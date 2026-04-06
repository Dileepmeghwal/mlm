import { Document } from 'mongoose';

export interface IUser extends Document {
  userId: number;
  first_name?: string;
  last_name?: string | null;
  email: string;
  password: string;
  mobile_number?: string | null;
  dob?: Date | null;
  type?: string;
  createdAt?: Date;
  updatedBy?: any;
  updatedAt?: Date;
  isVerified?: boolean;
  referred_by?: any;
  pin?: any;
  wallet?: number;
  isBlock?: boolean;
  pan?: string | null;
  adress1?: string | null;
  adress2?: string | null;
  adhaar?: string | null;
  upi?: string | null;
  bankAC?: string | null;
  ifsc?: string | null;
  bankName?: string | null;
  // Password reset fields
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  passwordResetAttempts?: number;
  passwordResetLockUntil?: Date | null;
  save(): Promise<this>;
}
