const express = require("express");

const {
  TestAiConnection,
  GenerateSessionAiResponse,
} = require("../Controllers/AiController");

const AuthMiddleware = require("../Middleware/AuthMiddleware");

const Router = express.Router();

Router.post("/test", AuthMiddleware, TestAiConnection);

Router.post(
  "/session/:sessionId",
  AuthMiddleware,
  GenerateSessionAiResponse
);

module.exports = Router;