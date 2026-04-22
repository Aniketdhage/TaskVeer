import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ✅ MULTIPLE ASSIGNEES WITH METADATA
    assignedTo: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 🔥 OPTIONAL: watchers (like Jira)
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    dueDate: Date,
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
