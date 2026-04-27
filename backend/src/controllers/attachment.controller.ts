import { Request, Response } from 'express';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';
import { Attachment } from '../models/attachment.model';
import { Task } from '../models/task.model';
import { ProjectMember } from '../models/project_member.model';

// UPLOAD IMAGE
export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // verify user is project member
    const member = await ProjectMember.findOne({
      project: task.project,
      user: userId,
    });
    if (!member) return res.status(403).json({ message: 'Access denied' });

    // stream buffer to cloudinary
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'taskveer' },
        (error, result) => {
          if (error || !result)
            return reject(error ?? new Error('Upload failed'));
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );
      Readable.from(req.file!.buffer).pipe(stream);
    });

    const attachment = await Attachment.create({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: req.file.originalname,
      task: taskId,
      uploadedBy: userId,
    });

    const populated = await Attachment.findById(attachment._id).populate(
      'uploadedBy',
      'name email'
    );

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET ATTACHMENTS
export const getTaskAttachments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const member = await ProjectMember.findOne({
      project: task.project,
      user: userId,
    });
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const attachments = await Attachment.find({ task: taskId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(attachments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ATTACHMENT
export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const attachment = await Attachment.findById(id);
    if (!attachment) return res.status(404).json({ message: 'Not found' });

    // only the uploader can delete
    if (attachment.uploadedBy?.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this attachment' });
    }

    // delete from cloudinary if publicId stored
    if ((attachment as any).publicId) {
      await cloudinary.uploader.destroy((attachment as any).publicId);
    }

    await attachment.deleteOne();
    res.json({ message: 'Attachment deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
