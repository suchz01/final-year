import React from 'react';
import Prediction from '../components/Prediction';
import SkillsAdd from '../components/Skillsadd';
import { Route, Routes } from 'react-router-dom';

function SkillsPrediction() {
  return (
    <Routes>
      <Route path="/" element={<SkillsAdd />} />
      <Route path="/Prediction" element={<Prediction />} />
    </Routes>
  )
}

export default SkillsPrediction
