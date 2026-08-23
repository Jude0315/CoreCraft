

const express =
  require("express");

const {
  GetProjectManagerLookup,
  GetTaskProjectLookup,
  GetTaskAssignedToLookup
} =
  require(
    "../Controllers/LookupController"
  );

const AuthMiddleware =
  require(
    "../Middleware/AuthMiddleware"
  );

const AllowRoles =
  require(
    "../Middleware/RoleMiddleware"
  );

const Router =
  express.Router();



Router.get(
  "/project/manager",
  AuthMiddleware, AllowRoles("administrator", "project manager"),
  GetProjectManagerLookup
);


Router.get(
  "/task/project",
  AuthMiddleware, AllowRoles("administrator", "project manager", "team member"),
  GetTaskProjectLookup
);


Router.get(
  "/task/assignedTo",
  AuthMiddleware, AllowRoles("administrator", "project manager", "team member"),
  GetTaskAssignedToLookup
);


module.exports =
  Router;
