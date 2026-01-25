async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        let html = await response.text();
        
        // Determine media path based on current location
        const isRootPage = window.location.pathname.endsWith('index.html') || 
                           window.location.pathname.endsWith('/');
        const mediaPath = isRootPage ? '' : '../';
        
        // Replace media path placeholder
        html = html.replace(/\{\{mediaPath\}\}/g, mediaPath);
        
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component from ${componentPath}:`, error);
    }
}

// Function to fix links after components load
function fixComponentLinks() {
    const isRootPage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/');
    
    const links = document.querySelectorAll('header a, footer a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        
        if (!href || href.startsWith('http') || href.startsWith('#')) {
            return;
        }
        
        if (isRootPage) {
            // On root page: add 'pages/' prefix to page links (but not index.html)
            if (href.endsWith('.html') && href !== 'index.html' && !href.startsWith('pages/')) {
                link.setAttribute('href', 'pages/' + href);
            }
        } else {
            // In pages folder: add '../' prefix to index.html
            if (href === 'index.html') {
                link.setAttribute('href', '../index.html');
            }
        }
    });
}

// Load header and footer when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    const isRootPage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/');
    
    const basePath = isRootPage ? 'pages/components/' : 'components/';
    
    // Load components
    await loadComponent('header-placeholder', basePath + 'header.html');
    await loadComponent('footer-placeholder', basePath + 'footer.html');
    await loadComponent('btn', basePath + 'submit-button.html');

    
    // Fix links after components are loaded
    fixComponentLinks();
});