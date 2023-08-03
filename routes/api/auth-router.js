import express from "express";

import authController from "../../controllers/auth-controller.js";

import usersSchemas from "../../schemas/users-schemas.js"

import authenticate from "../../middlewars/authenticate.js";

const authRouter = express.Router();

authRouter.post("/registers", authController.signup);

authRouter.post("/login", authController.signin);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.signout);


export default authRouter;