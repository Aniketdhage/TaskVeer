import mongoose from 'mongoose';

const projectInviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
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

export const ProjectInvite = mongoose.model(
  'ProjectInvite',
  projectInviteSchema
);
