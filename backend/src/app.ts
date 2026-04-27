import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import commentRoutes from './routes/comment.routes';
import attachmentRoutes from './routes/attachment.routes';
import activityRoutes from './routes/activity.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL, // set on Render: your Vercel URL
  'http://localhost:3000', // local dev
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (health checkers, curl, etc.)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/health', healthRoutes); // ← no auth, first — for UptimeRobot / Render keep-alive
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', commentRoutes);
app.use('/api', attachmentRoutes);
app.use('/api', activityRoutes);
app.use('/api', dashboardRoutes);

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
