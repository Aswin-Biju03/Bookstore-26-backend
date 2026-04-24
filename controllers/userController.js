const users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerController = async (req, res) => {
  console.log("Inside Register");
  console.log(req.body);
  const { username, email, password } = req.body;

  const existingUser = await users.findOne({ email });
  if (existingUser) {
    res.status(409).json("User Already Exists.... Please Login!!");
  } else {
    let encrypPassword = await bcrypt.hash(password, 10);
    const newUser = await users.create({
      username,
      email,
      password: encrypPassword,
    });
    res.status(201).json(newUser);
  }
};

exports.loginController = async (req, res) => {
  console.log("Inside login");
  const { email, password } = req.body;

  const existingUser = await users.findOne({ email });
  if (existingUser) {
    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (isPasswordMatch) {
      const token = jwt.sign(
        { userMail: email, role: existingUser.role },
        process.env.JWTSECRET,
      );
      res.status(200).json({
        user: existingUser,
        token,
      });
    } else {
      res.status(409).json("Invalid email or password");
    }
  } else {
    res.status(409).json("Invalid email.... Please register!!");
  }
};
