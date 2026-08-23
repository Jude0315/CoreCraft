const express = require("express");

const {
  Register,
  Login,
  GetProfile,
  GetUsers,
  GetUserById,
  CreateUser,
  UpdateUser,
  DeleteUser,
} = require("../Controllers/AuthController");

const AuthMiddleware = require(
  "../Middleware/AuthMiddleware"
);


const AllowRoles = require(
  "../Middleware/RoleMiddleware"
);


const Router = express.Router();

Router.post(
  "/register",
  Register
);

Router.post(
  "/login",
  Login
);

Router.get(
  "/profile",
  AuthMiddleware,
  GetProfile
);

Router.get(
  "/users",
  AuthMiddleware,
  AllowRoles(
    "administrator"
  ),
  GetUsers
);

Router.get(
  "/users/:id",
  AuthMiddleware,
  AllowRoles(
    "administrator"
  ),
  GetUserById
);


Router.post(
  "/users",
  AuthMiddleware,
  AllowRoles(
    "administrator"
  ),
  CreateUser
);


Router.put(
  "/users/:id",
  AuthMiddleware,
  AllowRoles(
    "administrator"
  ),
  UpdateUser
);


Router.delete(
  "/users/:id",
  AuthMiddleware,
  AllowRoles(
    "administrator"
  ),
  DeleteUser
);


module.exports = Router;
