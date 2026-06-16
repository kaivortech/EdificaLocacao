import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, formatCPF } from '../services/authService';
import logoEdifica from '../assets/logo-edifica.jpg';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', cpf: '', role: '', password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(formData.name, formData.email, formData.password, formData.cpf, formData.role);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Erro ao cadastrar. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'cpf' ? formatCPF(value) : value });
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
        <h2 className="text-2xl font-bold text-center text-secondary-500 dark:text-white mb-6">Cadastro</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Nome Completo" className="input-base" onChange={handleChange} required />
          <input type="email" name="email" placeholder="E-mail" className="input-base" onChange={handleChange} required />
          <input type="text" name="cpf" placeholder="CPF" className="input-base" value={formData.cpf} onChange={handleChange} required />
          <input type="text" name="role" placeholder="Cargo (Ex: Atendente)" className="input-base" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Senha (Mín. 6 caracteres)" className="input-base" onChange={handleChange} required minLength={6} />
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Já tem uma conta? <Link to="/login" className="text-primary hover:underline font-medium">Faça login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
