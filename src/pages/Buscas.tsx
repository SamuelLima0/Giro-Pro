import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AutoSearch } from '../types';
import { Radar, Plus, List, X, Trash2, Edit2, Power, MapPin, Clock, ShoppingBag, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Buscas: React.FC = () => {
  const [searches, setSearches] = useLocalStorage<AutoSearch[]>('autoSearches', []);
  const [view, setView] = useState<'main' | 'create' | 'list'>('main');
  const [editingSearch, setEditingSearch] = useState<AutoSearch | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [term, setTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [radius, setRadius] = useState('40');
  const [frequency, setFrequency] = useState('30');

  const marketplaces = ['OLX', 'Facebook Marketplace', 'Enjoei'];
  const distances = ['10', '20', '30', '40', '50', '100'];
  const frequencies = [
    { value: '30', label: 'A cada 30 minutos' },
    { value: '60', label: 'A cada 60 minutos' }
  ];

  useEffect(() => {
    if (editingSearch) {
      setName(editingSearch.name);
      setTerm(editingSearch.term);
      setMinPrice(editingSearch.minPrice.toString());
      setMaxPrice(editingSearch.maxPrice.toString());
      setSelectedMarketplaces(editingSearch.marketplaces);
      setRadius(editingSearch.radius.toString());
      setFrequency(editingSearch.frequency.toString());
    } else {
      resetForm();
    }
  }, [editingSearch]);

  const resetForm = () => {
    setName('');
    setTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedMarketplaces([]);
    setRadius('40');
    setFrequency('30');
  };

  const handleSave = () => {
    if (!name || !term || !minPrice || !maxPrice || selectedMarketplaces.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newSearch: AutoSearch = {
      id: editingSearch?.id || crypto.randomUUID(),
      name,
      term,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      marketplaces: selectedMarketplaces,
      radius: Number(radius),
      frequency: Number(frequency),
      isActive: editingSearch ? editingSearch.isActive : true,
      createdAt: editingSearch ? editingSearch.createdAt : Date.now()
    };

    if (editingSearch) {
      setSearches(searches.map(s => s.id === editingSearch.id ? newSearch : s));
    } else {
      setSearches([newSearch, ...searches]);
    }

    setView('list');
    setEditingSearch(null);
    resetForm();
  };

  const toggleMarketplace = (mp: string) => {
    if (selectedMarketplaces.includes(mp)) {
      setSelectedMarketplaces(selectedMarketplaces.filter(m => m !== mp));
    } else {
      setSelectedMarketplaces([...selectedMarketplaces, mp]);
    }
  };

  const toggleActive = (id: string) => {
    setSearches(searches.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir esta busca?')) {
      setSearches(searches.filter(s => s.id !== id));
    }
  };

  const requestPermissions = async () => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(() => {});
      }
      if ('Notification' in window) {
        await Notification.requestPermission();
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  // Simulation of finding an opportunity
  useEffect(() => {
    const activeSearches = searches.filter(s => s.isActive);
    if (activeSearches.length === 0) return;

    const interval = setInterval(() => {
      const randomSearch = activeSearches[Math.floor(Math.random() * activeSearches.length)];
      const randomPrice = Math.floor(Math.random() * (randomSearch.maxPrice - randomSearch.minPrice + 1)) + randomSearch.minPrice;
      
      const message = `Oportunidade encontrada: ${randomSearch.term} por R$${randomPrice} perto de você.`;
      
      if (Notification.permission === 'granted') {
        new Notification('Giro Pro - Nova Oportunidade', { body: message });
      } else {
        console.log('Simulated Notification:', message);
      }
    }, 60000); // Check every minute for simulation purposes

    return () => clearInterval(interval);
  }, [searches]);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Buscas Automáticas</h2>
        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-full animate-pulse">
          <Radar size={20} />
        </div>
      </div>

      {view === 'main' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-8"
        >
          <div className="bg-[#121821] p-8 rounded-3xl border border-white/5 text-center flex flex-col gap-4">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <Radar size={32} />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              O app procura oportunidades automaticamente nos marketplaces e te avisa quando aparecer algo dentro do seu filtro.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                requestPermissions();
                setView('create');
              }}
              className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              <Plus size={20} /> Criar nova busca
            </button>
            <button 
              onClick={() => setView('list')}
              className="w-full bg-[#121821] text-white font-black py-5 rounded-2xl border border-white/5 active:scale-95 transition-transform flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              <List size={20} /> Ver minhas buscas
            </button>
          </div>
        </motion.div>
      )}

      {view === 'create' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-4">
            <button onClick={() => { setView('main'); setEditingSearch(null); }} className="text-slate-500">
              <X size={24} />
            </button>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">
              {editingSearch ? 'Editar Busca' : 'Nova Busca'}
            </h3>
          </div>

          <div className="flex flex-col gap-5 bg-[#121821] p-6 rounded-3xl border border-white/5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Nome da busca</label>
              <input 
                type="text" 
                placeholder="Ex: iPhone barato"
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Termo de busca</label>
              <input 
                type="text" 
                placeholder="Ex: iPhone 13 Pro Max"
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Preço Mínimo</label>
                <input 
                  type="number" 
                  placeholder="R$ 0,00"
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Preço Máximo</label>
                <input 
                  type="number" 
                  placeholder="R$ 0,00"
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Marketplaces</label>
              <div className="grid grid-cols-1 gap-2">
                {marketplaces.map(mp => (
                  <button
                    key={mp}
                    onClick={() => toggleMarketplace(mp)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-xs font-bold transition-all ${
                      selectedMarketplaces.includes(mp) 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {mp}
                    {selectedMarketplaces.includes(mp) && <CheckCircle size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Distância Máxima</label>
              <div className="grid grid-cols-3 gap-2">
                {distances.map(d => (
                  <button
                    key={d}
                    onClick={() => setRadius(d)}
                    className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${
                      radius === d 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {d} km
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Frequência de busca</label>
              <div className="grid grid-cols-2 gap-2">
                {frequencies.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${
                      frequency === f.value 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 transition-transform uppercase tracking-widest text-sm mt-4"
            >
              Salvar Busca
            </button>
          </div>
        </motion.div>
      )}

      {view === 'list' && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('main')} className="text-slate-500">
                <X size={24} />
              </button>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Minhas Buscas</h3>
            </div>
            <button 
              onClick={() => setView('create')}
              className="bg-blue-500 text-white p-2 rounded-xl"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {searches.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="p-6 bg-[#121821] rounded-full text-slate-700">
                  <Radar size={48} />
                </div>
                <p className="text-slate-500 font-bold uppercase text-xs">Nenhuma busca cadastrada</p>
              </div>
            ) : (
              searches.map(search => (
                <div 
                  key={search.id}
                  className={`bg-[#121821] p-6 rounded-3xl border border-white/5 flex flex-col gap-4 transition-opacity ${!search.isActive ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-white text-lg">{search.name}</h4>
                      <span className="text-xs font-bold text-blue-400 uppercase">{search.term}</span>
                    </div>
                    <button 
                      onClick={() => toggleActive(search.id)}
                      className={`p-3 rounded-xl transition-colors ${search.isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}
                    >
                      <Power size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <ShoppingBag size={12} /> {search.minPrice} - {search.maxPrice}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <MapPin size={12} /> {search.radius} km
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Clock size={12} /> {search.frequency} min
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Bell size={12} /> {search.marketplaces.join(', ')}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => { setEditingSearch(search); setView('create'); }}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-[10px] uppercase"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(search.id)}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-[10px] uppercase"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const CheckCircle: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default Buscas;
