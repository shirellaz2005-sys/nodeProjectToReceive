import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    address: String,
    phone: String,
    role: { type: String, enum: ["admin", "user"], default: "user" },
});

const hashPassword = async (password) => {
    if (typeof password !== "string" || password.length === 0) {
        throw new TypeError("Password must be a non-empty string");
    }

    const saltRounds = Number(process.env.SALT_ROUNDS ?? 12);
    if (!Number.isInteger(saltRounds) || saltRounds < 4 || saltRounds > 31) {
        throw new RangeError("SALT_ROUNDS must be an integer between 4 and 31");
    }

    return bcrypt.hash(password, saltRounds);
};

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await hashPassword(this.password);
    }
});



userSchema.methods.comparePassword = function (password) {
    if (!this.password) {
        throw new Error("Select the password field before comparing passwords");
    }

    return bcrypt.compare(password, this.password);
};

const User = model("User", userSchema);
export default User;