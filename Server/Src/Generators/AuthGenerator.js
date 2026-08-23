const FormatRoleList = (
  roles = []
) => {
  const safeRoles =
    Array.isArray(roles) &&
    roles.length > 0
      ? roles
      : ["user"];

  return safeRoles;
};


const NormalizeEntityName = (
  name = ""
) => {
  return name
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(
      /^./,
      (character) =>
        character.toUpperCase()
    );
};


const GetUserApiModule = (
  specification = {}
) => {
  return (
    specification.apiModules || []
  ).find(
    (module) =>
      NormalizeEntityName(
        module.entity ||
        module.name ||
        ""
      ) === "User"
  );
};


const GetUserApiOperations = (
  specification = {}
) => {
  const userApiModule =
    GetUserApiModule(
      specification
    );

  return Array.isArray(
    userApiModule?.operations
  )
    ? userApiModule.operations.map(
        (operation) =>
          String(
            operation
          ).toLowerCase()
      )
    : [];
};


const HasUserOperation = (
  operations,
  operation
) => {
  if (
    operation === "read"
  ) {
    return (
      operations.includes("read") ||
      operations.includes("view")
    );
  }

  return operations.includes(
    operation
  );
};


const GetUserApiRoles = (
  specification = {}
) => {
  const userApiModule =
    GetUserApiModule(
      specification
    );

  return Array.isArray(
    userApiModule?.roles
  )
    ? userApiModule.roles
    : [];
};


const GenerateUserModel = (
  roles = []
) => {
  const safeRoles =
    FormatRoleList(roles);

  const defaultRole =
    safeRoles[0];

  return `const mongoose =
  require("mongoose");


const UserSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      password: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        enum: ${JSON.stringify(
          safeRoles
        )},
        default: "${defaultRole}",
      },
    },
    {
      timestamps: true,
    }
  );


module.exports =
  mongoose.model(
    "User",
    UserSchema
  );
`;
};


