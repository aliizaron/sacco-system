import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

// Default dummy config
const dummyConfig = {
  apiKey: "AIzaSyDummyKey",
  authDomain: "dummy-app.firebaseapp.com",
  projectId: "dummy-app",
  storageBucket: "dummy-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

// Initialize with dummy immediately to prevent undefined errors in hooks
app = initializeApp(dummyConfig);
db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
auth = getAuth(app);
googleProvider = new GoogleAuthProvider();

const initializeFirebase = (config: any) => {
  try {
    // Re-initialize with real config
    const newApp = initializeApp(config, "real-app");
    db = initializeFirestore(newApp, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
    auth = getAuth(newApp);
    googleProvider = new GoogleAuthProvider();
    return true;
  } catch (e) {
    console.error("Firebase initialization failed", e);
    return false;
  }
};

// Try to load from window if available (for manual injection)
// @ts-ignore
const manualConfig = window.FIREBASE_CONFIG;

if (manualConfig) {
  initializeFirebase(manualConfig);
} else {
  // Try to load the real config if it exists (it might be injected by the platform)
  const configPath = './firebase-applet-config.json';
  // @ts-ignore
  import(/* @vite-ignore */ configPath)
    .then(config => {
      initializeFirebase(config.default || config);
    })
    .catch(() => {
      console.warn("Firebase config file not found, using dummy config. Sign-in will not work.");
      initializeFirebase(dummyConfig);
    });
}

// @ts-ignore
export { auth, db, googleProvider };
