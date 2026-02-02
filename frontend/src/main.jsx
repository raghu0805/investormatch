import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./global.css";
import DataContext from "./context/DataContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("VITE_GOOGLE_CLIENT_ID:", clientId);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <DataContext>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </DataContext>
    </GoogleOAuthProvider>
  </StrictMode>
);
