// Purpose: React entry point that hydrates the root element and wraps the app in StrictMode for dev checks.
// Editing: Add providers (router, state, theme) here; keep StrictMode unless you have a strong reason to remove it.
// Dependencies: Mounts App component and relies on index.html having a #root element.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Estilos globais
import './index.css'
import './styles/mobile.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
