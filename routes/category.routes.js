import { Router } from 'express';
import { 
    getCategories, 
    createCategory 
} from '../controllers/category.controller.js';
import { validateSchema } from '../middleware/validateJoi.middleware.js';
import { categoryValidationSchema } from "../validation/category.validation.js";
const router = Router();

router.get('/', getCategories);       
router.post('/', validateSchema(categoryValidationSchema),createCategory);     

export default router;