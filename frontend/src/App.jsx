import React,{useState,useEffect} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Trial from "./components/Trial";
import SkillsPrediction from "./pages/SkillsPrediction";

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
  useEffect(() => {
    if (user) {
      setIslogged(true);
    }
  }, [user]);
// console.log(profile);
  return (
    <BrowserRouter>
    {/* <SkillsPrediction profile={profile}/> */}
    <Routes>
        <Route path="/" element={<Trial profile={profile || {}} />} />
        <Route
          path="/login"
          element={<Login setIslogged={setIslogged} setUser={setUser} setProfile={setProfile} />}
        />
         <Route path="/skill" element={<SkillsPrediction />} />
       </Routes> */
   
    </BrowserRouter>
  );
}

export default App;
