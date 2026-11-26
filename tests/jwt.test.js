import { afterEach, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { createToken } from "../utils/jwt.js";

const originalSecret = process.env.JWT_SECRET;
const testSecret = "fake-secret-for-unit-tests-only";

afterEach(() => {
    if (originalSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalSecret;
    }
});

describe("createToken", () => {
    it("creates a verifiable token with user claims and an expiration", () => {
        process.env.JWT_SECRET = testSecret;
        const user = {
            _id: { toString: () => "507f1f77bcf86cd799439011" },
            username: "alice",
            role: "user",
        };

        const token = createToken(user);
        const payload = jwt.verify(token, testSecret, { algorithms: ["HS256"] });

        expect(payload.sub).toBe("507f1f77bcf86cd799439011");
        expect(payload.username).toBe("alice");
        expect(payload.role).toBe("user");
        expect(payload.exp).toBeDefined();
    });

    it("throws when JWT_SECRET is not configured", () => {
        delete process.env.JWT_SECRET;

        expect(() => createToken({
            _id: { toString: () => "507f1f77bcf86cd799439011" },
            username: "alice",
            role: "user",
        })).toThrow("JWT_SECRET is not configured");
    });

    it("throws if the user has no identifier", () => {
        process.env.JWT_SECRET = testSecret;

        expect(() => createToken({ username: "alice", role: "user" })).toThrow();
    });
});
