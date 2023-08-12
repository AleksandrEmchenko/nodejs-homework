import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import fs from "fs/promises";
import path from "path";

import gravatar from "gravatar";
import Jimp from "jimp";

import { nanoid } from "nanoid";

import User from "../models/users.js";

import usersSchemas from "../schemas/users-schemas.js";
("../schemas/users-schemas.js");
import { HttpError, sendEmail } from "../helpers/index.js";
import createVerifyEmail from "../helpers/createVerifyEmail.js";

const { JWT_SECRET, BASE_URL } = process.env;

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
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    avatarURL,
    password: hashPassword,
    verificationToken,
  });

  //Створення листа-підтвердження

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}" target="_blank">Click verify email</a>`,
  };
  // const verifyEmail = createVerifyEmail({email, verificationToken});
  
  await sendEmail(verifyEmail);
 
  res.status(201).json({
    email: newUser.email,
    password: newUser.password,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: " ",
  });
  res.json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  
  if(!user) {
    throw HttpError(404, "Email not found");
  }

  if(user.verify) {
    throw HttpError(400, "User already verify");
  }

    const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank">Click verify email</a>`,
  };

  // const verifyEmail = createVerifyEmail({email, verificationToken: user.verificationToken})

  await sendEmail(verifyEmail);

  res.status(201).json({
    message: "Resend email successfully"
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

  if (!user.verify) {
    throw HttpError(401, "Email not verify");
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
  verify,
  getCurrent,
  signout,
  updateAvatar,
  resendVerifyEmail,
};
