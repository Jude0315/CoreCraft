const express = require("express");

const {
  CreateSession,
  GetSession,
  AddMessage,
  AddFeature,
  RemoveFeature,
  GetFeatureSuggestions,
} = require("../Controllers/BuilderController");

const AuthMiddleware = require("../Middleware/AuthMiddleware");

const Router = express.Router();

// Create session
Router.post("/session", AuthMiddleware, CreateSession);

// Get session by project
Router.get("/session/:projectId", AuthMiddleware, GetSession);

// Add message
Router.post("/message/:sessionId", AuthMiddleware, AddMessage);

// Add feature
Router.post("/feature/:sessionId", AuthMiddleware, AddFeature);

// Remove feature
Router.post("/feature/remove/:sessionId", AuthMiddleware, RemoveFeature);

//Sugestions

Router.get("/suggestions/:appType", AuthMiddleware, GetFeatureSuggestions);

module.exports = Router;