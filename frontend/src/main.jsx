import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './global.css'
import DataContext from './context/DataContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
    <DataContext>
    <App />
    </DataContext>
  </StrictMode>, 
  </BrowserRouter>
)
