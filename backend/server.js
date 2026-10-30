
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import checkRoutes from './routes/checkRoutes.js';

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// API routes
app.use('/api/users', userRoutes);
app.use('/api/checks', checkRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Smart Health Checker Server is running');
});

// Connect database and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

startServer();
