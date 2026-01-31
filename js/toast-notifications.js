// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
// A modern, reusable toast notification system for user feedback
// Supports success, error, info, and warning message types
// Auto-dismisses after a set duration with smooth animations

/**
 * Create and show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'info', or 'warning'
 * @param {number} duration - How long to show toast in milliseconds (default: 4000)
 * 
 * USAGE EXAMPLES:
 * showToast('Profile updated successfully!', 'success');
 * showToast('Please fill in all required fields', 'error');
 * showToast('Your changes are being saved...', 'info');
 * showToast('This action cannot be undone', 'warning', 6000);
 */
 export function showToast(message, type = 'info', duration = 4000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Get the appropriate icon for the toast type
    const icon = getToastIcon(type);
    
    // Build toast HTML
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close notification">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        </button>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Trigger animation (needs small delay for CSS transition to work)
    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });
    
    // Set up close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        dismissToast(toast);
    });
    
    // Auto-dismiss after duration
    const dismissTimer = setTimeout(() => {
        dismissToast(toast);
    }, duration);
    
    // Pause auto-dismiss on hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(dismissTimer);
    });
    
    // Resume auto-dismiss on mouse leave
    toast.addEventListener('mouseleave', () => {
        setTimeout(() => {
            dismissToast(toast);
        }, 1000); // Give 1 more second after mouse leaves
    });
    
    // Add progress bar animation
    const progressBar = document.createElement('div');
    progressBar.className = 'toast-progress';
    progressBar.style.animationDuration = `${duration}ms`;
    toast.appendChild(progressBar);
}

/**
 * Dismiss a toast notification
 * @param {HTMLElement} toast - The toast element to dismiss
 */
function dismissToast(toast) {
    // Remove show class to trigger fade-out animation
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300); // Match this to CSS transition duration
}

/**
 * Get icon SVG for toast type
 * @param {string} type - Toast type
 * @returns {string} - SVG icon HTML
 */
function getToastIcon(type) {
    const icons = {
        success: `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
        `,
        error: `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
        `,
        warning: `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
        `,
        info: `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
        `
    };
    
    return icons[type] || icons.info;
}

/**
 * Quick helper functions for common toast types
 * These are shorthand versions for convenience
 */
export function toastSuccess(message, duration) {
    showToast(message, 'success', duration);
}

export function toastError(message, duration) {
    showToast(message, 'error', duration);
}

export function toastInfo(message, duration) {
    showToast(message, 'info', duration);
}

export function toastWarning(message, duration) {
    showToast(message, 'warning', duration);
}

// ============================================
// EXAMPLE USAGE IN YOUR FORMS:
// ============================================
/*

// Import the toast functions at the top of your file:
import { showToast, toastSuccess, toastError } from './toast-notifications.js';

// Then use them instead of showMessage:

// Success example:
toastSuccess('Profile updated successfully!');
// or
showToast('Profile updated successfully!', 'success');

// Error example:
toastError('Please fill in all required fields');
// or
showToast('Please fill in all required fields', 'error');

// Info example:
toastInfo('Uploading profile picture...');

// Warning example:
toastWarning('This action cannot be undone', 6000); // 6 seconds

*/