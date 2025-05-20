import express from "express";

declare global {
  namespace Express {
    interface User {
      email: string;
      _id: string;
      referredBy: string;
      verified: boolean;
      type: string;
    }

    interface Request {
      user: User;
    }
  }
}
