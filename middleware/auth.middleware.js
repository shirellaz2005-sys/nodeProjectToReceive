import jwt from "jsonwebtoken";
import { AppError } from "./AppError.js";

export const auth = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        return next(new AppError("Authentication required", 401));
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
        return next(new AppError("Authentication required", 401));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        if (
            typeof payload !== "object" ||
            payload === null ||
            typeof payload.sub !== "string" ||
            typeof payload.role !== "string"
        ) {
            return next(new AppError("Invalid authentication token", 401));
        }

        req.user = {
            id: payload.sub,
            role: payload.role,
        };
        return next();
    } catch (error) {
        return next(new AppError("Invalid authentication token", 401));
    }
};

export const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
        return next(new AppError("Insufficient permissions", 403));
    }

    return next();
};
