import mongoose from "mongoose";
import dns from "dns";
import "@/models";

interface Connection {
  isConnected?: number;
}

const connection: Connection = {};
let connectionPromise: Promise<typeof mongoose> | null = null;

const isSrvMongoUri = (uri: string) => uri.startsWith("mongodb+srv://");

const connectWithDnsFallback = async (mongoUri: string) => {
  try {
    return await mongoose.connect(mongoUri);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (
      process.env.NODE_ENV === "development" &&
      isSrvMongoUri(mongoUri) &&
      message.includes("querySrv ECONNREFUSED")
    ) {
      console.warn(
        "Mongo SRV lookup failed with the local DNS resolver. Retrying with public DNS servers.",
      );
      dns.setServers(["1.1.1.1", "8.8.8.8"]);
      return await mongoose.connect(mongoUri);
    }

    throw error;
  }
};

export const connectToDb = async () => {
  try {
    if (connection.isConnected) {
      console.log("Using existing connection");
      return;
    }
    if (connectionPromise) {
      await connectionPromise;
      return;
    }
    if (!process.env.MONGO) {
      throw new Error("MONGO environment variable is not defined.");
    }
    console.log("Creating new connection");
    connectionPromise = connectWithDnsFallback(process.env.MONGO);
    const db = await connectionPromise;
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    connectionPromise = null;
    console.error("Failed to connect to MongoDB:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
};
