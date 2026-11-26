import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { auth, authorize } from "../middleware/auth.middleware.js";

const testSecret = "mocked-auth-secret";
const originalSecret = process.env.JWT_SECRET;
const validPayload = {
    sub: "507f1f77bcf86cd799439011",
    username: "Alice",
    role: "user",
};

const makeRequest = (authorization) => ({
    headers: authorization === undefined ? {} : { authorization },
});

beforeEach(() => {
    process.env.JWT_SECRET = testSecret;
});

afterEach(() => {
    vi.restoreAllMocks();
    if (originalSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalSecret;
    }
});

describe("auth middleware", () => {
    it("extracts and verifies a Bearer token and sets id and role", () => {
        const token = jwt.sign(validPayload, testSecret, { algorithm: "HS256" });
        const req = makeRequest(`Bearer ${token}`);
        const next = vi.fn();

        auth(req, {}, next);

        expect(req.user).toEqual({ id: validPayload.sub, role: "user" });
        expect(next).toHaveBeenCalledWith();
    });

    it.each([
        ["missing header", undefined],
        ["wrong scheme", "Basic token"],
        ["empty bearer value", "Bearer "],
        ["invalid token", "Bearer invalid.token.value"],
    ])("returns 401 for %s", (_case, authorization) => {
        const next = vi.fn();

        auth(makeRequest(authorization), {}, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it("returns 401 for an expired token", () => {
        const token = jwt.sign(validPayload, testSecret, {
            algorithm: "HS256",
            expiresIn: -1,
        });
        const next = vi.fn();

        auth(makeRequest(`Bearer ${token}`), {}, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it("returns 401 for a token with a malformed payload", () => {
        const token = jwt.sign("not-an-object", testSecret, { algorithm: "HS256" });
        const next = vi.fn();

        auth(makeRequest(`Bearer ${token}`), {}, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
});

describe("authorize middleware", () => {
    it("continues when the user's role is allowed", () => {
        const next = vi.fn();

        authorize("user", "admin")({ user: { role: "user" } }, {}, next);

        expect(next).toHaveBeenCalledWith();
    });

    it("returns 401 when auth did not set req.user", () => {
        const next = vi.fn();

        authorize("admin")({}, {}, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it("returns 403 when the role is not allowed", () => {
        const next = vi.fn();

        authorize("admin")({ user: { role: "user" } }, {}, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
});
