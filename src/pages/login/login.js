import { auth } from '../../../firebase/firebase.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const googleBtn = document.querySelector('.social-btn:nth-child(1)');
const facebookBtn = document.querySelector('.social-btn:nth-child(2)');

// Utility functions
const setLoading = (isLoading) => {
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Logging in...' : 'Login';
};

const handleAuthSuccess = (user) => {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userEmail', user.email);
    sessionStorage.setItem('userId', user.uid);
    sessionStorage.setItem('displayName', user.displayName || user.email);
    window.location.href = '../home_screen/home_screen.html';
};

// Add this after the initial constants
const createPopup = (message, type = 'error') => {
    const popup = document.createElement('div');
    popup.className = `popup-message ${type}`;
    popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    document.body.appendChild(popup);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        popup.remove();
    }, 5000);
};

// Replace the handleAuthError function with this enhanced version
const handleAuthError = (error) => {
    let errorMessage = '';
    switch (error.code) {
        case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
        case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
        case 'auth/user-not-found':
            errorMessage = 'No account found with this email. Please sign up first.';
            break;
        case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
        case 'auth/popup-closed-by-user':
            errorMessage = 'Login popup was closed. Please try again.';
            break;
        case 'auth/cancelled-popup-request':
            errorMessage = 'Login process cancelled. Please try again.';
            break;
        case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
        default:
            errorMessage = error.message;
    }
    createPopup(errorMessage, 'error');
};

// Enhanced validation function
const validateInput = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        createPopup('Please enter a valid email address', 'error');
        return false;
    }
    if (password.length < 6) {
        createPopup('Password must be at least 6 characters long', 'error');
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        handleAuthSuccess(userCredential.user);
    } catch (error) {
        handleAuthError(error);
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
