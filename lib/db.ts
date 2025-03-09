import mongoose from 'mongoose';

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    console.log('Using existing database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {};
    
    console.log('Creating new database connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Database connected successfully');
        return mongoose.connection as mongoose.Connection;
      })
      .catch((error) => {
        console.error('Database connection error:', error);
        throw error; // Re-throw to allow proper error handling
      });
  } else {
    console.log('Waiting for existing connection promise to resolve...');
  }

  // This will block execution until the connection is established
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;