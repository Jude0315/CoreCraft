const express = require("express");

const {
  CreateSession,
  GetSession,
  AddMessage,
  AddFeature,
  RemoveFeature,
  GetFeatureSuggestions,
  AcceptSuggestion,
  RejectSuggestion,
  GenerateBuilderAiResponse,
  FinalizeSession,
} = require("../Controllers/BuilderController");

const AuthMiddleware =
  require("../Middleware/AuthMiddleware");

const Router = express.Router();

// Requirement session
Router.post(
  "/session",
  AuthMiddleware,
  CreateSession
);

Router.get(
  "/session/:projectId",
  AuthMiddleware,
  GetSession
);

// Messages
Router.post(
  "/message/:sessionId",
  AuthMiddleware,
  AddMessage
);

// CoreCraft AI response
Router.post(
  "/ai-response/:sessionId",
  AuthMiddleware,
  GenerateBuilderAiResponse
);

// Features
Router.post(
  "/feature/:sessionId",
  AuthMiddleware,
  AddFeature
);

Router.post(
  "/feature/remove/:sessionId",
  AuthMiddleware,
  RemoveFeature
);

// Suggestions
Router.get(
  "/suggestions/:appType",
  AuthMiddleware,
  GetFeatureSuggestions
);

Router.post(
  "/suggestion/accept/:sessionId",
  AuthMiddleware,
  AcceptSuggestion
);

Router.post(
  "/suggestion/reject/:sessionId",
  AuthMiddleware,
  RejectSuggestion
);

// Finalize requirement session
Router.post(
  "/finalize/:sessionId",
  AuthMiddleware,
  FinalizeSession
);

module.exports = Router;
