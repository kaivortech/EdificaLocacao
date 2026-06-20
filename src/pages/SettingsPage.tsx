import React, { useState } from 'react';
import { deleteUserAccount, changePassword } from '../services/authService';
import ConfirmDialog from '../components/ConfirmDialog';

const SettingsPage: React.FC<{ user: any }> = ({ user }) => {
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const passwordChecks = {
    upper: /[A-Z]/.test(passwordData.newPass),
    lower: /[a-z]/.test(passwordData.newPass),
    number: /[0-9]/.test(passwordData.newPass),
  };
  const allPass = passwordChecks.upper && passwordChecks.lower && passwordChecks.number;

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
    if (!allPass) {
      setFeedback({ message: 'A senha deve conter letras maiúsculas, minúsculas e números.', type: 'error' });
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
    <div className="space-y-6 animate-fade-in max-w-full md:max-w-2xl">
      <h2 className="text-2xl font-bold text-secondary-500 dark:text-white">Configurações</h2>

      {feedback && (
        <div className={`${feedback.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded relative`} role="alert">
          {feedback.message}
        </div>
      )}
      
      <div className="card space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-bold text-secondary-500 dark:text-white">Perfil</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-neutral-500">Nome</span>
            <span className="font-medium text-secondary-500 dark:text-white">{user?.displayName}</span>
          </div>
          <div>
            <span className="block text-neutral-500">E-mail</span>
            <span className="font-medium text-secondary-500 dark:text-white">{user?.email}</span>
          </div>
        </div>
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
        {passwordData.newPass && (
          <div className="flex items-center gap-3 text-xs">
            <span className={`flex items-center gap-1 ${passwordChecks.upper ? 'text-green-600 dark:text-green-400' : 'text-neutral-500'}`}>
              <span className={`w-3 h-3 rounded-full border ${passwordChecks.upper ? 'bg-green-500 border-green-500' : 'border-neutral-500'}`} />
              A-Z
            </span>
            <span className={`flex items-center gap-1 ${passwordChecks.lower ? 'text-green-600 dark:text-green-400' : 'text-neutral-500'}`}>
              <span className={`w-3 h-3 rounded-full border ${passwordChecks.lower ? 'bg-green-500 border-green-500' : 'border-neutral-500'}`} />
              a-z
            </span>
            <span className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-600 dark:text-green-400' : 'text-neutral-500'}`}>
              <span className={`w-3 h-3 rounded-full border ${passwordChecks.number ? 'bg-green-500 border-green-500' : 'border-neutral-500'}`} />
              0-9
            </span>
            {allPass && <span className="text-green-600 dark:text-green-400 font-medium">✓ Senha segura</span>}
          </div>
        )}
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
