const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
            default: '',
        },
        list: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'List',
            required: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        position: {
            type: Number,
            default: 0,
        },
        priority: {
            type: String,
            enum: {
                values: ['low', 'medium', 'high'],
                message: 'Priority must be low, medium or high',
            },
            default: 'medium',
        },
        dueDate: {
            type: Date,
            default: null,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

taskSchema.index({ list: 1, position: 1 });
taskSchema.index({ project: 1 });

module.exports = mongoose.model('Task', taskSchema);