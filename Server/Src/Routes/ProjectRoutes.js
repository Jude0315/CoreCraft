const express = require("express");
const {
  CreateProject,
  GetProjects,
  GetProjectById,
} = require("../Controllers/ProjectController");

const AuthMiddleware = require("../Middleware/AuthMiddleware");

const Router = express.Router();

Router.post("/", AuthMiddleware, CreateProject);
Router.get("/", AuthMiddleware, GetProjects);
Router.get("/:projectId", AuthMiddleware, GetProjectById);

module.exports = Router;