const GenerateAuthController = (
  roles = [],
  specification = {}
) => {
  const safeRoles =
    FormatRoleList(roles);

  const defaultRole =
    safeRoles[0];

  const userOperations =
    GetUserApiOperations(
      specification
    );

  const includeCreateUser =
    HasUserOperation(
      userOperations,
      "create"
    );

  const includeUpdateUser =
    HasUserOperation(
      userOperations,
      "update"
    );

  const includeDeleteUser =
    HasUserOperation(
      userOperations,
      "delete"
    );

  const createUserCode =
    includeCreateUser
      ? `
const CreateUser = async (req, res) => {
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

    const allowedRoles =
      ${JSON.stringify(safeRoles)};

    if (
      role &&
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        message:
          "Invalid account role",
      });
    }

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email,
        password:
          hashedPassword,
        role:
          role ||
          "${defaultRole}",
      });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message,
    });
  }
};
`
      : "";

  const updateUserCode =
    includeUpdateUser
      ? `
const UpdateUser = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const {
      name,
      email,
      password,
      role,
    } = req.body;

    const allowedRoles =
      ${JSON.stringify(safeRoles)};

    if (
      role &&
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        message:
          "Invalid account role",
      });
    }

    if (
      email &&
      email !== user.email
    ) {
      const existingUser =
        await User.findOne({
          email,
          _id: {
            $ne:
              user._id,
          },
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "User already exists",
        });
      }
    }

    user.name =
      name || user.name;

    user.email =
      email || user.email;

    user.role =
      role || user.role;

    if (password) {
      user.password =
        await bcrypt.hash(
          password,
          10
        );
    }

    await user.save();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message,
    });
  }
};
`
      : "";

  const deleteUserCode =
    includeDeleteUser
      ? `
const DeleteUser = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      message:
        "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message,
    });
  }
};
`
      : "";

  const userCrudExports =
    [
      includeCreateUser
        ? "  CreateUser,"
        : "",
      includeUpdateUser
        ? "  UpdateUser,"
        : "",
      includeDeleteUser
        ? "  DeleteUser,"
        : "",
    ]
      .filter(Boolean)
      .join("\n");

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

    const allowedRoles =
      ${JSON.stringify(safeRoles)};

    if (
      role &&
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        message:
          "Invalid account role",
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
      role:
        role || "${defaultRole}",
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

const GetUsers = async (req, res) => {
  try {
    const users =
      await User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const GetUserById = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.params.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

${createUserCode}
${updateUserCode}
${deleteUserCode}

module.exports = {
  Register,
  Login,
  GetProfile,
  GetUsers,
  GetUserById,
${userCrudExports}
};
`;
};

const GenerateAuthMiddleware = () => {
  return `const jwt = require("jsonwebtoken");

// This middleware protects private API routes.
// It reads the JWT from the Authorization header and verifies that it is valid.
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
  return `// This middleware checks whether the authenticated user has one of the
// roles permitted by the generated application specification.
const AllowRoles = (...roles) => {
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

const GenerateAuthRoutes = (
  specification = {}
) => {
  const userOperations =
    GetUserApiOperations(
      specification
    );

  const userApiRoles =
    GetUserApiRoles(
      specification
    );

  const hasUserApiModule =
    Boolean(
      GetUserApiModule(
        specification
      )
    );

  const includeCreateUser =
    HasUserOperation(
      userOperations,
      "create"
    );

  const includeUpdateUser =
    HasUserOperation(
      userOperations,
      "update"
    );

  const includeDeleteUser =
    HasUserOperation(
      userOperations,
      "delete"
    );

  const userRouteMiddleware =
    userApiRoles.length > 0
      ? `AuthMiddleware,
  AllowRoles(
    ${userApiRoles
      .map((role) =>
        JSON.stringify(role)
      )
      .join(",\n    ")}
  ),`
      : "AuthMiddleware,";

  const roleMiddlewareImport =
    hasUserApiModule &&
    userApiRoles.length > 0
      ? `
const AllowRoles = require(
  "../Middleware/RoleMiddleware"
);
`
      : "";

  const controllerImports =
    [
      "Register",
      "Login",
      "GetProfile",
      "GetUsers",
      "GetUserById",
      includeCreateUser
        ? "CreateUser"
        : "",
      includeUpdateUser
        ? "UpdateUser"
        : "",
      includeDeleteUser
        ? "DeleteUser"
        : "",
    ]
      .filter(Boolean)
      .join(",\n  ");

  const createUserRoute =
    includeCreateUser
      ? `
Router.post(
  "/users",
  ${userRouteMiddleware}
  CreateUser
);
`
      : "";

  const updateUserRoute =
    includeUpdateUser
      ? `
Router.put(
  "/users/:id",
  ${userRouteMiddleware}
  UpdateUser
);
`
      : "";

  const deleteUserRoute =
    includeDeleteUser
      ? `
Router.delete(
  "/users/:id",
  ${userRouteMiddleware}
  DeleteUser
);
`
      : "";

  return `const express = require("express");

const {
  ${controllerImports},
} = require("../Controllers/AuthController");

const AuthMiddleware = require(
  "../Middleware/AuthMiddleware"
);

${roleMiddlewareImport}

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
  ${userRouteMiddleware}
  GetUsers
);

Router.get(
  "/users/:id",
  ${userRouteMiddleware}
  GetUserById
);

${createUserRoute}
${updateUserRoute}
${deleteUserRoute}

module.exports = Router;
`;
};

const GenerateAuthFiles = (
  specification = {}
) => {
  const roles =
    Array.isArray(
      specification.roles
    )
      ? specification.roles
      : [];

  return {
    model: {
      filename:
        "User.js",

      content:
        GenerateUserModel(roles),
    },

    controller: {
      filename:
        "AuthController.js",

      content:
        GenerateAuthController(
          roles,
          specification
        ),
    },

    authMiddleware: {
      filename:
        "AuthMiddleware.js",

      content:
        GenerateAuthMiddleware(),
    },

    roleMiddleware: {
      filename:
        "RoleMiddleware.js",

      content:
        GenerateRoleMiddleware(),
    },

    routes: {
      filename:
        "AuthRoutes.js",

      content:
        GenerateAuthRoutes(
          specification
        ),
    },
  };
};

module.exports = {
  GenerateAuthFiles,
  GenerateUserModel,
  GenerateAuthController,
  GenerateAuthMiddleware,
  GenerateRoleMiddleware,
  GenerateAuthRoutes,
  FormatRoleList,
};
