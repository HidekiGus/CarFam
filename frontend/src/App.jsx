import React, { useState, useEffect } from 'react';
import { Car, Fuel, PieChart, Users } from 'lucide-react';
import api from './api';
import UserSelect from './components/UserSelect';
import TripForm from './components/TripForm';
import RefillForm from './components/RefillForm';
import Dashboard from './components/Dashboard';

function App() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [activeTab, setActiveTab] = useState('trip');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      if (response.data.length > 0 && !activeUser) {
        setActiveUser(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-14">
      <header className="bg-white shadow-sm fixed top-0 w-full z-10 hidden md:block">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600">
            <Car size={24} />
            <h1 className="font-bold text-xl tracking-tight">FamCar Tracker</h1>
          </div>
          {activeTab !== 'dashboard' && (
            <UserSelect users={users} activeUser={activeUser} onSelect={setActiveUser} />
          )}
        </div>
      </header>
      
      <div className="md:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-bold text-lg text-primary-600 flex items-center gap-2">
          <Car size={20} /> FamCar Tracker
        </h1>
        {activeTab !== 'dashboard' && (
           <UserSelect users={users} activeUser={activeUser} onSelect={setActiveUser} isMobile />
        )}
      </div>

      <main className="max-w-md mx-auto md:max-w-4xl px-4 py-6">
        {activeTab === 'trip' && <TripForm user={activeUser} />}
        {activeTab === 'refill' && <RefillForm user={activeUser} />}
        {activeTab === 'dashboard' && <Dashboard />}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 md:bottom-auto md:top-14 md:border-t-0 md:border-b md:shadow-sm">
        <div className="max-w-md md:max-w-4xl mx-auto flex justify-around">
          <button 
            onClick={() => setActiveTab('trip')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeTab === 'trip' ? 'text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            <Car size={20} />
            <span className="text-xs">Viagem</span>
          </button>
          <button 
            onClick={() => setActiveTab('refill')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeTab === 'refill' ? 'text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            <Fuel size={20} />
            <span className="text-xs">Abastecer</span>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            <PieChart size={20} />
            <span className="text-xs">Estatísticas</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
