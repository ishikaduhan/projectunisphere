import dotenv from 'dotenv';
// Load environment variables before importing config or app
dotenv.config();

import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP listener
    app.listen(PORT, () => {
      console.log(`[Server] UniSphere API Server listening on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('Failed to start UniSphere API Server:', error);
    process.exit(1);
  }
};

startServer();
