import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { criarMundo } from './game/jogo.js';
import './index.css';

// No npm run dev, ?semente=123 repete o mapa (a semente aparece no painel Dev)
const semente = import.meta.env.DEV ? new URLSearchParams(location.search).get('semente') : null;
criarMundo(semente ? Number(semente) >>> 0 : undefined);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
