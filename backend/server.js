import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from "cors";
import userRoutes from './routes/userRoutes.js';   // login/signup routes
import checkRoutes from './routes/checkRoutes.js'; // symptom check routes

const app = express();

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith("http://127.0.0.1:550") || origin.startsWith("http://localhost:550")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

connectDB();

app.use('/api/users', userRoutes);    // login/signup API
app.use('/api/checks', checkRoutes);  // symptom check API

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
