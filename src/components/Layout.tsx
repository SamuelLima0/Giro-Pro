import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-200 pb-20 max-w-md mx-auto relative overflow-x-hidden">
      <header className="p-6">
        <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
          GIRO <span className="text-[#00c853]">PRO</span>
        </h1>
      </header>
      <main className="px-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
