import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './global.css'
import DataContext from './context/DataContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google"
console.log("USED CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
createRoot(document.getElementById('root')).render(

  <GoogleOAuthProvider clientId="230231015330-8mb8t6hv76vdkeccuu8n29g51i3kb3fn.apps.googleusercontent.com">
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
