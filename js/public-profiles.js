        // Import Firebase modules
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

        /**
         * Get initials from display name for avatar
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
         * Create a profile card element
         */
        function createProfileCard(userData) {
            // Create card container
            const card = document.createElement('div');
            card.className = 'profile-card';
            
            // Get user initials for avatar
            const initials = getInitials(userData.displayName);

            // Build card HTML
            let cardHTML = `
                <div class="profile-avatar">${initials}</div>
                <div class="profile-name">${userData.displayName || 'Anonymous'}</div>
                <div class="profile-email">${userData.email || ''}</div>
            `;

            // Add bio if available
            if (userData.bio) {
                cardHTML += `
                    <div class="profile-bio">
                        "${userData.bio}"
                    </div>
                `;
            }

            // Start profile info section
            cardHTML += '<div class="profile-info">';

            // Add location if available
            if (userData.location) {
                cardHTML += `
                    <div class="info-item">
                        <div class="info-icon">📍</div>
                        <div class="info-text">${userData.location}</div>
                    </div>
                `;
            }

            // Add phone if available
            if (userData.phoneNumber) {
                cardHTML += `
                    <div class="info-item">
                        <div class="info-icon">📞</div>
                        <div class="info-text">${userData.phoneNumber}</div>
                    </div>
                `;
            }

            // Close profile info section
            cardHTML += '</div>';

            // Add website link if available
            if (userData.website) {
                cardHTML += `
                    <div class="profile-website">
                        <a href="${userData.website}" target="_blank" rel="noopener noreferrer" class="website-link">
                            Visit Website
                        </a>
                    </div>
                `;
            }

            // Set the HTML content
            card.innerHTML = cardHTML;

            return card;
        }

        /**
         * Load approved profiles from Firestore
         * Uses real-time listener for automatic updates
         */
        function loadProfiles() {
            // Create query for approved users only
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef, 
                where('approved', '==', true),
                orderBy('approvedAt', 'desc') // Show most recently approved first
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