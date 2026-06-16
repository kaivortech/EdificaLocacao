import React, { useEffect, useState } from 'react';
import { logoutUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  user: any;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-secondary-500 shadow-sm border-b border-tertiary-300 dark:border-secondary-600 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button could go here */}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-tertiary-200 dark:hover:bg-secondary-600 transition-colors">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="flex items-center gap-3 border-l border-tertiary-300 dark:border-secondary-600 pl-4">
          <span className="text-sm font-medium text-secondary-500 dark:text-tertiary-300">
            {user?.displayName || 'Usuário'}
          </span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
