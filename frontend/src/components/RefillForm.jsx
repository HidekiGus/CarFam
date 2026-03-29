import React, { useState } from 'react';
import { Fuel, DollarSign, Wallet } from 'lucide-react';
import api from '../api';

const RefillForm = ({ user }) => {
  const [fuelType, setFuelType] = useState('Gasoline'); // Keep value as 'Gasoline' for backend compatibility, display translated Let's fix backend later if needed, but backend expects 'Gasoline' or 'Alcohol'
  const [amountReais, setAmountReais] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [status, setStatus] = useState('');

  const handleSaveRefill = async () => {
    if (!amountReais || !pricePerLiter) {
      setStatus('Insira o valor e o preço por litro.');
      return;
    }

    try {
      await api.post('/refills', {
        userId: user.id,
        fuelType,
        amountReais: parseFloat(amountReais),
        pricePerLiter: parseFloat(pricePerLiter)
      });
      setStatus('Abastecimento salvo com sucesso!');
      setAmountReais('');
      setPricePerLiter('');
    } catch (error) {
      setStatus('Erro ao salvar o abastecimento.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Fuel className="text-primary-500" /> Registrar Abastecimento
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Combustível</label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${fuelType === 'Gasoline' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFuelType('Gasoline')}
            >
              Gasolina (6,0 km/L)
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${fuelType === 'Alcohol' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFuelType('Alcohol')}
            >
              Etanol (4,0 km/L)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pago (R$)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium R$">R$</span>
            </div>
            <input 
              type="number" 
              step="0.01"
              value={amountReais}
              onChange={(e) => setAmountReais(e.target.value)}
              placeholder="ex. 150.00"
              className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Preço por Litro (R$/L)</label>
           <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium R$">R$</span>
            </div>
            <input 
              type="number" 
              step="0.01"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(e.target.value)}
              placeholder="ex. 5.90"
              className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
            />
           </div>
        </div>

        {status && (
          <div className={`mt-4 text-sm px-3 py-2 rounded-md ${status.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status}
          </div>
        )}

        <button 
          onClick={handleSaveRefill}
          className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold flex py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <Wallet size={20} />
          Salvar abastecimento para {user?.name}
        </button>
      </div>
    </div>
  );
};

export default RefillForm;
