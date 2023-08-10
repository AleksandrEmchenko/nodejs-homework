import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import fs from "fs/promises";
import path from "path";

import gravatar from "gravatar";
import Jimp from "jimp";

import User from "../models/users.js";

import usersSchemas from "../schemas/users-schemas.js";
("../schemas/users-schemas.js");
import { HttpError } from "../helpers/index.js";

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    res.status(409).json({
      message: "Email in use",
    });
    throw HttpError(409, "Email in use");
  }

  const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "404" });

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    ...req.body,
    avatarURL,
    password: hashPassword,
  });

  res.status(201).json({
    email: newUser.email,
    password: newUser.password,
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({
      message: "Email or password is wrong",
    });
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token: token,
    user: {
      email: user.email,
      subscription: "starter",
    },
  });
};

const getCurrent = (req, res) => {
  const { name, email } = req.user;

  res.json({
    name,
    email,
  });
};
const signout = async (req, res) => {
  const { _id } = req.user;
  await User.findOneAndUpdate(_id, { token: "" });

  res.json({
    message: "Singout success",
  });
};

// change userAvatar
const newPath = path.resolve("public", "avatars");

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;
  const avatarURL = path.join(newPath, filename);

  try {
    const JIMPTImg = Jimp.read(oldPath)
      .then((avatar) => {
        return avatar.resize(250, 250).write(newPath);
      })
      .catch((err) => {
        console.error(err);
        throw HttpError(400, "img resize error");
      });
    console.log("JIMPTImg", JIMPTImg);

    await fs.rename(oldPath, avatarURL);
    await User.findByIdAndUpdate(_id, { avatarURL }, { new: true });
  } catch (error) {
    res.status(401).json({
      message: "Not authorized",
    });
  }

  res.status(200).json({
    avatarURL: avatarURL,
  });
};

export default {
  signup,
  signin,
  getCurrent,
  signout,
  updateAvatar,
};
