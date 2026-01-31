
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

import { showToast, toastSuccess, toastError, toastInfo, toastWarning } from './toast-notifications.js'; // ← ADD THIS

// ============================================
// FIREBASE CONFIGURATION
// ============================================
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
const storage = getStorage(app);
// ============================================
// GET DOM ELEMENTS
// ============================================
// These variables store references to HTML elements so we can interact with them
const profileUpdateForm = document.getElementById('profileUpdateForm');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');
const userEmailSpan = document.getElementById('userEmailmessage');

// Profile Picture Elements
const profilePictureInput = document.getElementById('profilePicture');
const profilePicturePreview = document.getElementById('profilePicturePreview');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const removePictureBtn = document.getElementById('removePictureBtn');

// ============================================
// FORM INPUT FIELDS
// ============================================
const displayNameInput = document.getElementById('displayName');
const bioInput = document.getElementById('bio');
const locationInput = document.getElementById('location');
const websiteInput = document.getElementById('website');
const specialtiesInput = document.getElementById('specialties');           // Multi-select dropdown
const yearsInIndustryInput = document.getElementById('yearsInIndustry');  // Single dropdown
const preferredContactInput = document.getElementById('preferredContact'); // Single dropdown
const instagramInput = document.getElementById('instagram');               // Text input (URL)

// Store current user globally
let currentUser = null;

// ============================================
// HELPER FUNCTIONS
// ============================================

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
 * EDUCATIONAL NOTE: Getting values from a multi-select dropdown
 * 
 * When you have a <select multiple> element, you can't just use .value
 * Instead, you need to loop through all options and check which are selected
 * This function returns an array of selected values like: ["Lashes", "Nails", "Haircuts"]
 */
function getSelectedSpecialties() {
    // Get all selected options from the multi-select dropdown
    const selectedOptions = Array.from(specialtiesInput.selectedOptions);
    
    // Extract just the values from those options
    const values = selectedOptions.map(option => option.value);
    
    console.log('Selected specialties:', values); // For debugging
    return values;
}


/**
 * Preview selected image before upload
 */
profilePictureInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Image must be smaller than 5MB', 'error');
            profilePictureInput.value = '';
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            showMessage('Please select an image file', 'error');
            profilePictureInput.value = '';
            return;
        }
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePicturePreview.src = e.target.result;
            removePictureBtn.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
        toastInfo('Image selected and ready to upload');
    }
});

/**
 * Remove/Clear selected picture
 */
removePictureBtn.addEventListener('click', () => {
    profilePictureInput.value = '';
    profilePicturePreview.src = 'https://via.placeholder.com/150/b54dbc/ffffff?text=No+Photo';
    removePictureBtn.style.display = 'none';
    toastInfo('Profile picture cleared');
});

/**
 * Upload profile picture to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} - The download URL of uploaded image
 */
