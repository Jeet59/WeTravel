// WeTravel Mumbai - Simple Modal JS
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - simplified version');
    
    // Initialize sidebar
    initSidebar();
    
    // Initialize tab navigation
    initTabNavigation();
    
    // Add direct click handlers to every card
    setupCardClickHandlers();
    
    // Initialize modals for other UI elements (not neighborhoods)
    initModals();
    
    // Add event listeners for CTA buttons on home page
    setupCTAButtons();
});

// Initialize sidebar functionality
function initSidebar() {
    console.log('Initializing sidebar');
    
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    if (!sidebar || !sidebarToggle) {
        console.error('Sidebar elements not found');
        return;
    }
    
    console.log('Found sidebar elements');
    
    // Toggle sidebar on button click - using multiple methods for redundancy
    sidebarToggle.style.cursor = 'pointer';
    
    // Method 1: Direct onclick property
    sidebarToggle.onclick = function() {
        console.log('Sidebar toggle clicked (onclick)');
        sidebar.classList.toggle('active');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
    };
    
    // Method 2: addEventListener
    sidebarToggle.addEventListener('click', function() {
        console.log('Sidebar toggle clicked (addEventListener)');
        sidebar.classList.toggle('active');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
    });
    
    // Close sidebar when clicking on overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            console.log('Sidebar overlay clicked');
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking on links (on mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                console.log('Nav link clicked on mobile, closing sidebar');
                sidebar.classList.remove('active');
                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            }
        });
    });
}

// Initialize tab navigation
function initTabNavigation() {
    console.log('Initializing tab navigation');
    
    const navLinks = document.querySelectorAll('.nav-link');
    console.log(`Found ${navLinks.length} navigation links`);
    
    navLinks.forEach(link => {
        // Make sure links are clickable
        link.style.cursor = 'pointer';
        
        // Add click handler using all methods for redundancy
        link.onclick = function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            console.log(`Tab link clicked: ${tabId}`);
            activateTab(tabId, this);
            return false;
        };
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            console.log(`Tab link clicked (addEventListener): ${tabId}`);
            activateTab(tabId, this);
        });
        
        // Add a transparent overlay to ensure clickability
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '2';
        overlay.style.cursor = 'pointer';
        overlay.onclick = function(e) {
            e.stopPropagation();
            const tabId = link.getAttribute('data-tab');
            console.log(`Tab overlay clicked: ${tabId}`);
            activateTab(tabId, link);
            return false;
        };
        
        // Make the link position relative to accommodate the overlay
        if (getComputedStyle(link).position === 'static') {
            link.style.position = 'relative';
            link.appendChild(overlay);
        }
        
        console.log(`Added click handlers to tab link: ${link.textContent}`);
    });
    
    // Initialize location tabs in the neighborhoods section (if they exist)
    const locationTabs = document.querySelectorAll('.location-tab');
    if (locationTabs.length > 0) {
        console.log(`Found ${locationTabs.length} location tabs`);
        locationTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all location tabs
                locationTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding location content
                const locationId = this.getAttribute('data-location');
                const locationContents = document.querySelectorAll('.location-content');
                
                locationContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetContent = document.getElementById(`${locationId}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    
                    // On mobile, scroll to the content
                    if (window.innerWidth <= 768) {
                        targetContent.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }
}

// Function to activate a tab
function activateTab(tabId, linkElement) {
    console.log(`Activating tab: ${tabId}`);
    
    // Remove active class from all tabs and links
    document.querySelectorAll('.nav-link').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-container').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked link
    if (linkElement) {
        linkElement.classList.add('active');
    }
    
    // Show corresponding tab content
    const tabContent = document.getElementById(tabId);
    
    if (tabContent) {
        tabContent.classList.add('active');
        console.log(`Tab content activated: ${tabId}`);
        
        // Extra check for neighborhoods tab to ensure cards are clickable
        if (tabId === 'neighborhoods') {
            console.log('Neighborhoods tab activated, refreshing card handlers');
            setupCardClickHandlers();
        }
    } else {
        console.error(`Tab content not found for ID: ${tabId}`);
    }
}

/**
 * Set up click handlers for all neighborhood cards
 * All neighborhoods will have dedicated pages like Colaba
 */
function setupCardClickHandlers() {
    // Find all neighborhood cards
    const cards = document.querySelectorAll('.neighborhood-card');
    console.log(`Found ${cards.length} neighborhood cards`);
    
    // Add click handler to each card
    cards.forEach((card, index) => {
        const neighborhoodName = card.getAttribute('data-neighborhood');
        
        if (!neighborhoodName) {
            console.error(`Card ${index + 1} missing data-neighborhood attribute`);
            return;
        }
        
        // Mark card as link and set cursor
        card.classList.add('hyperlink-card');
        card.style.cursor = 'pointer';
        
        // Clear any existing event listeners
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        card = newCard;
        
        // Add single click event listener to navigate to neighborhood page
        card.addEventListener('click', function(e) {
            // Don't follow the link if they clicked on a feature icon
            if (e.target.closest('.feature')) {
                return;
            }
            
            console.log(`${neighborhoodName} card clicked - navigating to dedicated page`);
            window.location.href = `/static/${neighborhoodName.toLowerCase()}.html`;
        });
        
        // Update the explore button
        const exploreBtn = card.querySelector('.view-btn');
        if (exploreBtn) {
            exploreBtn.textContent = 'View Full Page';
            
            // Add direct listener to button
            exploreBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering card click
                window.location.href = `/static/${neighborhoodName.toLowerCase()}.html`;
            });
        }
        
        // Handle feature icons separately
        const features = card.querySelectorAll('.feature');
        features.forEach(feature => {
            feature.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering card click
                const section = feature.getAttribute('data-section');
                const location = feature.getAttribute('data-location');
                console.log(`Feature clicked: ${location} - ${section}`);
                
                // Navigate to the specific section in the neighborhood page
                window.location.href = `/static/${location.toLowerCase()}.html#${section}`;
            });
        });
    });
    
    // Special handling for the attractions within the neighborhood pages
    const attractionCards = document.querySelectorAll('.attraction-card, .restaurant-card');
    if (attractionCards.length > 0) {
        console.log(`Found ${attractionCards.length} attraction/restaurant cards to enhance`);
        
        attractionCards.forEach(card => {
            // Add hover effect
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        });
    }
}

