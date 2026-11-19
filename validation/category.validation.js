import Joi from "joi";

export const categoryValidationSchema = Joi.object({
    name: Joi.string().trim().required().min(2).max(50).messages({
        "string.empty": "שם הקטגוריה הוא שדה חובה",
        "string.min": "שם הקטגוריה חייב להיות 2 תווים לפחות",
    }),
});