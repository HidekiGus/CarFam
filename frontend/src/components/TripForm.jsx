import React, { useState } from 'react';
import { Camera, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../api';

const TripForm = ({ user }) => {
  const [startKm, setStartKm] = useState('');
  const [endKm, setEndKm] = useState('');
  const [uploadingStart, setUploadingStart] = useState(false);
  const [uploadingEnd, setUploadingEnd] = useState(false);
  const [status, setStatus] = useState('');

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'start') setUploadingStart(true);
    else setUploadingEnd(true);
    
    setStatus(`Lendo odômetro para o ${type === 'start' ? 'início' : 'fim'} da viagem...`);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { km } = response.data;
      if (km !== null) {
        if (type === 'start') setStartKm(km.toString());
        else setEndKm(km.toString());
        setStatus('Quilometragem lida com sucesso. Você pode editar se estiver incorreta.');
      } else {
        setStatus('Falha ao ler a quilometragem. Insira manualmente.');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setStatus('Erro ao processar a imagem. Insira manualmente.');
    } finally {
      if (type === 'start') setUploadingStart(false);
      else setUploadingEnd(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!startKm || !endKm) {
      setStatus('Insira os km inicial e final.');
      return;
    }
    
    if (parseInt(endKm) <= parseInt(startKm)) {
      setStatus('O km final deve ser maior que o km inicial.');
      return;
    }

    try {
      await api.post('/trips', {
        userId: user.id,
        startKm: parseInt(startKm),
        endKm: parseInt(endKm)
      });
      setStatus('Viagem salva com sucesso!');
      setStartKm('');
      setEndKm('');
    } catch (error) {
      setStatus('Erro ao salvar viagem.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Registrar Viagem</h2>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Início da Viagem</h3>
        <p className="text-sm text-gray-600 mb-4">Envie uma foto do painel para ler a quilometragem inicial automaticamente.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="cursor-pointer bg-white border border-gray-200 shadow-sm hover:border-blue-300 hover:bg-blue-50 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 pb-2">
            {uploadingStart ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
            <span>Capturar Início</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'start')} />
          </label>
          <div className="flex-1 w-full">
            <input 
              type="number" 
              placeholder="Km inicial (ex. 43946)" 
              value={startKm}
              onChange={(e) => setStartKm(e.target.value)}
              className="w-full border border-gray-300 bg-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-green-400"></div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Fim da Viagem</h3>
        <p className="text-sm text-gray-600 mb-4">Envie uma foto ao terminar de dirigir para calcular a distância total.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="cursor-pointer bg-white border border-gray-200 shadow-sm hover:border-green-300 hover:bg-green-50 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 pb-2">
            {uploadingEnd ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
            <span>Capturar Fim</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'end')} />
          </label>
          <div className="flex-1 w-full">
            <input 
              type="number" 
              placeholder="Km final (ex. 44010)" 
              value={endKm}
              onChange={(e) => setEndKm(e.target.value)}
              className="w-full border border-gray-300 bg-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-lg"
            />
          </div>
        </div>
      </div>

      {status && (
        <div className={`mb-4 text-sm px-3 py-2 rounded-md ${status.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
          {status}
        </div>
      )}

      <button 
        onClick={handleSaveTrip}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold flex py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={20} />
        Salvar viagem para {user?.name}
      </button>
    </div>
  );
};

export default TripForm;
