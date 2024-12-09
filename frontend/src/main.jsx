import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import reportWebVitals from "./reportWebVitals.js";
import { GoogleOAuthProvider } from '@react-oauth/google';
const clientId = '998898996296-1jpv92rlq2032dfh39dmpg0jaj8f0o6h.apps.googleusercontent.com' 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
    <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
reportWebVitals();