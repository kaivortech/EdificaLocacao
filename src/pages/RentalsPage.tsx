import React, { useEffect, useState, useRef } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Rental, Machine, Client } from '../types';
import { maskDate, maskCurrency, getCurrentDateFormatted } from '../utils/masks';
import { gerarPDFContratoLocacao } from '../services/pdfService';

const parseDateBR = (dateBR: string): Date => {
  const [day, month, year] = dateBR.split('/').map(Number);
  return new Date(year, month - 1, day);
};

const calcDaysLocal = (startBR: string, endBR: string): number => {
  if (!startBR || !endBR) return 1;
  try {
    const start = parseDateBR(startBR);
    const end = parseDateBR(endBR);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  } catch(e) { return 1; }
};

const RentalsPage: React.FC<{ user: any }> = ({ user }) => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!deleteTarget || deleting) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setDeleteTarget(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [deleteTarget, deleting]);

  const [formData, setFormData] = useState({
    clientId: '',
    machineId: '',
    startDate: getCurrentDateFormatted(),
    endDate: '',
    notes: '',
  });
  const [offerDiscount, setOfferDiscount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const loadData = async () => {
    try {
      const [rData, mData, cData] = await Promise.all([
        firestoreService.getRentals(),
        firestoreService.getMachines(),
        firestoreService.getClients()
      ]);
      const sortByDate = (a: Rental, b: Rental) => {
        const [da, ma, ya] = a.startDate.split('/').map(Number);
        const [db, mb, yb] = b.startDate.split('/').map(Number);
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
      };
      setRentals((rData as Rental[]).sort(sortByDate));
      setMachines((mData as Machine[]).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setClients((cData as Client[]).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const openAddForm = () => {
    setEditingRental(null);
    setFormData({ clientId: '', machineId: '', startDate: getCurrentDateFormatted(), endDate: '', notes: '' });
    setOfferDiscount(false);
    setCustomAmount('');
    setIsFormOpen(true);
  };

  const openEditForm = (rental: Rental) => {
    setEditingRental(rental);
    setFormData({
      clientId: rental.clientId,
      machineId: rental.machineId,
      startDate: rental.startDate,
      endDate: rental.endDate,
      notes: rental.notes || '',
    });
    setOfferDiscount(!!rental.hasDiscount);
    setCustomAmount(rental.hasDiscount && rental.originalAmount !== rental.totalAmount
      ? `R$ ${rental.totalAmount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
      : '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const machine = editingRental
      ? machines.find((m) => m.id === formData.machineId) || { dailyRate: 0 }
      : machines.find((m) => m.id === formData.machineId);
    if (!machine && !editingRental) { setSubmitting(false); return; }

    const client = clients.find(c => c.id === formData.clientId);
    const days = calcDaysLocal(formData.startDate, formData.endDate);
    const calculatedAmount = days * ((machine as any)?.dailyRate || 0);
    const totalAmount = (offerDiscount && customAmount)
      ? parseFloat(customAmount.replace(/\D/g, '')) / 100
      : calculatedAmount;

    const rentalData: any = {
      clientId: formData.clientId,
      clientName: client?.name || '',
      machineId: formData.machineId,
      machineName: (machine as any)?.name || '',
      machineType: (machine as any)?.type || '',
      dailyRate: (machine as any)?.dailyRate || 0,
      totalDays: days,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalAmount,
      notes: formData.notes,
      hasDiscount: offerDiscount && totalAmount !== calculatedAmount,
      originalAmount: calculatedAmount,
    };

    if (editingRental) {
      await firestoreService.updateRental({
        id: editingRental.id,
        ...rentalData,
      });
      setFeedback({ message: 'Locação atualizada com sucesso!', type: 'success' });
    } else {
      await firestoreService.addRental({
        ...rentalData,
        status: 'active',
      });
      setFeedback({ message: 'Locação cadastrada com sucesso!', type: 'success' });
    }

    setSubmitting(false);
    setIsFormOpen(false);
    setEditingRental(null);
    setFormData({ clientId: '', machineId: '', startDate: getCurrentDateFormatted(), endDate: '', notes: '' });
    setTimeout(() => setFeedback(null), 5000);
    loadData();
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await firestoreService.deleteRental(deleteTarget);
      setDeleteTarget(null);
      setFeedback({ message: 'Locação excluída com sucesso!', type: 'error' });
      setTimeout(() => setFeedback(null), 5000);
      loadData();
    } finally {
      setDeleting(false);
    }
  };

  const handleContract = (rental: Rental) => {
    const client = clients.find(c => c.id === rental.clientId);
    const machine = machines.find(m => m.id === rental.machineId);
    gerarPDFContratoLocacao(rental, client, machine);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-secondary-500 dark:text-white">Locações</h2>
        <button onClick={openAddForm} className="btn-primary text-xs md:text-sm w-fit">+ Nova Locação</button>
      </div>

      {feedback && (
        <div className={`${feedback.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded relative`} role="alert">
          {feedback.message}
        </div>
      )}

      {isFormOpen && (
        <div className="card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-secondary-500 dark:text-white">{editingRental ? 'Editar Locação' : 'Nova Locação'}</h3>
            <button onClick={() => { setIsFormOpen(false); setEditingRental(null); }} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white text-2xl font-bold">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="input-base" value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} required>
                <option value="">Selecione o Cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select className="input-base" value={formData.machineId} onChange={(e) => setFormData({ ...formData, machineId: e.target.value })} required>
                <option value="">Selecione a Máquina</option>
                {machines.filter(m => m.status === 'available' || (editingRental && m.id === editingRental.machineId)).map((m) => (
                  <option key={m.id} value={m.id}>{m.name} (R$ {m.dailyRate}/dia)</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Data Início (DD/MM/AAAA)" className="input-base" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: maskDate(e.target.value) })} required />
              <input type="text" placeholder="Data Fim (DD/MM/AAAA)" className="input-base" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: maskDate(e.target.value) })} required />
            </div>
            <textarea placeholder="Observações" className="input-base" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />

            {formData.machineId && formData.startDate && formData.endDate && (
              <div className="bg-tertiary-100 dark:bg-secondary-700 p-4 rounded-lg space-y-3">
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  Valor calculado: <strong>R$ {(calcDaysLocal(formData.startDate, formData.endDate) * (machines.find(m => m.id === formData.machineId)?.dailyRate || 0)).toFixed(2)}</strong>
                  {' '}({calcDaysLocal(formData.startDate, formData.endDate)} dias x R$ {machines.find(m => m.id === formData.machineId)?.dailyRate?.toFixed(2) || '0.00'}/dia)
                </div>
                <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={offerDiscount} onChange={(e) => setOfferDiscount(e.target.checked)} className="rounded border-neutral-400" />
                  Oferecer Desconto
                </label>
                {offerDiscount && (
                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    className="input-base"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value.length > customAmount.length ? maskCurrency(e.target.value) : e.target.value)}
                  />
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setIsFormOpen(false); setEditingRental(null); }} className="btn-ghost">Cancelar</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : editingRental ? 'Atualizar' : 'Salvar'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-container" style={{ overflow: deleteTarget ? 'visible' : undefined }}>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Máquina</th>
              <th>Período</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((r) => {
              const client = clients.find((c) => c.id === r.clientId);
              const machine = machines.find((m) => m.id === r.machineId);

              return (
                <tr key={r.id}>
                  <td className="font-medium">{client?.name || 'Cliente Removido'}</td>
                  <td>{machine?.name || 'Máquina Removida'}</td>
                  <td>{r.startDate} a {r.endDate}</td>
                  <td>R$ {r.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={`badge ${r.status === 'active' ? 'badge-warning' : r.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                      {r.status === 'active' ? 'Ativa' : r.status === 'completed' ? 'Finalizada' : 'Cancelada'}
                    </span>
                  </td>
                  <td className="relative">
                    {deleteTarget === r.id ? (
                      <div ref={popoverRef} className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-secondary-500 rounded-xl shadow-2xl border border-red-200 dark:border-red-800 p-4 min-w-[280px] animate-scale-in">
                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-secondary-500 border-l border-t border-red-200 dark:border-red-800 rotate-[-45deg]" />
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-secondary-500 dark:text-white">Excluir locação?</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                              {client?.name} — {machine?.name}<br />
                              {r.startDate} a {r.endDate}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <button onClick={() => setDeleteTarget(null)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-secondary-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-secondary-500 transition-colors">
                                Cancelar
                              </button>
                              <button onClick={confirmDelete} disabled={deleting} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {deleting ? 'Excluindo...' : 'Sim, excluir'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => handleContract(r)} className="btn-ghost text-primary hover:text-primary-600" title="Contrato">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </button>
                        {r.status === 'active' && (
                          <button onClick={() => openEditForm(r)} className="btn-ghost text-yellow-500 hover:text-yellow-700" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                        )}
                        <button onClick={() => handleDelete(r.id!)} className="btn-ghost text-red-500 hover:text-red-700" title="Excluir">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default RentalsPage;
