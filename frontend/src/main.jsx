import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./global.css";
import DataContext from "./context/DataContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="230231015330-8mb8t6hv76vdkeccuu8n29g51i3kb3fn.apps.googleusercontent.com">
      <DataContext>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </DataContext>
    </GoogleOAuthProvider>
  </StrictMode>
);
