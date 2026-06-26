# NutriFit

> **Integrated web nutrition platform** focused on **AI-driven meal planning** that makes **two AI models - GPT-5.2 and Gemini 3.5 Flash - generate a truly personalized, nutritionally accurate meal plan**. It measures how far each model deviates from the user's defined limits, and compares their performance against each other through a dedicated **head-to-head AI comparison panel**. Body metrics (BMI, body fat %, lean mass, ideal weight) are calculated and tracked daily, supported by **nearly 40 interactive Chart.js statistics**. The project was developed alongside a **React Native mobile app** (NutriFitMobile repository) mirroring core web features

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Gitignored Configuration Files](#gitignored-configuration-files)
- [Local Development](#local-development)

---

## Architecture

```
NutriFit/
├── src/
│   ├── views/          # Route-level interface: landing, auth, user measurements, admin
│   ├── layouts/        # Route layouts wrapping views (landing, auth, user measurements, admin)
│   ├── components/     # Reusable UI building blocks (cards, charts, tables, navbar, sidebar...)
│   ├── database/       # Firebase connection and Firestore get/set/delete helpers
│   ├── theme/          # Chakra UI theme configuration and overrides
│   └── variables/      # Chart options, weight-stat helpers, and shared types
└── api                 # Node.js + Express backend (not included in this repository)
```

| Sub-project | Role                                                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`      | Frontend application used for meal plan generation, body metric tracking, AI deviation comparison, food rankings, and user statistics          |
| `api`       | Backend API responsible for proxying API calls, Firebase Admin SDK operations, Gemini (Vertex AI) calls, and daily cron jobs for food rankings |

---

## Tech Stack

**Frontend (`src/`)**  
React, TypeScript, Chakra UI, Chart.js, Firebase (client SDK), OpenAI API

**Backend (`api`)**  
Node.js, Express.js, Firebase Admin SDK, Firestore, Google Cloud Vertex AI (Gemini), Google Custom Search API

---

## Gitignored Configuration Files

These files are excluded from version control and must exist locally before running the project. Templates below show the expected structure - fill in real values yourself.

### `src/.env`

```env
REACT_APP_API_KEY=your_openai_api_key
```

### `api/nutrifit-ed16d-5f412500590f.json`

Firebase Admin SDK service account key file. Download it from the Firebase Console. Place the downloaded file in the `api/` directory and make sure the filename matches the one referenced in `server.js`:

```js
process.env.GOOGLE_APPLICATION_CREDENTIALS =
  "./nutrifit-ed16d-5f412500590f.json";
```

### `api/firebase_credentials.json`

Firebase client SDK configuration. Obtain it from the Firebase Console:

```json
{
  "type": "service_account",
  "project_id": "your_project_id",
  "private_key_id": "your_private_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

---

## Local Development

### 1. Install dependencies

```bash
cd `api path`
npm i

cd `NutriFit main directory`
npm i
```

### 2. Start the API

```bash
cd api
node server.js
```

The API runs on `http://localhost:3000`.

### 3. Start the frontend

```bash
npm start
```

The app runs on `http://localhost:3001` (or the next available port if 3000 is taken by the API).
