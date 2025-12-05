// Test if script is loading
console.log('Firebase config script loaded!');

// Import Firebase SDK modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('Firebase modules imported successfully!');

// ========================================
// FIREBASE CONFIGURATION
// ========================================
// Replace these values with your actual Firebase project credentials
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

console.log('Firebase initialized!', app.name);

// ========================================
// FORM HANDLING
// ========================================

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up contact form...');
    
    // Get form elements - matching your HTML IDs
    const form = document.getElementById('contactForm');
    const messageDiv = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Check if elements exist
    if (!form) {
        console.error('Contact form not found!');
        return;
    }
    
    console.log('Contact form found and ready!');

    // Character counter for message field
    const messageField = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    
    if (messageField && charCount) {
        messageField.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Change color if approaching limit
            if (count > 450) {
                charCount.style.color = '#ff6b6b';
            } else {
                charCount.style.color = '';
            }
        });
    }

    // Function to show messages
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type} show`;
        messageDiv.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Form submit event listener
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submission intercepted!');
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        messageDiv.style.display = 'none';

        // Get form data - matching your HTML field IDs
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim() || null,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value.trim(),
            timestamp: serverTimestamp(),
            status: 'unread' // Track which submissions you've reviewed
        };

        console.log('Submitting data to Firestore:', formData);

        try {
            // Add document to Firestore
            const docRef = await addDoc(collection(db, 'contactSubmissions'), formData);
            
            console.log('✅ Document written with ID:', docRef.id);
            
            // Show success message
            showMessage('✓ Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
            
            // Reset form
            form.reset();
            if (charCount) charCount.textContent = '0';
            
        } catch (error) {
            console.error('❌ Error adding document:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            // Show error message with more details
            let errorMessage = 'Oops! Something went wrong. Please try again later.';
            
            if (error.code === 'permission-denied') {
                errorMessage = 'Permission denied. Please check Firestore security rules.';
            } else if (error.code === 'unavailable') {
                errorMessage = 'Service temporarily unavailable. Please try again.';
            }
            
            showMessage(errorMessage, 'error');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

    // Add visual feedback for form fields
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            
            // Validate on blur
            if (this.validity.valid) {
                this.classList.remove('invalid');
                this.classList.add('valid');
            } else if (this.value) {
                this.classList.add('invalid');
                this.classList.remove('valid');
            }
        });
    });

    console.log('✅ Contact form fully initialized and ready!');
});