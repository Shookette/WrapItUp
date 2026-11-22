import { FirebaseOptions, getApps, initializeApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const missing = Object.entries({ ...firebaseConfig, recaptchaSiteKey })
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(
    `Configuration Firebase incomplète : ${missing.join(", ")} (voir .env)`,
  );
}

const enableAppCheckDebugMode = () => {
  (
    self as typeof self & { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }
  ).FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
};

const initFirebase = () => {
  if (getApps().length > 0) {
    return;
  }

  const app = initializeApp(firebaseConfig);

  if (import.meta.env.MODE !== "production") {
    enableAppCheckDebugMode();
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
};

export default initFirebase;
