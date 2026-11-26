import Joi from "joi";

export const registerSchema = Joi.object({
    username: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().min(8).required(),
}).required().unknown(false);

export const loginSchema = Joi.object({
    username: Joi.string().trim().min(2).max(50),
    email: Joi.string().trim().email().lowercase(),
    password: Joi.string().min(8).required(),
})
    .or("username", "email")
    .required()
    .unknown(false);
