import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/users.js";

import usersSchemas from "../schemas/users-schemas.js";
("../schemas/users-schemas.js");
import { HttpError } from "../helpers/index.js";

const {JWT_SECRET} = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.status(409).json({
      message: "Email in use",
    });
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ ...req.body, password: hashPassword });

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
  if(!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
const payload = {
    id: user._id,
}
  const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "23h"});
  await User.findByIdAndUpdate(user._id, {token});

  res.json({
    "token": token,
    "user": {
      "email": user.email,
      "subscription": "starter",
  },
});
}

const getCurrent = (req, res) => {
  const {name, email} = req.user;

  res.json({
    name, 
    email,
  })
}
const signout = async (req, res) => {
  const {_id} = req.user;
  await User.findOneAndUpdate(_id, {token: ""});

  res.json({
    message: "Singout success"
  })

}


export default {
  signup,
  signin,
  getCurrent,
  signout,
};
