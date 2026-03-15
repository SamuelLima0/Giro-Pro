/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import NovoProduto from './pages/NovoProduto';
import Vendas from './pages/Vendas';
import Relatorios from './pages/Relatorios';
import Ferramentas from './pages/Ferramentas';
import Buscas from './pages/Buscas';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="novo-produto" element={<NovoProduto />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="buscas" element={<Buscas />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="ferramentas" element={<Ferramentas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
