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

const GetProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const UpdateProjectStatus = async (
  projectId,
  status,
) => {
  return Project.findByIdAndUpdate(
    projectId,
    {
      status,
    },
    {
      new: true,
    },
  );
};

module.exports = {
  CreateProject,
  GetProjects,
  GetProjectById,
  UpdateProjectStatus,
};
