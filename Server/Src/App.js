const express = require("express");
const cors = require("cors");

const AuthRoutes = require("./Routes/AuthRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CoreCraft API running...");
});

app.use("/api/auth", AuthRoutes);

module.exports = app;