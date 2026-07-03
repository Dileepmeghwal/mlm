// Vercel serverless entry point.
//
// Vercel routes every request (see vercel.json) to this file. We import the
// Express app from the project root; because process.env.VERCEL is set in the
// Vercel runtime, index.ts does NOT start a listener — the exported app is used
// directly as the serverless request handler.
import app from "../index";

export default app;
