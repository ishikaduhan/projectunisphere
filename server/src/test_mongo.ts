import mongoose from 'mongoose';

const testMongo = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/unisphere');
    console.log('Connected successfully!');
    await mongoose.disconnect();
    console.log('Disconnected successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect:', err);
    process.exit(1);
  }
};

testMongo();
