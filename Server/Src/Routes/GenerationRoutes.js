const express = require("express");

const {
  CreateGenerationSpecification,
   GenerateSchemas,
    GenerateBackend,
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

module.exports = Router;