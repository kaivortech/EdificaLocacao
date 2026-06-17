import React, { useEffect, useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Rental, Machine, Client } from '../types';
import { maskDate, maskCurrency, getCurrentDateFormatted } from '../utils/masks';

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
      setRentals(rData as Rental[]);
      setMachines(mData as Machine[]);
      setClients(cData as Client[]);
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

    const days = calcDaysLocal(formData.startDate, formData.endDate);
    const calculatedAmount = days * ((machine as any)?.dailyRate || 0);
    const totalAmount = (offerDiscount && customAmount)
      ? parseFloat(customAmount.replace(/\D/g, '')) / 100
      : calculatedAmount;

    const rentalData: any = {
      clientId: formData.clientId,
      machineId: formData.machineId,
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

  const handleFinalize = async (rentalId: string, machineId: string) => {
    const r = rentals.find(x => x.id === rentalId);
    if(r) {
      await firestoreService.updateRental({ id: rentalId, status: 'completed' });
      await firestoreService.updateMachine({ id: machineId, status: 'available' });
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-secondary-500 dark:text-white">Locações</h2>
        <button onClick={openAddForm} className="btn-primary">+ Nova Locação</button>
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

      <div className="card table-container">
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
                  <td>
                    <div className="flex gap-2">
                      {r.status === 'active' && (
                        <>
                          <button onClick={() => openEditForm(r)} className="btn-ghost text-yellow-500 hover:text-yellow-700" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleFinalize(r.id!, r.machineId)} className="btn-ghost text-sm text-primary">
                            Finalizar
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(r.id!)} className="btn-ghost text-red-500 hover:text-red-700" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (() => {
        const rental = rentals.find(r => r.id === deleteTarget);
        const client = clients.find(c => c.id === rental?.clientId);
        const machine = machines.find(m => m.id === rental?.machineId);
        return (
          <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
            <div className="modal-content max-w-md p-0" onClick={e => e.stopPropagation()}>
              <div className="p-6 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-secondary-500 dark:text-white mb-2">Excluir Locação</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  Tem certeza que deseja excluir esta locação? Esta ação não pode ser desfeita.
                </p>
                {rental && (
                  <div className="bg-tertiary-100 dark:bg-secondary-700 rounded-lg p-4 text-left space-y-1.5 mb-6">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      <span className="font-medium">Cliente:</span> {client?.name || 'Removido'}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      <span className="font-medium">Máquina:</span> {machine?.name || 'Removida'}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      <span className="font-medium">Período:</span> {rental.startDate} a {rental.endDate}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      <span className="font-medium">Valor:</span> R$ {rental.totalAmount?.toFixed(2) || '0,00'}
                    </p>
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="btn-ghost px-6">Cancelar</button>
                  <button onClick={confirmDelete} disabled={deleting} className="btn-danger min-w-[130px]">
                    {deleting ? (
                      <span className="flex items-center gap-2"><span className="spinner !border-white !border-t-transparent w-4 h-4" /> Excluindo...</span>
                    ) : 'Sim, excluir'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default RentalsPage;
