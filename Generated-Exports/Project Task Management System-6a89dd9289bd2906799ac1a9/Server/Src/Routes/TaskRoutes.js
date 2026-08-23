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


// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.post(
  "/",
  AuthMiddleware, AllowRoles("administrator", "project manager"), CreateTask
);


// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.get(
  "/",
  AuthMiddleware, AllowRoles("administrator", "project manager", "team member"), GetAllTasks
);

// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.get(
  "/:id",
  AuthMiddleware, AllowRoles("administrator", "project manager", "team member"), GetTaskById
);


// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.put(
  "/:id",
  AuthMiddleware, AllowRoles("administrator", "project manager", "team member"), UpdateTask
);


// The JWT middleware confirms that the request comes from a logged-in user.
// AllowRoles then checks whether that user's role can perform this operation.

Router.delete(
  "/:id",
  AuthMiddleware, AllowRoles("administrator"), DeleteTask
);


module.exports =
  Router;
