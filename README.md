# 🔐 Auth Microservice

This is a TypeScript-based authentication microservice that handles local and social login (Google OAuth), 2FA (Two-Factor Authentication), sessions (HTTP Cookies), and JWT handling using Express.js and PostgreSQL.

---

## 🚀 Getting Started

### 1. Clone the Repo

```
bash
git clone https://github.com/your-username/auth-microservice.git
cd auth-microservice
```

### 2. Install Dependencies

```
bash
npm install
```

---

## ⚙️ Environment Configuration

Copy the example environment file and update values accordingly:

```
bash
cp .env.sample .env
```

### Required Environment Variables

| Key                    | Description                          | Example                                    |
| ---------------------- | ------------------------------------ | ------------------------------------------ |
| `PORT`                 | Port the server runs on              | `4000`                                     |
| `NODE_ENV`             | Environment (dev, prod)              | `development`                              |
| `FRONTEND_URL`         | Your frontend app URL                | `http://localhost:3000`                    |
| `DATABASE_URL`         | Full DB connection string (optional) | `postgresql://user:pass@localhost/auth_db` |
| `PG_HOST`              | PostgreSQL host                      | `localhost`                                |
| `PG_USER`              | PostgreSQL user                      | `postgres`                                 |
| `PG_PASSWORD`          | PostgreSQL password                  | `yourpassword`                             |
| `PG_DATABASE`          | PostgreSQL database name             | `auth_db`                                  |
| `PG_PORT`              | PostgreSQL port                      | `5432`                                     |
| `JWT_SECRET`           | JWT encryption secret                | _Use `openssl rand -hex 16`_               |
| `SESSION_SECRET`       | Express session secret               | _Use `openssl rand -hex 16`_               |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID               | `xxxx.apps.googleusercontent.com`          |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret                  | `your_google_secret`                       |
| `LINKED_APP_NAME`      | Name shown in 2FA apps like Authy    | `YourAppName`                              |

### 🔐 Generate Secure Random Strings

```
bash
openssl rand -hex 16
```

Use this to generate values for `JWT_SECRET` and `SESSION_SECRET`.

---

## 🧩 Core Configuration Guide

### PostgreSQL Setup

Make sure PostgreSQL is running and a database is created:

```
bash
createdb auth_db
```

Update your `.env` with PG credentials or a `DATABASE_URL`.

# 🧱 Users Table Schema (via Drizzle ORM)

Your auth microservice uses a PostgreSQL users table structured as follows:

## 🗃️ Schema Fields

| Field           | Type      | Description                                                              |
| --------------- | --------- | ------------------------------------------------------------------------ |
| `id`            | `serial`  | Auto-incrementing primary key                                            |
| `name`          | `varchar` | Required full name of the user                                           |
| `email`         | `varchar` | Required unique email for login and identity                             |
| `password`      | `varchar` | Hashed password (not required for OAuth users)                           |
| `googleId`      | `varchar` | Google account ID if user logs in with Google OAuth                      |
| `facebookId`    | `varchar` | Facebook account ID if user logs in with Facebook OAuth                  |
| `provider`      | `varchar` | Authentication method (e.g., `local`, `google`, `facebook`)              |
| `twofa_secret`  | `varchar` | Base32 secret used for 2FA token generation (e.g., Google Authenticator) |
| `twofa_enabled` | `boolean` | Whether 2FA is enabled for the user                                      |

### Google OAuth Setup

1. Go to [Google Developer Console](https://console.developers.google.com/)
2. Create a new project
3. Under **OAuth Consent Screen**:
   - Set application name
   - Add scopes (email, profile)
4. Under **Credentials**:
   - Create **OAuth Client ID**
   - Set **Authorized redirect URIs** (e.g., `http://localhost:4000/auth/google/callback`)
5. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into your `.env`.

---

## ✅ Example Frontend Requests (FE Integration)

### 📝 Signup

```
ts
ts
fetch(“http://localhost:4000/api/auth/signup”, {
    method: “POST”,
    credentials: “include”,
    headers: {
    “Content-Type”: “application/json”,
    },
    body: JSON.stringify({
    email: “test@example.com”,
    password: “password123”,
    }),
});
```

### 🔐 Login

```
ts
    fetch(“http://localhost:4000/api/auth/login”, {
    method: “POST”,
    credentials: “include”,
    headers: {
    “Content-Type”: “application/json”,
    },
    body: JSON.stringify({
    email: “test@example.com”,
    password: “password123”,
    }),
});
```

### 🌐 Google OAuth

To initiate Google OAuth login:

```
ts
window.location.href = “http://localhost:4000/api/auth/google”;
```

### 🔐 Verify 2FA

```
ts
fetch("http://localhost:4000/verify-2fa", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    userId: 1,
    token: "123456" // code from authenticator app
  }),
});
```

### 🛠️ Setup 2FA

```
ts
fetch("http://localhost:4000/setup-2fa", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ userId: 1 }),
});
```

---

## 🔐 Enabling 2FA for a User

- When setting up 2FA:
  - Generate a secret using `speakeasy.generateSecret()`
  - Store the `base32` secret in the `twofa_secret` field
  - Set `twofa_enabled = true` only after successful verification

## 🔑 OAuth Notes

- If `googleId` or `facebookId` is present, that becomes the unique identifier for those users.
- For OAuth users, you can skip password creation and instead set a `provider` value (e.g., `google`).
- Ensure `provider` is always recorded (`local`, `google`, or `facebook`).

## 📝 TODOs

- [ ] **Add support for other DBs (MongoDB, MySQL)**  
       Refactor the `pool.query()` logic and use environment-driven DB provider switching.

- [ ] **Add session store support (e.g. Redis)** for production scaling.

- [ ] **Enhance request validation** with Zod or Joi.

- [ ] **Rate limiting and brute-force protection** for 2FA routes.

- [ ] **Serverless Wrapper Function** for AWS Lambda as an example.

---

## 📂 Folder Structure (WIP)

```
plaintext
src/
├── config/            # DB connection and passport config
├── passport/          # Strategy setup and 2FA logic
├── routes/            # Express routes (auth, 2fa)
├── types/             # Custom types and interfaces
└── index.ts           # Entry point
```

---

## 💬 Questions?

Open an issue or reach out to the maintainer.
