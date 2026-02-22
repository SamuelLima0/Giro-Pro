import React, { useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, Sale, AppSettings } from '../types';
import { TrendingUp, DollarSign, ShoppingBag, RefreshCcw, Target } from 'lucide-react';
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
    const soldProducts = products.filter(p => p.status === 'Vendido' && p.soldAt);
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

    return {
      totalRevenue,
      totalProfit,
      avgMargin,
      avgGiro,
      totalSales: sales.length,
      totalReinvested: totalCost,
      goalProgress,
      currentMonthRevenue
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
        <StatCard title="Faturamento" value={stats.totalRevenue} icon={DollarSign} />
        <StatCard title="Lucro Líquido" value={stats.totalProfit} icon={TrendingUp} />
        <StatCard title="Margem Média" value={stats.avgMargin.toFixed(1)} suffix="%" icon={Target} colorClass="text-blue-400" />
        <StatCard title="Giro Médio" value={stats.avgGiro.toFixed(0)} suffix=" dias" icon={RefreshCcw} colorClass="text-amber-400" />
        <StatCard title="Total Vendas" value={stats.totalSales} icon={ShoppingBag} colorClass="text-purple-400" />
        <StatCard title="Reinvestido" value={stats.totalReinvested} icon={RefreshCcw} colorClass="text-indigo-400" />
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
