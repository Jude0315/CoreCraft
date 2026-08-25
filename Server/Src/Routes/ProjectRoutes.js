const express = require("express");
const {
  CreateProject,
  GetProjects,
  GetProjectById,
  DeleteProject,
} = require("../Controllers/ProjectController");

const AuthMiddleware = require("../Middleware/AuthMiddleware");

const Router = express.Router();

Router.post("/", AuthMiddleware, CreateProject);
Router.get("/", AuthMiddleware, GetProjects);
Router.get("/:projectId", AuthMiddleware, GetProjectById);
Router.delete("/:projectId", AuthMiddleware, DeleteProject);

module.exports = Router;
