import { auth, db } from '../../firebase/firebase.js';
import { createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { PopupMessage } from '../../components/popup_message/popup.js';

const signUpForm = document.getElementById('signUpForm');
const googleBtn = document.querySelector('.social-btn:nth-child(1)');
const facebookBtn = document.querySelector('.social-btn:nth-child(2)');

// Helper function to store user data
async function storeUserData(user, additionalData = {}) {
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            email: user.email,
            displayName: additionalData.name || '',
            createdAt: new Date().toISOString(),
            settings: {
                currency: 'USD',
                monthlyBudget: 0,
                notifications: true
            }
        });
        console.log('User data stored successfully');
        return true;
    } catch (error) {
        console.error("Error storing user data:", error);
        throw error;
    }
}

// Email/Password Sign Up
const handleSignUp = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!validateInputs(name, email, password)) return;

    try {
        setLoading(true);
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Store additional user data
        await storeUserData(userCredential.user, { name });
        
        // Show success and redirect
        PopupMessage.show('Account created successfully! Redirecting...', 'success');
        
        // Set session data
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userId', userCredential.user.uid);
        sessionStorage.setItem('displayName', name || email);

        // Redirect after success message
        setTimeout(() => {
            window.location.href = '../home_screen/home_screen.html';
        }, 2000);

    } catch (error) {
        console.error('Signup error:', error);
        handleAuthError(error);
    } finally {
        setLoading(false);
    }
};

signUpForm.addEventListener('submit', handleSignUp);

// Add this to your existing error handler
const handleAuthError = (error) => {
    let message = 'An error occurred during sign up.';
    let type = 'error';

    switch (error.code) {
        case 'auth/email-already-in-use':
            message = 'This email is already registered. Please login instead.';
            break;
        case 'auth/invalid-email':
            message = 'Please enter a valid email address.';
            break;
        case 'auth/operation-not-allowed':
            message = 'Sign up is currently disabled. Please try again later.';
            break;
        case 'auth/weak-password':
            message = 'Password is too weak. Please use at least 6 characters.';
            break;
        // Add Firestore specific errors
        case 'permission-denied':
            message = 'Unable to create user profile. Please try again.';
            break;
        default:
            message = error.message || 'Sign up failed. Please try again.';
    }

    PopupMessage.show(message, type);
};

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
