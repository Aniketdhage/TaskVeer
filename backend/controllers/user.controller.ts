import { Request, Response } from 'express';
import { User } from '../models/user.modal';

// ✅ GET all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET single user
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CREATE user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.create({ name, email, role });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ UPDATE user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ DELETE user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
