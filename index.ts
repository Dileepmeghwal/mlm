import "dotenv/config";
import Express, { Application, Request, Response } from "express";
import useApi from "./src/routes";
import { connectToDatabase } from "./src/config/database.config";

const cors = require("cors");
const app: Application = Express();

//Applying middleware
app.use(Express.json());

// --- CORS lockdown -------------------------------------------------------
// Only allow the configured frontend origin(s). Set ALLOWED_ORIGINS (comma
// separated) in the environment for production; localhost is allowed by
// default for local dev. Requests without an Origin header (curl, mobile,
// server-to-server) are allowed through.
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"]
    .filter(Boolean)
    .join(",")
)
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return cb(null, true);
      return cb(null, allowedOrigins.includes(origin.replace(/\/+$/, "")));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// --- Basic security headers ---------------------------------------------
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  next();
});

// --- NoSQL injection guard ----------------------------------------------
// Strip any keys that look like Mongo operators ($...) or contain dots from
// request payloads, so a client can't smuggle query operators into a filter
// (e.g. { "email": { "$gt": "" } } to bypass auth).
function sanitizeMongo(value: any): void {
  if (!value || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete value[key];
    } else {
      sanitizeMongo(value[key]);
    }
  }
}
app.use((req: Request, _res: Response, next) => {
  sanitizeMongo(req.body);
  sanitizeMongo(req.query);
  sanitizeMongo(req.params);
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
