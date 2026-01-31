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
 * Copy text to clipboard and show notification
 * @param {string} text - The text to copy
 * @param {HTMLElement} button - The button element that was clicked
 */
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Create and show tooltip notification
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = 'Email copied to clipboard!';
        
        // Position tooltip above the button
        const rect = button.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.left = rect.left + (rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - 40) + 'px';
        tooltip.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(tooltip);
        
        // Add visible class for animation
        setTimeout(() => tooltip.classList.add('visible'), 10);
        
        // Remove tooltip after 2 seconds
        setTimeout(() => {
            tooltip.classList.remove('visible');
            setTimeout(() => tooltip.remove(), 300);
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy email:', err);
        alert('Failed to copy email to clipboard');
    });
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
    // BIO SECTION 
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
    // SOCIAL ICONS SECTION (NEW - Bottom Left Icons)
    // ============================================
    // This section creates small, clickable icon buttons at the bottom
    cardHTML += '<div class="profile-social-icons">'; // 🎨 STYLE THIS CLASS
    
    // We'll add icons in order: Instagram, Website, Email (if they exist)
    
    // --------------------------------------------
    // INSTAGRAM ICON
    // --------------------------------------------
    if (userData.instagram) {
        cardHTML += `
            <a href="${userData.instagram}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="social-icon instagram-icon"
               title="Visit Instagram profile"
               aria-label="Visit ${userData.displayName}'s Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
            </a>
        `;
    }
    
    // --------------------------------------------
    // WEBSITE ICON
    // --------------------------------------------
    if (userData.website) {
        cardHTML += `
            <a href="${userData.website}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="social-icon website-icon"
               title="Visit website"
               aria-label="Visit ${userData.displayName}'s website">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
            </a>
        `;
    }
    
    // --------------------------------------------
    // EMAIL ICON (with clipboard functionality)
    // --------------------------------------------
    if (userData.email) {
        // Use data-email attribute to store the email for the click handler
        cardHTML += `
            <button class="social-icon email-icon"
                    data-email="${userData.email}"
                    title="Copy email to clipboard"
                    aria-label="Copy ${userData.displayName}'s email to clipboard">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
            </button>
        `;
    }
    
    cardHTML += '</div>'; // End of profile-social-icons
    
    // Set the HTML content of the card
    card.innerHTML = cardHTML;
    
    // ============================================
    // ADD EVENT LISTENER FOR EMAIL COPY
    // ============================================
    // Find the email button and add click handler
    const emailButton = card.querySelector('.email-icon');
    if (emailButton) {
        emailButton.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('data-email');
            copyToClipboard(email, this);
        });
    }
    
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