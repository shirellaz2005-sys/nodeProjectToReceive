import Joi from "joi";

export const taskValidationSchema = Joi.object({
    title: Joi.string().trim().required().min(5).max(100),
    description: Joi.string().trim().allow("", null),
    isCompleted: Joi.boolean(),
    dueDate: Joi.date().allow(null),
    categoryId: Joi.string().hex().length(24).allow(null),
});