// ============================================
//   SMART CAMPUS — FIREBASE CONFIGURATION
// ============================================

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsLtxZqGjUgYad1LXsgwv438iNeG-32Tk",
  authDomain: "gate-pass-9c608.firebaseapp.com",
  databaseURL: "https://gate-pass-9c608-default-rtdb.firebaseio.com", // Added based on project ID
  projectId: "gate-pass-9c608",
  storageBucket: "gate-pass-9c608.firebasestorage.app",
  messagingSenderId: "531643415518",
  appId: "1:531643415518:web:bf3679a3c2db26d13afb4f",
  measurementId: "G-B7CD0RSNH3"
};

// Initialize Firebase using the Compat (v8) syntax to match index.html scripts
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
console.log("🔥 Firebase Initialized successfully with project: " + firebaseConfig.projectId);