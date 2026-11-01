import Task from "../models/task.model.js";
import { isValidObjectId } from "mongoose";

export const getAlltasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({}).populate('categoryId');
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const task = await Task.findById(id).populate('categoryId');
        
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};