import express from 'express'
import { connectToDB } from './config/db.js'
import taskRoutes from './routes/task.routes.js';
import categoryRoutes from './routes/category.routes.js';


const app=express();
connectToDB();
app.use(express.json());
app.use('/api/tasks',taskRoutes);
app.use('/api/categories',categoryRoutes)
const PORT=process.env.PORT|| 5000;
app.listen(PORT,()=>{
    console.log('server is running on port 5000');
    
})