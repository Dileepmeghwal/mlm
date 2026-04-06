/**
 * Password Reset Service Tests
 *
 * Run tests with: npm test
 *
 * Install testing dependencies first:
 * npm install --save-dev jest @types/jest ts-jest
 */

import PasswordResetService from '../passwordReset.service';
import User from '../../user/user.model';
import crypto from 'crypto';

// Mock the User model
jest.mock('../../user/user.model');
jest.mock('../../verifyUser/sendMail');

describe('PasswordResetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validatePassword', () => {
    test('should accept valid password', () => {
      const result = PasswordResetService.validatePassword('ValidPass123!');
      expect(result.valid).toBe(true);
    });

    test('should reject password with less than 8 characters', () => {
      const result = PasswordResetService.validatePassword('Pass1!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('8 characters');
    });

    test('should reject password without uppercase letter', () => {
      const result = PasswordResetService.validatePassword('validpass123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    test('should reject password without lowercase letter', () => {
      const result = PasswordResetService.validatePassword('VALIDPASS123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    test('should reject password without number', () => {
      const result = PasswordResetService.validatePassword('ValidPass!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });

    test('should reject password without special character', () => {
      const result = PasswordResetService.validatePassword('ValidPass123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('special character');
    });
  });

  describe('generateResetToken', () => {
    test('should generate token for valid user', async () => {
      const mockUser = {
        email: 'test@example.com',
        first_name: 'Test',
        passwordResetAttempts: 0,
        passwordResetLockUntil: null,
        resetToken: null,
        resetTokenExpiry: null,
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordResetService.generateResetToken('test@example.com');

      expect(result.success).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should not reveal if email does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await PasswordResetService.generateResetToken('nonexistent@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toContain('If this email exists');
    });

    test('should reject after max attempts', async () => {
      const mockUser = {
        email: 'test@example.com',
        first_name: 'Test',
        passwordResetAttempts: 3,
        passwordResetLockUntil: new Date(Date.now() + 3600000),
        save: jest.fn()
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordResetService.generateResetToken('test@example.com');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Too many');
    });

    test('should increment attempt counter', async () => {
      const mockUser = {
        email: 'test@example.com',
        first_name: 'Test',
        passwordResetAttempts: 1,
        passwordResetLockUntil: null,
        resetToken: null,
        resetTokenExpiry: null,
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await PasswordResetService.generateResetToken('test@example.com');

      expect(mockUser.passwordResetAttempts).toBe(2);
    });
  });

  describe('verifyResetToken', () => {
    test('should verify valid token', async () => {
      const testToken = 'test-token-123';
      const hashedToken = crypto
        .createHash('sha256')
        .update(testToken)
        .digest('hex');

      const mockUser = {
        email: 'test@example.com',
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 60000) // 1 minute from now
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordResetService.verifyResetToken(
        testToken,
        'test@example.com'
      );

      expect(result.valid).toBe(true);
      expect(result.user).toBeDefined();
    });

    test('should reject expired token', async () => {
      const testToken = 'test-token-123';
      const hashedToken = crypto
        .createHash('sha256')
        .update(testToken)
        .digest('hex');

      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await PasswordResetService.verifyResetToken(
        testToken,
        'test@example.com'
      );

      expect(result.valid).toBe(false);
    });

    test('should reject invalid token', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await PasswordResetService.verifyResetToken(
        'wrong-token',
        'test@example.com'
      );

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid');
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully', async () => {
      const testToken = 'test-token-123';
      const hashedToken = crypto
        .createHash('sha256')
        .update(testToken)
        .digest('hex');

      const mockUser = {
        email: 'test@example.com',
        password: 'old-hashed-password',
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 60000),
        passwordResetAttempts: 2,
        passwordResetLockUntil: null,
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordResetService.resetPassword(
        testToken,
        'test@example.com',
        'NewSecure123!'
      );

      expect(result.success).toBe(true);
      expect(mockUser.resetToken).toBeNull();
      expect(mockUser.resetTokenExpiry).toBeNull();
      expect(mockUser.passwordResetAttempts).toBe(0);
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should reject weak password', async () => {
      const result = await PasswordResetService.resetPassword(
        'token',
        'test@example.com',
        'weak'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Password');
    });

    test('should reject invalid token', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await PasswordResetService.resetPassword(
        'invalid-token',
        'test@example.com',
        'NewSecure123!'
      );

      expect(result.success).toBe(false);
    });
  });
});

/**
 * Jest Configuration (jest.config.js)
 *
 * Add this to your project root:
 *
 * module.exports = {
 *   preset: 'ts-jest',
 *   testEnvironment: 'node',
 *   roots: ['<rootDir>/src'],
 *   testMatch: ['**/__tests__/**/*.test.ts'],
 *   moduleFileExtensions: ['ts', 'js'],
 * };
 */
