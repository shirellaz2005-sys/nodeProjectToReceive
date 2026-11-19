import jwt from "jsonwebtoken";

export const createToken = (user) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            sub: user._id.toString(),
            username: user.username,
            role: user.role,
        },
        secret,
        { expiresIn: "1h" }
    );
};