/**
 * Initialize all modals in the application
 * (Not for neighborhoods, which now use separate HTML pages)
 */
function initModals() {
    // Get all modals (excluding neighborhood modals which are no longer used)
    const modals = document.querySelectorAll('.modal-overlay');
    if (!modals.length) return;
    
    // Setup each modal
    modals.forEach(modal => {
        // Get close buttons
        const closeButtons = modal.querySelectorAll('.modal-close, .close-modal, .btn-secondary');
        
        // Add click handler to close buttons
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Get modal triggers that target this modal
        const modalId = modal.id;
        if (modalId) {
            const triggers = document.querySelectorAll(`[data-modal="${modalId}"]`);
            triggers.forEach(trigger => {
                trigger.addEventListener('click', function(e) {
                    e.preventDefault();
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            });
        }
    });
    
    // Initialize modal system for place details
    if (typeof initModalSystem === 'function') {
        initModalSystem();
    }
}

/**
 * Set up event listeners for CTA buttons on home page
 */
function setupCTAButtons() {
    console.log('Setting up CTA buttons');
    
    // Get all CTA buttons (from hero section, CTA section, and showcase section)
    const ctaButtons = document.querySelectorAll('.cta-buttons a.btn, .hero-cta a.btn, .showcase-content a.btn');
    
    if (!ctaButtons.length) {
        console.error('No CTA buttons found');
        return;
    }
    
    console.log(`Found ${ctaButtons.length} CTA buttons`);
    
    // Add click handler to each button
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section from the href
            const targetSection = this.getAttribute('href').substring(1);
            console.log(`CTA button clicked for section: ${targetSection}`);
            
            // Find the corresponding nav link
            const navLink = document.querySelector(`.nav-link[data-tab="${targetSection}"]`);
            
            if (navLink) {
                // Activate the target tab
                console.log(`Activating tab: ${targetSection}`);
                activateTab(targetSection, navLink);
                
                // Scroll to the target section
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                console.error(`No navigation link found for section: ${targetSection}`);
                
                // Fallback to just scrolling to the target section
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Add a direct handler for the showcase "Start Exploring" button for redundancy
    const startExploringBtn = document.querySelector('.showcase-content a.btn');
    if (startExploringBtn) {
        console.log('Found Start Exploring button');
        startExploringBtn.onclick = function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('href').substring(1);
            console.log(`Start Exploring button clicked for section: ${targetSection}`);
            
            // Find the neighborhoods tab
            const neighborhoodsTab = document.querySelector('.nav-link[data-tab="neighborhoods"]');
            if (neighborhoodsTab) {
                // Activate the neighborhoods tab
                activateTab('neighborhoods', neighborhoodsTab);
                
                // Scroll to the neighborhoods section
                const targetElement = document.getElementById('neighborhoods');
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                console.error('Neighborhoods tab not found');
            }
            
            return false;
        };
    }
}