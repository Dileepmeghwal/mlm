# 🔒 Critical Security Notes

## ⚠️ CRITICAL ISSUES FOUND IN CURRENT CODE

### 1. **EXPOSED CREDENTIALS IN CODEBASE** 🚨

**Location:** `src/config/database.config.ts` (lines 4-5)

**Issue:**
```typescript
// ❌ EXPOSED - Database credentials hardcoded
const uri='mongodb+srv://admin:mlm%231%40dtfindia%24%23000%23%24@cluster0.rilg88z.mongodb.net/mlm'
```

**Fix:**
```typescript
// ✅ CORRECT - Use environment variables
const uri = process.env.MONGODB_URI || 'fallback_uri_if_needed';
```

**Action Required:**
1. Move `MONGODB_URI` to `.env` file
2. **IMMEDIATELY rotate your MongoDB password** (your current password is exposed in git)
3. Add `.env` to `.gitignore`
4. Run: `git rm --cached src/config/database.config.ts` (remove from git history)

---

### 2. **HARDCODED EMAIL CREDENTIALS** 🚨

**Location:** `src/verifyUser/sendMail.ts` (lines 14-15)

**Issue:**
```typescript
// ❌ EXPOSED - Email credentials hardcoded
auth: {
  user: "support@dtfindia.org",
  pass: "1@Dtfindia#harish",
}
```

**Fix:**
```typescript
// ✅ CORRECT - Use environment variables
auth: {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASSWORD,
}
```

**Action Required:**
1. Move credentials to `.env`
2. **IMMEDIATELY change your email password**
3. Remove from git history
4. Consider rotating email account

---

## 🔐 Security Best Practices for Password Reset

### Token Security ✅
- **Generation:** Using `crypto.randomBytes(32)` - GOOD
- **Storage:** Tokens are hashed before saving - GOOD
- **Expiry:** 15 minutes - GOOD
- **One-time use:** Token is invalidated after reset - GOOD

### Password Security ✅
- **Hashing:** Using bcrypt with 10 salt rounds - GOOD
- **Validation:** Strong password requirements enforced - GOOD
- **Never logged:** Passwords never appear in logs - GOOD

### Rate Limiting ✅
- **Forgot Password:** 5 attempts per 15 minutes
- **Account Lock:** After 3 failed attempts, 1 hour lockout
- **IP-based:** Different limits per IP address

### Privacy Protection ✅
- **Email enumeration:** Doesn't reveal if email exists
- **Generic errors:** Same error message for all failures
- **Email validation:** Only user's own email can reset account

---

## 🚀 Production Deployment Checklist

### Before Going Live

- [ ] **Move ALL credentials to environment variables**
  - [ ] Database URI
  - [ ] Email credentials
  - [ ] JWT secrets
  - [ ] API keys

- [ ] **Use environment files**
  ```bash
  # Create .env in production
  # Add to .gitignore
  # Never commit .env file
  ```

- [ ] **Enable HTTPS**
  - All endpoints must use HTTPS (TLS 1.2+)
  - Set `secure: true` in cookies
  - Redirect HTTP to HTTPS

- [ ] **Configure CORS properly**
  ```typescript
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
  ```

- [ ] **Email Setup**
  - Use production email service (SendGrid, AWS SES, Mailgun)
  - Test email delivery thoroughly
  - Set up SPF, DKIM, DMARC records

- [ ] **Database Security**
  - Enable IP whitelist in MongoDB Atlas
  - Use strong passwords (20+ characters)
  - Enable audit logging
  - Regular backups enabled

- [ ] **Rate Limiting**
  - For production with multiple servers, **use Redis**
  - Current in-memory implementation works for single server only
  - Example Redis setup:
    ```typescript
    import redis from 'redis';
    const client = redis.createClient(process.env.REDIS_URL);
    ```

- [ ] **Logging & Monitoring**
  - Set up error tracking (Sentry, DataDog)
  - Monitor failed login attempts
  - Log password reset events
  - Alert on suspicious activity

- [ ] **Security Headers**
  ```typescript
  app.use(helmet()); // Adds security headers
  ```

- [ ] **Input Validation**
  - Validate all user inputs
  - Use libraries like `joi` or `zod`
  - Sanitize data before processing

