const express = require("express");

const {
  TestAiConnection,
  GenerateSessionAiResponse,
  ContinueAiConversation,
} = require("../Controllers/AiController");

const AuthMiddleware = require("../Middleware/AuthMiddleware");

const Router = express.Router();

Router.post("/test", AuthMiddleware, TestAiConnection);

Router.post(
  "/session/:sessionId",
  AuthMiddleware,
  GenerateSessionAiResponse

);

/*---------------------------------------------------------*/
Router.post(
  "/conversation/:sessionId",
  AuthMiddleware,
  ContinueAiConversation
);

/*---------------------------------------------------------*/

module.exports = Router;