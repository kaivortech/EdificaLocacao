import React, { useState } from 'react';
import { deleteUserAccount, updateUserProfile, changePassword } from '../services/authService';
import ConfirmDialog from '../components/ConfirmDialog';

const SettingsPage: React.FC<{ user: any }> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSave = async () => {
    try {
      await updateUserProfile(user.uid, { name });
      setIsEditing(false);
      setFeedback({ message: 'Perfil atualizado com sucesso!', type: 'success' });
      setTimeout(() => setFeedback(null), 5000);
    } catch (e: any) {
      setFeedback({ message: e.message || 'Erro ao atualizar perfil.', type: 'error' });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.newPass || !passwordData.confirm) {
      setFeedback({ message: 'Preencha todos os campos de senha.', type: 'error' });
      setTimeout(() => setFeedback(null), 5000);
      return;
    }
    if (passwordData.newPass.length < 6) {
      setFeedback({ message: 'A nova senha deve ter no mínimo 6 caracteres.', type: 'error' });
      setTimeout(() => setFeedback(null), 5000);
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      setFeedback({ message: 'A confirmação de senha não confere.', type: 'error' });
      setTimeout(() => setFeedback(null), 5000);
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(passwordData.current, passwordData.newPass);
      setPasswordData({ current: '', newPass: '', confirm: '' });
      setFeedback({ message: 'Senha alterada com sucesso!', type: 'success' });
    } catch (e: any) {
      const msg = e.code === 'auth/wrong-password' ? 'Senha atual incorreta.'
        : e.code === 'auth/too-many-requests' ? 'Muitas tentativas. Aguarde e tente novamente.'
        : 'Erro ao alterar senha. Verifique a senha atual e tente novamente.';
      setFeedback({ message: msg, type: 'error' });
    }
    setChangingPassword(false);
    setTimeout(() => setFeedback(null), 5000);
  };

  const confirmDeleteAccount = async () => {
    try {
      await deleteUserAccount();
      window.location.href = '/';
    } catch (e) {
      alert('Erro ao excluir conta.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h2 className="text-2xl font-bold text-secondary-500 dark:text-white">Configurações</h2>

      {feedback && (
        <div className={`${feedback.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded relative`} role="alert">
          {feedback.message}
        </div>
      )}
      
      <div className="card space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-bold text-secondary-500 dark:text-white dark:border-secondary-600">Perfil</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-ghost text-sm text-yellow-500 hover:text-yellow-700" title="Editar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Nome</label>
              <input type="text" className="input-base" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">E-mail</label>
              <input type="email" className="input-base" value={user?.email || ''} disabled />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setIsEditing(false); setName(user?.displayName || ''); }} className="btn-ghost">Cancelar</button>
              <button onClick={handleSave} className="btn-primary">Salvar</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-neutral-500">Nome</span>
              <span className="font-medium text-secondary-500 dark:text-white">{user?.displayName}</span>
            </div>
            <div>
              <span className="block text-neutral-500">E-mail</span>
              <span className="font-medium text-secondary-500 dark:text-white">{user?.email}</span>
            </div>
          </div>
        )}
      </div>

      <div className="card space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-bold text-secondary-500 dark:text-white">Alterar Senha</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="password" placeholder="Senha atual" className="input-base"
            value={passwordData.current}
            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} />
          <input type="password" placeholder="Nova senha" className="input-base"
            value={passwordData.newPass}
            onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })} />
          <input type="password" placeholder="Confirmar nova senha" className="input-base"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <button onClick={handleChangePassword} disabled={changingPassword} className="btn-primary">
            {changingPassword ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </div>
      </div>

      <div className="card space-y-4 border-l-4 border-red-500">
        <h3 className="text-lg font-bold text-red-500">Zona de Risco</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          A exclusão da conta apagará permanentemente todos os seus dados.
        </p>
        <button onClick={handleDelete} className="btn-danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Excluir minha conta
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Excluir Conta"
        message="Tem certeza que deseja excluir sua conta? Esta ação é irreversível."
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default SettingsPage;
