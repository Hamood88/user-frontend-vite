import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './i18n'
import { UserMallCartProvider } from './context/UserMallCartContext'
import MallCartDrawer from './components/MallCartDrawer'

// ✅ FORCE CACHE CLEAR LOG
console.log("🚀 MOONDALA APP v2.1 LOADED - Fixes active");
// Emergency fix: Try to unregister any zombie service workers that might cache old JS
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      // registration.unregister(); // Optional: uncomment if really desperate
      registration.update();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserMallCartProvider>
        <App />
        <MallCartDrawer />
      </UserMallCartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
