import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, ProductCondition, ExtraCost } from '../types';
import { Camera, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'Informática',
  'Celular',
  'Eletrodoméstico',
  'Videogame',
  'Eletrônicos',
  'Móveis',
  'Bicicletas',
  'Motos',
  'Carros',
  'Imóveis',
  'Instrumentos',
  'Peças Automóveis',
  'Roupas e Acessórios',
  'Calçados',
  'Bijuterias',
  'Relógios',
  'Perfumes',
  'Máquinas e Ferramentas',
  'TV / Acessórios',
  'Outros'
];

const CONDITIONS: ProductCondition[] = ['Pronto para venda', 'Aguardando reparo', 'Em melhoria'];

const NovoProduto: React.FC = () => {
  const [productsRaw, setProducts] = useLocalStorage<Product[]>('products', []);
  const products = Array.isArray(productsRaw) ? productsRaw : [];
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Outros');
  const [baseCost, setBaseCost] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [status, setStatus] = useState<ProductCondition>('Pronto para venda');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [extraCosts, setExtraCosts] = useState<ExtraCost[]>([]);
  
  const [extraCostName, setExtraCostName] = useState('');
  const [extraCostValue, setExtraCostValue] = useState('');

  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExtraCost = () => {
    if (extraCostName && extraCostValue) {
      setExtraCosts([...extraCosts, { name: extraCostName, value: Number(extraCostValue) }]);
      setExtraCostName('');
      setExtraCostValue('');
    }
  };

  const removeExtraCost = (index: number) => {
    setExtraCosts(extraCosts.filter((_, i) => i !== index));
  };

  const totalExtraCosts = extraCosts.reduce((sum, cost) => sum + cost.value, 0);
  const totalCost = (Number(baseCost) || 0) + totalExtraCosts;

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!name || !baseCost || !estimatedPrice) {
        setSaveError('Preencha os campos obrigatórios.');
        return;
      }

      const newProduct: Product = {
        id: crypto.randomUUID(),
        name,
        category,
        baseCost: Number(baseCost),
        estimatedPrice: Number(estimatedPrice),
        stock: Number(stock),
        status,
        location,
        notes,
        extraCosts,
        photo,
        createdAt: Date.now(),
        // Compatibility fields
        purchaseDate: new Date().toISOString().split('T')[0],
        costValue: totalCost,
        salePrice: Number(estimatedPrice),
        quantity: Number(stock),
        taxPercentage: 0,
        availability: 'Em estoque',
        priceHistory: [
          {
            price: Number(estimatedPrice),
            date: new Date().toISOString().split('T')[0],
            type: 'created'
          }
        ]
      };

      setProducts(prev => [newProduct, ...prev]);
      setSaveSuccess('Produto salvo com sucesso.');
      setSaveError('');

      setTimeout(() => {
        navigate('/estoque');
      }, 1500);

    } catch (error) {
      console.error("Save product error:", error);
      alert("Ocorreu um erro ao salvar o produto.");
      setSaveError('Erro ao salvar produto. Tente novamente.');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-400">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Novo Produto</h2>
      </div>

      <form onSubmit={saveProduct} className="flex flex-col gap-6">
        {/* Photo Section */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Foto do Produto</label>
          <div className="relative w-full aspect-video bg-[#121821] rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
            {photo ? (
              <img src={photo} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-700">
                <Camera size={40} />
                <span className="text-[10px] font-bold uppercase">Toque para adicionar foto</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {saveError && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold text-center">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="bg-[#00c853]/10 border border-[#00c853]/20 p-4 rounded-xl text-[#00c853] text-xs font-bold text-center">
              {saveSuccess}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Nome do Produto *</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: iPhone 13 Pro" 
              className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Categoria</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50 appearance-none"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Custo Base (R$) *</label>
              <input 
                type="number" 
                step="0.01"
                value={baseCost}
                onChange={(e) => setBaseCost(e.target.value)}
                placeholder="0,00" 
                className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Preço Venda Estimado (R$) *</label>
              <input 
                type="number" 
                step="0.01"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="0,00" 
                className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Estoque</label>
              <input 
                type="number" 
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductCondition)}
                className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50 appearance-none"
              >
                {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
          </div>

          {/* Extra Costs Section */}
          <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold uppercase text-slate-500">Gastos Adicionais</span>
            <div className="flex gap-2">
              <input 
                placeholder="Nome (ex: Frete)" 
                value={extraCostName}
                onChange={(e) => setExtraCostName(e.target.value)}
                className="flex-1 bg-[#0b0f14] border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:border-[#00c853]/50"
              />
              <input 
                type="number" 
                placeholder="Valor" 
                value={extraCostValue}
                onChange={(e) => setExtraCostValue(e.target.value)}
                className="w-24 bg-[#0b0f14] border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:border-[#00c853]/50"
              />
              <button 
                type="button"
                onClick={addExtraCost}
                className="p-3 bg-[#00c853]/20 text-[#00c853] rounded-xl"
              >
                <Plus size={18} />
              </button>
            </div>

            {extraCosts.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {extraCosts.map((cost, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{cost.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">R$ {cost.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <button onClick={() => removeExtraCost(idx)} className="text-red-500 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Financial Summary Box */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Custo Base</span>
                <span>R$ {(Number(baseCost) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Gastos Adicionais</span>
                <span>R$ {totalExtraCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-black uppercase text-white pt-1">
                <span>Total de Custo</span>
                <span className="text-[#00c853]">R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Local</label>
            <input 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Prateleira A1" 
              className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Observações</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3} 
              placeholder="Detalhes adicionais..." 
              className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50 resize-none" 
            />
          </div>
        </div>

        <button type="submit" className="bg-[#00c853] text-[#0b0f14] font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(0,200,83,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Save size={20} /> SALVAR PRODUTO
        </button>
      </form>
    </div>
  );
};

export default NovoProduto;
