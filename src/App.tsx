import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
    <BrowserRouter>
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
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header user={user} />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-tertiary-200 dark:bg-secondary-800 p-6">
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
    </BrowserRouter>
  );
};

export default App;
