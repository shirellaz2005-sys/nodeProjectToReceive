import { AppError } from "./AppError";
export const validateSchema = (schema) => {
    const mdl = (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(message, 400));
        }
        
       
        req.body = value;
        next();
    };
    return mdl;
};