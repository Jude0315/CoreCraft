const GenerateAuthController = () => {
  return `const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../Models/User");

const Register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    return res.status(201).json({
      message:
        "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const Login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message:
        "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const GetProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  Register,
  Login,
  GetProfile,
};
`;
};

const GenerateAuthMiddleware = () => {
  return `const jwt = require("jsonwebtoken");

const AuthMiddleware = (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message:
          "Authentication required",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message:
        "Invalid or expired token",
    });
  }
};

module.exports = AuthMiddleware;
`;
};

const GenerateRoleMiddleware = () => {
  return `const AllowRoles = (...roles) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !roles.includes(req.user.role)
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to access this resource",
      });
    }

    next();
  };
};

module.exports = AllowRoles;
`;
};

const GenerateAuthRoutes = () => {
  return `const express = require("express");

const {
  Register,
  Login,
  GetProfile,
} = require("../Controllers/AuthController");

const AuthMiddleware = require(
  "../Middleware/AuthMiddleware"
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

module.exports = Router;
`;
};

const GenerateAuthFiles = () => {
  return {
    controller: {
      filename: "AuthController.js",
      content:
        GenerateAuthController(),
    },

    authMiddleware: {
      filename: "AuthMiddleware.js",
      content:
        GenerateAuthMiddleware(),
    },

    roleMiddleware: {
      filename: "RoleMiddleware.js",
      content:
        GenerateRoleMiddleware(),
    },

    routes: {
      filename: "AuthRoutes.js",
      content:
        GenerateAuthRoutes(),
    },
  };
};

module.exports = {
  GenerateAuthFiles,
  GenerateAuthController,
  GenerateAuthMiddleware,
  GenerateRoleMiddleware,
  GenerateAuthRoutes,
};