import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import React, { useEffect, useState } from "react";

const Login = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  const logOut = () => {
    googleLogout();
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    if (user) {
      fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setProfile(data);
        })
        .catch((error) => console.log("Error fetching profile:", error));
    }
  }, [user]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="bg-slate-800 p-6 shadow-3xl w-[24rem] h-[24rem] text-center flex flex-col rounded-lg justify-center">
        {profile ? (
          <>
            <p className="text-2xl font-semibold text-gray-300 mb-6">Welcome</p>
            <div className="flex flex-col items-center">
              <img
                className="w-32 h-32 rounded-full mb-4"
                src={profile.picture}
                alt="user_image"
              />
              <h3 className="text-2xl font-semibold mb-2">{profile.name}</h3>
              <p className="text-gray-300 mb-2">Email: {profile.email}</p>
              <button
                onClick={logOut}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg w-full mt-2"
              >
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-gray-300 mb-6">Sign In To Your Account</p>
            <button
              onClick={login}
              className="bg-gray-700 hover:bg-slate-900 text-white py-2 px-4 rounded-lg w-full flex items-center justify-center mt-2"
            >
              <span className="mr-2">Sign in with Google</span>
              🚀
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
