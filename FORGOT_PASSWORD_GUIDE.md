# Password Reset Implementation Guide

## Overview
This guide covers the complete implementation of a secure "Forgot Password / Reset Password" flow for your Node.js backend with MongoDB.

---

## Backend API Endpoints

### 1. **Forgot Password Endpoint**
**POST** `/api/password-reset/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "If this email exists, a reset link has been sent."
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "message": "Too many reset attempts. Please try again later."
}
```

**Security Features:**
- ✅ Rate limited (5 attempts per 15 minutes)
- ✅ Doesn't reveal if email exists
- ✅ Generates cryptographically secure token
- ✅ Token valid for 15 minutes only
- ✅ Hashed token stored in database

---

### 2. **Verify Token Endpoint**
**POST** `/api/password-reset/verify-token`

**Request:**
```json
{
  "token": "abc123def456...",
  "email": "user@example.com"
}
```

**Response (Valid):**
```json
{
  "success": true,
  "message": "Token is valid.",
  "data": {
    "email": "user@example.com",
    "firstName": "John"
  }
}
```

**Response (Invalid/Expired):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token."
}
```

---

### 3. **Reset Password Endpoint**
**POST** `/api/password-reset/reset-password`

**Request:**
```json
{
  "token": "abc123def456...",
  "email": "user@example.com",
  "newPassword": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please login with your new password."
}
```

**Response (Weak Password):**
```json
{
  "success": false,
  "message": "Password must contain at least one uppercase letter."
}
```

---

### 4. **Check Token Status (GET)**
**GET** `/api/password-reset/check-token?token=xxx&email=yyy`

**Response:**
```json
{
  "valid": true,
  "message": "Token is valid."
}
```

---

## Password Requirements

Your backend validates passwords to ensure security:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*...)

**Example Valid Passwords:**
- `MyPassword123!`
- `SecurePass@456`
- `NewPass#2024`

---

## Frontend Implementation

