import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4slpNFOX9FcreqlkZZ9RVwUdXv4uDRhs",
  authDomain: "mothly-exspense-tracker.firebaseapp.com",
  projectId: "mothly-exspense-tracker",
  storageBucket: "mothly-exspense-tracker.firebasestorage.app",
  messagingSenderId: "85582219756",
  appId: "1:85582219756:web:3efef6113e631fb89058c9",
  measurementId: "G-MQS5JD6517"
};

// Declare variables first
let auth;
let db;

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  // Initialize Auth and Firestore
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Set persistence to LOCAL
  await setPersistence(auth, browserLocalPersistence);
  
  // Add development environment detection and emulator setup
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

  if (isLocalhost) {
      console.log('Development mode: Running on localhost');
      // Optionally connect to emulators if needed
      // connectAuthEmulator(auth, "http://localhost:9099");
      // connectFirestoreEmulator(db, 'localhost', 8080);
  } else {
      console.log('Production mode:', window.location.hostname);
  }
  
  // Verify initialization
  if (!auth || !db) {
      throw new Error('Firebase services failed to initialize');
  }

  console.log('Firebase initialized successfully');
  
  // Test auth state
  auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
  });

} catch (error) {
  console.error('Firebase initialization error:', error);
  // Re-throw to prevent the app from continuing with broken Firebase
  throw error;
}

// Add this after Firebase initialization
async function validateIndexes() {
    try {
        const testQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', 'test'),
            where('year', '==', 2024),
            where('month', '==', 1),
            orderBy('date', 'desc')
        );
        
        await getDocs(testQuery);
        console.log('Firebase indexes are properly configured');
        return true;
    } catch (error) {
        if (error.code === 'failed-precondition') {
            console.warn('Required indexes are not yet built. Check Firebase Console.');
            return false;
        }
        throw error;
    }
}

// Export after initialization
export { auth, db, validateIndexes };
export const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);

// Add these Firestore rules in Firebase Console:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.amount > 0;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
*/
