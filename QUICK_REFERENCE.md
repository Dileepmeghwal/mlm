# Password Reset - Quick Reference Guide

## 🚀 For Frontend Developers

### Step 1: Show "Forgot Password" Link
```jsx
<a href="/forgot-password">Forgot your password?</a>
```

### Step 2: Build Forgot Password Form
```jsx
const email = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await fetch("/password-reset/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (data.success) alert("Check your email for reset link!");
};

return (
  <form onSubmit={handleSubmit}>
    <input 
      type="email" 
      value={email} 
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <button type="submit">Send Reset Link</button>
  </form>
);
```

### Step 3: Handle Reset Link (User gets email)
User clicks link in email:
```
https://yourapp.com/reset-password?token=xxx&email=user@example.com
```

### Step 4: Build Reset Password Form
```jsx
import { useSearchParams } from 'react-router-dom';

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [searchParams] = useSearchParams();

const token = searchParams.get("token");
const email = searchParams.get("email");

const handleReset = async (e) => {
  e.preventDefault();
  
  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  const res = await fetch("/password-reset/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      email,
      newPassword: password,
      confirmPassword
    })
  });

  const data = await res.json();
  if (data.success) {
    alert("Password reset! Login with your new password.");
    window.location.href = "/login";
  } else {
    alert("Error: " + data.message);
  }
};

return (
  <form onSubmit={handleReset}>
    <input 
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="New password"
      required
    />
    <input 
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="Confirm password"
      required
    />
    <button>Reset Password</button>
  </form>
);
```

### Password Requirements (Show to User)
```
✓ At least 8 characters
✓ One uppercase letter (A-Z)
✓ One lowercase letter (a-z)
✓ One number (0-9)
✓ One special character (!@#$%^&*)
```

---

## 🧑‍💻 For Backend Developers

### Using the Service Directly
```typescript
import PasswordResetService from './password-reset/passwordReset.service';

// Generate reset token
const result = await PasswordResetService.generateResetToken('user@example.com');

// Verify token
const verification = await PasswordResetService.verifyResetToken(token, email);
if (verification.valid) {
  console.log("Token is valid!");
}

// Reset password
const resetResult = await PasswordResetService.resetPassword(token, email, newPassword);

// Validate password strength
const validation = PasswordResetService.validatePassword('MyPass123!');
if (!validation.valid) {
  console.log(validation.message);
}
```

### Database Queries
```typescript
import User from './user/user.model';

// Find user with valid reset token
const user = await User.findOne({
  email,
  resetToken: hashedToken,
  resetTokenExpiry: { $gt: new Date() }
});

// Clear expired tokens (run as cron job)
await PasswordResetService.clearExpiredTokens();

// Check reset attempts
const user = await User.findOne({ email });
console.log(user.passwordResetAttempts);
console.log(user.passwordResetLockUntil);
```

### Error Handling
```typescript
try {
  const result = await PasswordResetService.resetPassword(token, email, password);
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
} catch (error) {
  console.error('Reset failed:', error);
  return res.status(500).json({ message: 'An error occurred' });
}
```

---

## 🧪 Testing API Endpoints

### Using cURL

#### Test 1: Request Reset
```bash
curl -X POST http://localhost:5000/password-reset/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### Test 2: Verify Token
```bash
curl -X POST http://localhost:5000/password-reset/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token":"abc123def456",
    "email":"test@example.com"
  }'
```

#### Test 3: Reset Password
```bash
curl -X POST http://localhost:5000/password-reset/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"abc123def456",
    "email":"test@example.com",
    "newPassword":"NewPass123!",
    "confirmPassword":"NewPass123!"
  }'
