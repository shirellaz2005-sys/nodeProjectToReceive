import User from "../models/user.model.js";
import { AppError } from "../middleware/AppError.js";
import { createToken } from "../utils/jwt.js";

export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body ?? {};

        if (
            typeof username !== "string" || !username.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || password.length < 8
        ) {
            return next(new AppError("Username, email and a password of at least 8 characters are required", 400));
        }

        const user = new User({ username, email, password });
         await user.save();
        const token = createToken(user);
       

        res.status(201).json({
            success: true,
            data: { username: user.username, token },
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError("Username or email already exists", 409));
        }

        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, email, password } = req.body ?? {};
        const identifiers = [];

        if (typeof email === "string" && email.trim()) {
            identifiers.push({ email: email.trim() });
        }
        if (typeof username === "string" && username.trim()) {
            identifiers.push({ username: username.trim() });
        }
        if (identifiers.length === 0 || typeof password !== "string" || password.length === 0) {
            return next(new AppError("Username or email and password are required", 400));
        }

        const user = await User.findOne({ $or: identifiers }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError("Invalid username or password", 401));
        }

        const token = createToken(user);
        res.status(200).json({
            success: true,
            data: { username: user.username, token },
        });
    } catch (error) {
        next(error);
    }
};
