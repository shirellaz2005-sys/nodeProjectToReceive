import { isValidObjectId } from "mongoose";
import Category from "../models/category.model.js";

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

