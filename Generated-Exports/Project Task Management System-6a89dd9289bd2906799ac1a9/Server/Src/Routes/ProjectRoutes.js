const express =
  require("express");

const {
  CreateProject,
  GetAllProjects,
  GetProjectById,
  UpdateProject,
  DeleteProject
} =
  require("../Controllers/ProjectController");

const AuthMiddleware =
  require("../Middleware/AuthMiddleware");

const AllowRoles =
  require("../Middleware/RoleMiddleware");


// This router defines the REST API endpoints for Project.
// Authentication runs first, followed by role-based authorization when required.
const Router =
  express.Router();


// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.post(
  "/",
  AuthMiddleware, AllowRoles("administrator", "project manager"), CreateProject
);


// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.get(
  "/",
  AuthMiddleware, AllowRoles("administrator", "project manager"), GetAllProjects
);

// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.get(
  "/:id",
  AuthMiddleware, AllowRoles("administrator", "project manager"), GetProjectById
);


// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.put(
  "/:id",
  AuthMiddleware, AllowRoles("administrator", "project manager"), UpdateProject
);


// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.delete(
  "/:id",
  AuthMiddleware, AllowRoles("administrator"), DeleteProject
);


module.exports =
  Router;
