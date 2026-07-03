# 🔒 Security Audit Report — MLM Backend

**Project:** `ml` (MLM / referral-commission platform)
**Stack:** Node.js · Express · TypeScript · MongoDB (Mongoose) · JWT · bcrypt · Nodemailer
**Audit date:** 2026-07-03
**Reviewer:** Code review (static)
**Scope:** Poora `src/` backend, config, aur git-tracked files.

> ⚠️ Ye ek **financial application** hai (wallet, withdrawals, bank details). Isliye normal app ke muqable severity bar high rakha gaya hai. Neeche jitne bhi **CRITICAL** aur zyaadatar **HIGH** issues hain, wo production mein **direct paisa churane / poora system takeover** karne layak hain.

---

## ✅ FIX STATUS (updated 2026-07-04)

Ek local end-to-end + security test harness (54 assertions, `scratchpad/e2e.mjs`) se verify kiya gaya. **54/54 pass.**

| ID | Issue | Status |
|----|-------|--------|
| C1 | MongoDB creds hardcoded | ✅ Code fixed (env). ⏳ **Aap:** prod password rotate + git history purge |
| C2 | JWT secret `test@123` | ✅ Fixed — env secret, HS256 pin, 7d expiry |
| C3 | SMTP password hardcoded | ✅ Code fixed (env). ⏳ **Aap:** email password rotate |
| C4 | `.env` git mein | ✅ Untracked + gitignored. ⏳ **Aap:** history purge |
| C5 | Mass assignment → self-admin/infinite money | ✅ Fixed — field whitelist (`updateUser`, `updateUserByAdmin`) |
| C6 | `/plan-pin/create` no auth (free money) | ✅ Fixed — `authMiddleware + checkAdmin` |
| H1 | JWT no expiry/algorithm | ✅ Fixed |
| H2 | `admin/edit-profile` no `checkAdmin` | ✅ Fixed — admin-gated + whitelist |
| H3 | `/user/get-list` public (PII/bank leak) | ✅ Fixed — admin-gated |
| H4 | Plan/Level CRUD no auth | ✅ Fixed — admin-gated (GET = logged-in) |
| H5 | Wallet race condition | ✅ Fixed — atomic conditional `$inc` on withdrawals |
| H6 | Negative/NaN withdrawal exploit | ✅ Fixed — amount validation (controller + service) |
| H7 | Login/signup leak password hash | ✅ Fixed — password stripped from responses |
| M3 | IDOR (read others' data) | ✅ Fixed — `get-by-id` self/admin only; `get-user` returns identity-only (no bank/PAN/wallet); `transaction-history` now auth'd |
| — | `block-unblock` any user | ✅ Fixed — admin-gated; `plan-pin/get` (pin codes) admin-gated |

**Abhi bhi baaki (P2 — deploy blocker nahi, par karna chahiye):** H8 NoSQL injection input-validation, M1 crypto-random PIN/OTP, M2 OTP rate-limit, M4 CORS lockdown, M5 signup password policy, M7 error-message leak, L1 helmet/HTTPS, referral-flow atomicity (transactions).

---

## Severity Summary

| # | Issue | Severity | File |
|---|-------|----------|------|
| C1 | Hardcoded MongoDB credentials (git mein committed) | 🔴 CRITICAL | `src/config/database.config.ts` |
| C2 | Hardcoded JWT secret `"test@123"` → token forgery / admin takeover | 🔴 CRITICAL | `src/middleware/jwt.ts` |
| C3 | Hardcoded SMTP email password (git mein) | 🔴 CRITICAL | `src/verifyUser/sendMail.ts` |
| C4 | `.env` git mein committed hai | 🔴 CRITICAL | `.env` |
| C5 | Mass assignment → self privilege escalation + infinite wallet | 🔴 CRITICAL | `user.controller.ts` (`updateUser`) |
| C6 | `POST /plan-pin/create` pe koi auth nahi → free enrollment PINs mint | 🔴 CRITICAL | `planPin.routes.ts` |
| H1 | JWT no expiry + no algorithm pinning | 🟠 HIGH | `jwt.ts` |
| H2 | `admin/edit-profile` pe `checkAdmin` missing → koi bhi kisi ka data badle | 🟠 HIGH | `user.routes.ts` |
| H3 | `GET /user/get-list` public → saari PII + bank details leak | 🟠 HIGH | `user.routes.ts` |
| H4 | Plan / Plan-Level CRUD pe koi auth nahi | 🟠 HIGH | `plan.routes.ts`, `levelPlan.router.ts` |
| H5 | Wallet race condition (read-modify-write, no atomicity) | 🟠 HIGH | `user.controller.ts`, `referrefFlow.service.ts` |
| H6 | Withdraw amount validation nahi → negative/NaN se exploit | 🟠 HIGH | `withdraw.service.ts`, `user.controller.ts` |
| H7 | Login response mein password hash bheja jaa raha hai | 🟠 HIGH | `user.controller.ts` (`loginController`) |
| H8 | NoSQL injection (input type validation nahi) | 🟠 HIGH | multiple |
| M1 | PIN & OTP `Math.random()` se generate (predictable) | 🟡 MEDIUM | `planPin.service.ts`, `verifyUser.service.ts` |
| M2 | OTP brute-force / email bombing (rate limit + attempt cap nahi) | 🟡 MEDIUM | `verifyUser.*` |
| M3 | IDOR — koi bhi kisi ka full profile/transactions dekh sakta hai | 🟡 MEDIUM | `user.controller.ts` |
| M4 | CORS `*` + credentials true (contradictory & open) | 🟡 MEDIUM | `index.ts` |
| M5 | Signup pe password policy enforce nahi | 🟡 MEDIUM | `user.controller.ts` |
| M6 | `mongoose.set("debug", true)` production mein | 🟡 MEDIUM | `database.config.ts` |
| M7 | Internal error `.message` client ko leak | 🟡 MEDIUM | multiple |
| L1 | Security headers (helmet) / HTTPS enforce nahi | 🔵 LOW | `index.ts` |
| L2 | Password reset ke baad existing JWT invalidate nahi hote | 🔵 LOW | `passwordReset.service.ts` |
| L3 | PIN generation double-random bug + collision handling nahi | 🔵 LOW | `planPin.service.ts` |

---

## 🔴 CRITICAL ISSUES

### C1 — Hardcoded MongoDB credentials (git history mein)
**File:** `src/config/database.config.ts:3`
```ts
const uri = "mongodb+srv://admin:<REDACTED-PASSWORD>@<REDACTED-CLUSTER>.mongodb.net/mlm?...";
```
**Impact:** Repo tak jiska bhi access hai (ya git history) usko **poore production database ka admin access** mil jaata hai — saare users, passwords (hash), bank details, wallet balances read/modify/delete kar sakta hai. Password URL-encoded tha lekin plaintext-decodable — value yahaan `<REDACTED>` (rotate karo).
**Fix:**
1. `process.env.MONGODB_URI` use karo, fallback hardcoded hata do.
2. **MongoDB password turant rotate karo** (already exposed hai).
3. MongoDB Atlas mein IP allowlist / network restrictions lagao.

---

### C2 — Hardcoded JWT secret → poora auth system toota hua hai
**File:** `src/middleware/jwt.ts:5,8`
```ts
export function generateToken(payload: any) { return jwt.sign(payload, "test@123"); }
function verifyToken(token: string) { return jwt.verify(token, "test@123"); }
```
**Impact:** Ye **sabse khatarnaak issue** hai. Secret public/guessable (`test@123`) hai, isliye koi bhi attacker apna khud ka valid token bana sakta hai:
- `type: "ADMIN"` daal ke **admin ban jaana** (withdrawals approve karna, saara data).
- Kisi bhi user ka `_id` daal ke **uski identity impersonate** karna.
- `verified: true` daal ke bina PIN ke system access.

Token forge karne ke liye code tak access ki bhi zaroorat nahi — `test@123` trivially guessable hai.
**Fix:**
1. `JWT_SECRET` ko strong random value (min 32 chars) se `.env` mein rakho.
2. Rotate: purane sab tokens invalid ho jayenge (accha hai).
3. `jwt.sign(payload, secret, { expiresIn: '7d', algorithm: 'HS256' })`.
4. `jwt.verify(token, secret, { algorithms: ['HS256'] })` — algorithm pin karo (alg-confusion attack rokne ke liye).

---

### C3 — Hardcoded SMTP email password
**File:** `src/verifyUser/sendMail.ts:14-15` (aur `:63` fallback mein)
```ts
auth: { user: "support@dtfindia.org", pass: "<REDACTED-EMAIL-PASSWORD>" }
```
**Impact:** Company ke email account ka password code + git mein exposed. Attacker company ki taraf se **phishing/spam** bhej sakta hai, emails read kar sakta hai. `sendResetPasswordEmail` mein bhi fallback hardcoded hai.
**Fix:** `process.env.SMTP_USER` / `process.env.SMTP_PASSWORD`, hardcoded fallback hatao, **email password rotate karo**.

---

### C4 — `.env` git mein committed hai
**Evidence:** `git ls-files` mein `.env` track ho raha hai. `.gitignore` mein sirf `node_modules` aur `dist` hai — `.env` list nahi.
**Impact:** Saare secrets (DB URI, SMTP, JWT) git history mein permanently store ho gaye — clone karne wale sabko mil jaate hain.
**Fix:**
1. `.gitignore` mein `.env` add karo.
2. `git rm --cached .env`.
3. History se purge karo (`git filter-repo` / BFG) — warna history mein rahega.
4. **Saare exposed secrets rotate karo** (DB, SMTP, JWT).

---

### C5 — Mass assignment → apne aap ko admin banana + wallet manipulate karna
**File:** `src/user/user.controller.ts` → `updateUser()`, route `POST /user/update` (`authMiddleware` only)
```ts
const user = await User.findById(userId);
Object.assign(user, body);   // ❌ poora req.body blindly merge
await user.save();
```
**Impact:** Koi bhi logged-in user apne hi record pe arbitrary fields set kar sakta hai:
- `{ "type": "ADMIN" }` → **admin ban gaya**.
- `{ "wallet": 99999999 }` → **infinite paisa**, phir withdraw.
- `{ "isVerified": true, "isBlock": false, "referred_by": "<koi bhi>" }`.

Yehi bug `updateUserByAdmin` (H2) aur `updateUserProfile`/`updateFinantialDetails` (partially) mein bhi pattern hai.
**Fix:** Sirf whitelist fields update karo:
```ts
const ALLOWED = ["first_name", "last_name", "mobile_number", "dob", "adress1", "adress2"];
for (const k of ALLOWED) if (k in body) (user as any)[k] = body[k];
```
`type`, `wallet`, `isVerified`, `isBlock`, `referred_by`, `pin` kabhi bhi user-controllable nahi hone chahiye.

---

### C6 — `POST /plan-pin/create` pe koi authentication nahi
**File:** `src/planPin/planPin.routes.ts:9`
```ts
PlanPinRouter.post("/create", Controller.create);   // ❌ no authMiddleware
```
**Impact:** PIN = paid enrollment (jo `enrollAmount` represent karta hai). Bina auth ke koi bhi:
- Unlimited free PINs mint kar sakta hai → **bina paise diye system join** / referral tree bharna.
- `createdFrom` body se aata hai → kisi ke naam pe PINs bana ke uski downline manipulate kar sakta hai → **commission farming**.

**Fix:** `authMiddleware` (+ `checkAdmin` ya proper ownership check) lagao. `createdFrom` server-side `req.user._id` se set karo, body se nahi.

---

## 🟠 HIGH ISSUES

### H1 — JWT: no expiry, no algorithm pinning
`generateToken` mein na `expiresIn` hai na `algorithm`. Token **kabhi expire nahi hota** — ek baar leak hone pe hamesha valid. `verify` mein `algorithms` restrict nahi → algorithm-confusion risk. (C2 ke saath fix karo.)

### H2 — `admin/edit-profile` pe `checkAdmin` missing
**File:** `src/user/user.routes.ts:39`
```ts
UserRouter.post("/admin/edit-profile/", authMiddleware, updateUserByAdmin);  // ❌ checkAdmin nahi
```
`updateUserByAdmin` bhi `Object.assign` mass-assignment karta hai **kisi bhi userId pe**. Matlab koi bhi normal logged-in user kisi aur user ka `wallet`/`type`/`isBlock` badal sakta hai. → **HIGH IDOR + privilege escalation.**
**Fix:** `checkAdmin` middleware add karo + field whitelist.

### H3 — `GET /user/get-list` public hai (PII + financial leak)
**File:** `src/user/user.routes.ts:42` → `getUserList` (no auth).
`select("-password")` sirf password hataata hai — response mein **email, mobile, DOB, PAN, Aadhaar, UPI, bank A/C, IFSC, wallet** sab included. Bina login ke poori user list nikal jaati hai. → **Serious data breach (PII + KYC + bank).**
**Fix:** `authMiddleware + checkAdmin`, aur response se sensitive financial fields explicitly hatao.

### H4 — Plan / Plan-Level CRUD pe koi auth nahi
**Files:** `src/plan/plan.routes.ts` (create/get/update/delete), `src/planLevel/levelPlan.router.ts` (create/update) — **koi middleware nahi**.
**Impact:** Koi bhi enrollment amounts, commission structure, bonus rules create/modify/**delete** kar sakta hai → poore payout economics ko todh sakta hai (e.g. commission amount 999999 set karke wallet bharna).
**Fix:** `authMiddleware + checkAdmin` sab admin-management routes pe.

### H5 — Wallet race condition (no atomicity)
**Files:** `user.controller.ts` (`withdrawAmount*`), `referrefFlow.service.ts`.
Pattern har jagah: `findById` → JS mein modify (`wallet -= x` / `wallet += x`) → `save()`. Concurrent requests (do withdraw ek saath) mein **lost update / double-spend** hota hai — balance check aur deduction atomic nahi hain.
**Fix:** Atomic conditional update use karo:
```ts
const r = await User.updateOne(
  { _id: userId, wallet: { $gte: total } },
  { $inc: { wallet: -total } }
);
if (r.modifiedCount === 0) throw new Error("Insufficient balance");
```
Referral crediting ke liye `$inc` aur ideally **MongoDB transactions** (multi-doc consistency).

### H6 — Withdraw amount validation nahi (negative/NaN exploit)
**File:** `withdraw.service.ts` `calculateWithDraws` → `parseInt(amountString)`; `user.controller.ts` `withdrawAmountCostumer`.
`amount` pe koi `> 0` / finite check nahi. Negative amount bhejne pe: `total` negative → `wallet < total` check pass ho jaata hai → `wallet -= (negative)` = **wallet badh jaata hai**. NaN se bhi NaN-propagation bugs.
**Fix:** `const amount = Number(body.amount); if (!Number.isFinite(amount) || amount <= 0) return 400;` Minimum withdrawal threshold bhi lagao.

### H7 — Login response mein password hash leak
**File:** `user.controller.ts` `loginController`:
```ts
const data = await User.findOne({ email: body.email }).lean();  // password included
...
res.send({ user: data, token, ... });   // ❌ bcrypt hash client ko chala gaya
```
**Fix:** `.select("-password")` ya response bhejne se pehle `delete data.password`.

### H8 — NoSQL injection (input type validation nahi)
`req.body.email` / `req.body.pin` etc. seedha query mein jaate hain, aur `express.json()` objects parse karta hai. Attacker `{"email": {"$gt": ""}}` bhej sakta hai → operator injection. Login mein full bypass mushkil (bcrypt), lekin `getPlanPinByPin`, password-reset lookups, etc. mein enumeration/logic-bypass ho sakta hai.
**Fix:** Har input pe type check (`typeof x === "string"`), ya `express-mongo-sanitize`, ya schema validation (zod/joi) lagao.

---

## 🟡 MEDIUM ISSUES

### M1 — PIN & OTP `Math.random()` se generate
`planPin.service.ts` aur `verifyUser.service.ts` dono `Math.floor(100000 + Math.random()*900000)` use karte hain. `Math.random()` **cryptographically secure nahi** — predictable. 6-digit space sirf 9 lakh → brute-forceable.
**Fix:** `crypto.randomInt(100000, 1000000)`; PIN ke liye longer + crypto-random. (Password reset token sahi hai — `crypto.randomBytes`.)

### M2 — OTP brute-force / email bombing
`POST /validate/createOTP` pe **na auth na rate limit** → kisi bhi email pe unlimited OTP mail (email bombing + SMTP cost). `verifyUser` pe attempt-limit nahi → 6-digit OTP brute-force possible. OTP DB mein plaintext store.
**Fix:** `createOTP` pe rate limit (jaise password-reset mein hai), verify attempts cap, OTP hash karke store, expiry enforce (already 10 min hai).

### M3 — IDOR: kisi ka bhi profile / transactions
`GET /user/get-by-id/:id` & `get-user/:id` (auth hai par ownership check nahi) → koi bhi user kisi aur ki `_id`/`userId` daal ke uska full profile (bank, PAN, Aadhaar) dekh sakta hai. `GET /user/transaction-history/:id` pe to auth bhi nahi.
**Fix:** Ownership check (`req.user._id === id` ya admin), aur transaction-history pe `authMiddleware`.

### M4 — CORS wide open + credentials
**File:** `index.ts` — `cors()` (all origins) + manually `Access-Control-Allow-Origin: *` **aur** `Access-Control-Allow-Credentials: true`. Ye combination invalid/insecure hai.
**Fix:** Allowed origins ki whitelist rakho; credentials chahiye to specific origin echo karo, `*` nahi.

### M5 — Signup pe password policy nahi
`PasswordResetService.validatePassword` (strong policy) sirf reset flow mein use hota hai. `signupController` koi bhi password accept karta hai (e.g. `"1"`).
**Fix:** Signup pe bhi same `validatePassword` chalao.

### M6 — `mongoose.set("debug", true)` production mein
`database.config.ts` har query (data ke saath) console pe log karta hai → sensitive data logs mein.
**Fix:** `mongoose.set("debug", process.env.NODE_ENV !== "production")`.

### M7 — Internal error messages client ko leak
Kai jagah `res.status(500).json({ message: err.message })` — internal DB/stack details expose karta hai (info disclosure).
**Fix:** Client ko generic message; detail sirf server log mein.

---

## 🔵 LOW ISSUES

- **L1 — Security headers / HTTPS:** `helmet` nahi laga, HTTPS enforce nahi. `helmet()` add karo, production mein HTTPS + HSTS.
- **L2 — Password reset ke baad sessions:** Password change hone par purane JWT abhi bhi valid rehte hain (expiry na hone se aur bura). Token versioning / `passwordChangedAt` check add karo.
- **L3 — PIN generation bug:** `planPin.service.ts` mein pin do baar generate hota hai (ek `body.pin`, ek `p.pin`) — pehla wasted. Unique index pe collision aane par `save()` throw karega (retry handling nahi). Loop mein error handling + collision retry add karo.

---

## Priority Action Plan

**Aaj hi (P0 — breach-level):**
1. Saare exposed secrets **rotate** karo: MongoDB password, SMTP password, JWT secret. (C1–C4)
2. Secrets ko `.env` mein move karo, hardcoded values hatao, `.env` ko gitignore + history se purge.
3. JWT secret strong karo + `expiresIn` + algorithm pin. (C2/H1)

**Is week (P1 — direct money/takeover):**
4. `updateUser` / `updateUserByAdmin` mein field whitelisting. (C5/H2)
5. `/plan-pin/create`, `/plan/*`, `/plan-level/*`, `/user/get-list`, `/user/transaction-history/:id` pe proper auth + `checkAdmin`. (C6/H2/H3/H4)
6. Wallet operations atomic (`$inc` + conditional). (H5)
7. Withdraw amount validation (positive, finite, min). (H6)
8. Login response se password hataao. (H7)

**Next (P2 — hardening):**
9. Input validation / NoSQL sanitization har route pe (zod/joi). (H8)
10. Crypto-random PINs/OTP + OTP rate-limit/attempt-cap. (M1/M2)
11. IDOR ownership checks. (M3)
12. CORS lockdown, signup password policy, mongoose debug off, generic errors, helmet. (M4–M7, L1)

---

## Note
Repo mein pehle se ek `SECURITY_NOTES.md` hai jo C1 aur C3 cover karta hai. Ye report usse zyaada complete hai — ismein auth/authorization gaps, mass-assignment, financial race conditions, aur MLM-specific business-logic exploits bhi included hain jo actual code review se mile.
