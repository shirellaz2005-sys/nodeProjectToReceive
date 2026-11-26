import { describe, expect, it } from "vitest";
import { AppError } from "../middleware/AppError.js";

describe("AppError", () => {
    it("creates a client error with its message, status, and fail type", () => {
        const error = new AppError("Not found", 404);

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe("Not found");
        expect(error.statusCode).toBe(404);
        expect(error.type).toBe("fail");
    });

    it("creates a server error with error type", () => {
        const error = new AppError("Internal error", 500);

        expect(error.statusCode).toBe(500);
        expect(error.type).toBe("error");
    });

    it("treats both ends of the 4xx range as client failures", () => {
        expect(new AppError("Bad request", 400).type).toBe("fail");
        expect(new AppError("Client error", 499).type).toBe("fail");
    });
});
