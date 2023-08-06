import express from "express";

import authController from "../../controllers/auth-controller.js";

import usersSchemas from "../../schemas/users-schemas.js"

import authenticate from "../../middlewars/authenticate.js";
import upload from "../../middlewars/upload.js";

const authRouter = express.Router();

authRouter.post("/registers", authController.signup);

authRouter.post("/login", authController.signin);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.signout);

authRouter.patch("/avatars", authenticate, upload.single("avatar"),  authController.updateAvatar);


export default authRouter;