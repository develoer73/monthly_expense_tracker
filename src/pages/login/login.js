import { auth } from '../../firebase/firebase.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { PopupMessage } from '../../components/popup_message/popup.js';

const loginForm = document.getElementById('loginForm');
const googleBtn = document.querySelector('.social-btn:nth-child(1)');
const facebookBtn = document.querySelector('.social-btn:nth-child(2)');

// Utility functions
const setLoading = (isLoading) => {
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Logging in...' : 'Login';
};

// Enhanced error handler
const handleAuthError = (error) => {
    console.error('Auth Error:', error);
    let errorMessage = '';
    let errorType = 'error';

    switch (error.code) {
        case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password';
            break;
        case 'auth/invalid-email':
            errorMessage = 'Invalid email format';
            break;
        case 'auth/user-disabled':
            errorMessage = 'Account disabled';
            break;
        case 'auth/user-not-found':
            errorMessage = 'Account not found';
            break;
        case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
        case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Try again later';
            errorType = 'warning';
            break;
        case 'auth/network-request-failed':
            errorMessage = 'Network error. Check connection';
            errorType = 'warning';
            break;
        case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in popup closed';
            errorType = 'warning';
            break;
        case 'auth/cancelled-popup-request':
            errorMessage = 'Close other sign-in popups first';
            errorType = 'warning';
            break;
        case 'auth/popup-blocked':
            errorMessage = 'Popup blocked by browser';
            errorType = 'warning';
            break;
        default:
            errorMessage = 'Sign in failed. Try again';
    }

    PopupMessage.show(errorMessage, errorType);
};

// Add success message handler
const handleSuccess = (message) => {
    PopupMessage.show(message, 'success');
};

// Update handleAuthSuccess to prevent multiple popups
const handleAuthSuccess = async (user) => {
    try {
        // Store user data
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userId', user.uid);
        sessionStorage.setItem('displayName', user.displayName || user.email);
        
        // Simple welcome message
        await PopupMessage.show('Login successful', 'success');
        
        setTimeout(() => {
            window.location.href = '../home_screen/home_screen.html';
        }, 1500);
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '../home_screen/home_screen.html';
    }
};

// Enhanced validation function
const validateInput = (email, password) => {
    if (!email) {
        PopupMessage.show('Email required', 'warning');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        PopupMessage.show('Invalid email format', 'warning');
        return false;
    }

    if (!password) {
        PopupMessage.show('Password required', 'warning');
        return false;
    }

    if (password.length < 6) {
        PopupMessage.show('Password too short', 'warning');
        return false;
    }

    return true;
};

// Update social button loading states
const setSocialLoading = (button, isLoading) => {
    button.disabled = isLoading;
    button.style.opacity = isLoading ? '0.7' : '1';
};

// Add after the initial constants
const passwordInput = document.getElementById('password');
const togglePassword = document.querySelector('.toggle-password');

// Remove any existing password toggle event listeners and replace with this one
togglePassword.addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = togglePassword.querySelector('i');
    if (type === 'password') {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
});

// Email/Password Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!validateInput(email, password)) return;

    try {
        setLoading(true);
        // Add persistence
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user) {
            throw new Error('No user data received');
        }

        handleAuthSuccess(userCredential.user);
    } catch (error) {
        console.error('Login Error:', error);
        handleAuthError(error);
        // Clear password on error
        document.getElementById('password').value = '';
    } finally {
        setLoading(false);
    }
});

// Google Login
googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        setSocialLoading(googleBtn, true);
        const result = await signInWithPopup(auth, provider);
        handleAuthSuccess(result.user);
    } catch (error) {
        handleAuthError(error);
    } finally {
        setSocialLoading(googleBtn, false);
    }
});

// Facebook Login
facebookBtn.addEventListener('click', async () => {
    const provider = new FacebookAuthProvider();
    try {
        setSocialLoading(facebookBtn, true);
        const result = await signInWithPopup(auth, provider);
        handleAuthSuccess(result.user);
    } catch (error) {
        handleAuthError(error);
    } finally {
        setSocialLoading(facebookBtn, false);
    }
});
