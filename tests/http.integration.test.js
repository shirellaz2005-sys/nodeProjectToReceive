import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mocks = vi.hoisted(() => {
    const taskSave = vi.fn();
    const TaskMock = vi.fn(function (data) {
        this.data = data;
        this.save = taskSave;
    });
    TaskMock.find = vi.fn();
    TaskMock.findOne = vi.fn();
    TaskMock.findOneAndUpdate = vi.fn();
    TaskMock.findOneAndDelete = vi.fn();
    TaskMock.exists = vi.fn();

    const categorySave = vi.fn();
    const CategoryMock = vi.fn(function (data) {
        this.data = data;
        this.save = categorySave;
    });
    CategoryMock.find = vi.fn();
    CategoryMock.findById = vi.fn();
    CategoryMock.findByIdAndUpdate = vi.fn();
    CategoryMock.findByIdAndDelete = vi.fn();

    const userSave = vi.fn();
    const UserMock = vi.fn(function (data) {
        Object.assign(this, data);
        this._id = { toString: () => "507f1f77bcf86cd799439011" };
        this.role = "user";
        this.save = userSave;
    });
    UserMock.findOne = vi.fn();

    return {
        taskSave,
        TaskMock,
        categorySave,
        CategoryMock,
        userSave,
        UserMock,
    };
});

vi.mock("../models/task.model.js", () => ({ default: mocks.TaskMock }));
vi.mock("../models/category.model.js", () => ({ default: mocks.CategoryMock }));
vi.mock("../models/user.model.js", () => ({ default: mocks.UserMock }));

import app from "../app.js";
import { createToken } from "../utils/jwt.js";

const testSecret = "fake-supertest-jwt-secret";
const originalJwtSecret = process.env.JWT_SECRET;
const validId = "507f1f77bcf86cd799439011";
const task = { _id: validId, title: "Test task" };
const category = { _id: validId, name: "Books" };
const validTaskBody = { title: "A valid task" };
const validCategoryBody = { name: "Books" };

const tokenFor = (role) => createToken({
    _id: { toString: () => validId },
    username: role,
    role,
});

const send = ({ method, path, body, token }) => {
    let req = request(app)[method](path);
    if (token) {
        req = req.set("Authorization", `Bearer ${token}`);
    }
    if (body !== undefined) {
        req = req.send(body);
    }
    return req;
};

const populateQuery = (result) => ({
    populate: vi.fn().mockResolvedValue(result),
});

const protectedRoutes = [
    { method: "get", path: "/api/tasks", status: 200 },
    { method: "get", path: `/api/tasks/${validId}`, status: 200 },
    { method: "post", path: "/api/tasks", body: validTaskBody, status: 201 },
    { method: "put", path: `/api/tasks/${validId}`, body: validTaskBody, status: 200 },
    { method: "delete", path: `/api/tasks/${validId}`, status: 200 },
    { method: "get", path: "/api/categories", status: 200 },
    { method: "get", path: `/api/categories/${validId}`, status: 200 },
    { method: "post", path: "/api/categories", body: validCategoryBody, status: 201 },
    { method: "put", path: `/api/categories/${validId}`, body: validCategoryBody, status: 200 },
    { method: "delete", path: `/api/categories/${validId}`, status: 200 },
];

beforeEach(() => {
    process.env.JWT_SECRET = testSecret;

    for (const mock of [
        mocks.taskSave,
        mocks.TaskMock,
        mocks.TaskMock.find,
        mocks.TaskMock.findOne,
        mocks.TaskMock.findOneAndUpdate,
        mocks.TaskMock.findOneAndDelete,
        mocks.TaskMock.exists,
        mocks.categorySave,
        mocks.CategoryMock,
        mocks.CategoryMock.find,
        mocks.CategoryMock.findById,
        mocks.CategoryMock.findByIdAndUpdate,
        mocks.CategoryMock.findByIdAndDelete,
        mocks.userSave,
        mocks.UserMock,
        mocks.UserMock.findOne,
    ]) {
        mock.mockReset();
    }

    mocks.TaskMock.mockImplementation(function (data) {
        this.data = data;
        this.save = mocks.taskSave;
    });
    mocks.TaskMock.find.mockReturnValue(populateQuery([task]));
    mocks.TaskMock.findOne.mockReturnValue(populateQuery(task));
    mocks.TaskMock.findOneAndUpdate.mockResolvedValue(task);
    mocks.TaskMock.findOneAndDelete.mockResolvedValue(task);
    mocks.TaskMock.exists.mockResolvedValue(false);
    mocks.taskSave.mockResolvedValue(task);

    mocks.CategoryMock.mockImplementation(function (data) {
        this.data = data;
        this.save = mocks.categorySave;
    });
    mocks.CategoryMock.find.mockResolvedValue([category]);
    mocks.CategoryMock.findById.mockResolvedValue(category);
    mocks.CategoryMock.findByIdAndUpdate.mockResolvedValue(category);
    mocks.CategoryMock.findByIdAndDelete.mockResolvedValue(category);
    mocks.categorySave.mockResolvedValue(category);

    mocks.UserMock.mockImplementation(function (data) {
        Object.assign(this, data);
        this._id = { toString: () => validId };
        this.role = "user";
        this.save = mocks.userSave;
    });
    mocks.userSave.mockResolvedValue();
    mocks.UserMock.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
    });
});

afterEach(() => {
    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
});

