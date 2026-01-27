// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Your Firebase configuration
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
const db = getFirestore(app);

// Get DOM elements
const loadingDiv = document.getElementById('loadingDiv');
const profilesGrid = document.getElementById('profilesGrid');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get initials from display name for avatar
 * This creates the circular letter avatar (e.g., "JD" for "John Doe")
 */
function getInitials(name) {
    if (!name) return '?';
    
    // Split name into words and get first letter of each
    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
    
    // Return first letter of first and last word
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Create a profile card element with updated fields
 * 
 * @param {Object} userData - The user's profile data from Firestore
 * @returns {HTMLElement} - The complete profile card element
 * 
 * EDUCATIONAL NOTE FOR UI DESIGNERS:
 * This function generates the HTML for each profile card.
 * All styling is done through CSS classes from your main.css
 * To change the appearance:
 *   1. Find the class name (e.g., "profile-card")
 *   2. Add/edit styles in your CSS file
 *   3. The changes will apply to all cards automatically
 */
function createProfileCard(userData) {
    // ============================================
    // CREATE CARD CONTAINER
    // ============================================
    const card = document.createElement('div');
    card.className = 'profile-card'; // 🎨 STYLE THIS CLASS in your CSS
    
    // Get user initials for avatar
    const initials = getInitials(userData.displayName);

    // ============================================
    // BUILD CARD HTML
    // ============================================
    let cardHTML = '';
    
    // --------------------------------------------
    // AVATAR SECTION
    // --------------------------------------------
    // 🎨 STYLE .profile-avatar in CSS to change avatar appearance
    if (userData.profilePhotoURL) {
        // User has uploaded a picture - show it
        cardHTML += `
            <div class="profile-photo-container">
                <img src="${userData.profilePhotoURL}" 
                    alt="${userData.displayName}'s profile picture" 
                    class="profile-photo">
            </div>
        `;
    } else {
        // No picture - show initials avatar
        cardHTML += `
            <div class="profile-avatar">${initials}</div>
        `;
    }
    
    // --------------------------------------------
    // NAME SECTION
    // --------------------------------------------
    // 🎨 STYLE .profile-name in CSS to change name appearance
    cardHTML += `
        <div class="profile-name">${userData.displayName || 'Anonymous'}</div>
    `;
    
    // --------------------------------------------
    // EMAIL SECTION
    // --------------------------------------------
    // 🎨 STYLE .profile-email in CSS to change email appearance
    cardHTML += `
        <div class="profile-email">${userData.email || ''}</div>
    `;
    
    // --------------------------------------------
    // SPECIALTIES SECTION (NEW)
    // --------------------------------------------
    // Display specialties as tags/badges if they exist
    if (userData.specialties && Array.isArray(userData.specialties) && userData.specialties.length > 0) {
        cardHTML += `<div class="profile-specialties">`; // 🎨 STYLE THIS CLASS
        
        // Loop through each specialty and create a tag
        userData.specialties.forEach(specialty => {
            cardHTML += `<span class="specialty-tag">${specialty}</span>`; // 🎨 STYLE THIS CLASS
        });
        
        cardHTML += `</div>`;
    }
    
    // --------------------------------------------
    // BIO SECTION (KEPT)
    // --------------------------------------------
    // 🎨 STYLE .profile-bio in CSS to change bio appearance
    if (userData.bio) {
        cardHTML += `
            <div class="profile-bio">
                "${userData.bio}"
            </div>
        `;
    }
    
    // ============================================
    // PROFILE INFO SECTION (Location, Years, Contact)
    // ============================================
    cardHTML += '<div class="profile-info">'; // 🎨 STYLE THIS CLASS
    
    // --------------------------------------------
    // YEARS IN INDUSTRY (NEW)
    // --------------------------------------------
    if (userData.yearsInIndustry) {
        cardHTML += `
            <div class="info-item">
                <div class="info-icon">⏱️</div>
                <div class="info-text">${userData.yearsInIndustry} years</div>
            </div>
        `;
    }
    
    // --------------------------------------------
    // LOCATION (KEPT - existing field)
    // --------------------------------------------
    if (userData.location) {
        cardHTML += `
            <div class="info-item">
                <div class="info-icon">📍</div>
                <div class="info-text">${userData.location}</div>
            </div>
        `;
    }
    
    // --------------------------------------------
    // PREFERRED CONTACT METHOD (NEW)
    // --------------------------------------------
    if (userData.preferredContact) {
        // Choose an appropriate icon based on the contact method
        let contactIcon = '💬'; // Default icon
        if (userData.preferredContact === 'Email') contactIcon = '📧';
        if (userData.preferredContact === 'Phone') contactIcon = '📞';
        if (userData.preferredContact === 'Instagram') contactIcon = '📸';
        if (userData.preferredContact === 'Website') contactIcon = '🌐';
        
        cardHTML += `
            <div class="info-item">
                <div class="info-icon">${contactIcon}</div>
                <div class="info-text">Contact via ${userData.preferredContact}</div>
            </div>
        `;
    }
    
    // Close profile info section
    cardHTML += '</div>'; // End of profile-info
    
    // ============================================
    // SOCIAL LINKS SECTION
    // ============================================
    cardHTML += '<div class="profile-links">'; // 🎨 STYLE THIS CLASS for spacing
    
    // --------------------------------------------
    // INSTAGRAM LINK (NEW - separate from website)
    // --------------------------------------------
    if (userData.instagram) {
        cardHTML += `
            <a href="${userData.instagram}" target="_blank" rel="noopener noreferrer" class="social-link instagram-link">
                <span class="link-icon">📸</span>
                <span class="link-text">Instagram</span>
            </a>
        `;
        // 🎨 STYLE .social-link and .instagram-link in CSS
        // Example: .instagram-link { background: linear-gradient(...); }
    }
    
    // --------------------------------------------
    // WEBSITE LINK (KEPT - existing field)
    // --------------------------------------------
    if (userData.website) {
        cardHTML += `
            <a href="${userData.website}" target="_blank" rel="noopener noreferrer" class="social-link website-link">
                <span class="link-icon">🌐</span>
                <span class="link-text">Visit Website</span>
            </a>
        `;
        // 🎨 STYLE .website-link in CSS
    }
    
    cardHTML += '</div>'; // End of profile-links
    
    // Set the HTML content of the card
    card.innerHTML = cardHTML;
    
    return card;
}

/**
 * Load approved profiles from Firestore
 * Uses real-time listener for automatic updates
 * 
 * EDUCATIONAL NOTE: 
 * This function queries Firestore for all approved users
 * and displays them on the page. It uses onSnapshot() which means
 * the page updates automatically when profiles are approved/unapproved.
 */
function loadProfiles() {
    // Create query for approved users only
    const usersRef = collection(db, 'users');
    const q = query(
        usersRef, 
        where('approved', '==', true),           // Only get approved users
        orderBy('approvedAt', 'desc')            // Show most recently approved first
    );
    
    // Set up real-time listener
    // This will automatically update when users are approved/unapproved
    onSnapshot(q, (querySnapshot) => {
        // Hide loading indicator
        loadingDiv.style.display = 'none';
        
        if (querySnapshot.empty) {
            // No approved profiles found
            profilesGrid.innerHTML = `
                <div class="no-profiles">
                    No profiles available yet. Check back soon!
                </div>
            `;
            return;
        }
        
        // Clear existing profiles
        profilesGrid.innerHTML = '';
        
        // Create card for each approved user
        querySnapshot.forEach((docSnap) => {
            const userData = docSnap.data();
            const card = createProfileCard(userData);
            profilesGrid.appendChild(card);
        });
        
        console.log(`Loaded ${querySnapshot.size} approved profiles`);
    }, (error) => {
        // Handle errors
        console.error('Error loading profiles:', error);
        loadingDiv.style.display = 'none';
        profilesGrid.innerHTML = `
            <div class="no-profiles">
                Error loading profiles. Please try again later.
            </div>
        `;
    });
}

// Initialize: Load profiles when page loads
loadProfiles();