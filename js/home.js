// Dashboard view for logiged in users

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// ============================================
// FIREBASE CONFIG
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyB2DccAwpNnzfNPhhP6KQJ58xVOEFsLB8Y",
    authDomain: "lhok-e77ba.firebaseapp.com",
    projectId: "lhok-e77ba",
    storageBucket: "lhok-e77ba.firebasestorage.app",
    messagingSenderId: "228980882242",
    appId: "1:228980882242:web:17bdb6c26604b0ae03e6db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ============================================
// DOM ELEMENTS
// ============================================
const welcomeMessage = document.getElementById('welcome-message');
const fullNameElement = document.getElementById('full-name');
const emailElement = document.getElementById('email');
const userIdElement = document.getElementById('user-id');
const accountCreatedElement = document.getElementById('account-created');
const signOutButton = document.getElementById('sign-out-button');

// ============================================
// CHECK AUTHENTICATION & DISPLAY USER DATA
// ============================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in - display their information
        
        // Extract first name from display name
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Friend';
        
        // Update welcome message with first name
        welcomeMessage.textContent = `Hello, ${firstName}! 👋`;
        
        // Display full profile information
        fullNameElement.textContent = user.displayName || 'Not set';
        emailElement.textContent = user.email;
        userIdElement.textContent = user.uid;
        accountCreatedElement.textContent = new Date(user.metadata.creationTime).toLocaleDateString();
        
    } else {
        // No user is signed in - redirect to auth page
        window.location.href = 'login.html';
    }
});

// ============================================
// SIGN OUT FUNCTIONALITY
// ============================================
signOutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        // onAuthStateChanged will handle redirect to auth page
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
});