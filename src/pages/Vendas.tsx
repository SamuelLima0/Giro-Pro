import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Sale } from '../types';
import { ShoppingCart, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const Vendas: React.FC = () => {
  const [sales] = useLocalStorage<Sale[]>('giropro_vendas', []);

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
              className="bg-[#121821] p-5 rounded-2xl border border-white/5 flex flex-col gap-3"
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
    </div>
  );
};

export default Vendas;
