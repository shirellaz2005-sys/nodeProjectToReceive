import { Router } from "express";
import{
    getAlltasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/task.controller.js';
import { taskValidationSchema } from "../validation/task.validation.js";
import { validateSchema } from "../middleware/validateJoi.middleware.js";
const router=Router();
router.get('/',getAlltasks)
router.get('/:id',getTaskById)
router.post('/',validateSchema(taskValidationSchema),createTask)
router.put('/:id',validateSchema(taskValidationSchema),updateTask)
router.delete('/:id',deleteTask)
export default router;