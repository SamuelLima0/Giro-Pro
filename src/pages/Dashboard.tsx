import React, { useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, Sale, AppSettings } from '../types';
import { TrendingUp, DollarSign, ShoppingBag, RefreshCcw, Target, Package, Wallet, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const [products] = useLocalStorage<Product[]>('giropro_produtos', []);
  const [sales] = useLocalStorage<Sale[]>('giropro_vendas', []);
  const [settings] = useLocalStorage<AppSettings>('giropro_settings', { monthlyGoal: 5000 });

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.salePrice, 0);
    const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
    const totalCost = sales.reduce((acc, s) => acc + s.costValue, 0);
    
    const avgMargin = sales.length > 0 
      ? (totalProfit / totalRevenue) * 100 
      : 0;

    // Giro médio (dias)
    const soldProducts = products.filter(p => p.availability === 'Vendido' && p.soldAt);
    const avgGiro = soldProducts.length > 0
      ? soldProducts.reduce((acc, p) => {
          const diff = Math.ceil((p.soldAt! - p.createdAt) / (1000 * 60 * 60 * 24));
          return acc + diff;
        }, 0) / soldProducts.length
      : 0;

    // Goal progress (current month)
    const now = new Date();
    const currentMonthSales = sales.filter(s => {
      const saleDate = new Date(s.saleDate);
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    });
    const currentMonthRevenue = currentMonthSales.reduce((acc, s) => acc + s.salePrice, 0);
    const goalProgress = Math.min((currentMonthRevenue / settings.monthlyGoal) * 100, 100);

    // Valor Total do Estoque
    const totalStockValue = products
      .filter(p => p.availability === 'Em estoque')
      .reduce((acc, p) => acc + p.costValue, 0);

    const totalCompanyCash = sales.reduce((acc, s) => acc + (s.companyCash || 0), 0);
    const totalCompanyCapital = totalStockValue + totalCompanyCash;

    // Top Profitable Products
    const profitByProduct = sales.reduce((acc: Record<string, number>, s) => {
      acc[s.productName] = (acc[s.productName] || 0) + s.profit;
      return acc;
    }, {});

    const topProfitableProducts = Object.entries(profitByProduct)
      .map(([name, profit]) => ({ name, profit }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    return {
      totalRevenue,
      totalProfit,
      avgMargin,
      avgGiro,
      totalSales: sales.length,
      totalReinvested: totalCost,
      goalProgress,
      currentMonthRevenue,
      totalStockValue,
      totalCompanyCash,
      totalCompanyCapital,
      topProfitableProducts
    };
  }, [sales, products, settings.monthlyGoal]);

  const StatCard = ({ title, value, icon: Icon, colorClass = "text-[#00c853]", suffix = "" }: any) => (
    <div className="bg-[#121821] p-5 rounded-2xl border border-white/5 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg bg-slate-800/50 ${colorClass}`}>
          <Icon size={16} />
        </div>
      </div>
      <span className="text-xl font-bold tracking-tight text-white">
        {typeof value === 'number' && !suffix.includes('%') && !suffix.includes('dias')
          ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
          : `${value}${suffix}`}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Goal Progress */}
      <div className="bg-[#121821] p-6 rounded-2xl border border-[#00c853]/20">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Meta Mensal</span>
            <h2 className="text-2xl font-black text-white">R$ {settings.monthlyGoal.toLocaleString('pt-BR')}</h2>
          </div>
          <span className="text-[#00c853] font-black text-xl">{stats.goalProgress.toFixed(0)}%</span>
        </div>
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.goalProgress}%` }}
            className="h-full bg-[#00c853] shadow-[0_0_10px_rgba(0,200,83,0.5)]"
          />
        </div>
        <p className="text-slate-500 text-[10px] mt-3 uppercase font-bold tracking-tighter">
          Faturamento este mês: R$ {stats.currentMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Capital Total da Empresa" value={stats.totalCompanyCapital} icon={Briefcase} colorClass="text-indigo-400" />
        <StatCard title="Caixa da Empresa" value={stats.totalCompanyCash} icon={Wallet} colorClass="text-purple-400" />
        <StatCard title="Lucro Total" value={stats.totalProfit} icon={TrendingUp} colorClass="text-[#00c853]" />
        <StatCard title="Valor Total do Estoque" value={stats.totalStockValue} icon={Package} colorClass="text-emerald-400" />
        <StatCard title="Faturamento" value={stats.totalRevenue} icon={DollarSign} />
        <StatCard title="Margem Média" value={stats.avgMargin.toFixed(1)} suffix="%" icon={Target} colorClass="text-blue-400" />
        <StatCard title="Giro Médio" value={stats.avgGiro.toFixed(0)} suffix=" dias" icon={RefreshCcw} colorClass="text-amber-400" />
        <StatCard title="Total Vendas" value={stats.totalSales} icon={ShoppingBag} colorClass="text-purple-400" />
      </div>

      {/* Top Profitable Products */}
      <div className="mt-2">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
          Top produtos mais lucrativos
        </h3>
        <div className="flex flex-col gap-3">
          {stats.topProfitableProducts.map((product, index) => (
            <div key={product.name} className="flex items-center justify-between p-4 bg-[#121821] rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{product.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Ranking de Lucro</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-[#00c853]">
                  R$ {product.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Lucro Total</div>
              </div>
            </div>
          ))}
          {stats.topProfitableProducts.length === 0 && (
            <div className="text-center py-10 bg-[#121821] rounded-2xl border border-white/5 border-dashed">
              <p className="text-slate-500 text-xs font-bold uppercase">Nenhuma venda registrada ainda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-2">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
          Últimas Vendas
        </h3>
        <div className="flex flex-col gap-3">
          {sales.slice(-3).reverse().map(sale => (
            <div key={sale.id} className="flex items-center justify-between p-4 bg-[#121821] rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{sale.productName}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">
                  {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-[#00c853]">
                  R$ {sale.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div className="text-[10px] text-slate-500 font-bold">
                  Lucro: R$ {sale.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}
          {sales.length === 0 && (
            <div className="text-center py-10 bg-[#121821] rounded-2xl border border-white/5 border-dashed">
              <p className="text-slate-500 text-xs font-bold uppercase">Nenhuma venda registrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
