const express =
  require("express");

const {
  CreateTask,
  GetAllTasks,
  GetTaskById,
  UpdateTask,
  DeleteTask
} =
  require("../Controllers/TaskController");

const AuthMiddleware =
  require("../Middleware/AuthMiddleware");

const AllowRoles =
  require("../Middleware/RoleMiddleware");


// This router defines the REST API endpoints for Task.
// Authentication runs first, followed by role-based authorization when required.
const Router =
  express.Router();


// Creates tasks only for roles allowed by the generated project-management rules.
// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.post(
  "/",
  AuthMiddleware, AllowRoles("administrator", "project manager"), CreateTask
);


// Reads task data for all roles that need project visibility.
// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.get(
  "/",
  AuthMiddleware, AllowRoles("administrator", "project manager", "team member"), GetAllTasks
);

// Reads a single task by ID.
// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.get(
  "/:id",
  AuthMiddleware, AllowRoles("administrator", "project manager", "team member"), GetTaskById
);


// Lets project-facing roles update task progress.
// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.put(
  "/:id",
  AuthMiddleware, AllowRoles("administrator", "project manager", "team member"), UpdateTask
);


// Deletes tasks only for administrator-level access.
// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.delete(
  "/:id",
  AuthMiddleware, AllowRoles("administrator"), DeleteTask
);


module.exports =
  Router;
