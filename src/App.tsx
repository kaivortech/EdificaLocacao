import React, { Component, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Erro não capturado:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-tertiary-200 dark:bg-secondary-800 p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-secondary-500 dark:text-white mb-4">Ops! Algo deu errado.</h1>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { onAuthStateChange } from './services/authService';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MachinesPage from './pages/MachinesPage';
import ClientsPage from './pages/ClientsPage';
import RentalsPage from './pages/RentalsPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-tertiary-200 dark:bg-secondary-800">
        <div className="spinner w-10 h-10 border-4"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <HashRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        
        {/* Rotas Protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute user={user}>
              <div className="flex h-screen bg-tertiary-200 dark:bg-secondary-800">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header user={user} onToggleSidebar={() => setSidebarOpen(o => !o)} />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-tertiary-200 dark:bg-secondary-800 p-4 md:p-6">
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage user={user} />} />
                      <Route path="/machines" element={<MachinesPage user={user} />} />
                      <Route path="/clients" element={<ClientsPage user={user} />} />
                      <Route path="/rentals" element={<RentalsPage user={user} />} />
                      <Route path="/settings" element={<SettingsPage user={user} />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
