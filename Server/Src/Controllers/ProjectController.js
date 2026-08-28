const Project = require("../Models/Project");
const RequirementSession = require("../Models/RequirementSession");

// Creates a CoreCraft project owned by the logged-in user.
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

// Lists only projects owned by the logged-in user.
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
  // Used by generation steps to move the project through the workflow.
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

const DeleteProject = async (req, res) => {
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

    // Remove requirement sessions first so deleted projects do not leave orphaned builder data.
    await RequirementSession.deleteMany({
      project: projectId,
    });

    await Project.deleteOne({
      _id: projectId,
    });

    res.json({
      message:
        "Project decommissioned successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  CreateProject,
  GetProjects,
  GetProjectById,
  DeleteProject,
  UpdateProjectStatus,
};
