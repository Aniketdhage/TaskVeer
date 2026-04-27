import mongoose from 'mongoose';

const projectMemberSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  { timestamps: true }
);

export const ProjectMember = mongoose.model(
  'ProjectMember',
  projectMemberSchema
);
