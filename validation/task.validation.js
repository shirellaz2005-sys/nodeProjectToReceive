import joi from 'joi';
export const taskValidationSchema=joi.object({
    title:joi.string().required().min(5).max(100),
    description:joi.string().allow('',null),
    isCompleted:joi.boolean(),
    duDate:joi.date().allow(null),
    categoryId:joi.string().required()
});