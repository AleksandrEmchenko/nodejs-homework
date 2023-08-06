import fs from "fs/promises";
import path from "path";

import { Contact } from "../models/index.js";

import { contactsAddSchema } from "../schemas/index.js";
import { HttpError } from "../helpers/index.js";

const getAll = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;

    //Pagination
    const { page = 1, limit = 10 } = req.query; //параметри запиту
    const skip = (page - 1) * limit;
    //End Pagination

    const result = await Contact.find({ owner }, { skip, limit }).populate(
      "owner",
      "name email"
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Contact.findById(id);
    if (!result) {
      throw HttpError(404, `Contact with id ${id} not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const avatarPath = path.resolve("public", "avatars");

const createNewContact = async (req, res, next) => {
  try {
    const { error } = contactsAddSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { _id: owner } = req.user;

    const { path: oldPath, filename } = req.file;
    const newPath = path.join(avatarPath, filename);

    await fs.rename(oldPath, newPath);
const avatar = path.join("avatars", filename);

    const result = await Contact.create({ ...req.body, avatar, owner });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Contact.findByIdAndDelete(id);
    if (!result) {
      throw HttpError(404, `Contact with id ${id} not found`);
    }

    res.json({ message: "Delete Success" });
  } catch (error) {
    next(error);
  }
};

const updateContactById = async (req, res, next) => {
  try {
    const { error } = contactsAddSchema.validate(req.body);

    if (error) {
      throw HttpError(400, error.message);
    }

    const { id } = req.params;
    const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });

    if (!result) {
      throw HttpError(404, `Contact with id ${id} not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateFavorite = async (req, res, next) => {
  try {
    // const { error } = contactsAddSchema.validate(req.body);

    // if (error) {
    //   throw HttpError(400, error.message);
    // }

    const { id } = req.params;
    const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });

    if (!result) {
      throw HttpError(404, `Contact with id ${id} not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  createNewContact,
  deleteById,
  updateContactById,
  updateFavorite,
};
