import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, ProductCondition } from '../types';
import { Camera, ArrowLeft, Save, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'Informática',
  'Celular',
  'Tablet',
  'Notebook',
  'Computadores',
  'Eletrônicos',
  'Videogame',
  'TV / Áudio',
  'Eletrodomésticos',
  'Móveis',
  'Decoração',
  'Ferramentas',
  'Máquinas',
  'Peças Automotivas',
  'Carros',
  'Motos',
  'Bicicletas',
  'Imóveis',
  'Instrumentos Musicais',
  'Relógios',
  'Perfumes',
  'Roupas e Acessórios',
  'Calçados',
  'Joias / Bijuterias',
  'Colecionáveis',
  'Brinquedos',
  'Esportes',
  'Equipamentos Profissionais',
  'Outros'
];
const CONDITIONS: ProductCondition[] = ['Pronto para venda', 'Aguardando reparo', 'Em melhoria'];

const NovoProduto: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<(string | undefined)[]>(Array(5).fill(undefined));

  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleImageUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...photos];
        newPhotos[index] = reader.result as string;
        setPhotos(newPhotos);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const salePrice = formData.get('salePrice');

      // 2. Validate the form before saving
      if (!name || !salePrice) {
        setSaveError('Preencha nome e valor do produto.');
        return;
      }
      
      const validPhotos = photos.filter((p): p is string => p !== undefined);

      // 3. Fix LocalStorage saving
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: name,
        category: formData.get('category') as string,
        purchaseDate: formData.get('purchaseDate') as string,
        costValue: Number(formData.get('costValue')),
        salePrice: Number(salePrice),
        quantity: Number(formData.get('quantity')),
        taxPercentage: Number(formData.get('taxPercentage')),
        observations: formData.get('observations') as string,
        status: formData.get('status') as ProductCondition,
        image: validPhotos[0],
        photos: validPhotos,
        availability: 'Em estoque',
        createdAt: Date.now(),
        // Adding fields requested in example structure
        // @ts-ignore
        price: Number(salePrice),
        // @ts-ignore
        photo: validPhotos[0],
        priceHistory: [
          {
            price: Number(formData.get('costValue')),
            date: new Date().toISOString().split('T')[0],
            type: 'created'
          }
        ]
      };

      // 4. If LocalStorage is empty, initialize it as an empty array
      // (Handled by useLocalStorage hook)
      setProducts(prev => [newProduct, ...prev]);

      // 6. After saving
      setSaveSuccess('Produto salvo com sucesso.');
      setSaveError('');

      setTimeout(() => {
        navigate('/estoque');
      }, 1500);

    } catch (error) {
      // 7. Console error logs if save fails
      console.error('Erro ao salvar produto:', error);
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
        {/* Photos Upload Section */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Fotos do Produto (Máx 5)</label>
          <div className="grid grid-cols-5 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square bg-[#121821] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                {photo ? (
                  <img src={photo} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={20} className="text-slate-700" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload(index)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase text-center">Toque nos quadrados para adicionar fotos</span>
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
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Status do Produto</label>
            <div className="relative">
              <select name="status" className="w-full bg-[#121821] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00c853]/50 appearance-none">
                {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
