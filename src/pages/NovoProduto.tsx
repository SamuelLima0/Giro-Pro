import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product } from '../types';
import { Camera, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Eletrônicos', 'Móveis', 'Moda', 'Ferramentas', 'Automotivo', 'Outros'];

const NovoProduto: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('giropro_produtos', []);
  const navigate = useNavigate();
  const [image, setImage] = useState<string | undefined>(undefined);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      purchaseDate: formData.get('purchaseDate') as string,
      costValue: Number(formData.get('costValue')),
      salePrice: Number(formData.get('salePrice')),
      quantity: Number(formData.get('quantity')),
      taxPercentage: Number(formData.get('taxPercentage')),
      observations: formData.get('observations') as string,
      image: image,
      status: 'Em estoque',
      createdAt: Date.now(),
    };

    setProducts([newProduct, ...products]);
    navigate('/estoque');
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-400">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Novo Produto</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Image Upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-full aspect-square max-w-[200px] bg-[#121821] rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera size={40} className="text-slate-700" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Toque para adicionar foto</span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Nome do Produto</label>
            <input name="name" required placeholder="Ex: iPhone 13 Pro" className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Categoria</label>
            <select name="category" className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50 appearance-none">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Data de Compra</label>
            <input name="purchaseDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Valor Custo</label>
              <input name="costValue" type="number" step="0.01" required placeholder="0,00" className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Valor Venda</label>
              <input name="salePrice" type="number" step="0.01" required placeholder="0,00" className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Quantidade</label>
              <input name="quantity" type="number" required defaultValue="1" className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Taxas (%)</label>
              <input name="taxPercentage" type="number" step="0.1" defaultValue="0" className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Observações</label>
            <textarea name="observations" rows={3} placeholder="Detalhes adicionais..." className="bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50 resize-none" />
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
