const bcrypt = require("bcrypt");
const User = require("../Models/User");
const GenerateToken = require("../Utils/Token");

const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const UserExists = await User.findOne({ email });

    if (UserExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const Salt = await bcrypt.genSalt(10);

    const HashedPassword = await bcrypt.hash(password, Salt);

    const UserCreated = await User.create({
      name,
      email,
      password: HashedPassword,
    });

    res.status(201).json({
      _id: UserCreated._id,
      name: UserCreated.name,
      email: UserCreated.email,
      token: GenerateToken(UserCreated._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const UserFound = await User.findOne({ email });

    if (
      UserFound &&
      (await bcrypt.compare(password, UserFound.password))
    ) {
      res.json({
        _id: UserFound._id,
        name: UserFound.name,
        email: UserFound.email,
        token: GenerateToken(UserFound._id),
      });
    } else {
      res.status(401).json({
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
};