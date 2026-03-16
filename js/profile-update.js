import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { showToast, toastSuccess, toastError, toastInfo, toastWarning } from './toast-notifications.js';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyB2DccAwpNnzfNPhhP6KQJ58xVOEFsLB8Y",
  authDomain: "lhok-e77ba.firebaseapp.com",
  projectId: "lhok-e77ba",
  storageBucket: "lhok-e77ba.firebasestorage.app",
  messagingSenderId: "228980882242",
  appId: "1:228980882242:web:6c5a9f0c36544aba03e6db"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ============================================
// GET DOM ELEMENTS
// ============================================
const profileUpdateForm = document.getElementById('profileUpdateForm');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');
const userEmailSpan = document.getElementById('userEmailmessage');

// User type
const typeProfessional = document.getElementById('typeProfessional');
const typeClient = document.getElementById('typeClient');
const userTypeLocked = document.getElementById('userTypeLocked');

// Profile picture (shared)
const profilePictureInput = document.getElementById('profilePicture');
const profilePicturePreview = document.getElementById('profilePicturePreview');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const removePictureBtn = document.getElementById('removePictureBtn');

// Form fields
const displayNameInput = document.getElementById('displayName');
const bioInput = document.getElementById('bio');
const locationInput = document.getElementById('location');
const websiteInput = document.getElementById('website');
const instagramInput = document.getElementById('instagram');
const specialtiesInput = document.getElementById('specialties');
const servicesLookingForInput = document.getElementById('servicesLookingFor');
const yearsInIndustryInput = document.getElementById('yearsInIndustry');
const preferredContactInput = document.getElementById('preferredContact');

// Field groups
const professionalOnlyFields = document.querySelectorAll('.professional-only');
const clientOnlyFields = document.querySelectorAll('.client-only');

let currentUser = null;

// ============================================
// USER TYPE TOGGLE
// ============================================
function applyUserTypeUI(userType) {
    const isProfessional = userType === 'professional';
    professionalOnlyFields.forEach(el => { el.style.display = isProfessional ? '' : 'none'; });
    clientOnlyFields.forEach(el => { el.style.display = isProfessional ? 'none' : ''; });
}

typeProfessional.addEventListener('change', () => applyUserTypeUI('professional'));
typeClient.addEventListener('change', () => applyUserTypeUI('client'));

function lockUserType(userType) {
    typeProfessional.disabled = true;
    typeClient.disabled = true;
    userTypeLocked.style.display = 'block';
    typeProfessional.checked = userType === 'professional';
    typeClient.checked = userType === 'client';
    applyUserTypeUI(userType);
}

// ============================================
// HELPERS
// ============================================
function getSelectedValues(selectEl) {
    return Array.from(selectEl.selectedOptions).map(opt => opt.value);
}

// Set preview image — empty src shows the SVG placeholder via CSS
function setProfilePicturePreview(url) {
    if (url) {
        profilePicturePreview.src = url;
        removePictureBtn.style.display = 'inline-block';
    } else {
        profilePicturePreview.src = '';
        removePictureBtn.style.display = 'none';
    }
}

// ============================================
// PROFILE PICTURE — preview on file select
// ============================================
profilePictureInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        toastError('Image must be smaller than 5MB');
        profilePictureInput.value = '';
        return;
    }
    if (!file.type.startsWith('image/')) {
        toastError('Please select an image file');
        profilePictureInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        profilePicturePreview.src = e.target.result;
        removePictureBtn.style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
    toastInfo('Image selected and ready to upload');
});

removePictureBtn.addEventListener('click', () => {
    profilePictureInput.value = '';
    setProfilePicturePreview(null);
    toastInfo('Profile picture cleared');
});

