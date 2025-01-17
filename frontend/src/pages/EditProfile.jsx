import React, { useState, useEffect } from "react";

const EditProfile = ({ profile }) => {
  const profileId = profile?.id || ""; // Profile ID passed as prop
  const [profileData, setProfileData] = useState({}); // Store profile data
  const [codechefUsername, setCodechefUsername] = useState(''); // Store CodeChef username
  const [leetcodeUsername, setLeetcodeUsername] = useState(''); // Store LeetCode username
  const [error, setError] = useState(''); // Store any error message

  // Fetch profile data when profileId changes
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data); // Set the fetched profile data
        } else {
          console.error("Failed to fetch profile data.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  // Handle field updates
  const handleSubmit = async (event) => {
    event.preventDefault();

    const fields = [
      "name", "aboutMe", "projects", "experience", "certification", "education", "extracurricular", 
      "phone", "email", "github", "linkedin"
    ];

    try {
      for (const field of fields) {
        const response = await fetch(`http://localhost:8080/profile/${field}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileId,
            value: profileData[field], // Send the updated field data
          }),
        });

        if (!response.ok) {
          console.log(`Failed to update ${field}.`);
          return;
        }
      }
      await handleCodechefSubmit();
      await handleLeetcodeSubmit();
      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      console.log("An error occurred while updating the profile.");
    }
  };

  // Handle input changes dynamically for each field
  const handleChange = (event, field) => {
    const { value } = event.target;
    setProfileData((prev) => ({
      ...prev,
      [field]: value, // Dynamically update the field in profileData
    }));
  };

  const handleAddItem = (field) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), { companyName: "", jobRole: "", time: "", description: "" }],
    }));
  };

  const handleItemChange = (index, field, itemField, value) => {
    const updatedItems = [...profileData[field]];
    updatedItems[index] = {
      ...updatedItems[index],
      [itemField]: value,
    };
    setProfileData((prev) => ({
      ...prev,
      [field]: updatedItems,
    }));
  };

  const handleDeleteItem = async (field, index) => {
    try {
      const response = await fetch(`http://localhost:8080/profile/${profileId}/${field}/${index}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
        console.log(`${field} deleted successfully!`);
      } else {
        console.log(`Failed to delete ${field}.`);
      }
    } catch (error) {
      console.error(`Error deleting ${field}:`, error);
      console.log(`An error occurred while deleting ${field}.`);
    }
  };

  // Handle adding a new certificate
  const handleAddCertificate = () => {
    setProfileData((prev) => ({
      ...prev,
      certification: [...(prev.certification || []), { instituteName: "", time: "", desc: "" }],
    }));
  };

  // Handle changes in certificate fields
  const handleCertificateChange = (index, field, value) => {
    const updatedCertificates = [...profileData.certification];
    updatedCertificates[index] = {
      ...updatedCertificates[index],
      [field]: value,
    };
    setProfileData((prev) => ({
      ...prev,
      certification: updatedCertificates,
    }));
  };

  // Handle adding a new extracurricular activity
  const handleAddExtracurricular = () => {
    setProfileData((prev) => ({
      ...prev,
      extracurricular: [...(prev.extracurricular || []), ""],
    }));
  };

  // Handle changes in extracurricular activities
  const handleExtracurricularChange = (index, value) => {
    const updatedExtracurricular = [...profileData.extracurricular];
    updatedExtracurricular[index] = value;
    setProfileData((prev) => ({
      ...prev,
      extracurricular: updatedExtracurricular,
    }));
  };

  // Handle CodeChef username submission
  const handleCodechefSubmit = async (e) => {

    try {
      if (codechefUsername) {
        const response = await fetch('http://localhost:8080/codechef', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, username: codechefUsername }),
        });

        if (response.ok) {
          const data = await response.json();
          // console.log('CodeChef data:', data);
        } else {
          setError('Error updating CodeChef profile.');
        }
      }
    } catch (error) {
      console.error('Error submitting CodeChef data:', error);
      setError('Error submitting CodeChef data.');
    }
  };

  // Handle LeetCode username submission
  const handleLeetcodeSubmit = async (e) => {

    try {
      if (leetcodeUsername) {
        const response = await fetch('http://localhost:8080/leetcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, username: leetcodeUsername }),
        });

        if (response.ok) {
          const data = await response.json();
          // console.log('LeetCode data:', data);
        } else {
          setError('Error updating LeetCode profile.');
        }
      }
    } catch (error) {
      console.error('Error submitting LeetCode data:', error);
      setError('Error submitting LeetCode data.');
    }
  };

  // Handle adding a new education entry
  const handleAddEducation = () => {
    setProfileData((prev) => ({
      ...prev,
      education: [...(prev.education || []), { instituteName: "", time: "", marks: "", stream: "" }],
    }));
  };

  // Handle changes in education fields
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...profileData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    };
    setProfileData((prev) => ({
      ...prev,
      education: updatedEducation,
    }));
  };

  return (
    <div className="bg-[#0f172a] min-h-screen py-10 px-5 text-white">
      <h2 className="text-3xl font-bold text-center mb-8">Edit Profile</h2>

      <form className="max-w-2xl mx-auto bg-[#1e293b] p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Personal Information</h3>
          <label className="block text-lg mb-4">
            <p>Edit Name</p>
            <input
              type="text"
              value={profileData.name || ""}
              onChange={(e) => handleChange(e, "name")}
              placeholder="Enter your name"
              className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
            />
          </label>
          <label className="block text-lg mb-4">
            <p>Edit "About Me"</p>
            <textarea
              value={profileData.aboutMe || ""}
              onChange={(e) => handleChange(e, "aboutMe")}
              placeholder="Write something about yourself..."
              rows="4"
              className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
            />
          </label>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Projects</h3>
          {profileData.projects?.map((project, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                value={project.name}
                onChange={(e) =>
                  handleItemChange(index, "projects", "name", e.target.value)
                }
                placeholder="Project Name"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <textarea
                value={project.description}
                onChange={(e) =>
                  handleItemChange(index, "projects", "description", e.target.value)
                }
                placeholder="Project Description"
                rows="2"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <input
                type="text"
                value={project.link}
                onChange={(e) =>
                  handleItemChange(index, "projects", "link", e.target.value)
                }
                placeholder="Project Link"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => handleDeleteItem("projects", index)}
                className="bg-red-600 py-2 mt-2 rounded-md text-white hover:bg-red-500 transition"
              >
                Delete Project
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddItem("projects")}
            className="bg-blue-600 py-2 mt-4 rounded-md text-white hover:bg-blue-500 transition"
          >
            Add Another Project
          </button>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Experience</h3>
          {profileData.experience?.map((exp, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                value={exp.companyName}
                onChange={(e) =>
                  handleItemChange(index, "experience", "companyName", e.target.value)
                }
                placeholder="Company Name"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <input
                type="text"
                value={exp.jobRole}
                onChange={(e) =>
                  handleItemChange(index, "experience", "jobRole", e.target.value)
                }
                placeholder="Job Role"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <input
                type="text"
                value={exp.time}
                onChange={(e) =>
                  handleItemChange(index, "experience", "time", e.target.value)
                }
                placeholder="Time Period"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <textarea
                value={exp.description}
                onChange={(e) =>
                  handleItemChange(index, "experience", "description", e.target.value)
                }
                placeholder="Job Description"
                rows="2"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => handleDeleteItem("experience", index)}
                className="bg-red-600 py-2 mt-2 rounded-md text-white hover:bg-red-500 transition"
              >
                Delete Experience
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddItem("experience")}
            className="bg-blue-600 py-2 mt-4 rounded-md text-white hover:bg-blue-500 transition"
          >
            Add Another Experience
          </button>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Certificates</h3>
          {profileData.certification?.map((cert, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                value={cert.instituteName}
                onChange={(e) =>
                  handleCertificateChange(index, "instituteName", e.target.value)
                }
                placeholder="Institute Name"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <input
                type="text"
                value={cert.time}
                onChange={(e) =>
                  handleCertificateChange(index, "time", e.target.value)
                }
                placeholder="Time Period"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <textarea
                value={cert.desc}
                onChange={(e) =>
                  handleCertificateChange(index, "desc", e.target.value)
                }
                placeholder="Description"
                rows="2"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => handleDeleteItem("certification", index)}
                className="bg-red-600 py-2 mt-2 rounded-md text-white hover:bg-red-500 transition"
              >
                Delete Certificate
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddCertificate}
            className="bg-blue-600 py-2 mt-4 rounded-md text-white hover:bg-blue-500 transition"
          >
            Add Another Certificate
          </button>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Extracurricular Activities</h3>
          {profileData.extracurricular?.map((activity, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                value={activity}
                onChange={(e) =>
                  handleExtracurricularChange(index, e.target.value)
                }
                placeholder="Activity"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => handleDeleteItem("extracurricular", index)}
                className="bg-red-600 py-2 mt-2 rounded-md text-white hover:bg-red-500 transition"
              >
                Delete Activity
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddExtracurricular}
            className="bg-blue-600 py-2 mt-4 rounded-md text-white hover:bg-blue-500 transition"
          >
            Add Another Activity
          </button>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Education</h3>
          {profileData.education?.map((edu, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                value={edu.instituteName}
                onChange={(e) => handleEducationChange(index, "instituteName", e.target.value)}
                placeholder="Institute Name"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <input
                type="text"
                value={edu.time}
                onChange={(e) => handleEducationChange(index, "time", e.target.value)}
                placeholder="Time Period"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <input
                type="text"
                value={edu.marks}
                onChange={(e) => handleEducationChange(index, "marks", e.target.value)}
                placeholder="Marks"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <input
                type="text"
                value={edu.stream}
                onChange={(e) => handleEducationChange(index, "stream", e.target.value)}
                placeholder="Stream"
                className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => handleDeleteItem("education", index)}
                className="bg-red-600 py-2 mt-2 rounded-md text-white hover:bg-red-500 transition"
              >
                Delete Education
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddEducation}
            className="bg-blue-600 py-2 mt-4 rounded-md text-white hover:bg-blue-500 transition"
          >
            Add Another Education
          </button>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Contact Information</h3>
          <label className="block text-lg mb-4">
            <p>Edit Email</p>
            <input
              type="email"
              value={profileData.email || ""}
              onChange={(e) => handleChange(e, "email")}
              placeholder="Enter your email"
              className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
            />
          </label>
          <label className="block text-lg mb-4">
            <p>Edit Phone Number</p>
            <input
              type="text"
              value={profileData.phone || ""}
              onChange={(e) => handleChange(e, "phone")}
              placeholder="Enter your phone number"
              className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
            />
          </label>
          <label className="block text-lg mb-4">
            <p>Edit GitHub Link</p>
            <input
              type="text"
              value={profileData.github || ""}
              onChange={(e) => handleChange(e, "github")}
              placeholder="Enter your GitHub link"
              className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
            />
          </label>
          <label className="block text-lg mb-4">
            <p>Edit LinkedIn Link</p>
            <input
              type="text"
              value={profileData.linkedin || ""}
              onChange={(e) => handleChange(e, "linkedin")}
              placeholder="Enter your LinkedIn link"
              className="w-full p-3 mt-2 rounded-md bg-[#334155] text-white placeholder-gray-400"
            />
          </label>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Coding Profiles</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error if any */}
          <div className="mb-4">
            <label className="block text-lg mb-2">CodeChef Username</label>
            <input
              type="text"
              value={codechefUsername}
              onChange={(e) => setCodechefUsername(e.target.value)}
              placeholder="Enter CodeChef Username"
              className="w-full p-3 rounded-md bg-[#334155] text-white placeholder-gray-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg mb-2">LeetCode Username</label>
            <input
              type="text"
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              placeholder="Enter LeetCode Username"
              className="w-full p-3 rounded-md bg-[#334155] text-white placeholder-gray-400"
            />
          </div>
        </section>

        <button
          type="submit"
          className="w-full bg-green-600 py-3 mt-4 rounded-md text-white hover:bg-green-500 transition"
        >
          Save All Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
