import React, { useEffect, useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Machine, Client, Rental, DashboardStats } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const CHART_COLORS = ['#917523', '#16a34a', '#2563eb', '#9333ea', '#dc2626', '#ea580c', '#0284c7', '#ca8a04'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const DashboardPage: React.FC<{ user: any }> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
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

        setMachines(mList);
        setRentals(rList);

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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="card border-l-4 border-l-primary flex flex-col justify-center p-4 md:p-6">
          <p className="text-xs md:text-sm text-neutral-500 font-medium">Máquinas Disponíveis</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl md:text-3xl font-bold text-secondary-500 dark:text-white">{stats.availableMachines}</h3>
            <span className="text-xs md:text-sm text-neutral-400">de {stats.totalMachines}</span>
          </div>
        </div>
        
        <div className="card border-l-4 border-l-green-500 flex flex-col justify-center p-4 md:p-6">
          <p className="text-xs md:text-sm text-neutral-500 font-medium">Locações Ativas</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl md:text-3xl font-bold text-secondary-500 dark:text-white">{stats.activeRentals}</h3>
            <span className="text-xs md:text-sm text-neutral-400">neste momento</span>
          </div>
        </div>

        <div className="card border-l-4 border-l-blue-500 flex flex-col justify-center p-4 md:p-6">
          <p className="text-xs md:text-sm text-neutral-500 font-medium">Faturamento do Mês</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-xl md:text-3xl font-bold text-secondary-500 dark:text-white break-all">
              R$ {stats.monthlyRevenue.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="card border-l-4 border-l-purple-500 flex flex-col justify-center p-4 md:p-6">
          <p className="text-xs md:text-sm text-neutral-500 font-medium">Total de Clientes</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl md:text-3xl font-bold text-secondary-500 dark:text-white">{stats.totalClients}</h3>
            <span className="text-xs md:text-sm text-neutral-400">cadastrados</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Revenue */}
        <div className="card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-secondary-500 dark:text-white mb-4">Faturamento Mensal</h3>
          <ResponsiveContainer width="100%" height={240} minHeight={200}>
            <BarChart data={(() => {
              const now = new Date();
              const data = [];
              for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const revenue = rentals
                  .filter(r => {
                    if (r.status !== 'completed' || !r.completedAt) return false;
                    const c = new Date(r.completedAt);
                    return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
                  })
                  .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
                data.push({ name: `${MONTHS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, receita: revenue });
              }
              return data;
            })()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']} />
              <Bar dataKey="receita" fill="#917523" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rental Status */}
        <div className="card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-secondary-500 dark:text-white mb-4">Status das Locações</h3>
          <ResponsiveContainer width="100%" height={240} minHeight={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Ativas', value: stats.activeRentals, color: CHART_COLORS[0] },
                  { name: 'Finalizadas', value: stats.completedRentals, color: CHART_COLORS[1] },
                  { name: 'Canceladas', value: rentals.filter(r => r.status === 'cancelled').length, color: CHART_COLORS[4] },
                ].filter(d => d.value > 0)}
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {[
                  { name: 'Ativas', value: stats.activeRentals, color: CHART_COLORS[0] },
                  { name: 'Finalizadas', value: stats.completedRentals, color: CHART_COLORS[1] },
                  { name: 'Canceladas', value: rentals.filter(r => r.status === 'cancelled').length, color: CHART_COLORS[4] },
                ].filter(d => d.value > 0).map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'Locações']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Machine Status */}
      <div className="card p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-secondary-500 dark:text-white mb-4">Status das Máquinas</h3>
        <ResponsiveContainer width="100%" height={220} minHeight={180}>
          <BarChart
            data={[
              { name: 'Disponíveis', quantidade: stats.availableMachines, fill: CHART_COLORS[1] },
              { name: 'Alugadas', quantidade: stats.rentedMachines, fill: CHART_COLORS[2] },
              { name: 'Em Manutenção', quantidade: stats.totalMachines - stats.availableMachines - stats.rentedMachines, fill: CHART_COLORS[5] },
            ]}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" width={120} />
            <Tooltip formatter={(value: number) => [value, 'Máquinas']} />
            <Bar dataKey="quantidade" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
