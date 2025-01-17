import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import First from "../components/First";
import Second from "../components/Second";
import Third from "../components/Third";

const Profile = ({ profile }) => {
  const profileId = profile?.id || "";
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          setError("Failed to fetch profile data.");
        }
      } catch (error) {
        setError("Error fetching profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    } else {
      setError("Profile ID is missing.");
      setLoading(false);
    }
  }, [profileId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!profileData) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#1e1a2a] text-[#C5C5C9] font-inter">
      {/* Navbar */}
      <nav className="py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          Horizon
        </h1>
        <div className="space-x-4 hidden md:flex">
          <a
            href="#"
            className="text-[#C5C5C9] hover:text-white hover:underline transition-all duration-300"
          >
            Home
          </a>
          <a
            href="#"
            className="text-[#C5C5C9] hover:text-white hover:underline transition-all duration-300"
          >
            About
          </a>
          <a
            href="#"
            className="text-[#C5C5C9] hover:text-white hover:underline transition-all duration-300"
          >
            Contact
          </a>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="container mx-auto p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* First Component */}
          <motion.div
            className="bg-[#29253b] rounded-lg shadow-lg p-6 flex-1 w-full lg:w-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <First profileData={profileData} profile={profile} />
          </motion.div>

          {/* Second Component */}
          <motion.div
            className="bg-[#29253b] rounded-lg shadow-lg p-6 flex-[2] w-full lg:w-auto"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Second profileData={profileData} />
          </motion.div>

          {/* Third Component */}
          <motion.div
            className="bg-[#29253b] rounded-lg shadow-lg p-6 flex-[1.5] w-full lg:w-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Third profileData={profileData} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
