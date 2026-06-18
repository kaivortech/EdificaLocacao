import React, { useEffect, useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Client } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { maskPhone, maskDocument } from '../utils/masks';

const ClientsPage: React.FC<{ user: any }> = ({ user }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', document: '', address: '' });
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadClients = async () => {
    try {
      const data = await firestoreService.getClients();
      setClients((data as Client[]).sort((a, b) =>
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0) || b.id.localeCompare(a.id)
      ));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadClients();
    }
  }, [user]);

  const openAddForm = () => {
    setEditingClient(null);
    setFormData({ name: '', phone: '', document: '', address: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone || '',
      document: (client as any).document || client.cpf || client.cnpj || '',
      address: client.address || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      name: formData.name,
      phone: formData.phone,
      document: formData.document,
      address: formData.address,
    };

    if (editingClient) {
      await firestoreService.updateClient({ id: editingClient.id, ...data });
      setFeedback({ message: 'Cliente atualizado com sucesso!', type: 'success' });
    } else {
      await firestoreService.addClient(data);
      setFeedback({ message: 'Cliente cadastrado com sucesso!', type: 'success' });
    }

    setSubmitting(false);
    setIsFormOpen(false);
    setEditingClient(null);
    setFormData({ name: '', phone: '', document: '', address: '' });
    setTimeout(() => setFeedback(null), 5000);
    loadClients();
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await firestoreService.deleteClient(deleteTarget);
    setDeleteTarget(null);
    setFeedback({ message: 'Cliente excluído com sucesso!', type: 'error' });
    setTimeout(() => setFeedback(null), 5000);
    loadClients();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-secondary-500 dark:text-white">Clientes</h2>
        <button onClick={openAddForm} className="btn-primary text-xs md:text-sm w-fit">+ Novo Cliente</button>
      </div>

      {feedback && (
        <div className={`${feedback.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded relative`} role="alert">
          {feedback.message}
        </div>
      )}

      {isFormOpen && (
        <div className="card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-secondary-500 dark:text-white">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <button onClick={() => { setIsFormOpen(false); setEditingClient(null); }} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white text-2xl font-bold">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nome Completo" className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input type="text" placeholder="Telefone (83)99888-8888" className="input-base" value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} required />
              <input type="text" placeholder="CPF/CNPJ" className="input-base" value={formData.document} onChange={e => setFormData({...formData, document: maskDocument(e.target.value)})} required />
              <input type="text" placeholder="Endereço Completo" className="input-base" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setIsFormOpen(false); setEditingClient(null); }} className="btn-ghost">Cancelar</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : editingClient ? 'Atualizar' : 'Salvar'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Documento</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td>{c.phone}</td>
                <td>{(c as any).document || c.cpf || c.cnpj || '-'}</td>
                <td>{c.address}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => openEditForm(c)} className="btn-ghost text-yellow-500 hover:text-yellow-700" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(c.id!)} className="btn-ghost text-red-500 hover:text-red-700" title="Excluir">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ClientsPage;
