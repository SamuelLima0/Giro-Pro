import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe initialization of LocalStorage keys
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify([]));
  }
  if (!localStorage.getItem('giropro_vendas')) {
    localStorage.setItem('giropro_vendas', JSON.stringify([]));
  }
  if (!localStorage.getItem('giropro_settings')) {
    localStorage.setItem('giropro_settings', JSON.stringify({ monthlyGoal: 5000 }));
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
