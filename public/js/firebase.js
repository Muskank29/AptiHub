
// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Replace with your Firebase project config
const firebaseConfig = {
  piKey: "AIzaSyDLF_JF9FtOBxW8TlpWYkKx3coM85QmX1U",
  authDomain: "aptihub2529.firebaseapp.com",
  projectId: "aptihub2529",
  storageBucket: "aptihub2529.firebasestorage.app",
  messagingSenderId: "791326188951",
  appId: "1:791326188951:web:96433ac7d26705d70490d2",

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
