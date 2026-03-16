import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
const db = getFirestore(app);

const loadingDiv = document.getElementById('loadingDiv');
const profilesGrid = document.getElementById('profilesGrid');

// ============================================
// HELPERS
// ============================================
function getInitials(name) {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = 'Email copied to clipboard!';

        const rect = button.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.left = rect.left + (rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - 40) + 'px';
        tooltip.style.transform = 'translateX(-50%)';

        document.body.appendChild(tooltip);
        setTimeout(() => tooltip.classList.add('visible'), 10);
        setTimeout(() => {
            tooltip.classList.remove('visible');
            setTimeout(() => tooltip.remove(), 300);
        }, 2000);
    }).catch(() => alert('Failed to copy email to clipboard'));
}

// ============================================
// CREATE PROFILE CARD — full data set
// ============================================
function createProfileCard(userData) {
    const card = document.createElement('div');
    card.className = 'profile-card';

    let cardHTML = '';

    // ----------------------------------------
    // AVATAR / PHOTO
    // ----------------------------------------
    if (userData.profilePhotoURL) {
        cardHTML += `
            <div class="profile-photo-container">
                <img src="${userData.profilePhotoURL}"
                     alt="${userData.displayName || 'Profile'} photo"
                     class="profile-photo">
            </div>
        `;
    } else {
        cardHTML += `
            <div class="profile-avatar">${getInitials(userData.displayName)}</div>
        `;
    }

    // ----------------------------------------
    // NAME
    // ----------------------------------------
    cardHTML += `<div class="profile-name">${userData.displayName || 'Anonymous'}</div>`;

    // ----------------------------------------
    // SPECIALTIES (tags)
    // ----------------------------------------
    if (userData.specialties && Array.isArray(userData.specialties) && userData.specialties.length > 0) {
        cardHTML += `<div class="profile-specialties">`;
        userData.specialties.forEach(s => {
            cardHTML += `<span class="specialty-tag">${s}</span>`;
        });
        cardHTML += `</div>`;
    }

    // ----------------------------------------
    // BIO
    // ----------------------------------------
    if (userData.bio) {
        cardHTML += `<div class="profile-bio">"${userData.bio}"</div>`;
    }

    // ----------------------------------------
    // INFO SECTION
    // ----------------------------------------
    cardHTML += `<div class="profile-info">`;

    if (userData.yearsInIndustry) {
        cardHTML += `
            <div class="info-label">Experience</div>
            <div class="info-item">
                <div class="info-text"><strong>${userData.yearsInIndustry} years</strong></div>
            </div>
        `;
    }

    if (userData.location) {
        cardHTML += `
            <div class="info-label">General Location</div>
            <div class="info-item">
                <div class="info-text"><strong>${userData.location}</strong></div>
            </div>
        `;
    }

    if (userData.preferredContact) {
        cardHTML += `
            <div class="info-label">Best Way to Connect</div>
            <div class="info-item">
                <div class="info-text">${userData.preferredContact}</div>
            </div>
        `;
    }

    cardHTML += `</div>`; // end profile-info

    // ----------------------------------------
    // SOCIAL ICONS (Instagram, Website, Email)
    // ----------------------------------------
    cardHTML += `<div class="profile-social-icons">`;

    if (userData.instagram) {
        cardHTML += `
            <a href="${userData.instagram}"
               target="_blank"
               rel="noopener noreferrer"
               class="social-icon instagram-icon"
               title="Instagram"
               aria-label="Visit ${userData.displayName}'s Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
            </a>
        `;
    }

    if (userData.website) {
        cardHTML += `
            <a href="${userData.website}"
               target="_blank"
               rel="noopener noreferrer"
               class="social-icon website-icon"
               title="Website"
               aria-label="Visit ${userData.displayName}'s website">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
            </a>
        `;
    }

    if (userData.email) {
        cardHTML += `
            <button class="social-icon email-icon"
                    data-email="${userData.email}"
                    title="Copy email"
                    aria-label="Copy ${userData.displayName}'s email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
            </button>
        `;
    }

    cardHTML += `</div>`; // end profile-social-icons

    card.innerHTML = cardHTML;

    // Email copy click handler
    const emailBtn = card.querySelector('.email-icon');
    if (emailBtn) {
        emailBtn.addEventListener('click', function (e) {
            e.preventDefault();
            copyToClipboard(this.getAttribute('data-email'), this);
        });
    }

    return card;
}

// ============================================
// LOAD PROFILES
// Single where clause — no composite index needed.
// JS filters to professionals only (includes legacy accounts without userType).
// ============================================
function loadProfiles() {
    const q = query(
        collection(db, 'users'),
        where('approved', '==', true)
    );

    onSnapshot(q, (querySnapshot) => {
        loadingDiv.style.display = 'none';

        // Filter professionals in JS
        const professionals = [];
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (!data.userType || data.userType === 'professional') {
                professionals.push(data);
            }
        });

        if (professionals.length === 0) {
            profilesGrid.innerHTML = `
                <div class="no-profiles">No profiles available yet. Check back soon!</div>
            `;
            return;
        }

        profilesGrid.innerHTML = '';
        professionals.forEach(userData => {
            profilesGrid.appendChild(createProfileCard(userData));
        });

        console.log(`Loaded ${professionals.length} approved professional profiles`);

    }, (error) => {
        console.error('Error loading profiles:', error);
        loadingDiv.style.display = 'none';
        profilesGrid.innerHTML = `
            <div class="no-profiles">Error loading profiles. Please try again later.</div>
        `;
    });
}

loadProfiles();