import Joi from "joi";

import { emailRegexp } from "../constants/user-constants.js";

const userSignupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().required(),
});

const userSigninSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().required(),
});

export default {
    userSignupSchema,
    userSigninSchema,
}