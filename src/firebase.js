// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEfobg0C4APkW0ereNQNGQ5jCgNF9Vo8I",
  authDomain: "moondala-83795.firebaseapp.com",
  projectId: "moondala-83795",
  storageBucket: "moondala-83795.firebasestorage.app",
  messagingSenderId: "577827666145",
  appId: "1:577827666145:web:97b22bdf7898480d18dfa0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