describe("protected task and category routes", () => {
    it.each(protectedRoutes)("rejects missing bearer tokens for $method $path", async (route) => {
        const response = await send(route);

        expect(response.status).toBe(401);
    });

    it.each(protectedRoutes)("rejects invalid bearer tokens for $method $path", async (route) => {
        const response = await send({ ...route, token: "invalid-token" });

        expect(response.status).toBe(401);
    });

    it.each(protectedRoutes)("allows admins to use $method $path", async (route) => {
        const response = await send({ ...route, token: tokenFor("admin") });

        expect(response.status).toBe(route.status);
    });

    it.each([
        { method: "post", path: "/api/categories", body: validCategoryBody },
        { method: "put", path: `/api/categories/${validId}`, body: validCategoryBody },
        { method: "delete", path: `/api/categories/${validId}` },
        { method: "delete", path: `/api/tasks/${validId}` },
    ])("returns 403 for regular users on admin actions: $method $path", async (route) => {
        const response = await send({ ...route, token: tokenFor("user") });

        expect(response.status).toBe(403);
    });

    it("allows regular users to read routes without admin restrictions", async () => {
        const token = tokenFor("user");

        const taskList = await send({ method: "get", path: "/api/tasks", token });
        const categoryList = await send({ method: "get", path: "/api/categories", token });
        const categoryById = await send({
            method: "get",
            path: `/api/categories/${validId}`,
            token,
        });

        expect(taskList.status).toBe(200);
        expect(categoryList.status).toBe(200);
        expect(categoryById.status).toBe(200);
    });
});

describe("resource IDs and request bodies", () => {
    it.each([
        { method: "get", path: "/api/tasks/not-an-id" },
        { method: "put", path: "/api/tasks/not-an-id", body: validTaskBody },
        { method: "delete", path: "/api/tasks/not-an-id" },
        { method: "get", path: "/api/categories/not-an-id" },
        { method: "put", path: "/api/categories/not-an-id", body: validCategoryBody },
        { method: "delete", path: "/api/categories/not-an-id" },
    ])("returns 404 for invalid ID at $method $path", async (route) => {
        const response = await send({ ...route, token: tokenFor("admin") });

        expect(response.status).toBe(404);
    });

    it.each([
        {
            method: "get",
            path: `/api/tasks/${validId}`,
            setup: () => mocks.TaskMock.findOne.mockReturnValueOnce(populateQuery(null)),
        },
        {
            method: "put",
            path: `/api/tasks/${validId}`,
            body: validTaskBody,
            setup: () => mocks.TaskMock.findOneAndUpdate.mockResolvedValueOnce(null),
        },
        {
            method: "delete",
            path: `/api/tasks/${validId}`,
            setup: () => mocks.TaskMock.findOneAndDelete.mockResolvedValueOnce(null),
        },
        {
            method: "get",
            path: `/api/categories/${validId}`,
            setup: () => mocks.CategoryMock.findById.mockResolvedValueOnce(null),
        },
        {
            method: "put",
            path: `/api/categories/${validId}`,
            body: validCategoryBody,
            setup: () => mocks.CategoryMock.findByIdAndUpdate.mockResolvedValueOnce(null),
        },
        {
            method: "delete",
            path: `/api/categories/${validId}`,
            setup: () => mocks.CategoryMock.findByIdAndDelete.mockResolvedValueOnce(null),
        },
    ])("returns 404 for a missing resource at $method $path", async (route) => {
        route.setup();
        const response = await send({ ...route, token: tokenFor("admin") });

        expect(response.status).toBe(404);
    });

    it.each([
        { method: "post", path: "/api/tasks", body: {} },
        { method: "post", path: "/api/tasks", body: { title: "" } },
        { method: "post", path: "/api/tasks", body: { title: "   " } },
        { method: "post", path: "/api/tasks", body: { title: "Valid task", userId: validId } },
        { method: "put", path: `/api/tasks/${validId}`, body: { title: "bad" } },
        { method: "put", path: `/api/tasks/${validId}`, body: { title: "" } },
        { method: "post", path: "/api/categories", body: {} },
        { method: "post", path: "/api/categories", body: { name: "" } },
        { method: "post", path: "/api/categories", body: { name: "   " } },
        { method: "put", path: `/api/categories/${validId}`, body: { name: "A" } },
        { method: "put", path: `/api/categories/${validId}`, body: { name: "" } },
    ])("returns 400 for invalid body at $method $path", async (route) => {
        const response = await send({ ...route, token: tokenFor("admin") });

        expect(response.status).toBe(400);
    });

    it("rejects registration that tries to set a role", async () => {
        const response = await request(app)
            .post("/api/users/register")
            .send({
                username: "Alice",
                email: "alice@example.com",
                password: "password123",
                role: "admin",
            });

        expect(response.status).toBe(400);
    });

    it("returns 401 for a login with an incorrect password", async () => {
        const user = {
            comparePassword: vi.fn().mockResolvedValue(false),
        };
        mocks.UserMock.findOne.mockReturnValue({
            select: vi.fn().mockResolvedValue(user),
        });

        const response = await request(app)
            .post("/api/users/login")
            .send({ username: "Alice", password: "incorrect-password" });

        expect(response.status).toBe(401);
    });

    it("returns 409 when deleting a category that has tasks", async () => {
        mocks.TaskMock.exists.mockResolvedValue(true);

        const response = await send({
            method: "delete",
            path: `/api/categories/${validId}`,
            token: tokenFor("admin"),
        });

        expect(response.status).toBe(409);
    });
});
