// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration
// The config object is intentionally public — Firebase API keys are NOT secrets.
// They identify your project, not grant access. Access control is enforced by
// Firestore Security Rules and Firebase Authentication.
// See: https://firebase.google.com/docs/projects/api-keys
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCWq7OhW7rkOGkPDtIHP7dioBVT9BdPuxw",
  authDomain: "kids-bank-65e92.firebaseapp.com",
  projectId: "kids-bank-65e92",
  storageBucket: "kids-bank-65e92.firebasestorage.app",
  messagingSenderId: "569962503197",
  appId: "1:569962503197:web:c260aff551abbf4a09baf4",
};

// Prevent re-initialization in dev (HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");
