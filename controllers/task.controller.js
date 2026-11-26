import Task from "../models/task.model.js";
import { isValidObjectId } from "mongoose";
import { AppError } from "../middleware/AppError.js";

const getTaskScope = (user) => user.role === "admin" ? {} : { userId: user.id };

export const getAlltasks = async (req, res, next) => {
    try {
        const tasks = await Task.find(getTaskScope(req.user)).populate('categoryId');
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
       next(error)
    }
};

export const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
           return next(new AppError('Task not found',404));
        }

        const task = await Task.findOne({
            _id: id,
            ...getTaskScope(req.user),
        }).populate('categoryId');
        
        if (!task) {
          return next(new AppError('Task not found',404));
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
       next(error);
    }
};

export const createTask = async (req, res, next) => {
    try {
        const newTask = new Task({
            ...req.body,
            userId: req.user.id,
        });
        const savedTask = await newTask.save();
        
        res.status(201).json({
            success: true,
            data: savedTask
        });
    } catch (error) {
      next(error)
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
           return next(new AppError('task not found',404));
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, ...getTaskScope(req.user) },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
          return next(new AppError('Task not found', 404)); 
        }

        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        next(error)
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
         return next(new AppError('Task not found', 404));
        }

        const deletedTask = await Task.findOneAndDelete({
            _id: id,
            ...getTaskScope(req.user),
        });

        if (!deletedTask) {
          return next(new AppError('Task not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
       next(error);
    }
};