import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const response = await api.get(`/dashboard?days=${period}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const chartData = stats.filter(s => s.total_km_driven > 0).map(s => ({
    name: s.name,
    value: s.total_km_driven
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Estatísticas da Família</h2>
        <select 
          className="bg-white border border-gray-200 text-sm font-medium py-1 px-3 rounded-md shadow-sm"
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
          <option value={365}>Último ano</option>
        </select>
      </div>

      {chartData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Proporção de Distância Dirigida</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} km`, 'Distância']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 flex-wrap mt-2">
            {chartData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-sm font-medium">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Sem dados de condução neste período.
        </div>
      )}

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2 mt-8">Balanço de Gastos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map(userStats => {
          const owes = userStats.balance_km < 0;
          return (
            <div key={userStats.userId} className={`rounded-xl p-5 border relative overflow-hidden ${owes ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
              <div className={`absolute top-0 right-0 w-2 h-full ${owes ? 'bg-red-400' : 'bg-green-400'}`}></div>
              <h4 className="font-bold text-gray-800 text-lg mb-1">{userStats.name}</h4>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase">Dirigido</div>
                  <div className="font-mono text-gray-700">{Math.round(userStats.total_km_driven)} km</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Combustível Pago (Eqv)</div>
                  <div className="font-mono text-gray-700">{Math.round(userStats.total_km_paid)} km</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200/50 flex justify-between items-center">
                <span className={`text-sm font-semibold ${owes ? 'text-red-600' : 'text-green-600'}`}>
                  {owes ? 'Precisa abastecer' : 'Tem crédito'}
                </span>
                <span className={`font-mono text-lg font-bold ${owes ? 'text-red-700' : 'text-green-700'}`}>
                  {Math.round(Math.abs(userStats.balance_km))} km
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
