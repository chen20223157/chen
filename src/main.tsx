import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// GitHub Pages路由处理
if (
  window.location.pathname === '/chen/' ||
  window.location.pathname === '/chen'
) {
  const path = sessionStorage.redirect || '';
  if (path) {
    sessionStorage.removeItem('redirect');
    const newPath = path.replace('/chen', '') || '/';
    window.history.replaceState('', '', newPath);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)