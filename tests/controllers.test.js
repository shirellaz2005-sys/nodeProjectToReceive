import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import {
    createTask,
    deleteTask,
    getAlltasks,
    getTaskById,
    updateTask,
} from "../controllers/task.controller.js";
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategoryById,
    updateCategory,
} from "../controllers/category.controller.js";
import { login, register } from "../controllers/user.controller.js";

const validId = "507f1f77bcf86cd799439011";
const originalJwtSecret = process.env.JWT_SECRET;

const makeResponse = () => {
    const res = {
        status: vi.fn(),
        json: vi.fn(),
    };
    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    return res;
};

const makePopulateQuery = (value) => ({
    populate: vi.fn().mockResolvedValue(value),
});

const expectErrorStatus = (next, statusCode) => {
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode }));
};

beforeEach(() => {
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
    mocks.CategoryMock.mockImplementation(function (data) {
        this.data = data;
        this.save = mocks.categorySave;
    });
    mocks.UserMock.mockImplementation(function (data) {
        Object.assign(this, data);
        this._id = { toString: () => validId };
        this.role = "user";
        this.save = mocks.userSave;
    });
});

afterEach(() => {
    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
});

describe("task controller", () => {
    it("scopes regular users to their own tasks and admins to all tasks", async () => {
        const userTasks = [{ _id: "user-task" }];
        const adminTasks = [{ _id: "any-task" }];
        mocks.TaskMock.find
            .mockReturnValueOnce(makePopulateQuery(userTasks))
            .mockReturnValueOnce(makePopulateQuery(adminTasks));

        const userRes = makeResponse();
        await getAlltasks({ user: { id: validId, role: "user" } }, userRes, vi.fn());
        const adminRes = makeResponse();
        await getAlltasks({ user: { id: validId, role: "admin" } }, adminRes, vi.fn());

        expect(mocks.TaskMock.find).toHaveBeenNthCalledWith(1, { userId: validId });
        expect(mocks.TaskMock.find).toHaveBeenNthCalledWith(2, {});
        expect(userRes.json).toHaveBeenCalledWith({ success: true, data: userTasks });
        expect(adminRes.json).toHaveBeenCalledWith({ success: true, data: adminTasks });
    });

    it("returns a task for its owner and returns 404 for invalid or missing IDs", async () => {
        mocks.TaskMock.findOne
            .mockReturnValueOnce(makePopulateQuery({ _id: validId }))
            .mockReturnValueOnce(makePopulateQuery(null));

        const res = makeResponse();
        const next = vi.fn();
        await getTaskById(
            { params: { id: validId }, user: { id: validId, role: "user" } },
            res,
            next
        );
        expect(mocks.TaskMock.findOne).toHaveBeenCalledWith({ _id: validId, userId: validId });
        expect(res.status).toHaveBeenCalledWith(200);

        await getTaskById(
            { params: { id: "invalid-id" }, user: { id: validId, role: "user" } },
            makeResponse(),
            next
        );
        expectErrorStatus(next, 404);

        await getTaskById(
            { params: { id: validId }, user: { id: validId, role: "user" } },
            makeResponse(),
            next
        );
        expectErrorStatus(next, 404);
    });

    it("creates tasks for the authenticated user, not a body-supplied owner", async () => {
        const savedTask = { _id: validId };
        mocks.taskSave.mockResolvedValue(savedTask);
        const res = makeResponse();

        await createTask({
            body: { title: "Task", userId: "attacker-id" },
            user: { id: validId, role: "user" },
        }, res, vi.fn());

        expect(mocks.TaskMock).toHaveBeenCalledWith({
            title: "Task",
            userId: validId,
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: savedTask });
    });

    it("updates and deletes only tasks within the caller's scope", async () => {
        const updatedTask = { _id: validId };
        const deletedTask = { _id: validId };
        mocks.TaskMock.findOneAndUpdate.mockResolvedValue(updatedTask);
        mocks.TaskMock.findOneAndDelete.mockResolvedValue(deletedTask);
        const req = {
            params: { id: validId },
            body: { title: "Updated task" },
            user: { id: validId, role: "user" },
        };
        const updateRes = makeResponse();
        const deleteRes = makeResponse();

        await updateTask(req, updateRes, vi.fn());
        await deleteTask(req, deleteRes, vi.fn());

        expect(mocks.TaskMock.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: validId, userId: validId },
            req.body,
            { new: true, runValidators: true }
        );
        expect(mocks.TaskMock.findOneAndDelete).toHaveBeenCalledWith({
            _id: validId,
            userId: validId,
        });
        expect(updateRes.status).toHaveBeenCalledWith(200);
        expect(deleteRes.status).toHaveBeenCalledWith(200);
    });

    it("returns 404 for invalid IDs and missing tasks during update or delete", async () => {
        mocks.TaskMock.findOneAndUpdate.mockResolvedValue(null);
        mocks.TaskMock.findOneAndDelete.mockResolvedValue(null);
        const next = vi.fn();
        const req = {
            params: { id: "invalid-id" },
            body: {},
            user: { id: validId, role: "user" },
        };

        await updateTask(req, makeResponse(), next);
        await deleteTask(req, makeResponse(), next);
        expectErrorStatus(next, 404);

        req.params.id = validId;
        await updateTask(req, makeResponse(), next);
        await deleteTask(req, makeResponse(), next);
        expect(next).toHaveBeenCalledTimes(4);
        expect(next.mock.calls.every(([error]) => error.statusCode === 404)).toBe(true);
    });
});

