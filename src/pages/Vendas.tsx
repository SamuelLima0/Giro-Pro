import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Sale } from '../types';
import { ShoppingCart, Calendar, TrendingUp, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Vendas: React.FC = () => {
  const [sales] = useLocalStorage<Sale[]>('giropro_vendas', []);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showModal, setShowModal] = useState(false);

  const openSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowModal(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-black text-white uppercase tracking-tighter">Histórico de Vendas</h2>

      <div className="flex flex-col gap-4">
        {sales.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="p-6 bg-[#121821] rounded-full text-slate-700">
              <ShoppingCart size={48} />
            </div>
            <p className="text-slate-500 font-bold uppercase text-xs">Nenhuma venda realizada</p>
          </div>
        ) : (
          sales.slice().reverse().map(sale => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={sale.id}
              onClick={() => openSaleDetails(sale)}
              className="bg-[#121821] p-5 rounded-2xl border border-white/5 flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white leading-tight">{sale.productName}</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mt-1">
                    <Calendar size={10} /> {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span className="text-lg font-black text-[#00c853]">
                  R$ {sale.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Custo</span>
                  <span className="text-xs font-bold text-slate-300">R$ {sale.costValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                    <TrendingUp size={10} /> Lucro
                  </span>
                  <span className="text-sm font-black text-[#00c853]">
                    R$ {sale.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal de Resumo Financeiro */}
      <AnimatePresence>
        {showModal && selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121821] w-full max-w-sm rounded-3xl border border-[#00c853]/30 overflow-hidden shadow-[0_0_50px_rgba(0,200,83,0.1)]"
            >
              <div className="p-8 flex flex-col gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-[#00c853]/20 text-[#00c853] rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Resumo da Venda</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{selectedSale.productName}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Data da Venda</span>
                    <span className="text-sm font-bold text-white">{new Date(selectedSale.saleDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Valor Investido</span>
                    <span className="text-sm font-bold text-white">R$ {selectedSale.costValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Valor Vendido</span>
                    <span className="text-sm font-bold text-[#00c853]">R$ {selectedSale.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="mt-2 p-4 bg-[#00c853]/10 border border-[#00c853]/20 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[#00c853] uppercase tracking-widest">Lucro Total</span>
                      <span className="text-xl font-black text-white">R$ {selectedSale.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pt-3 border-t border-[#00c853]/20">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Pro-labore ({selectedSale.profitPercentage}%)</span>
                        <span className="text-xs font-bold text-blue-400">R$ {selectedSale.personalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Caixa Empresa</span>
                        <span className="text-xs font-bold text-purple-400">R$ {selectedSale.companyCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Capital Reinvestimento</span>
                        <span className="text-xs font-bold text-amber-400">R$ {selectedSale.reinvestmentCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-colors uppercase tracking-widest text-xs"
                >
                  Fechar Detalhes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vendas;
