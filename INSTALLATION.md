# Installation & Setup Guide

## 📦 Required Dependencies

### Core Password Reset
```bash
npm install bcrypt nodemailer
npm install --save-dev @types/bcrypt
```

### If Not Already Installed
```bash
npm install express mongoose
npm install dotenv # For environment variables
npm install cors helmet # Security headers
```

### Optional (Recommended for Production)
```bash
npm install redis # For distributed rate limiting
npm install winston # Better logging
npm install sentry # Error tracking
npm install joi # Input validation
npm install helmet # Security headers
```

### Development/Testing
```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/express
npm install --save-dev nodemon # Auto-restart on changes
```

---

## 🔧 Installation Steps

### Step 1: Install Dependencies
```bash
# Minimal setup
npm install bcrypt nodemailer express mongoose

# With security enhancements
npm install bcrypt nodemailer express mongoose cors helmet dotenv
```

### Step 2: Update package.json Scripts
```json
{
  "scripts": {
    "start": "node dist/app.js",
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts"
  }
}
```

### Step 3: Configure Environment Variables

Create `.env` file in project root:
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (if using Nodemailer)
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
SMTP_USER=support@dtfindia.org
SMTP_PASSWORD=your_secure_password_here

# Or SendGrid
SENDGRID_API_KEY=SG.xxxxx

# Password Reset
PASSWORD_RESET_EXPIRY=15m

# Node
NODE_ENV=development
PORT=5000
```

### Step 4: Add to .gitignore
```
node_modules/
.env
.env.local
.env.*.local
dist/
*.log
```

### Step 5: Initialize TypeScript (if not already)
```bash
npx tsc --init
```

### Step 6: Update tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## ✅ Verify Installation

### Test 1: Check TypeScript Compilation
```bash
npm run build
```

Should create `dist/` folder without errors.

### Test 2: Check Dependencies
```bash
npm list bcrypt nodemailer
```

Should show installed versions.

### Test 3: Start Development Server
```bash
npm run dev
```

Should start server on `http://localhost:5000`

---

## 🚀 Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

---

## 📋 File Structure After Setup

```
mlm/
├── src/
│   ├── password-reset/
│   │   ├── passwordReset.controller.ts
│   │   ├── passwordReset.service.ts
│   │   ├── passwordReset.dto.ts
│   │   ├── passwordReset.routes.ts
│   │   └── __tests__/
│   │       └── passwordReset.service.test.ts
│   │
│   ├── middleware/
│   │   ├── jwt.ts
│   │   └── rateLimiter.ts
│   │
│   ├── user/
│   │   ├── user.model.ts (UPDATED)
│   │   ├── user.controller.ts
│   │   └── user.routes.ts
│   │
│   ├── config/
│   │   └── database.config.ts
│   │
│   ├── verifyUser/
│   │   └── sendMail.ts (UPDATED)
│   │
│   ├── app.ts
│   └── routes.ts (UPDATED)
│
├── .env.example
├── .env (DO NOT COMMIT)
├── .gitignore (UPDATED)
├── package.json
├── tsconfig.json
├── jest.config.js (if added)
├── FORGOT_PASSWORD_GUIDE.md
├── SECURITY_NOTES.md
└── INSTALLATION.md
```

---

## 🔍 Troubleshooting Installation

### Issue: `bcrypt` installation fails
```
Solution: 
npm install --build-from-source bcrypt
# or use pre-built version
npm install bcrypt@5.1.0
```

### Issue: TypeScript compilation errors
```
Solution:
npm install --save-dev typescript
npm install --save-dev @types/node @types/express
npx tsc --init
```

### Issue: Cannot find module 'dotenv'
```
Solution:
npm install dotenv
# Then in app.ts:
import dotenv from 'dotenv';
dotenv.config();
```

### Issue: Nodemailer not sending emails
```
Solution:
1. Check SMTP credentials in .env
2. Enable "Less secure app access" if using Gmail
3. Use app-specific password
4. Check firewall/network settings
```

---

## 🔄 Testing Installation

### Test Password Validation
```bash
node -e "
const service = require('./dist/password-reset/passwordReset.service.js').default;
console.log(service.validatePassword('TestPass123!'));
"
```

### Test with cURL
```bash
curl -X POST http://localhost:5000/password-reset/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test with Postman
1. Create new POST request
2. URL: `http://localhost:5000/password-reset/forgot-password`
3. Headers: `Content-Type: application/json`
4. Body:
```json
{
  "email": "test@example.com"
}
```

---

## 📊 Performance Considerations

### Database Indexes
Add these indexes for better performance:

```typescript
// In user.model.ts
UserSchema.index({ email: 1 });
UserSchema.index({ resetToken: 1 });
UserSchema.index({ resetTokenExpiry: 1 });
```

### Redis Setup (Optional but Recommended)
```typescript
import redis from 'redis';

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

// Use for rate limiting instead of in-memory store
```

---

## 🔒 Security Checklist After Installation

- [ ] `.env` file created and added to `.gitignore`
- [ ] All credentials moved to environment variables
- [ ] HTTPS enabled (in production)
- [ ] CORS configured for your frontend URL
- [ ] Rate limiting tested
- [ ] Email sending tested
- [ ] Database backups configured
- [ ] Error logging configured

---

## 📞 Support

If you encounter issues:

1. **Check logs:** `npm run dev` shows detailed errors
2. **Verify .env:** Make sure all required variables are set
3. **Test email:** Verify SMTP credentials work
4. **Check MongoDB:** Ensure connection string is correct
5. **Review SECURITY_NOTES.md:** For security-related issues

