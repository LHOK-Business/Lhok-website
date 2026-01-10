// Import Firebase modules (adjust path/config based on your setup)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your Firebase configuration (replace with your actual config)
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
const db = getFirestore(app);

// Get DOM elements
const profileUpdateForm = document.getElementById('profileUpdateForm');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');
const userEmailSpan = document.getElementById('userEmail');

// Form input fields
const displayNameInput = document.getElementById('displayName');
const phoneNumberInput = document.getElementById('phoneNumber');
const bioInput = document.getElementById('bio');
const locationInput = document.getElementById('location');
const websiteInput = document.getElementById('website');

// Store current user globally
let currentUser = null;

/**
 * Display a message to the user
 * @param {string} text - Message text to display
 * @param {string} type - Message type ('success' or 'error')
 */
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

/**
 * Load existing profile data from Firestore
 * @param {string} userId - The user's UID
 */
async function loadProfileData(userId) {
    try {
        // Reference to the user's document in the 'users' collection
        const userDocRef = doc(db, 'users', userId);
        
        // Fetch the document
        const userDoc = await getDoc(userDocRef);
        
        // Check if document exists
        if (userDoc.exists()) {
            // Document exists - populate form with existing data
            const data = userDoc.data();
            
            displayNameInput.value = data.displayName || '';
            phoneNumberInput.value = data.phoneNumber || '';
            bioInput.value = data.bio || '';
            locationInput.value = data.location || '';
            websiteInput.value = data.website || '';
            
            console.log('Profile data loaded successfully');
        } else {
            // Document doesn't exist yet - this is a new profile
            console.log('No existing profile found. Ready to create new profile.');
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        showMessage('Error loading profile data: ' + error.message, 'error');
    }
}

/**
 * Save or update profile data in Firestore
 * @param {Object} profileData - The profile data to save
 */
async function saveProfileData(profileData) {
    try {
        // Reference to the user's document
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Check if document already exists
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            // Document exists - UPDATE existing document
            // Note: updateDoc only updates specified fields, leaving others unchanged
            await updateDoc(userDocRef, {
                ...profileData,
                updatedAt: serverTimestamp() // Add timestamp of last update
            });
            
            console.log('Profile updated successfully');
            showMessage('Profile updated successfully!', 'success');
        } else {
            // Document doesn't exist - CREATE new document
            // Note: setDoc creates a new document with all specified fields
            await setDoc(userDocRef, {
                ...profileData,
                email: currentUser.email, // Store email for reference
                approved: false, // Store new users as unapproved
                approvedAt: null, // Will store when user was approved by admins
                createdAt: serverTimestamp(), // Add creation timestamp
                updatedAt: serverTimestamp() // Add update timestamp
            });
            
            console.log('Profile created successfully');
            showMessage('Profile created successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showMessage('Error saving profile: ' + error.message, 'error');
        throw error; // Re-throw to handle in form submit
    }
}

/**
 * Handle form submission
 */
profileUpdateForm.addEventListener('submit', async (e) => {
    // Prevent default form submission behavior
    e.preventDefault();
    
    // Check if user is authenticated
    if (!currentUser) {
        showMessage('You must be logged in to update your profile', 'error');
        return;
    }
    
    // Disable submit button to prevent double-submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        // Gather form data into an object
        const profileData = {
            displayName: displayNameInput.value.trim(),
            phoneNumber: phoneNumberInput.value.trim(),
            bio: bioInput.value.trim(),
            location: locationInput.value.trim(),
            website: websiteInput.value.trim()
        };
        
        // Save to Firestore
        await saveProfileData(profileData);
        
    } catch (error) {
        // Error already handled in saveProfileData, but we catch here
        // to ensure the button gets re-enabled
        console.error('Form submission error:', error);
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Profile';
    }
});

/**
 * Initialize the page - check authentication state
 */
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        currentUser = user;
        userEmailmessage.textContent = user.email;
        
        // Load existing profile data
        loadProfileData(user.uid);
        
        console.log('User authenticated:', user.uid);
    } else {
        // User is not signed in - redirect to login page
        console.log('No user authenticated, redirecting to login');
        showMessage('Please log in to access this page', 'error');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html'; // Adjust path as needed
        }, 2000);
    }
});