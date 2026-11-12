import { FirebaseOptions, initializeApp } from "firebase/app";

// Valeurs lues dans `.env` / `.env.production` (voir ces fichiers).
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(
    `Configuration Firebase incomplète : ${missing.join(", ")} (voir .env)`,
  );
}

const initFirebase = () => {
  initializeApp(firebaseConfig);
};

export default initFirebase;
