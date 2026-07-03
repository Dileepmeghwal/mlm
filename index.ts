import "dotenv/config";
import Express, { Application, Request, Response } from "express";
import useApi from "./src/routes";
import { connectToDatabase } from "./src/config/database.config";

const cors = require("cors");
const app: Application = Express();

//Applying middleware
app.use(Express.json());
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(Express.static("public"));

// Ensure a database connection exists before handling any request. On
// serverless (Vercel) this connects lazily on the first request and reuses the
// cached connection thereafter.
app.use(async (req: Request, res: Response, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection error" });
  }
});

//Adding routes
useApi(app);

// Only run a long-lived HTTP listener when NOT on Vercel (i.e. local dev or a
// traditional server like EC2). On Vercel the exported `app` is used as the
// serverless request handler instead.
if (!process.env.VERCEL) {
  const port = process?.env?.PORT || 8002;
  connectToDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err);
      process.exit(1);
    });
}

export default app;
