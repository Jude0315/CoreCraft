const GenerateBackendFiles = (specification) => {
  if (!specification) {
    throw new Error("Generation specification is required");
  }

  const entities = Array.isArray(specification.entities)
    ? specification.entities
    : [];

  const apiModules = Array.isArray(specification.apiModules)
    ? specification.apiModules
    : [];

  const controllerFiles = entities.map((entity) => ({
    type: "controller",
    entity,
    filename: `${entity}Controller.js`,
    content: GenerateController(entity),
  }));

  const routeFiles = entities.map((entity) => ({
    type: "route",
    entity,
    filename: `${entity}Routes.js`,
    content: GenerateRoute(entity),
  }));

  return {
    controllerFiles,
    routeFiles,
    apiModules,
  };
};

const GenerateController = (entity) => {
  if (entity === "Progress") {
    return GenerateProgressController();
  }

  return `const ${entity} = require("../Models/${entity}");

const Create${entity} = async (req, res) => {
  try {
    const item = await ${entity}.create(req.body);

    return res.status(201).json({
      message: "${entity} created successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const GetAll${entity}s = async (req, res) => {
  try {
    const items = await ${entity}.find();

    return res.status(200).json({
      count: items.length,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const Get${entity}ById = async (req, res) => {
  try {
    const item = await ${entity}.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "${entity} not found",
      });
    }

    return res.status(200).json({
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const Update${entity} = async (req, res) => {
  try {
    const item = await ${entity}.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        message: "${entity} not found",
      });
    }

    return res.status(200).json({
      message: "${entity} updated successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const Delete${entity} = async (req, res) => {
  try {
    const item = await ${entity}.findByIdAndDelete(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        message: "${entity} not found",
      });
    }

    return res.status(200).json({
      message: "${entity} deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  Create${entity},
  GetAll${entity}s,
  Get${entity}ById,
  Update${entity},
  Delete${entity},
};
`;
};

const GenerateProgressController = () => {
  return `const Progress = require("../Models/Progress");

const PopulateProgressQuery = (query) => {
  return query
    .populate("course")
    .populate(
      "student",
      "name email role"
    );
};

const GetCurrentUserId = (req) => {
  return req.user?.id || req.user?._id;
};

const IsProgressOwner = (
  progress,
  userId
) => {
  const studentId =
    progress.student?._id ||
    progress.student;

  return (
    String(studentId) ===
    String(userId)
  );
};

const CreateProgress = async (req, res) => {
  try {
    const item = await Progress.create(req.body);

    const populatedItem =
      await PopulateProgressQuery(
        Progress.findById(item._id)
      );

    return res.status(201).json({
      message:
        "Progress created successfully",
      data: populatedItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const GetAllProgresss = async (req, res) => {
  try {
    const items =
      await PopulateProgressQuery(
        Progress.find()
      );

    return res.status(200).json({
      count: items.length,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const GetMyProgress = async (req, res) => {
  try {
    const userId =
      GetCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        message:
          "Authentication required",
      });
    }

    const items =
      await PopulateProgressQuery(
        Progress.find({
          student: userId,
        })
      );

    return res.status(200).json({
      count: items.length,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const GetProgressById = async (req, res) => {
  try {
    const item =
      await PopulateProgressQuery(
        Progress.findById(req.params.id)
      );

    if (!item) {
      return res.status(404).json({
        message: "Progress not found",
      });
    }

    const isManager =
      req.user?.role === "instructor" ||
      req.user?.role === "admin";

    if (
      !isManager &&
      !IsProgressOwner(
        item,
        GetCurrentUserId(req)
      )
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to access this resource",
      });
    }

    return res.status(200).json({
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const UpdateProgress = async (req, res) => {
  try {
    const item =
      await Progress.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!item) {
      return res.status(404).json({
        message: "Progress not found",
      });
    }

    const populatedItem =
      await PopulateProgressQuery(
        Progress.findById(item._id)
      );

    return res.status(200).json({
      message:
        "Progress updated successfully",
      data: populatedItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const DeleteProgress = async (req, res) => {
  try {
    const item =
      await Progress.findByIdAndDelete(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        message: "Progress not found",
      });
    }

    return res.status(200).json({
      message:
        "Progress deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  CreateProgress,
  GetAllProgresss,
  GetMyProgress,
  GetProgressById,
  UpdateProgress,
  DeleteProgress,
};
`;
};

const GenerateRoute = (entity) => {
  if (entity === "Progress") {
    return GenerateProgressRoute();
  }

  const isProtectedEntity = entity !== "User";

  const instructorManagedEntities = [
    "Course",
    "Lesson",
    "Quiz",
    "Assignment",
    "Progress",
    "Student",
    "Instructor",
  ];

  const requiresInstructorRole =
    instructorManagedEntities.includes(entity);

  const middlewareImports = isProtectedEntity
    ? `const AuthMiddleware = require("../Middleware/AuthMiddleware");
const AllowRoles = require("../Middleware/RoleMiddleware");`
    : "";

  const createMiddleware = requiresInstructorRole
    ? `AuthMiddleware, AllowRoles("instructor", "admin"), `
    : "";

  const readMiddleware = isProtectedEntity
    ? `AuthMiddleware, `
    : "";

  const updateMiddleware = requiresInstructorRole
    ? `AuthMiddleware, AllowRoles("instructor", "admin"), `
    : "";

  const deleteMiddleware = requiresInstructorRole
    ? `AuthMiddleware, AllowRoles("admin"), `
    : "";

  return `const express = require("express");

const {
  Create${entity},
  GetAll${entity}s,
  Get${entity}ById,
  Update${entity},
  Delete${entity},
} = require("../Controllers/${entity}Controller");

${middlewareImports}

const Router = express.Router();

Router.post("/", ${createMiddleware}Create${entity});

Router.get("/", ${readMiddleware}GetAll${entity}s);

Router.get("/:id", ${readMiddleware}Get${entity}ById);

Router.put("/:id", ${updateMiddleware}Update${entity});

Router.delete("/:id", ${deleteMiddleware}Delete${entity});

module.exports = Router;
`;
};

const GenerateProgressRoute = () => {
  return `const express = require("express");

const {
  CreateProgress,
  GetAllProgresss,
  GetMyProgress,
  GetProgressById,
  UpdateProgress,
  DeleteProgress,
} = require("../Controllers/ProgressController");

const AuthMiddleware = require("../Middleware/AuthMiddleware");
const AllowRoles = require("../Middleware/RoleMiddleware");

const Router = express.Router();

Router.post(
  "/",
  AuthMiddleware,
  AllowRoles("instructor", "admin"),
  CreateProgress
);

Router.get(
  "/",
  AuthMiddleware,
  AllowRoles("instructor", "admin"),
  GetAllProgresss
);

Router.get(
  "/me",
  AuthMiddleware,
  GetMyProgress
);

Router.get(
  "/:id",
  AuthMiddleware,
  GetProgressById
);

Router.put(
  "/:id",
  AuthMiddleware,
  AllowRoles("instructor", "admin"),
  UpdateProgress
);

Router.delete(
  "/:id",
  AuthMiddleware,
  AllowRoles("admin"),
  DeleteProgress
);

module.exports = Router;
`;
};

module.exports = {
  GenerateBackendFiles,
  GenerateController,
  GenerateRoute,
};
