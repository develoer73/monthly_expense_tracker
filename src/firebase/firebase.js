import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4slpNFOX9FcreqlkZZ9RVwUdXv4uDRhs",
  authDomain: "mothly-exspense-tracker.firebaseapp.com",
  projectId: "mothly-exspense-tracker",
  storageBucket: "mothly-exspense-tracker.firebasestorage.app",
  messagingSenderId: "85582219756",
  appId: "1:85582219756:web:3efef6113e631fb89058c9",
  measurementId: "G-MQS5JD6517"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
