import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Wrench, Radar } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/estoque', icon: <Package size={20} />, label: 'Estoque' },
    { to: '/vendas', icon: <ShoppingCart size={20} />, label: 'Vendas' },
    { to: '/buscas', icon: <Radar size={20} />, label: 'Buscas' },
    { to: '/relatorios', icon: <BarChart3 size={20} />, label: 'Relatórios' },
    { to: '/ferramentas', icon: <Wrench size={20} />, label: 'Ferramentas' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#121821] border-t border-white/5 h-16 flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-[#00c853]' : 'text-slate-500'
            }`
          }
        >
          {item.icon}
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
