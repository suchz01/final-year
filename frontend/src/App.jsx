// import './App.css';
import React from 'react';
// import SkillForm from './components/SkillForm';
import Login from "./components/Login";
import SkillsPrediction from "./pages/SkillsPrediction";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
   
    {/* <Login /> */}
    
     <BrowserRouter>
     <SkillsPrediction/>
      
    </BrowserRouter>

    </>
  );
}

export default App;