### **React Example - Forgot Password Page**

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/password-reset/forgot-password',
        { email }
      );

      setMessage(response.data.message);
      setEmail('');
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Forgot Password</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email Address:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="info">
        We'll send you an email with instructions to reset your password.
        The reset link will expire in 15 minutes.
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
```

---

### **React Example - Reset Password Page**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // Verify token before showing form
    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/password-reset/check-token`,
          { params: { token, email } }
        );

        if (response.data.valid) {
          setIsValidToken(true);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Invalid or expired reset link. Please try again.');
      } finally {
        setValidating(false);
      }
    };

    if (token && email) {
      verifyToken();
    } else {
      setError('Invalid reset link');
      setValidating(false);
    }
  }, [token, email]);

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('Password must contain uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('Password must contain lowercase letter');
    if (!/\d/.test(pwd)) errors.push('Password must contain a number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('Password must contain a special character');
    }
    return errors;
  };

  const passwordErrors = password ? validatePassword(password) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordErrors.length > 0) {
      setError('Please fix password requirements');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/password-reset/reset-password',
        {
          token,
          email,
          newPassword: password,
          confirmPassword
        }
      );

      setMessage(response.data.message);
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return <div className="container"><p>Validating reset link...</p></div>;
  }

  if (!isValidToken) {
    return (
      <div className="container">
        <h2>Reset Password</h2>
        <div className="error-message">{error}</div>
        <p><a href="/forgot-password">Request another reset link</a></p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Reset Your Password</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter new password"
          />
          
          {/* Password requirements checklist */}
          <div className="requirements">
            <p>Password must contain:</p>
            <ul>
              <li className={password.length >= 8 ? 'valid' : 'invalid'}>
                ✓ At least 8 characters
              </li>
              <li className={/[A-Z]/.test(password) ? 'valid' : 'invalid'}>
                ✓ At least one uppercase letter (A-Z)
              </li>
              <li className={/[a-z]/.test(password) ? 'valid' : 'invalid'}>
                ✓ At least one lowercase letter (a-z)
              </li>
              <li className={/\d/.test(password) ? 'valid' : 'invalid'}>
                ✓ At least one number (0-9)
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : 'invalid'}>
                ✓ At least one special character
              </li>
            </ul>
          </div>
        </div>

        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Confirm new password"
          />
          {password && confirmPassword && password !== confirmPassword && (
            <p className="error-text">Passwords do not match</p>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button 
          type="submit" 
          disabled={loading || passwordErrors.length > 0}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
```

---

## Database Schema Updates

The following fields have been added to your User model:

```typescript
resetToken: {
  type: String,
  default: null,  // Stores hashed token
}

resetTokenExpiry: {
  type: Date,
  default: null,  // When token expires
}

passwordResetAttempts: {
  type: Number,
  default: 0,  // Tracks failed attempts
}

passwordResetLockUntil: {
  type: Date,
  default: null,  // Account locked until this time
}
```

---

## Security Best Practices Implemented

### ✅ **1. Token Security**
- Tokens are generated using cryptographically secure random bytes
- Only hashed tokens are stored in the database
- Unhashed token is sent in email (only visible to user)
- Tokens expire after 15 minutes

### ✅ **2. Rate Limiting**
- Maximum 5 forgot password attempts per 15 minutes per IP
- Account locks after 3 failed reset attempts
- Lock duration: 1 hour

### ✅ **3. Password Security**
- Passwords are hashed using bcrypt (10 salt rounds)
- Strong password validation (8+ chars, uppercase, lowercase, number, special char)
- Passwords never logged or exposed in responses

### ✅ **4. Privacy Protection**
- Forgot password endpoint doesn't reveal if email exists
- Invalid token error is generic (doesn't say "user not found")
- Error messages are consistent

### ✅ **5. Database Security**
- Tokens are hashed before storage
- Reset tokens automatically cleared after expiry
- Old tokens cleaned up periodically

### ✅ **6. Email Security**
- Reset links include email parameter (users must use correct email)
- Email contains security warnings
- Expiry time clearly displayed

---

## Testing the Implementation

### **Using Postman/Thunder Client**

#### Test 1: Request Password Reset
```
POST http://localhost:5000/password-reset/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Test 2: Verify Token
```
POST http://localhost:5000/password-reset/verify-token
Content-Type: application/json

{
  "token": "abc123def456...",
  "email": "user@example.com"
}
```

#### Test 3: Reset Password
```
POST http://localhost:5000/password-reset/reset-password
Content-Type: application/json

{
  "token": "abc123def456...",
  "email": "user@example.com",
  "newPassword": "NewSecure123!",
  "confirmPassword": "NewSecure123!"
}
```

---

### **Manual Testing Checklist**

- [ ] Forgot password with valid email sends email
- [ ] Rate limiting kicks in after 5 attempts
- [ ] Attempt with non-existent email returns generic message
- [ ] Token expires after 15 minutes
- [ ] Weak password is rejected with correct message
- [ ] Passwords must match
- [ ] Reset with invalid token is rejected
- [ ] After reset, old token can't be used again
- [ ] User can login with new password immediately after reset

---

## Logging & Monitoring

The system logs:
- Password reset requests
- Successful resets (user email, timestamp)
- Rate limit violations
- Token verification failures

Example log format:
```
[2024-01-15 10:30:45] Password reset for user: john@example.com
[2024-01-15 10:31:00] Rate limit: forgot-password attempt from IP 192.168.1.1
```

---

## Troubleshooting

### Issue: Email not sending
**Solution:**
- Check SMTP credentials in `.env`
- Verify SMTP settings (host, port, authentication)
- Check email logs: `console.error` output in terminal
- Test with `sendmail()` function directly

### Issue: Token always invalid
**Solution:**
- Make sure token wasn't modified
- Check token expiry: 15 minutes from generation
- Verify email matches the one in reset request
- Check if token was already used

### Issue: Password reset works but user can't login
**Solution:**
- Verify password was actually changed in database
- Check password hashing is working (bcrypt)
- Ensure user email is correct

### Issue: Rate limiting blocking legitimate users
**Solution:**
- Increase rate limit in `.env` (adjust `RATE_LIMIT_MAX_REQUESTS`)
- Check if multiple users are behind same IP (proxy scenario)
- Use Redis for distributed rate limiting in production

---

## Production Checklist

Before deploying to production:

- [ ] Remove test token logging
- [ ] Move credentials to environment variables
- [ ] Enable HTTPS only
- [ ] Use Redis for rate limiting (not in-memory)
- [ ] Set up email service with production account
- [ ] Update FRONTEND_URL to production domain
- [ ] Enable CORS for frontend domain only
- [ ] Set up monitoring and error tracking
- [ ] Test email delivery thoroughly
- [ ] Set up automated token cleanup (cron job)
- [ ] Enable request logging and audit trails
- [ ] Test with real email client
- [ ] Set up password reset email in team's design system
- [ ] Configure password requirements in frontend

---

## Next Steps

1. **Install Dependencies:**
   ```bash
   npm install bcrypt nodemailer axios
   npm install --save-dev @types/bcrypt
   ```

2. **Update `.env` with real values**

3. **Test locally with Postman**

4. **Integrate React components into your frontend**

5. **Deploy and monitor**

---

## Support

For questions or issues:
- Check the backend logs for errors
- Verify database connection
- Ensure SMTP credentials are correct
- Review rate limit headers in responses

