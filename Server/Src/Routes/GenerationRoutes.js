const express = require("express");

const {
  CreateGenerationSpecification,
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

module.exports = Router;