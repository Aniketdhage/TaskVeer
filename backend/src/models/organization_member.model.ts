import mongoose from 'mongoose';

const organizationMemberSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
  },
  { timestamps: true }
);

export const OrganizationMember = mongoose.model(
  'OrganizationMember',
  organizationMemberSchema
);
