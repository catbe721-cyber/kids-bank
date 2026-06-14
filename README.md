# 🐷 小豬撲滿 — Kids Savings Bank

A family savings app for kids, featuring 10% monthly compound interest, parent-verified transactions, and savings goals. Built with React + Firebase.

---

## Features

- 📊 Real-time balance with monthly compound interest simulation
- 🔐 Secure 6-digit PIN verification via Firebase Cloud Functions (PIN never in client code)
- ✏️ Full CRUD — add, edit, delete transactions (parent-only)
- 💰 Quick amount buttons (+$1 → +$100)
- 🎯 Savings goals with progress bars
- 📅 Transaction history grouped by date
- 📱 Mobile-first responsive design
- 👧👦 Multi-child support (姊姊 / 弟弟)

---

## Security Architecture

```
Parent enters PIN → Cloud Function verifies (bcrypt) → Custom claims set on token
                                                       → Firestore rules enforce role + expiry
```

- PIN is hashed with bcrypt (12 rounds) and stored in **Firebase Secret Manager** — never in code or Firestore
- Custom claims grant a 30-minute parent session
- Firestore Security Rules enforce `role === 'parent'` AND claim expiry on all writes
- Anonymous users have read-only access
- Rate limiting: 5 PIN attempts per 10 minutes per UID

---

## Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project on **Blaze (pay-as-you-go) plan** (required for Cloud Functions)

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/kids-bank.git
cd kids-bank
npm install
cd functions && npm install && cd ..
```

### 2. Set the Parent PIN

Generate your bcrypt hash (run once, never commit output):

```bash
node scripts/generate-pin-hash.mjs
```

Store the hash in Firebase Secret Manager:

```bash
firebase functions:secrets:set PIN_HASH
# Paste the bcrypt hash when prompted
```

### 3. Configure Firebase

```bash
firebase login
firebase use kids-bank-65e92   # or your project ID
```

### 4. Deploy

```bash
# Deploy security rules
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Cloud Functions (builds TypeScript first)
cd functions && npm run build && cd ..
firebase deploy --only functions

# Deploy frontend
npm run build
firebase deploy --only hosting
```

---

## Development

```bash
# Start frontend dev server
npm run dev

# Watch Cloud Functions (in separate terminal)
cd functions && npm run build:watch
```

> **Note:** For local development with Cloud Functions, use the Firebase Emulator Suite:
> ```bash
> firebase emulators:start
> ```
> Then set `FIREBASE_EMULATOR_HOST` in your environment.

---

## Project Structure

```
kids-bank/
├── functions/src/          # Cloud Functions (TypeScript)
│   ├── pins/               # PIN verification & revocation
│   └── shared/             # Admin SDK singleton, error helpers
├── src/
│   ├── config/firebase.ts  # Firebase client init
│   ├── types/              # TypeScript domain types
│   ├── utils/              # ledger.ts, format.ts
│   ├── services/           # transactionService, goalService
│   ├── hooks/              # useAuth, useParentMode, useTransactions, useSavingsGoals
│   └── components/         # All UI components
├── firestore.rules         # Firestore Security Rules
├── firestore.indexes.json  # Composite indexes
└── firebase.json           # Hosting + Functions config
```

---

## Changing the PIN

Generate a new hash and update the secret:

```bash
node scripts/generate-pin-hash.mjs
firebase functions:secrets:set PIN_HASH   # paste new hash
firebase deploy --only functions           # redeploy to pick up new secret
```

---

## Interest Calculation

Interest is computed client-side by simulating the full timeline from the first transaction to today. On the 1st of each month, 10% of the balance at that point is added. This matches a monthly compound interest model.

To change the rate, edit `MONTHLY_INTEREST_RATE` in [`src/utils/ledger.ts`](src/utils/ledger.ts).
