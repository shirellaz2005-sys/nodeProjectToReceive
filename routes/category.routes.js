import { Router } from 'express';
import { 
    getCategories, 
    createCategory 
} from '../controllers/category.controller.js';
import { validateSchema } from '../middleware/validateJoi.middleware.js';
import categorySchema from '../models/category.model.js'
const router = Router();

router.get('/', getCategories);       
router.post('/', validateSchema(categorySchema),createCategory);     

export default router;