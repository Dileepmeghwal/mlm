import { Request, Response } from 'express';
import PasswordResetService from './passwordReset.service';
import {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TokenVerificationRequest
} from './passwordReset.dto';

export class PasswordResetController {
  /**
   * POST /api/password-reset/forgot-password
   * Request user's email to send reset link
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as ForgotPasswordRequest;

      // Validate input
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required.'
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
        return;
      }

      // Generate and send reset token
      const result = await PasswordResetService.generateResetToken(email);

      // Always return success message (don't leak if email exists)
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred.'
      });
    }
  }

  /**
   * POST /api/password-reset/verify-token
   * Verify if reset token is valid before showing reset form
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, email } = req.body as TokenVerificationRequest;

      if (!token || !email) {
        res.status(400).json({
          success: false,
          message: 'Token and email are required.'
        });
        return;
      }

      const verification = await PasswordResetService.verifyResetToken(token, email);

      if (!verification.valid || !verification.user) {
        res.status(400).json({
          success: false,
          message: verification.message
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid.',
        data: {
          email: verification.user.email,
          firstName: verification.user.first_name
        }
      });
    } catch (error) {
      console.error('Error in verifyToken:', error);
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred.'
      });
    }
  }

  /**
   * POST /api/password-reset/reset-password
   * Reset password with valid token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, email, newPassword, confirmPassword } = req.body as ResetPasswordRequest;

      // Validate input
      if (!token || !email || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'All fields are required.'
        });
        return;
      }

      // Check passwords match
      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Passwords do not match.'
        });
        return;
      }

      // Reset password
      const result = await PasswordResetService.resetPassword(token, email, newPassword);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred.'
      });
    }
  }

  /**
   * GET /api/password-reset/check-token?token=xxx&email=yyy
   * Check if token is still valid (useful for frontend to show form)
   */
  static async checkToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, email } = req.query;

      if (!token || !email) {
        res.status(400).json({
          success: false,
          message: 'Token and email are required.'
        });
        return;
      }

      const verification = await PasswordResetService.verifyResetToken(
        token as string,
        email as string
      );

      res.status(200).json({
        valid: verification.valid,
        message: verification.message
      });
    } catch (error) {
      console.error('Error in checkToken:', error);
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred.'
      });
    }
  }
}

export default PasswordResetController;
