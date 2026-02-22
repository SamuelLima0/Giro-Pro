import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppSettings, Product } from '../types';
import { ShieldCheck, RefreshCcw, Target, Save } from 'lucide-react';
import { calcularPrecoSeguro } from '../utils/calculos';

const Ferramentas: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('giropro_settings', { monthlyGoal: 5000 });
  const [products] = useLocalStorage<Product[]>('giropro_produtos', []);
  
  // Preço Seguro State
  const [custo, setCusto] = useState('');
  const [margem, setMargem] = useState('');
  const [taxas, setTaxas] = useState('');
  const precoSeguro = calcularPrecoSeguro(Number(custo), Number(margem), Number(taxas));

  // Giro Médio calculation
  const soldProducts = products.filter(p => p.status === 'Vendido' && p.soldAt);
  const avgGiro = soldProducts.length > 0
    ? soldProducts.reduce((acc, p) => {
        const diff = Math.ceil((p.soldAt! - p.createdAt) / (1000 * 60 * 60 * 24));
        return acc + diff;
      }, 0) / soldProducts.length
    : 0;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <h2 className="text-xl font-black text-white uppercase tracking-tighter">Ferramentas</h2>

      {/* A) Preço Seguro */}
      <div className="bg-[#121821] p-6 rounded-2xl border border-white/5 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-white uppercase text-sm tracking-widest">Preço Seguro</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Custo</label>
            <input 
              type="number" 
              value={custo} 
              onChange={(e) => setCusto(e.target.value)} 
              placeholder="0,00" 
              className="bg-slate-800/50 border border-white/5 rounded-xl p-3 text-sm focus:outline-none" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Margem %</label>
            <input 
              type="number" 
              value={margem} 
              onChange={(e) => setMargem(e.target.value)} 
              placeholder="0" 
              className="bg-slate-800/50 border border-white/5 rounded-xl p-3 text-sm focus:outline-none" 
            />
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Taxas %</label>
            <input 
              type="number" 
              value={taxas} 
              onChange={(e) => setTaxas(e.target.value)} 
              placeholder="0" 
              className="bg-slate-800/50 border border-white/5 rounded-xl p-3 text-sm focus:outline-none" 
            />
          </div>
        </div>

        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-center">
          <span className="text-[10px] text-blue-400 font-bold uppercase block mb-1">Preço Sugerido</span>
          <span className="text-2xl font-black text-white">
            R$ {isNaN(precoSeguro) || !isFinite(precoSeguro) ? '0,00' : precoSeguro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* B) Giro */}
      <div className="bg-[#121821] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
            <RefreshCcw size={20} />
          </div>
          <h3 className="font-bold text-white uppercase text-sm tracking-widest">Tempo de Giro</h3>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Média de tempo entre a compra e a venda dos seus produtos.
        </p>
        <div className="bg-amber-500/10 p-6 rounded-xl border border-amber-500/20 text-center">
          <span className="text-3xl font-black text-white">{avgGiro.toFixed(0)}</span>
          <span className="text-xs font-bold text-amber-500 uppercase block mt-1">Dias em média</span>
        </div>
      </div>

      {/* C) Meta */}
      <div className="bg-[#121821] p-6 rounded-2xl border border-white/5 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00c853]/10 text-[#00c853] rounded-lg">
            <Target size={20} />
          </div>
          <h3 className="font-bold text-white uppercase text-sm tracking-widest">Definir Meta</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Meta Mensal (R$)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={settings.monthlyGoal} 
                onChange={(e) => setSettings({ ...settings, monthlyGoal: Number(e.target.value) })}
                className="flex-1 bg-slate-800/50 border border-white/5 rounded-xl p-4 text-sm focus:outline-none" 
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase italic">A meta é salva automaticamente.</p>
        </div>
      </div>
    </div>
  );
};

export default Ferramentas;
