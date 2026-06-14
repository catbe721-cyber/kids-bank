import * as admin from "firebase-admin";

// Singleton initialization — safe to import from multiple files
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
