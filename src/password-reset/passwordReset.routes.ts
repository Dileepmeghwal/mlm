import { Router } from 'express';
import PasswordResetController from './passwordReset.controller';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = Router();

/**
 * Password Reset Routes
 * These routes handle forgot password and reset password flows
 */

/**
 * POST /api/password-reset/forgot-password
 * Request password reset email
 * Rate limited to 5 requests per 15 minutes per IP
 */
router.post(
  '/forgot-password',
  rateLimitMiddleware('forgot-password', 5, 15 * 60),
  PasswordResetController.forgotPassword
);

/**
 * POST /api/password-reset/verify-token
 * Verify reset token before showing password form
 * Rate limited to 10 requests per 15 minutes per IP
 */
router.post(
  '/verify-token',
  rateLimitMiddleware('verify-token', 10, 15 * 60),
  PasswordResetController.verifyToken
);

/**
 * POST /api/password-reset/reset-password
 * Reset password with valid token
 * Rate limited to 5 attempts per 15 minutes per IP
 */
router.post(
  '/reset-password',
  rateLimitMiddleware('reset-password', 5, 15 * 60),
  PasswordResetController.resetPassword
);

/**
 * GET /api/password-reset/check-token
 * Check if reset token is still valid (query params: token, email)
 * Rate limited to 10 requests per 15 minutes per IP
 */
router.get(
  '/check-token',
  rateLimitMiddleware('check-token', 10, 15 * 60),
  PasswordResetController.checkToken
);

export default router;
