import { Schema, model } from "mongoose";

const taskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'], 
        trim: true
    },
    description: {
        type: String,
        default: "", 
        trim: true
    },
    isCompleted: {
        type: Boolean,
        default: false 
    },
    dueDate: {
        type: Date,
        default: null 
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category', 
        required: false
    }
}, {
    timestamps: true 
});

const Task = model('Task', taskSchema);
export default Task;