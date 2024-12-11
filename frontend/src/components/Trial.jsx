import React, { useState, useEffect } from "react";

const Trial = ({ profile }) => {
  const profileId = profile?.id || "";
  const [profileData, setProfileData] = useState({});
  const [aboutMeInput, setAboutMeInput] = useState("");
  const [project, setProject] = useState({ name: "", description: "", link: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setAboutMeInput(data.aboutMe || "");
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const aboutMeUpdate = async () => {
    try {
      const response = await fetch("http://localhost:8080/profile/aboutMe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, aboutMe: aboutMeInput }),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setAboutMeInput(updatedData.aboutMe);
      } else {
        console.error("Failed to update About Me");
      }
    } catch (error) {
      console.error("Error saving About Me:", error);
    }
  };

  const addProject = async () => {
    try {
      const response = await fetch("http://localhost:8080/profile/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, project }),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setProject({ name: "", description: "", link: "" });
      } else {
        console.error("Failed to add project");
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch("http://localhost:8080/profile/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, projectId }),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
      } else {
        console.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="text-green-600">
      <div>
        <p><strong>About Me</strong></p>
        <input
          type="text"
          onChange={(e) => setAboutMeInput(e.target.value)}
          placeholder="Tell us about yourself"
        />
        <button onClick={aboutMeUpdate}>Save About Me</button>
        <p>{profileData.aboutMe || "No content available yet."}</p>
      </div>
      <div>
        <p><strong>Projects</strong></p>
        <input
          type="text"
          placeholder="Project Name"
          value={project.name}
          onChange={(e) => setProject({ ...project, name: e.target.value })}
        />
        <textarea
          placeholder="Project Description"
          value={project.description}
          onChange={(e) => setProject({ ...project, description: e.target.value })}
        ></textarea>
        <input
          type="text"
          placeholder="Project Link"
          value={project.link}
          onChange={(e) => setProject({ ...project, link: e.target.value })}
        />
        <button onClick={addProject}>Add Project</button>
        <div>
          {profileData.projects?.map((proj) => (
            <div key={proj._id}>
              <p><strong>{proj.name}</strong></p>
              <p>{proj.description}</p>
              <a href={proj.link} target="_blank" rel="noopener noreferrer">
                {proj.link}
              </a>
              <button onClick={() => deleteProject(proj._id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trial;
