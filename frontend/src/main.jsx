import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import './i18n/config'
import { analytics } from './lib/analytics'
import { errorLogger } from './lib/errorLogger'
import ErrorBoundary from './components/ErrorBoundary'

// Initialize analytics and error logging
window.analytics = analytics;
window.errorLogger = errorLogger;



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