describe("category controller", () => {
    it("lists categories and forwards database errors", async () => {
        const categories = [{ _id: validId }];
        mocks.CategoryMock.find.mockResolvedValueOnce(categories);
        const res = makeResponse();

        await getCategories({}, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: categories });

        const databaseError = new Error("database failed");
        mocks.CategoryMock.find.mockRejectedValueOnce(databaseError);
        const next = vi.fn();
        await getCategories({}, makeResponse(), next);
        expect(next).toHaveBeenCalledWith(databaseError);
    });

    it("creates a category", async () => {
        const savedCategory = { _id: validId, name: "Books" };
        mocks.categorySave.mockResolvedValue(savedCategory);
        const res = makeResponse();

        await createCategory({ body: { name: "Books" } }, res, vi.fn());

        expect(mocks.CategoryMock).toHaveBeenCalledWith({ name: "Books" });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: savedCategory });
    });

    it("gets a category by ID and returns 404 for invalid or missing IDs", async () => {
        mocks.CategoryMock.findById
            .mockResolvedValueOnce({ _id: validId })
            .mockResolvedValueOnce(null);
        const res = makeResponse();
        const next = vi.fn();

        await getCategoryById({ params: { id: validId } }, res, next);
        expect(res.status).toHaveBeenCalledWith(200);

        await getCategoryById({ params: { id: "invalid-id" } }, makeResponse(), next);
        expectErrorStatus(next, 404);

        await getCategoryById({ params: { id: validId } }, makeResponse(), next);
        expectErrorStatus(next, 404);
    });

    it("updates a category and returns 404 for invalid or missing IDs", async () => {
        mocks.CategoryMock.findByIdAndUpdate
            .mockResolvedValueOnce({ _id: validId, name: "New name" })
            .mockResolvedValueOnce(null);
        const req = { params: { id: validId }, body: { name: "New name" } };
        const res = makeResponse();
        const next = vi.fn();

        await updateCategory(req, res, next);
        expect(mocks.CategoryMock.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            req.body,
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);

        req.params.id = "invalid-id";
        await updateCategory(req, makeResponse(), next);
        expectErrorStatus(next, 404);

        req.params.id = validId;
        await updateCategory(req, makeResponse(), next);
        expectErrorStatus(next, 404);
    });

    it("returns 409 when tasks use the category and 404 for invalid or missing IDs", async () => {
        mocks.TaskMock.exists.mockResolvedValueOnce(true);
        const next = vi.fn();
        await deleteCategory({ params: { id: validId } }, makeResponse(), next);
        expectErrorStatus(next, 409);
        expect(mocks.CategoryMock.findByIdAndDelete).not.toHaveBeenCalled();

        await deleteCategory({ params: { id: "invalid-id" } }, makeResponse(), next);
        expectErrorStatus(next, 404);

        mocks.TaskMock.exists.mockResolvedValueOnce(false);
        mocks.CategoryMock.findByIdAndDelete.mockResolvedValueOnce(null);
        await deleteCategory({ params: { id: validId } }, makeResponse(), next);
        expectErrorStatus(next, 404);
    });

    it("deletes an unused category", async () => {
        mocks.TaskMock.exists.mockResolvedValue(false);
        mocks.CategoryMock.findByIdAndDelete.mockResolvedValue({ _id: validId });
        const res = makeResponse();

        await deleteCategory({ params: { id: validId } }, res, vi.fn());

        expect(mocks.TaskMock.exists).toHaveBeenCalledWith({ categoryId: validId });
        expect(mocks.CategoryMock.findByIdAndDelete).toHaveBeenCalledWith(validId);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("user controller", () => {
    it("registers a user and returns a token", async () => {
        process.env.JWT_SECRET = "mocked-controller-secret";
        mocks.userSave.mockResolvedValue();
        const res = makeResponse();

        await register({
            body: { username: "Alice", email: "alice@example.com", password: "password123" },
        }, res, vi.fn());

        expect(mocks.UserMock).toHaveBeenCalledWith({
            username: "Alice",
            email: "alice@example.com",
            password: "password123",
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json.mock.calls[0][0].data.token).toEqual(expect.any(String));
    });

    it("rejects invalid registration and maps duplicate users to 409", async () => {
        const next = vi.fn();
        await register({ body: { username: " ", email: "", password: "short" } }, makeResponse(), next);
        expectErrorStatus(next, 400);

        const duplicateError = Object.assign(new Error("duplicate"), { code: 11000 });
        mocks.userSave.mockRejectedValue(duplicateError);
        await register({
            body: { username: "Alice", email: "alice@example.com", password: "password123" },
        }, makeResponse(), next);
        expectErrorStatus(next, 409);
    });

    it("logs in by email and returns a token", async () => {
        process.env.JWT_SECRET = "mocked-controller-secret";
        const user = {
            _id: { toString: () => validId },
            username: "Alice",
            role: "user",
            comparePassword: vi.fn().mockResolvedValue(true),
        };
        const select = vi.fn().mockResolvedValue(user);
        mocks.UserMock.findOne.mockReturnValue({ select });
        const res = makeResponse();

        await login({ body: { email: "alice@example.com", password: "password123" } }, res, vi.fn());

        expect(mocks.UserMock.findOne).toHaveBeenCalledWith({
            $or: [{ email: "alice@example.com" }],
        });
        expect(select).toHaveBeenCalledWith("+password");
        expect(user.comparePassword).toHaveBeenCalledWith("password123");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json.mock.calls[0][0].data.token).toEqual(expect.any(String));
    });

    it("returns 400 for missing credentials and 401 for invalid credentials", async () => {
        const next = vi.fn();
        await login({ body: { password: "password123" } }, makeResponse(), next);
        expectErrorStatus(next, 400);

        const select = vi.fn().mockResolvedValue(null);
        mocks.UserMock.findOne.mockReturnValue({ select });
        await login({ body: { username: "Alice", password: "password123" } }, makeResponse(), next);
        expectErrorStatus(next, 401);

        expect(next.mock.calls.map(([error]) => error.statusCode)).toEqual([400, 401]);
    });
});
