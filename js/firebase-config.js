// ========================================
// PART 1: IMPORT FIREBASE MODULES
// ========================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ========================================
// PART 2: FIREBASE CONFIGURATION
// ========================================
// TODO: Replace with YOUR actual Firebase config
// Get this from Firebase Console > Project Settings > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyBDQEO-UwIbqE4Hgf_8FLvy3crHxFAlBFk",
    authDomain: "lhok-business-canada.firebaseapp.com",
    projectId: "lhok-business-canada",
    storageBucket: "lhok-business-canada.firebasestorage.app",
    messagingSenderId: "790079291918",
    appId: "1:790079291918:web:c30705b3cd49e77970725f",
    measurementId: "G-DJRPBVKXLK"
};

// ========================================
// PART 3: INITIALIZE FIREBASE; connect to firebase create db ref
// ========================================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Firebase initialized successfully');

// ========================================
// PART 4: GET FORM ELEMENTS; get form feilds and store as a reference 
// ========================================
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');

// Input fields
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const subjectInput = document.getElementById('subject');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');

// ========================================
// PART 5: INPUT VALIDATION FUNCTIONS
// ========================================

// Real-time character counter for message
messageInput.addEventListener('input', () => {
    const length = messageInput.value.length;
    charCount.textContent = length;
    
    if (length > 500) {
        messageInput.value = messageInput.value.substring(0, 500);
        charCount.textContent = 500;
    }
});

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error message for specific field
function showFieldError(inputElement, message) {
    inputElement.classList.add('invalid');
    const errorSpan = document.getElementById(inputElement.id + 'Error');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
}

// Clear error message for specific field
function clearFieldError(inputElement) {
    inputElement.classList.remove('invalid');
    const errorSpan = document.getElementById(inputElement.id + 'Error');
    if (errorSpan) {
        errorSpan.textContent = '';
    }
}

// Clear errors on input
[nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
});

// ========================================
// PART 6: VALIDATE FORM DATA
// ========================================
function validateForm() {
    let isValid = true;

    // Clear previous errors
    clearFieldError(nameInput);
    clearFieldError(emailInput);
    clearFieldError(messageInput);

    // Validate name
    if (nameInput.value.trim().length < 2) {
        showFieldError(nameInput, 'Name must be at least 2 characters');
        isValid = false;
    }

    // Validate email
    if (!isValidEmail(emailInput.value.trim())) {
        showFieldError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }

    // Validate message
    if (messageInput.value.trim().length < 10) {
        showFieldError(messageInput, 'Message must be at least 10 characters');
        isValid = false;
    }

    // Validate subject
    if (!subjectInput.value) {
        isValid = false;
    }

    return isValid;
}

// ========================================
// PART 7: SHOW SUCCESS/ERROR MESSAGES
// ========================================
function showMessage(type, text) {
    formMessage.textContent = text;
    formMessage.className = `message ${type}`;
    
    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
}

// ========================================
// PART 8: LOADING STATE MANAGEMENT
// ========================================
function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// ========================================
// PART 9: MAIN FORM SUBMISSION HANDLER
// ========================================
form.addEventListener('submit', async (e) => {
    // Prevent default form submission
    e.preventDefault();
    
    console.log('📝 Form submission started...');
    
    // Validate form
    if (!validateForm()) {
        showMessage('error', 'Please fix the errors above and try again.');
        return;
    }
    
    // Set loading state
    setLoadingState(true);
    formMessage.style.display = 'none';
    
    // ========================================
    // PART 10: PREPARE DATA FOR FIRESTORE
    // ========================================
    const formData = {
        // User input
        name: nameInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        phone: phoneInput.value.trim() || null, // null if empty
        subject: subjectInput.value,
        message: messageInput.value.trim(),
        
        // Metadata
        timestamp: serverTimestamp(), // Firebase server time
        status: 'new', // You can use this to track read/unread
        source: 'website_contact_form',
        
        // Optional: User agent and referrer for analytics
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
    };
    
    console.log('📦 Data prepared:', formData);
    
    // ========================================
    // PART 11: SEND TO FIRESTORE
    // ========================================
    try {
        console.log('🚀 Sending to Firestore...');
        
        // Add document to 'contacts' collection
        const docRef = await addDoc(collection(db, 'contact-us-submission'), formData);
        
        console.log('✅ Document created with ID:', docRef.id);
        
        // ========================================
        // PART 12: SUCCESS HANDLING
        // ========================================
        showMessage('success', 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
        
        // Reset form
        form.reset();
        charCount.textContent = '0';
        
        // Optional: Track with analytics
        if (window.gtag) {
            gtag('event', 'form_submission', {
                'event_category': 'Contact Form',
                'event_label': subjectInput.value
            });
        }
        
    } catch (error) {
        // ========================================
        // PART 13: ERROR HANDLING
        // ========================================
        console.error('❌ Error submitting form:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // User-friendly error messages
        let errorMessage = 'Sorry, there was an error sending your message. ';
        
        if (error.code === 'permission-denied') {
            errorMessage += 'Database permissions error. Please contact support.';
        } else if (error.code === 'unavailable') {
            errorMessage += 'Network error. Please check your connection and try again.';
        } else {
            errorMessage += 'Please try again or contact us at support@lhok.ca';
        }
        
        showMessage('error', errorMessage);
        
    } finally {
        // ========================================
        // PART 14: CLEANUP
        // ========================================
        // Always remove loading state
        setLoadingState(false);
        console.log('✅ Form submission process completed');
    }
});

// ========================================
// PART 15: INITIALIZATION COMPLETE
// ========================================
console.log('✅ Contact form script loaded and ready');
console.log('📊 Waiting for form submission...');
