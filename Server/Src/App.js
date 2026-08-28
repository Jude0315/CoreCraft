const express = require("express");
const cors = require("cors");

const AuthRoutes = require("./Routes/AuthRoutes");
const ProjectRoutes = require("./Routes/ProjectRoutes");
const BuilderRoutes = require("./Routes/BuilderRoutes");
const AiRoutes = require("./Routes/AiRoutes");

const app = express();

// Registers shared Express middleware before any API route handles requests.
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CoreCraft API running...");
});

// Main CoreCraft API modules.
// Each route file keeps its own endpoint definitions and controller links.
app.use("/api/auth", AuthRoutes);
app.use("/api/projects", ProjectRoutes);
app.use("/api/builder", BuilderRoutes);
app.use("/api/ai", AiRoutes);

// Generation routes convert finalized requirements into a runnable MERN project.
app.use(
  "/api/generation",
  require("./Routes/GenerationRoutes")
);

module.exports = app;
