import mongoose from "mongoose";

interface Connection {
  isConnected?: number;
}

const connection: Connection = {};

export const connectToDb = async () => {
  try {
    if (connection.isConnected) {
      console.log("Using existing connection");
      return;
    }
    if (!process.env.MONGO) {
      throw new Error("MONGO environment variable is not defined.");
    }
    console.log("Creating new connection");
    const db = await mongoose.connect(process.env.MONGO);
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
};
