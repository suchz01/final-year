const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/profileDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Profile schema and model
const profileSchema = new mongoose.Schema({
  profileId: { type: String, required: true, unique: true },
  aboutMe: { type: String, default: "" },
  skills: [{ type: String }],
  projects: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      link: { type: String, default: "" },
    },
  ],
});

const Profile = mongoose.model("Profile", profileSchema);

// Routes

// Fetch or create a profile
app.get("/profile/:profileId", async (req, res) => {
  const { profileId } = req.params;
  try {
    let profile = await Profile.findOne({ profileId });
    if (!profile) {
      profile = new Profile({ profileId });
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Update "About Me" section
app.post("/profile/aboutMe", async (req, res) => {
  const { profileId, aboutMe } = req.body;
  try {
    const profile = await Profile.findOneAndUpdate(
      { profileId },
      { aboutMe },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    console.error("Error updating About Me:", error);
    res.status(500).json({ message: "Error updating About Me" });
  }
});

// Add or update skills
app.post("/profile/skills", async (req, res) => {
  const { profileId, skills } = req.body;
  try {
    const profile = await Profile.findOneAndUpdate(
      { profileId },
      { $set: { skills } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    console.error("Error updating skills:", error);
    res.status(500).json({ message: "Error updating skills" });
  }
});

// Add a project
app.post("/profile/projects", async (req, res) => {
  const { profileId, project } = req.body;
  try {
    const profile = await Profile.findOneAndUpdate(
      { profileId },
      { $push: { projects: project } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ message: "Error adding project" });
  }
});

// Delete a project
app.delete("/profile/projects", async (req, res) => {
  const { profileId, projectId } = req.body;
  try {
    const profile = await Profile.findOneAndUpdate(
      { profileId },
      { $pull: { projects: { _id: projectId } } },
      { new: true }
    );
    res.json(profile);
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
});

// Server setup
const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
