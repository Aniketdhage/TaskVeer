import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    fileName: String,

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Attachment = mongoose.model('Attachment', attachmentSchema);
