import { isValidObjectId } from "mongoose";
import Category from "../models/category.model.js";
import { AppError } from "../middleware/AppError.js";
import Task from "../models/task.model.js";

export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error); 
    }
};

export const createCategory = async (req, res, next) => {
    try {
        const newCategory = new Category(req.body);
        const savedCategory = await newCategory.save();
    
        res.status(201).json({
            success: true,
            data: savedCategory
        });
    } catch (error) {
        next(error); 
    }
};

export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return next(new AppError("Category not found", 404));
        }

        const category = await Category.findById(id);
        if (!category) {
            return next(new AppError("Category not found", 404));
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return next(new AppError("Category not found", 404));
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return next(new AppError("Category not found", 404));
        }

        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return next(new AppError("Category not found", 404));
        }

        const hasTasks = await Task.exists({ categoryId: id });
        if (hasTasks) {
            return next(new AppError("Cannot delete category with existing tasks", 409));
        }

        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return next(new AppError("Category not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};