async function uploadProfilePicture(file, userId) {
    return new Promise((resolve, reject) => {
        // Create a unique filename
        const timestamp = Date.now();
        const fileName = `profile_${timestamp}.${file.name.split('.').pop()}`;
        
        // Create storage reference
        const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
        
        // Start upload
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        // Show progress bar
        uploadProgress.style.display = 'block';
        
        // Monitor upload progress
        uploadTask.on('state_changed',
            (snapshot) => {
                // Calculate progress percentage
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
                progressText.textContent = `Uploading: ${Math.round(progress)}%`;
            },
            (error) => {
                // Handle upload error
                console.error('Upload error:', error);
                uploadProgress.style.display = 'none';
                reject(error);
            },
            async () => {
                // Upload completed successfully
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    uploadProgress.style.display = 'none';
                    progressBar.style.width = '0%';
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

/**
 * Delete old profile picture from Storage
 * @param {string} photoURL - The URL of the photo to delete
 */
async function deleteOldProfilePicture(photoURL) {
    if (!photoURL || photoURL.includes('placeholder')) {
        return; // Nothing to delete
    }
    
    try {
        // Extract the file path from the URL
        const baseURL = 'https://firebasestorage.googleapis.com/v0/b/';
        if (photoURL.startsWith(baseURL)) {
            const filePath = decodeURIComponent(
                photoURL.split('/o/')[1].split('?')[0]
            );
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
            console.log('Old profile picture deleted');
        }
    } catch (error) {
        console.error('Error deleting old picture:', error);
        // Don't throw error - not critical if old picture deletion fails
    }
}


/**
 * Load existing profile data from Firestore
 * @param {string} userId - The user's UID
 * 
 * EDUCATIONAL NOTE: This function retrieves existing data from Firestore
 * and populates the form fields. This lets users edit their existing profile.
 */
async function loadProfileData(userId) {
    try {
        // Reference to the user's document in the 'users' collection
        // Path structure: users/{userId}
        const userDocRef = doc(db, 'users', userId);
        
        // Fetch the document from Firestore
        const userDoc = await getDoc(userDocRef);
        
        // Check if document exists
        if (userDoc.exists()) {
            // Document exists - populate form with existing data
            const data = userDoc.data();
            
            console.log('Loading profile data:', data); // For debugging
            
            // Populate general fields (if they exist in Firestore)
            displayNameInput.value = data.displayName || '';
            bioInput.value = data.bio || '';
            locationInput.value = data.location || '';
            websiteInput.value = data.website || '';
            
            //Populate Profile Picture if exists
            if (data.profilePhotoURL) {
                profilePicturePreview.src = data.profilePhotoURL;
                removePictureBtn.style.display = 'inline-block';
            } 
           
            // For Instagram (simple text input)
            instagramInput.value = data.instagram || '';
            
            // For Years in Industry (dropdown)
            if (data.yearsInIndustry) {
                yearsInIndustryInput.value = data.yearsInIndustry;
            }
            
            // For Preferred Contact (dropdown)
            if (data.preferredContact) {
                preferredContactInput.value = data.preferredContact;
            }
            
            // For Specialties (multi-select dropdown)
            // EDUCATIONAL NOTE: Setting multi-select values is tricky
            // We need to loop through all options and mark the ones that match
            if (data.specialties && Array.isArray(data.specialties)) {
                // Loop through each option in the dropdown
                Array.from(specialtiesInput.options).forEach(option => {
                    // Check if this option's value is in the saved specialties array
                    if (data.specialties.includes(option.value)) {
                        option.selected = true; // Mark it as selected
                    }
                });
            }
            
            console.log('Profile data loaded successfully');
            toastInfo('Profile data loaded');
        } else {
            // Document doesn't exist yet - this is a new profile
            console.log('No existing profile found. Ready to create new profile.');
            toastInfo('Ready to create your profile');
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        toastError('Error loading profile data: ' + error.message);
    }
}

/**
 * Save or update profile data in Firestore
 * @param {Object} profileData - The profile data to save
 * 
 * EDUCATIONAL NOTE: This function handles both creating NEW profiles
 * and updating EXISTING profiles. It checks if the document exists first.
 */
async function saveProfileData(profileData) {
    try {
        // Reference to the user's document
        // Path: users/{currentUser.uid}
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Check if document already exists
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            // ============================================
            // DOCUMENT EXISTS - UPDATE IT
            // ============================================
            // updateDoc only updates specified fields, leaving others unchanged
            await updateDoc(userDocRef, {
                ...profileData,
                updatedAt: serverTimestamp() // Add timestamp of last update
            });
            
            console.log('Profile updated successfully');
            toastSuccess('Profile updated successfully!');
        } else {
            // ============================================
            // DOCUMENT DOESN'T EXIST - CREATE IT
            // ============================================
            // setDoc creates a new document with all specified fields
            await setDoc(userDocRef, {
                ...profileData,
                email: currentUser.email,    // Store email for reference
                approved: false,             // New users start as unapproved
                approvedAt: null,           // Will be set when admin approves
                createdAt: serverTimestamp(), // Add creation timestamp
                updatedAt: serverTimestamp()  // Add update timestamp
            });
            console.log('Profile created successfully');
            toastSuccess('Profile created successfully! Awaiting admin approval.');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        toastError('Error saving profile: ' + error.message);
        throw error; // Re-throw to handle in form submit
    }
}

/**
 * Handle form submission
 * 
 * EDUCATIONAL NOTE: This is the main function that runs when the user
 * clicks "Save Profile". It gathers all form data and sends it to Firestore.
 */
profileUpdateForm.addEventListener('submit', async (e) => {
    // Prevent default form submission behavior (which would reload the page)
    e.preventDefault();
    
    // Check if user is authenticated
    if (!currentUser) {
        toastError('You must be logged in to update your profile');
        return;
    }
    
    // Disable submit button to prevent double-submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        let newPhotoURL = null;
        const file = profilePictureInput.files[0];
        
        if (file) {
            try {
                toastInfo('Uploading profile picture...');
                newPhotoURL = await uploadProfilePicture(file, currentUser.uid);
                
                // Delete old picture if exists
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().profilePhotoURL) {
                    await deleteOldProfilePicture(userDoc.data().profilePhotoURL);
                }
                toastSuccess('Profile picture uploaded successfully!');
            } catch (error) {
                console.error('Error uploading picture:', error);
                toastError('Error uploading picture: ' + error.message);
                throw error;
            }
        }

    // determine which Photo URL to use:
    let existingPhotoURL = null;
    if (!newPhotoURL) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().profilePhotoURL) {
            existingPhotoURL = userDoc.data().profilePhotoURL;
        }
    }
        // ============================================
        // GATHER FORM DATA - UPDATED FOR NEW FIELDS
        // ============================================
        // Create an object with all the profile data
        const profileData = {
            displayName: displayNameInput.value.trim(),
            bio: bioInput.value.trim(),
            location: locationInput.value.trim(),
            website: websiteInput.value.trim(),
            specialties: getSelectedSpecialties(),             // Array: ["Lashes", "Nails"]
            yearsInIndustry: yearsInIndustryInput.value,       // String: "3-5"
            preferredContact: preferredContactInput.value,     // String: "Instagram"
            instagram: instagramInput.value.trim(),            // String: "https://instagram.com/..."
            profilePhotoURL: newPhotoURL || existingPhotoURL || null
            // profilePhotoURL: (await getDoc(userDocRef)).data()?.profilePhotoURL || null
        };

        console.log('Saving profile data:', profileData); // For debugging
        
        // Save to Firestore
        await saveProfileData(profileData);
        
    } catch (error) {
        // Error already handled in saveProfileData, but we catch here
        // to ensure the button gets re-enabled
        console.error('Form submission error:', error);
    } finally {
        // Re-enable submit button (happens whether save succeeded or failed)
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Profile';
    }
});

/**
 * Initialize the page - check authentication state
 * 
 * EDUCATIONAL NOTE: This runs automatically when the page loads.
 * It checks if a user is logged in, and if so, loads their profile data.
 */
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        currentUser = user;
        userEmailSpan.textContent = user.email; // Fixed typo from original (was userEmailmessage)
        
        // Load existing profile data for this user
        loadProfileData(user.uid);
        
        console.log('User authenticated:', user.uid);
    } else {
        // User is not signed in - redirect to login page
        console.log('No user authenticated, redirecting to login');
        toastError('Please log in to access this page');
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html'; // Adjust path as needed
        }, 2000);
    }
});
