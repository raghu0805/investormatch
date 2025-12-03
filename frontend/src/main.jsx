import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './global.css'
import DataContext from './context/DataContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google"
createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="230231015330-31e3rgelkj4l90qunemfsljguvq4s83d.apps.googleusercontent.com">
    <DataContext>
      <BrowserRouter>
        <StrictMode>
          <App />
          <Toaster />
        </StrictMode>,
      </BrowserRouter>
    </DataContext>
  </GoogleOAuthProvider>
)
