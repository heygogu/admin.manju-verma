// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Track connection state
let isConnected = false;

async function connectToDatabase() {
  // If already connected, return
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      // Add options that can help with connection stability
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s default
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    // Check if we're connected
    isConnected = !!db.connections[0].readyState;

    if (isConnected) {
      console.log("Database connection established successfully");
    } else {
      throw new Error("Failed to establish database connection");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
}

// Handle Node.js process events to properly manage connection
if (process.env.NODE_ENV !== "production") {
  mongoose.connection.on("connected", () => console.log("MongoDB connected"));
  mongoose.connection.on("error", (err) =>
    console.error("MongoDB connection error:", err)
  );
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
    isConnected = false;
  });

  // If the Node process ends, close the MongoDB connection
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  });
}

export default connectToDatabase;