// ============================================
// UPLOAD PROFILE PICTURE TO FIREBASE STORAGE
// ============================================
async function uploadProfilePicture(file, userId) {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const fileName = `profile_${timestamp}.${ext}`;
        const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadProgress.style.display = 'block';

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
                progressText.textContent = `Uploading: ${Math.round(progress)}%`;
            },
            (error) => {
                console.error('Upload error:', error);
                uploadProgress.style.display = 'none';
                reject(error);
            },
            async () => {
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

// ============================================
// DELETE OLD PROFILE PICTURE FROM STORAGE
// ============================================
async function deleteOldProfilePicture(photoURL) {
    if (!photoURL) return;
    try {
        const baseURL = 'https://firebasestorage.googleapis.com/v0/b/';
        if (photoURL.startsWith(baseURL)) {
            const filePath = decodeURIComponent(photoURL.split('/o/')[1].split('?')[0]);
            await deleteObject(ref(storage, filePath));
        }
    } catch (error) {
        console.error('Error deleting old picture — non-critical:', error);
    }
}

// ============================================
// LOAD EXISTING PROFILE DATA
// ============================================
async function loadProfileData(userId) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('Loading profile data:', data);

            // Lock user type if already set
            if (data.userType) lockUserType(data.userType);

            // Shared fields
            displayNameInput.value = data.displayName || '';
            bioInput.value = data.bio || '';
            locationInput.value = data.location || '';
            instagramInput.value = data.instagram || '';

            // Profile picture — shared for all user types
            setProfilePicturePreview(data.profilePhotoURL || null);

            // Professional-only fields
            if (data.userType === 'professional') {
                if (websiteInput) websiteInput.value = data.website || '';
                if (data.yearsInIndustry) yearsInIndustryInput.value = data.yearsInIndustry;
                if (data.preferredContact) preferredContactInput.value = data.preferredContact;
                if (data.specialties && Array.isArray(data.specialties)) {
                    Array.from(specialtiesInput.options).forEach(opt => {
                        opt.selected = data.specialties.includes(opt.value);
                    });
                }
            }

            // Client-only fields
            if (data.userType === 'client') {
                if (data.servicesLookingFor && Array.isArray(data.servicesLookingFor)) {
                    Array.from(servicesLookingForInput.options).forEach(opt => {
                        opt.selected = data.servicesLookingFor.includes(opt.value);
                    });
                }
            }

            toastInfo('Profile data loaded');
        } else {
            console.log('No existing profile — ready to create.');
            toastInfo('Ready to create your profile');
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        toastError('Error loading profile data: ' + error.message);
    }
}

// ============================================
// SAVE PROFILE DATA
// On UPDATE: userType is only written if it was missing from the document
// (handles accounts created before userType was added).
// On CREATE: full data including approval fields for professionals.
// ============================================
async function saveProfileData(profileData) {
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const existingData = userDoc.data();
            const { userType, ...updateData } = profileData;

            // If the document is missing userType (older account), write it now
            if (!existingData.userType && userType) {
                updateData.userType = userType;

                // Also backfill approval fields for professionals if missing
                if (userType === 'professional' && existingData.approved === undefined) {
                    updateData.approved = false;
                    updateData.approvedAt = null;
                }
            }

            await updateDoc(userDocRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
            toastSuccess('Profile updated successfully!');

        } else {
            // New document
            const baseData = {
                ...profileData,
                email: currentUser.email,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (profileData.userType === 'professional') {
                baseData.approved = false;
                baseData.approvedAt = null;
            }

            await setDoc(userDocRef, baseData);
            toastSuccess(profileData.userType === 'professional'
                ? 'Profile created! Awaiting admin approval.'
                : 'Profile created successfully!');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        toastError('Error saving profile: ' + error.message);
        throw error;
    }
}

// ============================================
// FORM SUBMISSION
// ============================================
profileUpdateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        toastError('You must be logged in to update your profile');
        return;
    }

    const selectedType = document.querySelector('input[name="userType"]:checked');
    if (!selectedType) {
        toastError('Please select whether you are a professional or a client');
        return;
    }
    const userType = selectedType.value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        // Handle profile picture upload
        let newPhotoURL = null;
        if (profilePictureInput.files[0]) {
            try {
                toastInfo('Uploading profile picture...');
                newPhotoURL = await uploadProfilePicture(profilePictureInput.files[0], currentUser.uid);

                // Delete old picture from Storage
                const snap = await getDoc(doc(db, 'users', currentUser.uid));
                if (snap.exists() && snap.data().profilePhotoURL) {
                    await deleteOldProfilePicture(snap.data().profilePhotoURL);
                }
                toastSuccess('Profile picture uploaded!');
            } catch (error) {
                toastError('Error uploading picture: ' + error.message);
                throw error;
            }
        }

        // Keep existing photo URL if no new file was selected
        let existingPhotoURL = null;
        if (!newPhotoURL) {
            const snap = await getDoc(doc(db, 'users', currentUser.uid));
            if (snap.exists()) existingPhotoURL = snap.data().profilePhotoURL || null;
        }

        // Build profile data object
        let profileData = {
            userType,
            displayName: displayNameInput.value.trim(),
            bio: bioInput.value.trim(),
            location: locationInput.value.trim(),
            instagram: instagramInput.value.trim(),
            profilePhotoURL: newPhotoURL || existingPhotoURL || null,
        };

        if (userType === 'professional') {
            profileData = {
                ...profileData,
                website: websiteInput ? websiteInput.value.trim() : '',
                specialties: getSelectedValues(specialtiesInput),
                yearsInIndustry: yearsInIndustryInput.value,
                preferredContact: preferredContactInput.value,
            };
        } else {
            profileData = {
                ...profileData,
                servicesLookingFor: getSelectedValues(servicesLookingForInput),
            };
        }

        console.log('Saving profile data:', profileData);
        await saveProfileData(profileData);

    } catch (error) {
        console.error('Form submission error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Profile';
    }
});

// ============================================
// AUTH STATE
// ============================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userEmailSpan.textContent = user.email;
        loadProfileData(user.uid);
        console.log('User authenticated:', user.uid);
    } else {
        toastError('Please log in to access this page');
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    }
});