import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, Sale } from '../types';
import { Plus, Search, Filter, Trash2, ShoppingCart, Tag, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { calcularLucro } from '../utils/calculos';

const Estoque: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('giropro_produtos', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('giropro_vendas', []);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSell = (product: Product) => {
    const profit = calcularLucro(product.costValue, product.salePrice, product.taxPercentage);
    
    const newSale: Sale = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      saleDate: new Date().toISOString(),
      salePrice: product.salePrice,
      costValue: product.costValue,
      taxPercentage: product.taxPercentage,
      profit: profit
    };

    setSales([...sales, newSale]);
    setProducts(products.map(p => 
      p.id === product.id 
        ? { ...p, status: 'Vendido', soldAt: Date.now() } 
        : p
    ));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Estoque</h2>
        <button 
          onClick={() => navigate('/novo-produto')}
          className="bg-[#00c853] text-[#0b0f14] p-3 rounded-2xl shadow-[0_0_15px_rgba(0,200,83,0.3)] active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Buscar produto..."
          className="w-full bg-[#121821] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00c853]/50 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {filteredProducts.map(product => (
            <motion.div 
              layout
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-[#121821] rounded-2xl border border-white/5 overflow-hidden ${product.status === 'Vendido' ? 'opacity-60' : ''}`}
            >
              <div className="flex p-4 gap-4">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-slate-800" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600">
                    <Tag size={24} />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white leading-tight">{product.name}</h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                        product.status === 'Vendido' ? 'bg-slate-800 text-slate-500' : 'bg-[#00c853]/10 text-[#00c853]'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mt-1">{product.category}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Preço Venda</span>
                      <span className="text-sm font-black text-white">R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg active:scale-90 transition-transform"
                      >
                        <Trash2 size={16} />
                      </button>
                      {product.status === 'Em estoque' && (
                        <button 
                          onClick={() => handleSell(product)}
                          className="p-2 bg-[#00c853]/10 text-[#00c853] rounded-lg active:scale-90 transition-transform"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 px-4 py-2 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(product.purchaseDate).toLocaleDateString('pt-BR')}</span>
                <span>Custo: R$ {product.costValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 font-bold uppercase text-xs">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Estoque;