- [ ] **Secrets Management**
  - Use AWS Secrets Manager, HashiCorp Vault, or similar
  - Never hardcode secrets
  - Rotate secrets regularly

---

## 📧 Email Security

### Current Setup Issue
Your email credentials are hardcoded in production code. This is **critical**.

### Recommended: Use Email Service Provider

**Option 1: SendGrid** (Recommended for production)
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: email,
  from: 'support@dtfindia.org',
  subject: 'Password Reset',
  html: '<p>Reset your password...</p>'
};

await sgMail.send(msg);
```

**Option 2: AWS SES**
```typescript
import AWS from 'aws-sdk';

const ses = new AWS.SES({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
```

**Option 3: Mailgun**
```typescript
const mailgun = require('mailgun.js');
const client = new mailgun.Client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});
```

---

## 🛡️ Additional Security Measures

### 1. **Account Lockout Protection**
```typescript
// Already implemented in password reset service
// Max 3 attempts → lock for 1 hour
```

### 2. **Two-Factor Authentication** (Future Enhancement)
```typescript
// Consider adding 2FA for sensitive operations
// Google Authenticator, SMS OTP, etc.
```

### 3. **Password History** (Future Enhancement)
```typescript
// Prevent reusing old passwords
passwordHistory: [
  { hash: 'hashed_pwd_1', changedAt: Date },
  { hash: 'hashed_pwd_2', changedAt: Date }
]
```

### 4. **Breach Notification**
```typescript
// Check password against breach databases
// Use https://haveibeenpwned.com API
```

### 5. **Login Attempt Tracking**
```typescript
lastLoginAt: Date,
loginAttempts: Number,
loginLockUntil: Date
```

---

## 🔍 Testing Security

### Test Cases to Add

```typescript
// Bruteforce resistance
test('should lock account after 3 failed attempts')
test('should allow reset after lock expires')

// Token security
test('should not leak hashed token in response')
test('should not accept reused tokens')
test('should reject tokens from different IP')

// Password security
test('should hash password before storing')
test('should not return password in API responses')
test('should not log passwords')

// Privacy
test('should not reveal if email exists')
test('should not return user data in error messages')
```

---

## 📝 Compliance Checklist

### GDPR Compliance
- [ ] User can request account deletion
- [ ] Password reset data is minimal
- [ ] No unnecessary data retention
- [ ] Clear privacy policy

### Data Protection
- [ ] Encrypted in transit (HTTPS)
- [ ] Encrypted at rest (for passwords)
- [ ] No sensitive data in logs
- [ ] Regular security audits

### PCI-DSS (if handling payments)
- [ ] No password storage (use OAuth/JWT)
- [ ] Secure token handling
- [ ] Access controls
- [ ] Audit logging

---

## 🚨 Immediate Action Items

### Priority 1 (DO NOW - Before Any Production Use):
1. ✅ Move database URI to `.env`
2. ✅ Move email credentials to `.env`
3. ✅ Add `.env` to `.gitignore`
4. ✅ Rotate exposed passwords
5. ✅ Remove credentials from git history

### Priority 2 (Before Production Deployment):
1. ✅ Set up proper email service (SendGrid/AWS SES)
2. ✅ Enable HTTPS
3. ✅ Configure CORS
4. ✅ Set up Redis for rate limiting
5. ✅ Add monitoring/error tracking

### Priority 3 (Ongoing):
1. Regular security audits
2. Dependency updates
3. Penetration testing
4. Security training for team

---

## 📚 Resources

### OWASP Top 10
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

### Node.js Security
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

### Tools for Security Testing
- [OWASP ZAP](https://www.zaproxy.org/) - Vulnerability scanner
- [Burp Suite Community](https://portswigger.net/burp/communitydownload) - Security testing
- [npm audit](https://docs.npmjs.com/cli/v9/commands/npm-audit) - Dependency vulnerabilities

---

## ❓ Questions?

If you have security concerns:
1. Check OWASP documentation
2. Review the FORGOT_PASSWORD_GUIDE.md
3. Test in staging environment first
4. Never expose credentials
5. Use environment variables for all secrets

