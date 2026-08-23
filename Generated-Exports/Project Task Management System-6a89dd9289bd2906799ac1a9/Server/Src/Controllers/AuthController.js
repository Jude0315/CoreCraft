const bcrypt = require("bcrypt");
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
      ["administrator","project manager","team member"];

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
        role || "administrator",
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
      ["administrator","project manager","team member"];

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
          "administrator",
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
      ["administrator","project manager","team member"];

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


module.exports = {
  Register,
  Login,
  GetProfile,
  GetUsers,
  GetUserById,
  CreateUser,
  UpdateUser,
  DeleteUser,
};
