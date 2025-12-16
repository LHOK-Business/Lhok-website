// Authentication script using Firebase Authentication

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// ============================================
// FIREBASE CONFIG - REPLACE WITH YOUR VALUES
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyB2DccAwpNnzfNPhhP6KQJ58xVOEFsLB8Y",
  authDomain: "lhok-e77ba.firebaseapp.com",
  projectId: "lhok-e77ba",
  storageBucket: "lhok-e77ba.firebasestorage.app",
  messagingSenderId: "228980882242",
  appId: "1:228980882242:web:6c5a9f0c36544aba03e6db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ============================================
// DOM ELEMENTS
// ============================================
const authTitle = document.getElementById('auth-title');
const authButton = document.getElementById('auth-button');
const googleButton = document.getElementById('google-button');
const toggleButton = document.getElementById('toggle-button');
const errorMessage = document.getElementById('error-message');
const nameFields = document.getElementById('name-fields');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');

// ============================================
// STATE
// ============================================
let isSignUpMode = false;

// ============================================
// CHECK IF USER IS ALREADY LOGGED IN
// ============================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, redirect to home page
        window.location.href = 'home.html'; // CHANGE THIS to your home page filename
    }
});

// ============================================
// TOGGLE BETWEEN SIGN IN / SIGN UP
// ============================================
toggleButton.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    
    if (isSignUpMode) {
        authTitle.textContent = 'Create Account';
        authButton.textContent = 'Sign Up';
        toggleButton.textContent = 'Already have an account? Sign in';
        nameFields.classList.remove('hidden');
    } else {
        authTitle.textContent = 'Sign In';
        authButton.textContent = 'Sign In';
        toggleButton.textContent = "Don't have an account? Sign up";
        nameFields.classList.add('hidden');
    }
    
    hideError();
});

// ============================================
// SHOW/HIDE ERROR MESSAGE
// ============================================
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// ============================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================
authButton.addEventListener('click', async () => {
    hideError();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }


    // Basic email format validation
    if (!email.includes('@') || !email.includes('.')) {
    showError('Please enter a valid email address');
    return;
    }

    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }
    
    
    try {
        if (isSignUpMode) {
            // Sign Up
            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();
            
            if (!firstName || !lastName) {
                showError('Please enter your first and last name');
                return;
            }
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Set the user's display name
            await updateProfile(userCredential.user, {
                displayName: `${firstName} ${lastName}`
            });
            
            // Redirect to home page
            window.location.href = 'home.html'; // CHANGE THIS to your home page filename
        } else {
            // Sign In
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle redirect
        }
    } catch (error) {
        showError(error.message);
    }
});

// ============================================
// GOOGLE AUTHENTICATION
// ============================================
googleButton.addEventListener('click', async () => {
    hideError();
    
    try {
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged will handle redirect
    } catch (error) {
        showError(error.message);
    }
});

// ============================================
// ENTER KEY SUPPORT
// ============================================
[emailInput, passwordInput, firstNameInput, lastNameInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            authButton.click();
        }
    });
});