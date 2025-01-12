import { auth } from '../../../firebase/firebase.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const googleBtn = document.querySelector('.social-btn:nth-child(1)');
const facebookBtn = document.querySelector('.social-btn:nth-child(2)');

// Email/Password Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Logged in:', userCredential.user);
        window.location.href = '/dashboard.html'; // Redirect to dashboard
    } catch (error) {
        alert(error.message);
    }
});

// Google Login
googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('Google sign in:', result.user);
        window.location.href = '/dashboard.html';
    } catch (error) {
        alert(error.message);
    }
});

// Facebook Login
facebookBtn.addEventListener('click', async () => {
    const provider = new FacebookAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('Facebook sign in:', result.user);
        window.location.href = '/dashboard.html';
    } catch (error) {
        alert(error.message);
    }
});
