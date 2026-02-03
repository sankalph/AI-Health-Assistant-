import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAwzqHb1TAbSoaVJvm79Oh6jnxiyv9__o8",
  authDomain: "ai-health-assistant-07.firebaseapp.com",
  projectId: "ai-health-assistant-07",
  storageBucket: "ai-health-assistant-07.firebasestorage.app",
  messagingSenderId: "63119830331",
  appId: "1:63119830331:web:b56c603c3d795adfb19b1e"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Existing export
async function createOrUpdateUser(user) {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, { email: user.email, name: user.displayName }, { merge: true });
}

// ✅ Google Sign-In
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// ✅ Phone Number Helpers
export function setupRecaptcha(containerId) {
  window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
    size: "invisible",
    callback: (response) => {
      console.log("Recaptcha verified", response);
    }
  }, auth);
}

export async function signInWithPhoneNumberHelper(phoneNumber) {
  const appVerifier = window.recaptchaVerifier;
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return confirmationResult;
}

// ✅ Email Registration
export async function registerWithEmail({ name, email, password, dob, address, phone }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, "users", user.uid), { name, email, dob, address, phone });
  return user;
}

// Export everything
export { auth, db, googleProvider, createOrUpdateUser };
