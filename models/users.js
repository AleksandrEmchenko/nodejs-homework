import { Schema, model } from "mongoose";
import { handleSaveError, isValidateAtUpdate } from "./hooks.js";
import { emailRegexp } from "../constants/index.js";

const userSchema = new Schema(
  {
    name: String,
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: String,

  },
  { versionKey: false, timestamps: true }
);

userSchema.pre("findOneAndUpdate", isValidateAtUpdate);

userSchema.post("save", handleSaveError);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);
export default User;