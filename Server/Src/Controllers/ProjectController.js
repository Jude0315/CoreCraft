const Project = require("../Models/Project");

// Create new project
const CreateProject = async (req, res) => {
  try {
    const { name } = req.body;

    const ProjectCreated = await Project.create({
      user: req.user._id,
      name,
    });

    res.status(201).json(ProjectCreated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all projects for logged-in user
const GetProjects = async (req, res) => {
  try {
    const Projects = await Project.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(Projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  CreateProject,
  GetProjects,
};