import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    meta: Object,
  },
  { timestamps: true }
);

export const Activity = mongoose.model('Activity', activitySchema);
