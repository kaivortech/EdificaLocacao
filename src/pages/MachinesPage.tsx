import React, { useEffect, useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Machine } from '../types';
import EstoqueModal from '../components/EstoqueModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { maskCurrency } from '../utils/masks';

const MachinesPage: React.FC<{ user: any }> = ({ user }) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isEstoqueOpen, setIsEstoqueOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({ name: '', type: '', dailyRate: '' });
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadMachines = async () => {
    try {
      const data = await firestoreService.getMachines();
      setMachines((data as Machine[]).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadMachines();
    }
  }, [user]);

  const openAddForm = () => {
    setEditingMachine(null);
    setFormData({ name: '', type: '', dailyRate: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      name: machine.name,
      type: machine.type,
      dailyRate: machine.dailyRate ? `R$ ${machine.dailyRate.toFixed(2)}` : '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      name: formData.name,
      type: formData.type,
      dailyRate: Number(formData.dailyRate.replace(/\D/g, '')) / 100,
      status: editingMachine ? editingMachine.status : 'available'
    };

    if (editingMachine) {
      await firestoreService.updateMachine({ id: editingMachine.id, ...data });
      setFeedback({ message: 'Máquina atualizada com sucesso!', type: 'success' });
    } else {
      await firestoreService.addMachine(data);
      setFeedback({ message: 'Máquina cadastrada com sucesso!', type: 'success' });
    }

    setSubmitting(false);
    setIsFormOpen(false);
    setEditingMachine(null);
    setFormData({ name: '', type: '', dailyRate: '' });
    setTimeout(() => setFeedback(null), 5000);
    loadMachines();
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await firestoreService.deleteMachine(deleteTarget);
    setDeleteTarget(null);
    setFeedback({ message: 'Máquina excluída com sucesso!', type: 'error' });
    setTimeout(() => setFeedback(null), 5000);
    loadMachines();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-secondary-500 dark:text-white">Máquinas</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsEstoqueOpen(true)} className="btn-secondary text-xs md:text-sm">📦 Estoque</button>
          <button onClick={openAddForm} className="btn-primary text-xs md:text-sm">+ Nova Máquina</button>
        </div>
      </div>

      {feedback && (
        <div className={`${feedback.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded relative`} role="alert">
          {feedback.message}
        </div>
      )}

      {isFormOpen && (
        <div className="card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-secondary-500 dark:text-white">{editingMachine ? 'Editar Máquina' : 'Nova Máquina'}</h3>
            <button onClick={() => { setIsFormOpen(false); setEditingMachine(null); }} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white text-2xl font-bold">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Nome" className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input type="text" placeholder="Tipo" className="input-base" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required />
              <input type="text" placeholder="Valor da Diária" className="input-base" value={formData.dailyRate} onChange={e => setFormData({...formData, dailyRate: maskCurrency(e.target.value)})} required />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setIsFormOpen(false); setEditingMachine(null); }} className="btn-ghost">Cancelar</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : editingMachine ? 'Atualizar' : 'Salvar'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Diária</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {machines.map(m => (
              <tr key={m.id}>
                <td className="font-medium">{m.name}</td>
                <td>{m.type}</td>
                <td>R$ {m.dailyRate?.toFixed(2) || '0.00'}</td>
                <td>
                  <span className={`badge ${m.status === 'available' ? 'badge-success' : m.status === 'rented' ? 'badge-warning' : 'badge-danger'}`}>
                    {m.status === 'available' ? 'Disponível' : m.status === 'rented' ? 'Em Locação' : m.status || 'Disponível'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => openEditForm(m)} className="btn-ghost text-yellow-500 hover:text-yellow-700" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(m.id!)} className="btn-ghost text-red-500 hover:text-red-700" title="Excluir">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EstoqueModal isOpen={isEstoqueOpen} onClose={() => setIsEstoqueOpen(false)} />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Excluir Máquina"
        message="Tem certeza que deseja excluir esta máquina?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default MachinesPage;
