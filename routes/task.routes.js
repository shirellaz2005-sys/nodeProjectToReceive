import { Router } from "express";
import{
    getAlltasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/task.controller.js';
import taskSchema from '../models/task.model.js'
import { validateSchema } from "../middleware/validateJoi.middleware.js";
const router=Router();
router.get('/',getAlltasks)
router.get('/:id',getTaskById)
router.post('/',validateSchema(taskSchema),createTask)
router.put('/:id',validateSchema(taskSchema),updateTask)
router.delete('/:id',deleteTask)
export default router;