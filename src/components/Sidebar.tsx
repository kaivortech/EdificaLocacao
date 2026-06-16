import React from 'react';
import { NavLink } from 'react-router-dom';
import logoEdifica from '../assets/logo-edifica.jpg';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-white dark:bg-secondary-500 shadow-card flex flex-col hidden md:flex">
      <div className="p-5 border-b border-tertiary-300 dark:border-secondary-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-3 shadow-sm w-full flex items-center justify-center">
          <img src={logoEdifica} alt="Edifica Locação" className="h-48 w-auto object-contain" />
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/dashboard" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/rentals" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`}>
          📝 Locações
        </NavLink>
        <NavLink to="/machines" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`}>
          🚜 Máquinas
        </NavLink>
        <NavLink to="/clients" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`}>
          👥 Clientes
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`}>
          ⚙️ Configurações
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
