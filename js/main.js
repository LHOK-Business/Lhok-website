function showMessage() { 
    // Declares a function named "showMessage"
    alert("Thank you for joining LHOK!"); 
    // Shows an alert box with the message
}

/* ============================================
   JAVASCRIPT FOR AUTO-SCROLL CAROUSEL
============================================ */

// document.addEventListener('DOMContentLoaded', function() {
//     const imageGrid = document.querySelector('.image-grid');
    
//     if (!imageGrid) {
//         console.log('Image grid not found');
//         return;
//     }
    
//     // Get all current images
//     const images = Array.from(imageGrid.querySelectorAll('img'));
    
//     if (images.length === 0) {
//         console.log('No images found');
//         return;
//     }
    
//     // Create wrapper div
//     const wrapper = document.createElement('div');
//     wrapper.className = 'image-scroll-wrapper';
    
//     // Add original images to wrapper
//     images.forEach(img => {
//         wrapper.appendChild(img.cloneNode(true));
//     });
    
//     // Duplicate images for seamless loop
//     images.forEach(img => {
//         const clone = img.cloneNode(true);
//         clone.setAttribute('aria-hidden', 'true');
//         wrapper.appendChild(clone);
//     });
    
//     // Clear grid and add wrapper
//     imageGrid.innerHTML = '';
//     imageGrid.appendChild(wrapper);
    
//     console.log('Carousel initialized successfully');
// });