import React, { useEffect, useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Machine, Client, Rental, DashboardStats } from '../types';

const DashboardPage: React.FC<{ user: any }> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Dashboard: Iniciando carregamento de dados...');
      try {
        setLoading(true);
        console.log('🔄 Dashboard: Chamando Promise.all...');
        const [machinesData, clientsData, rentalsData] = await Promise.all([
          firestoreService.getMachines(),
          firestoreService.getClients(),
          firestoreService.getRentals(),
        ]);
        
        console.log('📊 Dashboard: Dados carregados:', {
          machines: machinesData.length,
          clients: clientsData.length,
          rentals: rentalsData.length
        });

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const mList = machinesData as Machine[];
        const rList = rentalsData as Rental[];

        const monthlyRevenue = rList
          .filter((r) => {
            if (r.status !== 'completed') return false;
            const completedDate = r.completedAt ? new Date(r.completedAt) : null;
            return completedDate && completedDate >= monthStart;
          })
          .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

        const totalRevenue = rList
          .filter((r) => r.status === 'completed')
          .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

        setStats({
          totalMachines: mList.length,
          availableMachines: mList.filter(m => m.status === 'available').length,
          rentedMachines: mList.filter(m => m.status === 'rented').length,
          totalClients: clientsData.length,
          activeRentals: rList.filter(r => r.status === 'active').length,
          completedRentals: rList.filter(r => r.status === 'completed').length,
          monthlyRevenue,
          totalRevenue,
        });
        
        console.log('✅ Dashboard: Stats calculados com sucesso');
        setLoading(false);
      } catch (error) {
        console.error('❌ Dashboard: Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    if (user?.uid) {
      console.log('👤 Dashboard: Usuário detectado, disparando loadData()', user.uid);
      loadData();
    } else {
      console.log('⚠️ Dashboard: Usuário não logado');
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-neutral-500 text-xl font-bold">🔄 Carregando dados do servidor, aguarde...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-center text-red-500 font-bold">❌ Falha ao carregar os dados. Verifique o console (F12).</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-secondary-500 dark:text-white">Visão Geral</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-l-4 border-l-primary flex flex-col justify-center">
          <p className="text-sm text-neutral-500 font-medium">Máquinas Disponíveis</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-secondary-500 dark:text-white">{stats.availableMachines}</h3>
            <span className="text-sm text-neutral-400">de {stats.totalMachines}</span>
          </div>
        </div>
        
        <div className="card border-l-4 border-l-green-500 flex flex-col justify-center">
          <p className="text-sm text-neutral-500 font-medium">Locações Ativas</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-secondary-500 dark:text-white">{stats.activeRentals}</h3>
            <span className="text-sm text-neutral-400">neste momento</span>
          </div>
        </div>

        <div className="card border-l-4 border-l-blue-500 flex flex-col justify-center">
          <p className="text-sm text-neutral-500 font-medium">Faturamento do Mês</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-secondary-500 dark:text-white">
              R$ {stats.monthlyRevenue.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="card border-l-4 border-l-purple-500 flex flex-col justify-center">
          <p className="text-sm text-neutral-500 font-medium">Total de Clientes</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-secondary-500 dark:text-white">{stats.totalClients}</h3>
            <span className="text-sm text-neutral-400">cadastrados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
