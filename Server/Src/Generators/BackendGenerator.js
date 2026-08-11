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

const GenerateRoute = (entity) => {
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

module.exports = {
  GenerateBackendFiles,
  GenerateController,
  GenerateRoute,
};