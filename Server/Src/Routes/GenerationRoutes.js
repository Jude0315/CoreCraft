const express = require("express");

const {
  CreateGenerationSpecification,
   GenerateSchemas,
    GenerateBackend,
    GenerateFrontend,
     GenerateFullProject,
} = require("../Controllers/GenerationController");

const AuthMiddleware = require(
  "../Middleware/AuthMiddleware"
);

const Router = express.Router();

Router.post(
  "/specification/:sessionId",
  AuthMiddleware,
  CreateGenerationSpecification
);

Router.post(
  "/schemas/:sessionId",
  AuthMiddleware,
  GenerateSchemas
);

Router.post(
  "/backend/:sessionId",
  AuthMiddleware,
  GenerateBackend
);

Router.post(
  "/frontend/:sessionId",
  AuthMiddleware,
  GenerateFrontend
);

Router.post(
  "/project/:sessionId",
  AuthMiddleware,
  GenerateFullProject
);

module.exports = Router;