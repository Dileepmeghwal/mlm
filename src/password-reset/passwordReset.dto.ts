export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface TokenVerificationRequest {
  token: string;
  email: string;
}

export interface TokenVerificationResponse {
  valid: boolean;
  email?: string;
  message: string;
}
