import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/user.routes';

const app = express();

app.use(cors());
app.use(express.json());

// use route
app.use('/api/users', userRoutes);

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
