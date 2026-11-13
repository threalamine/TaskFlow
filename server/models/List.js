const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'List title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
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
    },
    { timestamps: true }
);

listSchema.index({ project: 1, position: 1 });

module.exports = mongoose.model('List', listSchema);