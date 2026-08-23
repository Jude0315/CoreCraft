const Project =
  require("../Models/Project");


// Creates a new Project record using data received from the request body.
const CreateProject = async (req, res) => {
  try {
    const item =
      await Project.create(
        req.body
      );

    return res
      .status(201)
      .json({
        message:
          "Project created successfully",

        data: item,
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};


// Retrieves Project records from MongoDB and returns them to the frontend.
// Related reference fields are populated so users see readable values instead of database IDs.
const GetAllProjects = async (req, res) => {
  try {
    const items =
      await Project
        .find()
        .populate({
          path:
            "manager",
          select:
            "name"
        });

    return res
      .status(200)
      .json({
        count:
          items.length,

        data:
          items,
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};


// Retrieves Project records from MongoDB and returns them to the frontend.
// Related reference fields are populated so users see readable values instead of database IDs.
const GetProjectById = async (req, res) => {
  try {
    const item =
      await Project
        .findById(
          req.params.id
        )
        .populate({
          path:
            "manager",
          select:
            "name"
        });

    if (!item) {
      return res
        .status(404)
        .json({
          message:
            "Project not found",
        });
    }

    return res
      .status(200)
      .json({
        data:
          item,
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};


// Updates an existing Project record using the ID provided in the request URL.
const UpdateProject = async (req, res) => {
  try {
    const item =
      await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!item) {
      return res
        .status(404)
        .json({
          message:
            "Project not found",
        });
    }

    return res
      .status(200)
      .json({
        message:
          "Project updated successfully",

        data:
          item,
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};


// Deletes the selected Project record from MongoDB.
const DeleteProject = async (req, res) => {
  try {
    const item =
      await Project.findByIdAndDelete(
        req.params.id
      );

    if (!item) {
      return res
        .status(404)
        .json({
          message:
            "Project not found",
        });
    }

    return res
      .status(200)
      .json({
        message:
          "Project deleted successfully",
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};


module.exports = {
  CreateProject,
  GetAllProjects,
  GetProjectById,
  UpdateProject,
  DeleteProject
};
