import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../user/user.model';
import { sendResetPasswordEmail } from '../verifyUser/sendMail';
import { IUser } from '../user/user.interface';

export class PasswordResetService {
  /**
   * Generate a secure reset token and save to database
   * Token is valid for 15 minutes
   */
  static async generateResetToken(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check rate limiting (max 3 attempts per hour)
      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal if email exists (security best practice)
        return {
          success: true,
          message: 'If this email exists, a reset link has been sent.'
        };
      }

      // Check if account is locked due to too many attempts
      if (user.passwordResetLockUntil && new Date() < user.passwordResetLockUntil) {
        return {
          success: false,
          message: 'Too many reset attempts. Please try again later.'
        };
      }

      // Reset attempts counter if lock has expired
      if (user.passwordResetLockUntil && new Date() >= user.passwordResetLockUntil) {
        user.passwordResetAttempts = 0;
        user.passwordResetLockUntil = null;
      }

      // Check if user has exceeded max attempts
      if (user.passwordResetAttempts >= 3) {
        user.passwordResetLockUntil = new Date(Date.now() + 60 * 60 * 1000); // Lock for 1 hour
        await user.save();
        return {
          success: false,
          message: 'Too many reset attempts. Please try again later.'
        };
      }

      // Generate reset token using crypto
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Token expires in 15 minutes
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      // Update user with reset token
      user.resetToken = hashedToken;
      user.resetTokenExpiry = resetTokenExpiry;
      user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;

      await user.save();

      // Send email with reset link (token is unhashed for email link)
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      try {
        await sendResetPasswordEmail(email, resetLink, user.first_name);
      } catch (emailError) {
        // Clear the token if email fails so user can retry immediately
        user.resetToken = null as any;
        user.resetTokenExpiry = null as any;
        user.passwordResetAttempts = Math.max(0, (user.passwordResetAttempts || 1) - 1);
        await user.save();
        console.error('Failed to send reset email:', emailError);
        return {
          success: false,
          message: 'Failed to send reset email. Please try again later.'
        };
      }

      return {
        success: true,
        message: 'If this email exists, a reset link has been sent.'
      };
    } catch (error) {
      console.error('Error generating reset token:', error);
      return {
        success: false,
        message: 'An error occurred. Please try again.'
      };
    }
  }

  /**
   * Verify reset token and validate it hasn't expired
   */
  static async verifyResetToken(token: string, email: string): Promise<{ valid: boolean; user?: IUser; message: string }> {
    try {
      // Hash the token to compare with database
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        email,
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: new Date() } // Token should not be expired
      });

      if (!user) {
        return {
          valid: false,
          message: 'Invalid or expired reset token.'
        };
      }

      return {
        valid: true,
        user,
        message: 'Token is valid.'
      };
    } catch (error) {
      console.error('Error verifying reset token:', error);
      return {
        valid: false,
        message: 'An error occurred while verifying token.'
      };
    }
  }

  /**
   * Reset password and invalidate token
   */
  static async resetPassword(
    token: string,
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate password strength
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: passwordValidation.message || 'Password does not meet requirements'
        };
      }

      // Verify token
      const verification = await this.verifyResetToken(token, email);
      if (!verification.valid || !verification.user) {
        return {
          success: false,
          message: verification.message
        };
      }

      const user = verification.user;

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password and clear reset token
      user.password = hashedPassword;
      user.resetToken = null as any;
      user.resetTokenExpiry = null as any;
      user.passwordResetAttempts = 0; // Reset attempts on successful reset
      user.passwordResetLockUntil = null as any;

      await user.save();

      // Optional: Log password change for security audit
      console.log(`Password reset for user: ${email} at ${new Date().toISOString()}`);

      return {
        success: true,
        message: 'Password has been reset successfully. Please login with your new password.'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: 'An error occurred while resetting password.'
      };
    }
  }

  /**
   * Validate password strength
   * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   */
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long.'
      };
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!hasLowercase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!hasNumber) {
      return { valid: false, message: 'Password must contain at least one number.' };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character.' };
    }

    return { valid: true };
  }

  /**
   * Clear expired reset tokens (run periodically via cron job)
   */
  static async clearExpiredTokens(): Promise<void> {
    try {
      const result = await User.updateMany(
        { resetTokenExpiry: { $lt: new Date() } },
        { $set: { resetToken: null, resetTokenExpiry: null } }
      );
      console.log(`Cleared ${result.modifiedCount} expired reset tokens`);
    } catch (error) {
      console.error('Error clearing expired tokens:', error);
    }
  }
}

export default PasswordResetService;
