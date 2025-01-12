import { auth, db } from '../../firebase/firebase.js';
import { createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const signUpForm = document.getElementById('signUpForm');
const googleBtn = document.querySelector('.social-btn:nth-child(1)');
const facebookBtn = document.querySelector('.social-btn:nth-child(2)');

// Helper function to store user data
async function storeUserData(user, additionalData = {}) {
    try {
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            fullName: additionalData.fullName || user.displayName || '',
            createdAt: new Date().toISOString(),
            ...additionalData
        });
    } catch (error) {
        console.error("Error storing user data:", error);
        throw error;
    }
}

// Email/Password Sign Up
signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Store additional user data
        await storeUserData(userCredential.user, {
            fullName,
            signUpMethod: 'email',
            lastLogin: new Date().toISOString()
        });
        window.location.href = '/dashboard.html';
    } catch (error) {
        alert(error.message);
    }
});

// Google Sign Up
googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await storeUserData(result.user, {
            signUpMethod: 'google',
            lastLogin: new Date().toISOString()
        });
        window.location.href = '/dashboard.html';
    } catch (error) {
        alert(error.message);
    }
});

// Facebook Sign Up
facebookBtn.addEventListener('click', async () => {
    const provider = new FacebookAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await storeUserData(result.user, {
            signUpMethod: 'facebook',
            lastLogin: new Date().toISOString()
        });
        window.location.href = '/dashboard.html';
    } catch (error) {
        alert(error.message);
    }
});
