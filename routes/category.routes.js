import { Router } from 'express';
import { 
    getCategories, 
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller.js';
import { validateSchema } from '../middleware/validateJoi.middleware.js';
import { categoryValidationSchema } from "../validation/category.validation.js";
import { auth, authorize } from "../middleware/auth.middleware.js";
const router = Router();

router.use(auth);
router.get('/', getCategories);       
router.get('/:id', getCategoryById);
router.post('/', authorize("admin"), validateSchema(categoryValidationSchema), createCategory);
router.put('/:id', authorize("admin"), validateSchema(categoryValidationSchema), updateCategory);
router.delete('/:id', authorize("admin"), deleteCategory);

export default router;