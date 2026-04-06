import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Connection string (masked):', uri?.replace(/:[^:]*@/, ':PASSWORD@'));

const testConnection = async () => {
  try {
    console.log('\nAttempting to connect...');
    await mongoose.connect(uri!, {
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 5
    });

    console.log('✓ Connection successful!');
    
    // Try a simple query
    console.log('\nTesting query...');
    const db = mongoose.connection.db;
    if (db) {
      await db.admin().command({ ping: 1 });
      console.log('✓ Ping successful!');
    }

    await mongoose.disconnect();
    console.log('✓ Disconnected successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Full error:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
};

testConnection();
