import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/users.js";

export const signin = async (req, res) => {
  // getting email and password from request (client side form)
  const { email, password } = req.body;

  try {
    // try to look for existing user using email
    const existingUser = await User.findOne({ email });
    // if user doesn't exist, respond with error
    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });
    // if the user exists, compare encrypted passwords
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    // if passwords do not match, respond with error
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });
    // if password is correct, respond by returning the access token
    // we're using 'test' as secret
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "test",
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  try {
    // try to look for existing user using email
    const existingUser = await User.findOne({ email });
    // if user does exist, respond with error
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match" });
    // Hashing password before storing it, difficulty is 12
    const hashedPassword = await bcrypt.hash(password, 12);
    // Create a new user in the database
    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });
    // return access token if everything is fine
    const token = jwt.sign({ email: result.email, id: result._id }, "test", {
      expiresIn: "1h",
    });
    res.status(200).json({ result: result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
