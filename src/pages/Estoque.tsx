import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, Sale } from '../types';
import { Plus, Search, Trash2, ShoppingCart, Tag, Calendar, X, CheckCircle2, CreditCard, Banknote, Smartphone, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const Estoque: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('giropro_produtos', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('giropro_vendas', []);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form State
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('PIX');
  const [installments, setInstallments] = useState('1');
  const [taxPercentage, setTaxPercentage] = useState('0');
  const [askingPrice, setAskingPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');

  // Summary State
  const [showSummary, setShowSummary] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const openSaleModal = (product: Product) => {
    setSelectedProduct(product);
    setAskingPrice(product.salePrice.toString());
    setFinalPrice(product.salePrice.toString());
    setIsModalOpen(true);
  };

  const handleConfirmSale = () => {
    if (!selectedProduct) return;

    const vVenda = Number(finalPrice);
    const vAnunciado = Number(askingPrice);
    const vCusto = selectedProduct.costValue;
    const pTaxa = paymentMethod === 'Cartão de Crédito' ? Number(taxPercentage) : 0;
    
    const taxAmount = vVenda * (pTaxa / 100);
    const discount = vAnunciado - vVenda;
    const profit = vVenda - vCusto - taxAmount;

    const newSale: Sale = {
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      saleDate: new Date().toISOString(),
      salePrice: vVenda,
      costValue: vCusto,
      taxPercentage: pTaxa,
      profit: profit,
      paymentMethod,
      installments: paymentMethod === 'Cartão de Crédito' ? Number(installments) : undefined,
      askingPrice: vAnunciado,
      discount,
      taxAmount
    };

    setSales([...sales, newSale]);
    setProducts(products.map(p => 
      p.id === selectedProduct.id 
        ? { ...p, status: 'Vendido', soldAt: Date.now() } 
        : p
    ));

    setLastSale(newSale);
    setIsModalOpen(false);
    setShowSummary(true);
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
                          onClick={() => openSaleModal(product)}
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

      {/* Modal de Venda */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-[#0b0f14] w-full max-w-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">Registrar Venda</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Como foi a venda?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'Dinheiro', icon: Banknote },
                        { id: 'PIX', icon: Smartphone },
                        { id: 'Cartão de Débito', icon: CreditCard },
                        { id: 'Cartão de Crédito', icon: CreditCard }
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                            paymentMethod === method.id 
                              ? 'bg-[#00c853]/20 border-[#00c853] text-[#00c853]' 
                              : 'bg-white/5 border-white/5 text-slate-400'
                          }`}
                        >
                          <method.icon size={14} />
                          {method.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'Cartão de Crédito' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Parcelas</label>
                        <input 
                          type="number" 
                          value={installments}
                          onChange={(e) => setInstallments(e.target.value)}
                          className="bg-white/5 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00c853]/50"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Taxa (%)</label>
                        <input 
                          type="number" 
                          value={taxPercentage}
                          onChange={(e) => setTaxPercentage(e.target.value)}
                          className="bg-white/5 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00c853]/50"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Valor Anunciado</label>
                      <input 
                        type="number" 
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(e.target.value)}
                        className="bg-white/5 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00c853]/50"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Valor Negociado</label>
                      <input 
                        type="number" 
                        value={finalPrice}
                        onChange={(e) => setFinalPrice(e.target.value)}
                        className="bg-white/5 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00c853]/50"
                      />
                    </div>
                  </div>

                  {Number(askingPrice) > Number(finalPrice) && (
                    <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-amber-500 uppercase">Desconto Aplicado</span>
                      <span className="text-xs font-black text-white">
                        R$ {(Number(askingPrice) - Number(finalPrice)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                        <span className="ml-1 opacity-50">({(((Number(askingPrice) - Number(finalPrice)) / Number(askingPrice)) * 100).toFixed(1)}%)</span>
                      </span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleConfirmSale}
                  className="w-full bg-[#00c853] text-[#0b0f14] font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(0,200,83,0.3)] active:scale-95 transition-transform uppercase tracking-widest text-sm"
                >
                  Confirmar Venda
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resumo da Venda */}
      <AnimatePresence>
        {showSummary && lastSale && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121821] w-full max-w-sm rounded-3xl border border-[#00c853]/30 overflow-hidden shadow-[0_0_50px_rgba(0,200,83,0.1)]"
            >
              <div className="p-8 flex flex-col gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-[#00c853]/20 text-[#00c853] rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Venda Concluída!</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Resumo da Operação</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Valor Investido</span>
                    <span className="text-sm font-bold text-white">R$ {lastSale.costValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Valor Vendido</span>
                    <span className="text-sm font-bold text-[#00c853]">R$ {lastSale.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Desconto Aplicado</span>
                    <span className="text-sm font-bold text-amber-500">R$ {lastSale.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Taxas da Venda</span>
                    <span className="text-sm font-bold text-red-500">R$ {lastSale.taxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-2 p-4 bg-[#00c853]/10 border border-[#00c853]/20 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black text-[#00c853] uppercase tracking-widest">Lucro Total</span>
                    <span className="text-xl font-black text-white">R$ {lastSale.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowSummary(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-colors uppercase tracking-widest text-xs"
                >
                  Fechar Resumo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Estoque;
