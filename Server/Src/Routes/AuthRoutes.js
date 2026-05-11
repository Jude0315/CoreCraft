const express = require("express");

const {
  RegisterUser,
  LoginUser,
} = require("../Controllers/AuthController");

const Router = express.Router();

Router.post("/register", RegisterUser);
Router.post("/login", LoginUser);

module.exports = Router;