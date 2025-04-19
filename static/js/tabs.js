/**
 * WeTravel Mumbai - Tab Navigation System
 * Handles switching between main application tabs and section content
 */

document.addEventListener('DOMContentLoaded', () => {
    initTabSystem();
    setActiveTabFromHash();
    handleResponsiveLayout();
});

/**
 * Initialize the tab navigation system
 */
function initTabSystem() {
    // Main navigation tabs
    const mainTabs = document.querySelectorAll('.main-nav .nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Set up click listeners for main navigation tabs
    mainTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute('data-target');
            
            // Update URL hash without scrolling
            const scrollPos = window.scrollY;
            window.location.hash = targetId;
            window.scrollTo(0, scrollPos);
            
            // Activate the clicked tab
            activateTab(tab, mainTabs, tabContents);
            
            // Close sidebar on mobile when tab is clicked
            if (window.innerWidth < 992 && document.getElementById('sidebar').classList.contains('active')) {
                document.getElementById('sidebar-toggle').click();
            }
        });
    });
    
    // Handle location tabs
    const locationTabs = document.querySelectorAll('.neighborhood-tabs .tab-link');
    const locationContents = document.querySelectorAll('.location-content');
    
    locationTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all location tabs and contents
            locationTabs.forEach(t => t.classList.remove('active'));
            locationContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const target = document.getElementById(tab.getAttribute('data-target'));
            if (target) {
                target.classList.add('active');
                
                // Smooth scroll on mobile
                if (window.innerWidth < 768) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Handle sub-section tabs within tabs
    const subTabs = document.querySelectorAll('.tab-navigation .tab-link');
    
    subTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabGroup = tab.closest('.tab-navigation').querySelectorAll('.tab-link');
            const targetContents = document.querySelectorAll(`.${tab.getAttribute('data-group')}`);
            const targetContent = document.getElementById(tab.getAttribute('data-target'));
            
            // Remove active class from all tabs in this group
            tabGroup.forEach(t => t.classList.remove('active'));
            targetContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and content
            tab.classList.add('active');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

/**
 * Activate the specified tab and show its content
 */
function activateTab(tab, allTabs, allContents) {
    const targetId = tab.getAttribute('data-target');
    
    // Remove active class from all tabs and contents
    allTabs.forEach(t => t.classList.remove('active'));
    allContents.forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Animate the indicator
    animateIndicator(tab);
    
    // Handle specific actions for certain tabs
    handleTabSpecificActions(targetId);
}

/**
 * Animate the active tab indicator
 */
function animateIndicator(activeTab) {
    const indicator = document.querySelector('.nav-indicator');
    if (!indicator) return;
    
    const tabRect = activeTab.getBoundingClientRect();
    const navRect = activeTab.closest('.main-nav').getBoundingClientRect();
    
    // Calculate position relative to the navigation
    const left = tabRect.left - navRect.left;
    
    // Animate the indicator
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${tabRect.width}px`;
}

/**
 * Handle specific actions needed for certain tabs
 */
function handleTabSpecificActions(tabId) {
    switch(tabId) {
        case 'map-tab':
            // Initialize or refresh map if needed
            if (typeof initMap === 'function' && window.googleMapsLoaded) {
                initMap();
            }
            break;
        case 'chat-tab':
            // Focus on chat input when switching to chat tab
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                setTimeout(() => chatInput.focus(), 300);
            }
            break;
    }
}

/**
 * Set the active tab based on the URL hash
 */
function setActiveTabFromHash() {
    // Check if there's a hash in the URL
    const hash = window.location.hash.substring(1);
    if (hash) {
        const tab = document.querySelector(`.nav-link[data-target="${hash}"]`);
        if (tab) {
            const mainTabs = document.querySelectorAll('.main-nav .nav-link');
            const tabContents = document.querySelectorAll('.tab-content');
            activateTab(tab, mainTabs, tabContents);
        }
    } else {
        // If no hash, activate the first tab
        const firstTab = document.querySelector('.main-nav .nav-link');
        if (firstTab) {
            const mainTabs = document.querySelectorAll('.main-nav .nav-link');
            const tabContents = document.querySelectorAll('.tab-content');
            activateTab(firstTab, mainTabs, tabContents);
        }
    }
}

/**
 * Handle responsive layout adjustments
 */
function handleResponsiveLayout() {
    // Check viewport size and make UI adjustments
    const adjustLayout = () => {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;
        
        // Adjust elements based on viewport size
        document.body.classList.toggle('is-mobile', isMobile);
        document.body.classList.toggle('is-tablet', isTablet);
        
        // Re-position the active tab indicator
        const activeTab = document.querySelector('.main-nav .nav-link.active');
        if (activeTab) {
            animateIndicator(activeTab);
        }
    };
    
    // Initialize and listen for resize events
    window.addEventListener('resize', adjustLayout);
    adjustLayout();
}

// Handle URL hash changes
window.addEventListener('hashchange', () => {
    setActiveTabFromHash();
}); 