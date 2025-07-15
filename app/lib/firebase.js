// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDpMvGfVpHKfhoC4WK31H_iyrEtrD43a4k",
  authDomain: "fir-37b10.firebaseapp.com",
  projectId: "fir-37b10",
  storageBucket: "fir-37b10.appspot.com",
  messagingSenderId: "867198306739",
  appId: "1:867198306739:web:45dd9577018963859023c6",
  measurementId: "G-JM4C5FFW7C", // this is fine, just unused
};

// Avoid initializing multiple times
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
