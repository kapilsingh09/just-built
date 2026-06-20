import mongoose from "mongoose";
import { db_name } from "../utils/constants.js";

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Start connection only once (no duplicate connections)
  if (!cached.promise) {
    // Note: useNewUrlParser & useUnifiedTopology are removed in Mongoose 9+
    cached.promise = mongoose
      .connect(`${MONGO_URI}/${db_name}`)
      .then((m) => m)
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        cached.promise = null; // reset so next call can retry
        throw err;
      });
  }

  // Wait for connection to complete
  cached.conn = await cached.promise;

  console.log(`Connected to MongoDB database: ${db_name}`);

  return cached.conn;
}