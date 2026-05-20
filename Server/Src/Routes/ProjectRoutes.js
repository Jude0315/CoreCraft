const express = require("express");
const {
  CreateProject,
  GetProjects,
} = require("../Controllers/ProjectController");

const AuthMiddleware = require("../Middleware/AuthMiddleware");

const Router = express.Router();

Router.post("/", AuthMiddleware, CreateProject);
Router.get("/", AuthMiddleware, GetProjects);

module.exports = Router;