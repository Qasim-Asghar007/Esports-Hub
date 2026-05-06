import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { AnnouncementProvider } from './context/AnnouncementContext'
import Tutorial   from './components/Tutorial'
import SupportBot from './components/SupportBot'
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AnnouncementProvider>
            <App />
            {/* Global overlays — rendered outside page tree so they survive route changes */}
            <Tutorial />
            <SupportBot />
          </AnnouncementProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
