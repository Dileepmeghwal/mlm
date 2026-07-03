import mongoose, { ConnectOptions } from "mongoose";

// Cache the connection promise across invocations. On serverless platforms
// (Vercel) the module stays warm between requests, so we must reuse a single
// connection instead of opening a new one per request.
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  // Already connected — reuse it.
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Define it in your environment (.env locally, Project Settings on Vercel)."
      );
    }

    const options: ConnectOptions = {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    };

    connectionPromise = mongoose
      .connect(uri, options)
      .then((m) => {
        console.log(
          `Connected to MongoDB database '${mongoose?.connection?.db?.databaseName}'`
        );
        mongoose.set("debug", process.env.NODE_ENV !== "production");
        return m;
      })
      .catch((error) => {
        // Reset so the next request can retry instead of caching a failure.
        connectionPromise = null;
        console.log("Error connecting to MongoDB:", error);
        throw error;
      });
  }

  return connectionPromise;
}

export default connectToDatabase;
