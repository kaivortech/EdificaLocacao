import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import logoEdifica from '../assets/logo-edifica.jpg';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tertiary-200 dark:bg-secondary-800 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4">
        <button onClick={() => navigate('/')} className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary flex items-center gap-1">
          ← Voltar para home
        </button>
      </div>
      <div className="card max-w-md w-full">
        <div className="bg-white rounded-2xl p-5 inline-flex items-center justify-center mx-auto mb-6 shadow-sm w-full">
          <img src={logoEdifica} alt="Edifica Locação" className="h-44 w-auto object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-center text-secondary-500 dark:text-white mb-6">Login</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">E-mail</label>
            <input
              type="email"
              className="input-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Senha</label>
            <input
              type="password"
              className="input-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Não tem uma conta? <Link to="/register" className="text-primary hover:underline font-medium">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
