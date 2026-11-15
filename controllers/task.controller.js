import Task from "../models/task.model.js";
import { isValidObjectId } from "mongoose";
import { AppError } from "../middleware/AppError.js";

export const getAlltasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({}).populate('categoryId');
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

        const task = await Task.findById(id).populate('categoryId');
        
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
        const newTask = new Task(req.body);
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

        const updatedTask = await Task.findByIdAndUpdate(
            id,
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

        const deletedTask = await Task.findByIdAndDelete(id);

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