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
 */
router.post(
  '/verify-token',
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
 */
router.get(
  '/check-token',
  PasswordResetController.checkToken
);

export default router;
