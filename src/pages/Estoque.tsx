import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, Sale } from '../types';
import { Plus, Search, Trash2, ShoppingCart, Tag, Calendar, X, CheckCircle2, CreditCard, Banknote, Smartphone, Percent, RefreshCcw, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const Estoque: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('giropro_produtos', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('giropro_vendas', []);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form State
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('PIX');
  const [installments, setInstallments] = useState('1');
  const [taxPercentage, setTaxPercentage] = useState('0');
  const [askingPrice, setAskingPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [profitPercentage, setProfitPercentage] = useState('20');
  const [customPercentage, setCustomPercentage] = useState('');
  const [tradeItemName, setTradeItemName] = useState('');
  const [tradeItemValue, setTradeItemValue] = useState('');
  const [cashDifference, setCashDifference] = useState('');

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeImage, setTradeImage] = useState<string | undefined>(undefined);

  const handleTradeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTradeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmTradeToStock = () => {
    if (!lastSale) return;

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: lastSale.tradeItemName || 'Item de Troca',
      category: 'Outros',
      purchaseDate: new Date().toISOString().split('T')[0],
      costValue: lastSale.tradeItemValue || 0,
      salePrice: lastSale.tradeItemValue || 0,
      quantity: 1,
      taxPercentage: 0,
      observations: `Recebido em troca na venda de ${lastSale.productName}`,
      image: tradeImage,
      availability: 'Em estoque',
      status: 'Pronto para venda',
      createdAt: Date.now(),
      priceHistory: [
        {
          price: lastSale.tradeItemValue || 0,
          date: new Date().toISOString().split('T')[0],
          type: 'created'
        }
      ]
    };

    setProducts([newProduct, ...products]);
    setIsTradeModalOpen(false);
    setTradeImage(undefined);
    setShowSummary(true);
  };

  const handleCancelTrade = () => {
    setIsTradeModalOpen(false);
    setTradeImage(undefined);
    setShowSummary(true);
  };

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

  const openSaleModal = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setAskingPrice(product.salePrice.toString());
    setFinalPrice(product.salePrice.toString());
    setIsModalOpen(true);
  };

  const openDetailsModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleUpdatePrice = (newPrice: number) => {
    if (!selectedProduct) return;
    
    const updatedProduct: Product = {
      ...selectedProduct,
      salePrice: newPrice,
      priceHistory: [
        ...(selectedProduct.priceHistory || []),
        {
          price: newPrice,
          date: new Date().toISOString().split('T')[0],
          type: 'price_update'
        }
      ]
    };

    setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    setSelectedProduct(updatedProduct);
  };

  const handleConfirmSale = () => {
    if (!selectedProduct) return;

    const vVenda = paymentMethod === 'Troca + Volta' 
      ? Number(tradeItemValue) + Number(cashDifference)
      : Number(finalPrice);
    const vAnunciado = Number(askingPrice);
    const vCusto = selectedProduct.costValue;
    const pTaxa = paymentMethod === 'Cartão de Crédito' ? Number(taxPercentage) : 0;
    const pLucro = profitPercentage === 'custom' ? Number(customPercentage) : Number(profitPercentage);
    
    const taxAmount = vVenda * (pTaxa / 100);
    const discount = vAnunciado - vVenda;
    const profit = vVenda - vCusto - taxAmount;

    const personalProfit = profit * (pLucro / 100);
    const companyCash = profit - personalProfit;
    const reinvestmentCapital = vCusto;

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
      tradeItemName: paymentMethod === 'Troca + Volta' ? tradeItemName : undefined,
      tradeItemValue: paymentMethod === 'Troca + Volta' ? Number(tradeItemValue) : undefined,
      cashDifference: paymentMethod === 'Troca + Volta' ? Number(cashDifference) : undefined,
      askingPrice: vAnunciado,
      discount,
      taxAmount,
      profitPercentage: pLucro,
      personalProfit,
      companyCash,
      reinvestmentCapital
    };

    setSales([...sales, newSale]);
    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        const newQuantity = p.quantity - 1;
        if (newQuantity <= 0) return null;
        return {
          ...p,
          quantity: newQuantity,
          priceHistory: [
            ...(p.priceHistory || []),
            {
              price: vVenda,
              date: new Date().toISOString().split('T')[0],
              type: 'sold'
            }
          ]
        };
      }
      return p;
    }).filter((p): p is Product => p !== null);

    setProducts(updatedProducts);

    setLastSale(newSale);
    setIsModalOpen(false);
    
    if (paymentMethod === 'Troca + Volta') {
      setIsTradeModalOpen(true);
    } else {
      setShowSummary(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Estoque</h2>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00c853] transition-colors">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar produto..."
          className="w-full bg-[#121821] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm focus:outline-none focus:border-[#00c853]/50 transition-colors"
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
              onClick={() => openDetailsModal(product)}
              className={`bg-[#121821] rounded-2xl border border-white/5 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${product.availability === 'Vendido' ? 'opacity-60' : ''}`}
            >
              <div className="flex p-4 gap-4">
                {(product.photos && product.photos.length > 0) || product.image ? (
                  <img src={product.photos?.[0] || product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-slate-800" />
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
                        product.availability === 'Vendido' ? 'bg-slate-800 text-slate-500' : 'bg-[#00c853]/10 text-[#00c853]'
                      }`}>
                        {product.availability}
                      </span>
                    </div>
                    <div className="flex flex-col mt-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{product.category}</span>
                      {product.status && (
                        <span className="text-[9px] text-blue-400 font-bold uppercase mt-0.5">Status: {product.status}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Preço Venda</span>
                      <span className="text-sm font-black text-white">R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id);
                        }}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg active:scale-90 transition-transform"
                      >
                        <Trash2 size={16} />
                      </button>
                      {product.availability === 'Em estoque' && (
                        <button 
                          onClick={(e) => openSaleModal(product, e)}
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

      {/* Modal de Detalhes do Produto */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121821] w-full max-w-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">Detalhes do Produto</h3>
                  <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Gallery */}
                  <div className="flex flex-col gap-3">
                    <div className="w-full aspect-square bg-[#0b0f14] rounded-2xl overflow-hidden border border-white/5">
                      {selectedProduct.photos && selectedProduct.photos.length > 0 ? (
                        <img 
                          src={selectedProduct.photos[0]} 
                          alt={selectedProduct.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : selectedProduct.image ? (
                        <img 
                          src={selectedProduct.image} 
                          alt={selectedProduct.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <Tag size={64} />
                        </div>
                      )}
                    </div>
                    
                    {selectedProduct.photos && selectedProduct.photos.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.photos.slice(1).map((photo, idx) => (
                          <div key={idx} className="aspect-square bg-[#0b0f14] rounded-xl overflow-hidden border border-white/5">
                            <img src={photo} alt={`Photo ${idx + 2}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <h4 className="text-xl font-black text-white">{selectedProduct.name}</h4>
                      <span className="text-xs font-bold text-slate-500 uppercase">{selectedProduct.category}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-xl relative group">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Preço Venda</span>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-[#00c853]">R$ {selectedProduct.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          {selectedProduct.availability === 'Em estoque' && (
                            <button 
                              onClick={() => {
                                const newPrice = prompt('Novo preço de venda:', selectedProduct.salePrice.toString());
                                if (newPrice && !isNaN(Number(newPrice))) {
                                  handleUpdatePrice(Number(newPrice));
                                }
                              }}
                              className="p-1 bg-white/10 rounded hover:bg-white/20 text-slate-400 transition-colors"
                            >
                              <Tag size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Custo</span>
                        <span className="text-lg font-black text-white">R$ {selectedProduct.costValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Price History Section */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">Histórico de Preços</span>
                      <div className="bg-white/5 rounded-xl overflow-hidden border border-white/5">
                        <table className="w-full text-[10px] text-left">
                          <thead className="bg-white/5 text-slate-500 uppercase font-black">
                            <tr>
                              <th className="px-3 py-2">Data</th>
                              <th className="px-3 py-2">Evento</th>
                              <th className="px-3 py-2 text-right">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {(selectedProduct.priceHistory || []).length > 0 ? (
                              selectedProduct.priceHistory?.map((entry, idx) => (
                                <tr key={idx} className="text-slate-300">
                                  <td className="px-3 py-2">{new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                  <td className="px-3 py-2 italic">
                                    {entry.type === 'created' ? 'Produto cadastrado' : 
                                     entry.type === 'price_update' ? 'Preço atualizado' : 
                                     'Produto vendido'}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-white">
                                    R$ {entry.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="px-3 py-4 text-center text-slate-500 italic">Nenhum histórico disponível</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">Observações</span>
                      <div className="bg-white/5 p-4 rounded-xl text-sm text-slate-300 min-h-[80px]">
                        {selectedProduct.observations || 'Nenhuma observação.'}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-colors uppercase tracking-widest text-xs"
                >
                  Fechar Detalhes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Venda */}
      <AnimatePresence>
        {isTradeModalOpen && lastSale && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121821] w-full max-w-sm rounded-3xl border border-blue-500/30 overflow-hidden shadow-2xl"
            >
              <div className="p-8 flex flex-col gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-2">
                    <RefreshCcw size={40} />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Adicionar ao estoque?</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Item recebido na troca</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Image Upload */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-full aspect-square max-w-[120px] bg-[#0b0f14] rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                      {tradeImage ? (
                        <img src={tradeImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={24} className="text-slate-700" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleTradeImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Toque para foto</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Item</span>
                      <span className="text-sm font-bold text-white">{lastSale.tradeItemName}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Valor Estimado</span>
                      <span className="text-sm font-bold text-blue-400">R$ {lastSale.tradeItemValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleConfirmTradeToStock}
                    className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 transition-transform uppercase tracking-widest text-xs"
                  >
                    Adicionar ao Estoque
                  </button>
                  <button 
                    onClick={handleCancelTrade}
                    className="w-full bg-white/5 hover:bg-white/10 text-slate-400 font-bold py-4 rounded-2xl transition-colors uppercase tracking-widest text-[10px]"
                  >
                    Agora não
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Como foi a venda?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'Dinheiro', icon: Banknote },
                        { id: 'PIX', icon: Smartphone },
                        { id: 'Cartão de Débito', icon: CreditCard },
                        { id: 'Cartão de Crédito', icon: CreditCard },
                        { id: 'Troca + Volta', icon: RefreshCcw }
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

                  {paymentMethod === 'Troca + Volta' && (
                    <div className="flex flex-col gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Item recebido na troca</label>
                        <input 
                          type="text" 
                          placeholder="Ex: iPhone 11"
                          value={tradeItemName}
                          onChange={(e) => setTradeItemName(e.target.value)}
                          className="bg-white/5 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00c853]/50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Valor do Item (R$)</label>
                          <input 
                            type="number" 
                            placeholder="0,00"
                            value={tradeItemValue}
                            onChange={(e) => setTradeItemValue(e.target.value)}
                            className="bg-white/5 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00c853]/50"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Valor da Volta (R$)</label>
                          <input 
                            type="number" 
                            placeholder="0,00"
                            value={cashDifference}
                            onChange={(e) => setCashDifference(e.target.value)}
                            className="bg-white/5 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00c853]/50"
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Valor Total da Venda</span>
                        <span className="text-sm font-black text-[#00c853]">R$ {(Number(tradeItemValue) + Number(cashDifference)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}

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

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Distribuição de Lucro (Pro-labore %)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['10', '15', '20', '25', '30', 'custom'].map(p => (
                        <button
                          key={p}
                          onClick={() => setProfitPercentage(p)}
                          className={`p-2 rounded-xl border text-[10px] font-bold transition-all ${
                            profitPercentage === p 
                              ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                              : 'bg-white/5 border-white/5 text-slate-400'
                          }`}
                        >
                          {p === 'custom' ? 'Outro' : `${p}%`}
                        </button>
                      ))}
                    </div>
                    {profitPercentage === 'custom' && (
                      <input 
                        type="number" 
                        placeholder="Digite a % personalizada"
                        value={customPercentage}
                        onChange={(e) => setCustomPercentage(e.target.value)}
                        className="bg-white/5 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500/50 mt-1"
                      />
                    )}
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

                <div className="pb-8">
                  <button 
                    onClick={handleConfirmSale}
                    className="w-full bg-[#00c853] text-[#0b0f14] font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(0,200,83,0.4)] active:scale-95 transition-transform uppercase tracking-widest text-sm"
                  >
                    Confirmar Venda
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => navigate('/novo-produto')}
          className="bg-[#00c853] text-[#0b0f14] w-16 h-16 rounded-full shadow-[0_10px_25px_rgba(0,200,83,0.4)] flex items-center justify-center active:scale-90 transition-all hover:scale-105"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

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
                  <div className="mt-2 p-4 bg-[#00c853]/10 border border-[#00c853]/20 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[#00c853] uppercase tracking-widest">Lucro Total</span>
                      <span className="text-xl font-black text-white">R$ {lastSale.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pt-3 border-t border-[#00c853]/20">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Pro-labore ({lastSale.profitPercentage}%)</span>
                        <span className="text-xs font-bold text-blue-400">R$ {lastSale.personalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Caixa Empresa</span>
                        <span className="text-xs font-bold text-purple-400">R$ {lastSale.companyCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Capital Reinvestimento</span>
                        <span className="text-xs font-bold text-amber-400">R$ {lastSale.reinvestmentCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
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
