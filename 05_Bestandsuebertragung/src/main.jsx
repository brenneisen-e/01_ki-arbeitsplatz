import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { wendeAn, gleicheGespeicherteDatenAn } from './utils/branding'

wendeAn()
// Gespeicherte Vorgänge auf die aktive Marke bringen (Whitelabel ohne ERGO)
gleicheGespeicherteDatenAn()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
