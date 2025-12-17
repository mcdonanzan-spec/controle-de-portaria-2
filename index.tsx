
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Não foi possível encontrar o elemento root para montar o app.");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Erro crítico na inicialização:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: white; background: #1E2124; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; font-family: sans-serif;">
      <div>
        <h1 style="color: #F39C12;">Erro de Carregamento</h1>
        <p>O aplicativo não conseguiu iniciar. Isso geralmente acontece por falta das chaves do Supabase na Vercel.</p>
        <p style="font-size: 12px; color: #A0A2A5;">${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <button onclick="window.location.reload()" style="background: #F39C12; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px;">Tentar Novamente</button>
      </div>
    </div>
  `;
}
