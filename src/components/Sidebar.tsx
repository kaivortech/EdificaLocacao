import React from 'react';
import { NavLink } from 'react-router-dom';
import logoEdifica from '../assets/logo-edifica.jpg';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        w-64 bg-white dark:bg-secondary-500 shadow-card flex-col h-screen
        fixed inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-auto md:flex
      `}>
        <div className="p-4 md:p-5 border-b border-tertiary-300 dark:border-secondary-600 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-3 shadow-sm w-full flex items-center justify-center">
            <img src={logoEdifica} alt="Edifica Locação" className="h-32 md:h-48 w-auto object-contain" />
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/dashboard" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`} onClick={onClose}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/rentals" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`} onClick={onClose}>
            📝 Locações
          </NavLink>
          <NavLink to="/machines" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`} onClick={onClose}>
            🚜 Máquinas
          </NavLink>
          <NavLink to="/clients" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`} onClick={onClose}>
            👥 Clientes
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => `sidebar-link group ${isActive ? 'active' : ''}`} onClick={onClose}>
            ⚙️ Configurações
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
