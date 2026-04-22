import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res
        .status(500)
        .json({ error: 'Database connection not established' });
    }
    const data = await mongoose.connection.db
      .collection('orders')
      .find()
      .toArray();
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

export default app;
