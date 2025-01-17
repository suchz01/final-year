import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import SkillsPrediction from "./pages/SkillsPrediction";
import Questions from "./components/Questions";
import Prediction from "./components/Prediction";
import TestPage from "./components/TestPage";
import Profile from "./pages/Profile";
import Homepage from "./components/Homepage";
import EditProfile from "./pages/EditProfile";
import CV from "./components/CV";


function App() {
  const [isLogged, setIslogged] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("profile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const navigate = useNavigate(); // Using navigate inside App component

  useEffect(() => {
    if (user) {
      setIslogged(true);
    } else {
      navigate('/login');
    }
  }, [user, navigate]); // Add navigate to the dependency array

  return (
    <Routes>
      <Route path="/" element={<Homepage profile={profile || {}} />} />
      <Route
        path="/login"
        element={<Login setIslogged={setIslogged} setUser={setUser} setProfile={setProfile} />}
      />
      <Route path="/skill" element={<SkillsPrediction profile={profile} />} />
      <Route path="/cv" element={<CV profile={profile} />} />
      <Route path="/questions" element={<Questions />} />
      <Route path="/edit" element={<EditProfile profile={profile || {}} />} />
      <Route path="/Prediction" element={<Prediction />} />
      <Route path="Test" element={<TestPage profile={profile} />} />
      <Route path="/profile" element={isLogged ? <Profile profile={profile} /> : <Login />} />
    </Routes>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default Root;
