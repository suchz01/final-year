import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// const clientId = '998898996296-1jpv92rlq2032dfh39dmpg0jaj8f0o6h.apps.googleusercontent.com' // TODO: Move to an .env file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <GoogleOAuthProvider clientId={clientId}> */}
      <App />
    {/* </GoogleOAuthProvider> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
