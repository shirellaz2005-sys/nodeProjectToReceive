import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema } from "../validation/user.validation.js";
import { taskValidationSchema } from "../validation/task.validation.js";
import { categoryValidationSchema } from "../validation/category.validation.js";

describe("registerSchema", () => {
    it("accepts valid details and normalizes strings", () => {
        const { error, value } = registerSchema.validate({
            username: "  Alice  ",
            email: "  ALICE@example.com  ",
            password: "password123",
        });

        expect(error).toBeUndefined();
        expect(value).toEqual({
            username: "Alice",
            email: "alice@example.com",
            password: "password123",
        });
    });

    it("rejects missing fields, invalid email, short password, and unknown fields", () => {
        const invalidInputs = [
            { username: "Alice", email: "alice@example.com" },
            { username: "Alice", email: "not-an-email", password: "password123" },
            { username: "Alice", email: "alice@example.com", password: "short" },
            {
                username: "Alice",
                email: "alice@example.com",
                password: "password123",
                role: "admin",
            },
        ];

        for (const input of invalidInputs) {
            expect(registerSchema.validate(input).error).toBeDefined();
        }
    });

    it("accepts the minimum valid username and password lengths", () => {
        expect(registerSchema.validate({
            username: "Al",
            email: "al@example.com",
            password: "12345678",
        }).error).toBeUndefined();
    });

    it("rejects each required field when missing or empty", () => {
        const valid = {
            username: "Alice",
            email: "alice@example.com",
            password: "password123",
        };
        const invalidInputs = [
            { email: valid.email, password: valid.password },
            { username: valid.username, password: valid.password },
            { username: valid.username, email: valid.email },
            { ...valid, username: "" },
            { ...valid, username: "   " },
            { ...valid, email: "" },
            { ...valid, password: "" },
        ];

        for (const input of invalidInputs) {
            expect(registerSchema.validate(input).error).toBeDefined();
        }
    });
});

describe("loginSchema", () => {
    it("accepts login by email and normalizes the email", () => {
        const { error, value } = loginSchema.validate({
            email: "  ALICE@example.com ",
            password: "password123",
        });

        expect(error).toBeUndefined();
        expect(value.email).toBe("alice@example.com");
    });

    it("accepts login by username", () => {
        expect(loginSchema.validate({
            username: "Alice",
            password: "password123",
        }).error).toBeUndefined();
    });

    it("rejects missing identifiers, invalid email, short password, and unknown fields", () => {
        const invalidInputs = [
            { password: "password123" },
            { email: "not-an-email", password: "password123" },
            { username: "Alice", password: "short" },
            { username: "Alice", password: "password123", role: "admin" },
        ];

        for (const input of invalidInputs) {
            expect(loginSchema.validate(input).error).toBeDefined();
        }
    });

    it("rejects empty identifiers and an empty password", () => {
        const invalidInputs = [
            { username: "", password: "password123" },
            { email: "", password: "password123" },
            { username: "", email: "", password: "password123" },
            { username: "Alice", password: "" },
        ];

        for (const input of invalidInputs) {
            expect(loginSchema.validate(input).error).toBeDefined();
        }
    });
});

describe("taskValidationSchema", () => {
    it("accepts valid task details and normalizes the title", () => {
        const { error, value } = taskValidationSchema.validate({
            title: "  Write tests  ",
            description: "  Unit tests ",
            isCompleted: true,
            dueDate: "2026-12-01",
            categoryId: "507f1f77bcf86cd799439011",
        });

        expect(error).toBeUndefined();
        expect(value.title).toBe("Write tests");
        expect(value.description).toBe("Unit tests");
        expect(value.isCompleted).toBe(true);
        expect(value.dueDate).toBeInstanceOf(Date);
    });

    it("accepts optional fields when null", () => {
        expect(taskValidationSchema.validate({
            title: "Valid title",
            description: null,
            dueDate: null,
            categoryId: null,
        }).error).toBeUndefined();
    });

    it("rejects missing or out-of-range title and invalid field values", () => {
        const invalidInputs = [
            {},
            { title: "" },
            { title: "   " },
            { title: "Four" },
            { title: "T".repeat(101) },
            { title: "Valid title", categoryId: "not-an-object-id" },
            { title: "Valid title", dueDate: "not-a-date" },
            { title: "Valid title", isCompleted: "not-a-boolean" },
            { title: "Valid title", description: 123 },
        ];

        for (const input of invalidInputs) {
            expect(taskValidationSchema.validate(input).error).toBeDefined();
        }
    });
});

describe("categoryValidationSchema", () => {
    it("accepts a valid name and trims whitespace", () => {
        const { error, value } = categoryValidationSchema.validate({ name: "  Books  " });

        expect(error).toBeUndefined();
        expect(value.name).toBe("Books");
    });

    it("accepts names at the minimum and maximum lengths", () => {
        expect(categoryValidationSchema.validate({ name: "AB" }).error).toBeUndefined();
        expect(categoryValidationSchema.validate({ name: "A".repeat(50) }).error).toBeUndefined();
    });

    it("rejects missing, blank, too-short, and too-long names", () => {
        const invalidInputs = [
            {},
            { name: "" },
            { name: "   " },
            { name: "A" },
            { name: "A".repeat(51) },
        ];

        for (const input of invalidInputs) {
            expect(categoryValidationSchema.validate(input).error).toBeDefined();
        }
    });
});