```

#### Test 4: Check Token (GET)
```bash
curl "http://localhost:5000/password-reset/check-token?token=abc123&email=test@example.com"
```

---

## 📧 Email Template Customization

The email sent looks like this (in `src/verifyUser/sendMail.ts`):

```html
<h2>Password Reset Request</h2>
<p>Hi John,</p>
<p>We received a request to reset your password.</p>
<a href="https://app.com/reset?token=...">Reset Password</a>
<p>This link expires in 15 minutes.</p>
```

### To Customize:
1. Edit `src/verifyUser/sendMail.ts`
2. Modify the `html` property in `mailOptions`
3. Update logo, colors, company name, etc.

---

## 🔍 Common Issues & Solutions

### Issue: Email not sending
```typescript
// Check credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Test email
transporter.verify((error, success) => {
  if (error) console.log("Email config error:", error);
  if (success) console.log("Email ready to send");
});
```

### Issue: Token always invalid
```typescript
// Make sure you're comparing hashed versions
const crypto = require('crypto');
const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
// Then compare with DB value
```

### Issue: Rate limiting too strict
```typescript
// In rateLimiter.ts, adjust these values:
rateLimitMiddleware('forgot-password', 
  10,      // <- Max requests (change this)
  60 * 60  // <- Time window in seconds (change this)
)
```

---

## 🔐 Security Checklist

Before each deploy, verify:

- [ ] `.env` file NOT committed to git
- [ ] Database credentials in `.env`, not hardcoded
- [ ] Email password in `.env`, not hardcoded
- [ ] HTTPS enabled in production
- [ ] CORS configured for your domain
- [ ] Rate limiting is working
- [ ] Tokens expire after 15 minutes
- [ ] Old passwords are hashed
- [ ] Error messages don't leak info

---

## 📊 Rate Limiting Rules

**Forgot Password:**
- Max 5 requests per 15 minutes (per IP)
- After 3 failed resets: locked 1 hour

**Reset Password:**
- Max 5 attempts per 15 minutes (per IP)

### Check Rate Limit Headers
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1672531200
```

---

## 🚨 Production vs Development

### Development
```
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
SMTP_HOST=smtp.mailtrap.io  // Use Mailtrap for testing
```

### Production
```
FRONTEND_URL=https://yourapp.com
NODE_ENV=production
SMTP_HOST=smtp.sendgrid.net  // Use real email service
HTTPS=true
```

---

## 📋 Code Snippets

### Add to Login (Check if account is locked)
```typescript
const user = await User.findOne({ email });

if (user.passwordResetLockUntil && new Date() < user.passwordResetLockUntil) {
  return res.status(429).json({
    message: "Account is temporarily locked. Try password reset instead."
  });
}
```

### Add to Signup (Initialize fields)
```typescript
const newUser = new User({
  email,
  password: hashedPassword,
  resetToken: null,
  resetTokenExpiry: null,
  passwordResetAttempts: 0
});
```

### Scheduled Token Cleanup (Run every day)
```typescript
// In your cron job file
import PasswordResetService from './password-reset/passwordReset.service';

schedule.scheduleJob('0 0 * * *', async () => {
  await PasswordResetService.clearExpiredTokens();
  console.log('Cleared expired tokens');
});
```

---

## 🎯 What Each File Does

| File | Does What |
|------|-----------|
| `passwordReset.service.ts` | Core logic (tokens, validation, reset) |
| `passwordReset.controller.ts` | HTTP endpoints (receive requests, send responses) |
| `passwordReset.routes.ts` | URL routes (/forgot-password, /reset-password) |
| `rateLimiter.ts` | Prevents too many requests from one IP |
| `sendMail.ts` | Sends email to user with reset link |

---

## 💡 Pro Tips

### 1. Test Email Locally
Use Mailtrap (fake SMTP server):
```
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465
SMTP_USER=xxxxx@gmail.com
SMTP_PASSWORD=xxxxxx
```

### 2. Debug Token Issues
Log the token generation:
```typescript
console.log('Generated token:', resetToken);
console.log('Hashed token:', hashedToken);
console.log('Stored in DB:', user.resetToken);
```

### 3. Monitor Rate Limits
```typescript
// Log when user hits rate limit
if (limitData.count > maxRequests) {
  console.warn(`Rate limited: ${clientIp} for ${key}`);
}
```

### 4. User Feedback
Always show user-friendly messages:
```
✅ "Check your email for a reset link"
✅ "Password has been reset. Please login."
❌ "If this email exists, we sent a reset link"
```

---

## 📞 Quick Contact Points

**Email Setup Issues?**
Check `INSTALLATION.md` → Email Configuration

**Security Concerns?**
Read `SECURITY_NOTES.md` → Urgent Actions

**API Documentation?**
See `FORGOT_PASSWORD_GUIDE.md` → API Endpoints

**Frontend Examples?**
Find React components in `FORGOT_PASSWORD_GUIDE.md` → Frontend Implementation

---

Done! 🎉 You now have everything needed to implement password reset.

