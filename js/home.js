// Dashboard view for logged in users

// ============================================
// IMPORTS
// ============================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// ============================================
// FIREBASE SERVICES
// ============================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// DOM ELEMENTS
// ============================================
const welcomeMessage = document.getElementById('welcome-message');
const emailElement = document.getElementById('email');
const avatarInitials = document.getElementById('avatar-initials');
const signOutButton = document.getElementById('sign-out-button');
const submitFeedbackBtn = document.getElementById('submit-feedback-btn');
const thankyouMsg = document.getElementById('thankyou-msg');
const pollOptions = document.querySelectorAll('.poll-option');

// ============================================
// STATE
// ============================================
let selectedFeature = null;
let currentUser = null;

// ============================================
// CHECK AUTHENTICATION & DISPLAY USER DATA
// ============================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;

        // Extract first name
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Friend';

        // Update welcome message
        welcomeMessage.textContent = `Hello, ${firstName}! 👋`;

        // Show email
        emailElement.textContent = user.email;

        // Generate initials for avatar circle
        if (user.displayName) {
            const words = user.displayName.trim().split(' ');
            const initials = words.length >= 2
                ? words[0][0] + words[words.length - 1][0]
                : words[0][0];
            avatarInitials.textContent = initials.toUpperCase();
        } else {
            avatarInitials.textContent = '?';
        }

    } else {
        // No user signed in — redirect to login
        window.location.href = 'login.html';
    }
});

// ============================================
// SIGN OUT
// ============================================
signOutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        // onAuthStateChanged handles redirect
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
});

// ============================================
// POLL - OPTION SELECTION
// ============================================
pollOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Deselect all
        pollOptions.forEach(o => o.classList.remove('selected'));

        // Select clicked
        option.classList.add('selected');
        selectedFeature = option.getAttribute('data-value');

        // Enable submit button
        submitFeedbackBtn.disabled = false;
    });
});

// ============================================
// POLL - SUBMIT FEEDBACK TO FIRESTORE
// ============================================
submitFeedbackBtn.addEventListener('click', async () => {
    if (!selectedFeature) return;

    submitFeedbackBtn.disabled = true;
    submitFeedbackBtn.textContent = 'Sending...';

    try {
        await addDoc(collection(db, 'dashboardFeedback'), {
            feature: selectedFeature,
            userEmail: currentUser?.email || 'anonymous',
            userId: currentUser?.uid || null,
            timestamp: serverTimestamp()
        });

        // Show thank you message
        thankyouMsg.classList.add('visible');
        submitFeedbackBtn.textContent = '✓ Vote Sent';

        // Deselect all options visually
        pollOptions.forEach(o => o.classList.remove('selected'));
        selectedFeature = null;

    } catch (error) {
        console.error('Error submitting feedback:', error);
        submitFeedbackBtn.disabled = false;
        submitFeedbackBtn.textContent = 'Send My Vote';
        alert('Something went wrong. Please try again.');
    }
});