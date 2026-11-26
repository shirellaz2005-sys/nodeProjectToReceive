import "dotenv/config";
import express from 'express'
import taskRoutes from './routes/task.routes.js';
import categoryRoutes from './routes/category.routes.js';
import userRoutes from './routes/user.routes.js';
import { middlewareHandler } from './middleware/error.middleware.js';

const app=express();
app.use(express.json());
app.use('/api/tasks',taskRoutes);
app.use('/api/categories',categoryRoutes)
app.use('/api/users', userRoutes);
app.use(middlewareHandler);

export default app;