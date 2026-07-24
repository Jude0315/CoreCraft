const express = require("express");

const {
  CreateGenerationSpecification,
   GenerateSchemas,
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

module.exports = Router;