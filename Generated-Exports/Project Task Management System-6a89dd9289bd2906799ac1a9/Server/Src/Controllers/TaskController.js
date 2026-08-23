const Task =
  require("../Models/Task");


// Creates a new Task record using data received from the request body.
const CreateTask = async (req, res) => {
  try {
    const item =
      await Task.create(
        req.body
      );

    return res
      .status(201)
      .json({
        message:
          "Task created successfully",

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


// Retrieves Task records from MongoDB and returns them to the frontend.
// Related reference fields are populated so users see readable values instead of database IDs.
const GetAllTasks = async (req, res) => {
  try {
    const items =
      await Task
        .find()
        .populate({
          path:
            "project",
          select:
            "title"
        })
        .populate({
          path:
            "assignedTo",
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


// Retrieves Task records from MongoDB and returns them to the frontend.
// Related reference fields are populated so users see readable values instead of database IDs.
const GetTaskById = async (req, res) => {
  try {
    const item =
      await Task
        .findById(
          req.params.id
        )
        .populate({
          path:
            "project",
          select:
            "title"
        })
        .populate({
          path:
            "assignedTo",
          select:
            "name"
        });

    if (!item) {
      return res
        .status(404)
        .json({
          message:
            "Task not found",
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


// Updates an existing Task record using the ID provided in the request URL.
const UpdateTask = async (req, res) => {
  try {
    const item =
      await Task.findByIdAndUpdate(
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
            "Task not found",
        });
    }

    return res
      .status(200)
      .json({
        message:
          "Task updated successfully",

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


// Deletes the selected Task record from MongoDB.
const DeleteTask = async (req, res) => {
  try {
    const item =
      await Task.findByIdAndDelete(
        req.params.id
      );

    if (!item) {
      return res
        .status(404)
        .json({
          message:
            "Task not found",
        });
    }

    return res
      .status(200)
      .json({
        message:
          "Task deleted successfully",
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
  CreateTask,
  GetAllTasks,
  GetTaskById,
  UpdateTask,
  DeleteTask
};
