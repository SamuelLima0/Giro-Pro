import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Sale, Product } from '../types';
import { BarChart3, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const Relatorios: React.FC = () => {
  const [sales] = useLocalStorage<Sale[]>('giropro_vendas', []);
  const [products] = useLocalStorage<Product[]>('giropro_produtos', []);
  const [viewType, setViewType] = useState<'mensal' | 'anual'>('mensal');
  const [currentDate, setCurrentDate] = useState(new Date());

  const reportData = useMemo(() => {
    const filteredSales = sales.filter(s => {
      const saleDate = new Date(s.saleDate);
      if (viewType === 'mensal') {
        return saleDate.getMonth() === currentDate.getMonth() && 
               saleDate.getFullYear() === currentDate.getFullYear();
      } else {
        return saleDate.getFullYear() === currentDate.getFullYear();
      }
    });

    if (filteredSales.length === 0) return null;

    const faturamento = filteredSales.reduce((acc, s) => acc + s.salePrice, 0);
    const lucro = filteredSales.reduce((acc, s) => acc + s.profit, 0);
    const reinvestimento = filteredSales.reduce((acc, s) => acc + s.costValue, 0);
    const lucroPessoal = filteredSales.reduce((acc, s) => acc + (s.personalProfit ?? (s.profit * 0.2)), 0);
    const caixaEmpresa = filteredSales.reduce((acc, s) => acc + (s.companyCash ?? (s.profit * 0.8)), 0);
    const margem = (lucro / faturamento) * 100;

    // Giro médio
    const soldProductIds = new Set(filteredSales.map(s => s.productId));
    const soldProducts = products.filter(p => soldProductIds.has(p.id) && p.soldAt);
    const giroMedio = soldProducts.length > 0
      ? soldProducts.reduce((acc, p) => {
          const diff = Math.ceil((p.soldAt! - p.createdAt) / (1000 * 60 * 60 * 24));
          return acc + diff;
        }, 0) / soldProducts.length
      : 0;

    return { 
      faturamento, 
      lucro, 
      reinvestimento,
      lucroPessoal,
      caixaEmpresa,
      margem, 
      giroMedio, 
      count: filteredSales.length,
      topProducts: Object.entries(
        filteredSales.reduce((acc, s) => {
          if (!acc[s.productName]) acc[s.productName] = { totalProfit: 0, count: 0 };
          acc[s.productName].totalProfit += s.profit;
          acc[s.productName].count += 1;
          return acc;
        }, {} as Record<string, { totalProfit: number, count: number }>)
      )
      .map(([name, data]) => ({ name, avgProfit: data.totalProfit / data.count }))
      .sort((a, b) => b.avgProfit - a.avgProfit)
      .slice(0, 3)
    };
  }, [sales, products, viewType, currentDate]);

  const changeDate = (offset: number) => {
    const newDate = new Date(currentDate);
    if (viewType === 'mensal') {
      newDate.setMonth(newDate.getMonth() + offset);
    } else {
      newDate.setFullYear(newDate.getFullYear() + offset);
    }
    setCurrentDate(newDate);
  };

  const formatPeriod = () => {
    if (viewType === 'mensal') {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    return currentDate.getFullYear().toString();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-black text-white uppercase tracking-tighter">Relatórios</h2>

      <div className="flex bg-[#121821] p-1 rounded-2xl border border-white/5">
        <button 
          onClick={() => setViewType('mensal')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${viewType === 'mensal' ? 'bg-[#00c853] text-[#0b0f14]' : 'text-slate-500'}`}
        >
          Mensal
        </button>
        <button 
          onClick={() => setViewType('anual')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${viewType === 'anual' ? 'bg-[#00c853] text-[#0b0f14]' : 'text-slate-500'}`}
        >
          Anual
        </button>
      </div>

      <div className="flex items-center justify-between px-2">
        <button onClick={() => changeDate(-1)} className="p-2 bg-[#121821] rounded-xl text-slate-400"><ChevronLeft size={20} /></button>
        <span className="text-sm font-black text-white uppercase tracking-widest">{formatPeriod()}</span>
        <button onClick={() => changeDate(1)} className="p-2 bg-[#121821] rounded-xl text-slate-400"><ChevronRight size={20} /></button>
      </div>

      {reportData ? (
        <div className="flex flex-col gap-4">
          <div className="bg-[#121821] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Faturamento</span>
              <span className="text-3xl font-black text-white">R$ {reportData.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Lucro</span>
                <span className="text-lg font-black text-[#00c853]">R$ {reportData.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Margem %</span>
                <span className="text-lg font-black text-blue-400">{reportData.margem.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Giro Médio</span>
                <span className="text-lg font-black text-amber-400">{reportData.giroMedio.toFixed(0)} dias</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Vendas</span>
                <span className="text-lg font-black text-purple-400">{reportData.count}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121821] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter border-b border-white/5 pb-2">Painel Financeiro</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Faturamento Total</span>
                <span className="text-sm font-black text-white">R$ {reportData.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Lucro Total</span>
                <span className="text-sm font-black text-[#00c853]">R$ {reportData.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Lucro Pessoal (Pro-labore)</span>
                <span className="text-sm font-black text-blue-400">R$ {reportData.lucroPessoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Caixa da Empresa</span>
                <span className="text-sm font-black text-purple-400">R$ {reportData.caixaEmpresa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Capital Reinvestido</span>
                <span className="text-sm font-black text-amber-400">R$ {reportData.reinvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total de Vendas</span>
                <span className="text-sm font-black text-white">{reportData.count}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121821] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter border-b border-white/5 pb-2">Produtos mais lucrativos</h3>
            
            <div className="flex flex-col gap-3">
              {reportData.topProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{i === 0 ? '1️⃣' : i === 1 ? '2️⃣' : '3️⃣'}</span>
                    <span className="text-xs font-bold text-white uppercase">{p.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Lucro médio</span>
                    <span className="text-sm font-black text-[#00c853]">R$ {p.avgProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <div className="p-6 bg-[#121821] rounded-full text-slate-700">
            <BarChart3 size={48} />
          </div>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Sem dados para este período</p>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
