/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  Archive, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  X,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type ProductStatus = 'Em estoque' | 'Vendido';

interface Product {
  id: string;
  name: string;
  category: string;
  investedValue: number;
  salePrice: number;
  extraCosts: number;
  observations: string;
  status: ProductStatus;
  createdAt: number;
  soldAt?: number;
}

type Tab = 'dashboard' | 'inventory' | 'add';

// --- Constants ---

const CATEGORIES = ['Eletrônicos', 'Móveis', 'Moda', 'Ferramentas', 'Automotivo', 'Outros'];
const MONTHLY_GOAL = 5000; // Exemplo de meta mensal

// --- Components ---

const StatCard = ({ title, value, icon: Icon, colorClass = "text-neon-green" }: { title: string, value: string | number, icon: any, colorClass?: string }) => (
  <div className="glass-card p-5 flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <span className="text-slate-400 text-sm font-medium">{title}</span>
      <div className={`p-2 rounded-lg bg-slate-800 ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <span className="text-2xl font-bold tracking-tight">
      {typeof value === 'number' ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : value}
    </span>
  </div>
);

const ProductCard: React.FC<{ 
  product: Product, 
  onEdit: (p: Product) => void, 
  onDelete: (id: string) => void, 
  onToggleStatus: (id: string) => void 
}> = ({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  const netProfit = product.salePrice - product.investedValue - product.extraCosts;
  const margin = (netProfit / product.salePrice) * 100;
  const isStale = product.status === 'Em estoque' && (Date.now() - product.createdAt > 30 * 24 * 60 * 60 * 1000);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex flex-col gap-4 relative overflow-hidden"
    >
      {isStale && (
        <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl border-l border-b border-amber-500/30">
          Parado +30 dias
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-white leading-tight">{product.name}</h3>
          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <Tag size={12} /> {product.category}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          product.status === 'Vendido' ? 'bg-neon-green/10 text-neon-green' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {product.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 p-3 rounded-xl">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Lucro Líquido</span>
          <span className={`text-sm font-bold ${netProfit >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Margem</span>
          <span className="text-sm font-bold text-white">
            {isNaN(margin) ? '0' : margin.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(product)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => onDelete(product.id)}
            className="p-2 rounded-lg bg-slate-800 text-red-400/70 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <button 
          onClick={() => onToggleStatus(product.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            product.status === 'Vendido' 
              ? 'bg-slate-800 text-slate-400' 
              : 'bg-neon-green text-dark-bg neon-shadow'
          }`}
        >
          {product.status === 'Vendido' ? <Archive size={14} /> : <CheckCircle2 size={14} />}
          {product.status === 'Vendido' ? 'Voltar Estoque' : 'Marcar Vendido'}
        </button>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Persistence ---

  useEffect(() => {
    const saved = localStorage.getItem('giro_pro_data');
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('giro_pro_data', JSON.stringify(products));
  }, [products]);

  // --- Calculations ---

  const stats = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const soldProducts = products.filter(p => p.status === 'Vendido');
    const inStockProducts = products.filter(p => p.status === 'Em estoque');

    const totalRevenue = soldProducts.reduce((acc, p) => acc + p.salePrice, 0);
    const totalInvestment = products.reduce((acc, p) => acc + p.investedValue + p.extraCosts, 0);
    const stockValue = inStockProducts.reduce((acc, p) => acc + p.investedValue, 0);
    
    const totalNetProfit = soldProducts.reduce((acc, p) => {
      return acc + (p.salePrice - p.investedValue - p.extraCosts);
    }, 0);

    const staleProductsCount = inStockProducts.filter(p => p.createdAt < thirtyDaysAgo).length;

    const goalProgress = Math.min((totalNetProfit / MONTHLY_GOAL) * 100, 100);

    return {
      totalRevenue,
      totalInvestment,
      stockValue,
      totalNetProfit,
      staleProductsCount,
      goalProgress
    };
  }, [products]);

  // --- Handlers ---

  const handleAddOrEditProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData: Partial<Product> = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      investedValue: Number(formData.get('investedValue')),
      salePrice: Number(formData.get('salePrice')),
      extraCosts: Number(formData.get('extraCosts')),
      observations: formData.get('observations') as string,
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...productData as Omit<Product, 'id' | 'status' | 'createdAt'>,
        status: 'Em estoque',
        createdAt: Date.now(),
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    
    setIsModalOpen(false);
    setActiveTab('inventory');
  };

  const toggleStatus = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus: ProductStatus = p.status === 'Em estoque' ? 'Vendido' : 'Em estoque';
        return { 
          ...p, 
          status: newStatus,
          soldAt: newStatus === 'Vendido' ? Date.now() : undefined
        };
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // --- Components removed from here ---

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative pb-24">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
            GIRO <span className="text-neon-green">PRO</span>
          </h1>
          <p className="text-slate-500 text-xs font-medium">Controle de Brick & Revenda</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-neon-green text-dark-bg p-3 rounded-2xl neon-shadow"
        >
          <PlusCircle size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-6"
            >
              {/* Goal Progress */}
              <div className="glass-card p-6 neon-border">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Meta Mensal</span>
                    <h2 className="text-3xl font-black text-white">R$ {MONTHLY_GOAL}</h2>
                  </div>
                  <span className="text-neon-green font-black text-xl">{stats.goalProgress.toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.goalProgress}%` }}
                    className="h-full bg-neon-green neon-shadow"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard title="Lucro Líquido" value={stats.totalNetProfit} icon={TrendingUp} />
                <StatCard title="Faturamento" value={stats.totalRevenue} icon={DollarSign} colorClass="text-blue-400" />
                <StatCard title="Investimento" value={stats.totalInvestment} icon={Package} colorClass="text-purple-400" />
                <StatCard title="Em Estoque" value={stats.stockValue} icon={Archive} colorClass="text-amber-400" />
              </div>

              {/* Alerts */}
              {stats.staleProductsCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-amber-500/20 p-2 rounded-xl text-amber-500">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-amber-500 font-bold text-sm">Produtos Parados</p>
                    <p className="text-slate-400 text-xs">{stats.staleProductsCount} itens há mais de 30 dias sem giro.</p>
                  </div>
                </div>
              )}

              {/* Recent Activity Placeholder */}
              <div className="mt-4">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-neon-green" /> Atividade Recente
                </h3>
                <div className="flex flex-col gap-3">
                  {products.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${p.status === 'Vendido' ? 'bg-neon-green' : 'bg-blue-400'}`} />
                        <span className="text-sm font-medium text-slate-300">{p.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="text-slate-500 text-center py-8 text-sm italic">Nenhuma atividade registrada ainda.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">Seu Estoque</h2>
                <span className="text-xs text-slate-500 font-bold uppercase">{products.length} Itens</span>
              </div>
              
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="p-6 bg-slate-800/50 rounded-full text-slate-600">
                    <Package size={48} />
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold">Estoque vazio</p>
                    <p className="text-slate-600 text-xs max-w-[200px]">Comece cadastrando seu primeiro produto para girar.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {products.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onEdit={openEditModal}
                      onDelete={deleteProduct}
                      onToggleStatus={toggleStatus}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 glass-card border border-white/10 flex items-center justify-around px-2 z-40 shadow-2xl">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-neon-green' : 'text-slate-500'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Início</span>
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'inventory' ? 'text-neon-green' : 'text-slate-500'}`}
        >
          <Archive size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Estoque</span>
        </button>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <div className="bg-neon-green text-dark-bg p-2 rounded-xl -mt-10 shadow-lg shadow-neon-green/20">
            <PlusCircle size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Novo</span>
        </button>
      </nav>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-dark-bg/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-card-bg rounded-t-[32px] sm:rounded-[32px] p-8 pb-12 sm:pb-8 shadow-2xl border-t border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-slate-800 rounded-full text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddOrEditProduct} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Nome do Item</label>
                  <input 
                    name="name" 
                    required 
                    defaultValue={editingProduct?.name}
                    placeholder="Ex: iPhone 13 Pro Max"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Categoria</label>
                  <select name="category" required defaultValue={editingProduct?.category || CATEGORIES[0]}>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Investimento</label>
                    <input 
                      name="investedValue" 
                      type="number" 
                      step="0.01" 
                      required 
                      defaultValue={editingProduct?.investedValue}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Venda Prevista</label>
                    <input 
                      name="salePrice" 
                      type="number" 
                      step="0.01" 
                      required 
                      defaultValue={editingProduct?.salePrice}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Gastos Extras (Melhorias)</label>
                  <input 
                    name="extraCosts" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingProduct?.extraCosts || 0}
                    placeholder="0,00"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Observações</label>
                  <textarea 
                    name="observations" 
                    rows={2} 
                    defaultValue={editingProduct?.observations}
                    placeholder="Detalhes sobre o estado do item..."
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green/50 transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="mt-4 bg-neon-green text-dark-bg font-black py-4 rounded-2xl flex items-center justify-center gap-2 neon-shadow"
                >
                  {editingProduct ? <Edit3 size={20} /> : <PlusCircle size={20} />}
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Item'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
