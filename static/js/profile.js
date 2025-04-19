/**
 * WeTravel Mumbai - Profile Management
 * Handles user profile functionality and integration with authentication
 */

document.addEventListener('DOMContentLoaded', function() {
    initProfile();
    loadSavedTrip();
    updateNeighborhoodFeatures();
    
    // Listen for saved trips updates from main.js
    document.addEventListener('savedTripsUpdated', function(event) {
        loadSavedTrip();
    });
});

/**
 * Initialize the profile functionality
 */
function initProfile() {
    const userAuth = JSON.parse(sessionStorage.getItem('wetravel_auth') || '{}');
    
    // Update UI with user info if available
    if (userAuth.email) {
        const profileSection = document.querySelector('.user-profile');
        
        if (profileSection) {
            const userNameElement = profileSection.querySelector('.user-name');
            const userEmailElement = profileSection.querySelector('.user-email');
            
            if (userNameElement) {
                userNameElement.textContent = userAuth.name || 'User';
            }
            
            if (userEmailElement) {
                userEmailElement.textContent = userAuth.email;
            }
        }
    }
    
    // Setup profile tab navigation
    const profileTabs = document.querySelectorAll('.profile-tab');
    if (profileTabs.length > 0) {
        profileTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                profileTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all tab contents
                const tabContents = document.querySelectorAll('.profile-tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Show the corresponding content
                const tabId = this.getAttribute('data-tab');
                const activeContent = document.getElementById(`${tabId}-tab`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
                
                // Update URL hash for deep linking
                window.location.hash = tabId;
            });
        });
        
        // Check URL hash to activate the correct tab
        const hash = window.location.hash.substring(1);
        if (hash) {
            const tabToActivate = document.querySelector(`.profile-tab[data-tab="${hash}"]`);
            if (tabToActivate) {
                tabToActivate.click();
            }
        }
    }
    
    // Setup edit profile functionality
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Activate the account tab which contains edit profile form
            const accountTab = document.querySelector('.profile-tab[data-tab="account"]');
            if (accountTab) {
                accountTab.click();
            }
            
            // Show edit form or modal
            const editProfileForm = document.getElementById('edit-profile-form');
            if (editProfileForm) {
                editProfileForm.classList.add('active');
                
                // Populate form with existing user data
                const nameInput = editProfileForm.querySelector('input[name="name"]');
                const emailInput = editProfileForm.querySelector('input[name="email"]');
                
                if (nameInput && userAuth.name) {
                    nameInput.value = userAuth.name;
                }
                
                if (emailInput && userAuth.email) {
                    emailInput.value = userAuth.email;
                }
            }
        });
    }
}

/**
 * Load saved trip from localStorage and update UI
 */
function loadSavedTrip() {
    // Read from primary key first
    let savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
    
    // If empty, try legacy keys for compatibility
    if (savedTrips.length === 0) {
        savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        if (savedTrips.length > 0) {
            // Migrate to the new key
            localStorage.setItem('wetravel_saved_places', JSON.stringify(savedTrips));
        }
    }
    
    if (savedTrips.length === 0) {
        savedTrips = JSON.parse(localStorage.getItem('saved_trips') || '[]');
        if (savedTrips.length > 0) {
            // Migrate to the new key
            localStorage.setItem('wetravel_saved_places', JSON.stringify(savedTrips));
        }
    }
    
    // Update UI in all possible saved trips containers
    updateSavedTripsContainer('saved-trips-container', savedTrips);
    updateSavedTripsContainer('saved-places', savedTrips);
    
    // Update profile stats with count of saved places
    updateProfileStats(savedTrips.length);
    
    // Update UI elements to reflect saved status
    updateNeighborhoodFeatures();
}

/**
 * Update a saved trips container with the provided trips
 */
function updateSavedTripsContainer(containerId, savedTrips) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    if (savedTrips.length === 0) {
        container.innerHTML = '<p class="no-trips">You have no saved places yet. Explore neighborhoods and save places to your trip!</p>';
        return;
    }
    
    // Create trip items
    savedTrips.forEach(place => {
        const placeName = place.name || place.id;
        const itemElem = document.createElement('div');
        itemElem.className = 'saved-trip-item';
        itemElem.setAttribute('data-place', placeName);
        
        itemElem.innerHTML = `
            <div class="saved-place-info">
                <img src="${place.image || `/static/img/${placeName.toLowerCase().replace(/\s+/g, '-')}.jpg`}" 
                     alt="${placeName}" class="saved-place-img">
                <div class="saved-place-details">
                    <h4>${placeName}</h4>
                    <p class="neighborhood">${place.neighborhood || 'Mumbai'}</p>
                    <p class="description">${place.description || 'A wonderful place to visit in Mumbai.'}</p>
                </div>
            </div>
            <div class="saved-place-actions">
                <button class="view-details-btn" data-place="${placeName}">View Details</button>
                <button class="remove-btn" data-place="${placeName}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(itemElem);
        
        // Add event listeners
        itemElem.querySelector('.view-details-btn').addEventListener('click', function() {
            showPlaceDetails(place);
        });
        
        itemElem.querySelector('.remove-btn').addEventListener('click', function() {
            removeFromTrip(placeName);
        });
    });
}

/**
 * Update profile stats display
 */
function updateProfileStats(savedPlacesCount) {
    const savedPlacesStats = document.querySelectorAll('.profile-stats .stat-value');
    savedPlacesStats.forEach(stat => {
        if (stat.parentElement.querySelector('.stat-label').textContent.includes('Saved')) {
            stat.textContent = savedPlacesCount;
        }
    });
}

/**
 * Remove a place from saved trips
 */
function removeFromTrip(placeName) {
    // Check all possible keys
    let savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
    savedTrips = savedTrips.filter(place => (place.name || place.id) !== placeName);
    
    // Update all keys to maintain compatibility
    localStorage.setItem('wetravel_saved_places', JSON.stringify(savedTrips));
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    localStorage.setItem('saved_trips', JSON.stringify(savedTrips));
    
    // Remove from UI
    const tripItems = document.querySelectorAll(`.saved-trip-item[data-place="${placeName}"]`);
    tripItems.forEach(item => item.remove());
    
    // Check if list is now empty and update all containers
    const savedTripsContainers = document.querySelectorAll('#saved-trips-container, #saved-places');
    savedTripsContainers.forEach(container => {
        if (container && container.children.length === 0) {
            container.innerHTML = '<p class="no-trips">You have no saved places yet. Explore neighborhoods and save places to your trip!</p>';
        }
    });
    
    // Update profile stats
    updateProfileStats(savedTrips.length);
    
    // Trigger event to update other parts of the UI
    const event = new CustomEvent('savedTripsUpdated', {
        detail: {
            trips: savedTrips
        }
    });
    document.dispatchEvent(event);
    
    // Update card buttons
    updateNeighborhoodFeatures();
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`Removed ${placeName} from your trip`);
    }
}

/**
 * Show place details in a modal
 */
function showPlaceDetails(place) {
    const modalElement = document.getElementById('place-details-modal');
    
    if (!modalElement) {
        console.warn('Place details modal not found. Creating one...');
        createPlaceDetailsModal();
        return setTimeout(() => showPlaceDetails(place), 100);
    }
    
    // Populate modal with place details
    const modal = {
        title: modalElement.querySelector('.modal-title'),
        image: modalElement.querySelector('.modal-place-image img'),
        description: modalElement.querySelector('.modal-place-description'),
        address: modalElement.querySelector('.modal-place-address'),
        category: modalElement.querySelector('.modal-place-category'),
        rating: modalElement.querySelector('.modal-place-rating'),
        saveButton: modalElement.querySelector('.save-place-btn')
    };
    
    if (modal.title) modal.title.textContent = place.name || 'Place Details';
    
    if (modal.image) {
        modal.image.src = place.image || `/static/img/${(place.name || '').toLowerCase().replace(/\s+/g, '')}.jpg`;
        modal.image.alt = place.name || 'Place image';
    }
    
    if (modal.description) modal.description.textContent = place.description || 'No description available.';
    if (modal.address) modal.address.textContent = place.address || 'Mumbai, India';
    
    if (modal.category) {
        let category = 'Attraction';
        if (place.category) {
            category = place.category;
        } else if (place.type) {
            category = place.type;
        } else if (place.tags && place.tags.length > 0) {
            category = place.tags[0];
        }
        modal.category.textContent = category;
    }
    
    if (modal.rating) modal.rating.textContent = place.rating || '4.5';
    
    // Set up save button based on saved status
    if (modal.saveButton) {
        // Check if place is saved
        const savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
        const isAlreadySaved = savedTrips.some(item => (item.name || item.id) === (place.name || place.id));
        
        if (isAlreadySaved) {
            modal.saveButton.innerHTML = '<i class="fas fa-check"></i> Saved to Trip';
            modal.saveButton.classList.add('saved');
        } else {
            modal.saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Save to My Trip';
            modal.saveButton.classList.remove('saved');
        }
        
        // Remove existing event listeners by cloning
        const newSaveButton = modal.saveButton.cloneNode(true);
        modal.saveButton.parentNode.replaceChild(newSaveButton, modal.saveButton);
        
        // Add click handler
        newSaveButton.addEventListener('click', function() {
            // Use main.js saveToTrip function if available
            if (typeof saveToTrip === 'function') {
                saveToTrip(place.name || place.id, place);
                
                // Update button state based on new status
                const updatedSavedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
                const isNowSaved = updatedSavedTrips.some(item => (item.name || item.id) === (place.name || place.id));
                
                if (isNowSaved) {
                    this.innerHTML = '<i class="fas fa-check"></i> Saved to Trip';
                    this.classList.add('saved');
                } else {
                    this.innerHTML = '<i class="fas fa-bookmark"></i> Save to My Trip';
                    this.classList.remove('saved');
                }
            }
        });
    }
    
    // Show the modal
    modalElement.classList.add('show');
    document.body.classList.add('modal-open');
    
    // Add close event handlers
    const closeButtons = modalElement.querySelectorAll('.close-modal, .modal-backdrop');
    closeButtons.forEach(button => {
        // Remove existing event listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add click handler
        newButton.addEventListener('click', function() {
            modalElement.classList.remove('show');
            document.body.classList.remove('modal-open');
        });
    });
}

/**
 * Create a place details modal if it doesn't exist
 */
function createPlaceDetailsModal() {
    if (document.getElementById('place-details-modal')) return;
    
    const modalElement = document.createElement('div');
    modalElement.id = 'place-details-modal';
    modalElement.className = 'modal';
    
    modalElement.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Place Details</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-place-image">
                    <img src="/static/img/placeholder.svg" alt="Place">
                </div>
                <div class="modal-place-info">
                    <div class="modal-place-meta">
                        <span class="modal-place-category">Attraction</span>
                        <span class="modal-place-rating">4.5 ★</span>
                    </div>
                    <p class="modal-place-description">Description of the place.</p>
                    <p class="modal-place-address">Mumbai, India</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="save-place-btn">
                    <i class="fas fa-bookmark"></i> Save to My Trip
                </button>
                <button class="close-modal btn-secondary">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalElement);
}

/**
 * Update neighborhood UI features based on saved trips
 */
function updateNeighborhoodFeatures() {
    // Get saved trips from localStorage
    const savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
    
    // Update all place cards
    const placeCards = document.querySelectorAll('.recommendation-card, .place-card');
    
    placeCards.forEach(card => {
        const placeName = card.getAttribute('data-place');
        if (!placeName) return;
        
        const isAlreadySaved = savedTrips.some(item => (item.name || item.id) === placeName);
        const saveButton = card.querySelector('.save-to-trip, .save-btn');
        
        if (saveButton) {
            if (isAlreadySaved) {
                // Update to saved state
                if (saveButton.classList.contains('save-to-trip')) {
                    saveButton.innerHTML = '<i class="fas fa-check"></i> Saved to Trip';
                    saveButton.classList.add('saved');
                } else if (saveButton.classList.contains('save-btn')) {
                    saveButton.classList.add('saved');
                    const icon = saveButton.querySelector('i');
                    if (icon) icon.className = 'fas fa-heart';
                }
            } else {
                // Update to unsaved state
                if (saveButton.classList.contains('save-to-trip')) {
                    saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Save to My Trip';
                    saveButton.classList.remove('saved');
                } else if (saveButton.classList.contains('save-btn')) {
                    saveButton.classList.remove('saved');
                    const icon = saveButton.querySelector('i');
                    if (icon) icon.className = 'far fa-heart';
                }
            }
        }
    });
    
    // If main.js has a function to update UI, call it
    if (typeof updateSavedTripsUI === 'function') {
        updateSavedTripsUI();
    }
}

/**
 * Show a notification
 */
function showNotification(message, type = 'success') {
    // Check if we have the native notification function
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback to our own implementation
    const notificationElement = document.querySelector('.toast-notification');
    
    if (!notificationElement) {
        // Create a notification element if it doesn't exist
        const newNotification = document.createElement('div');
        newNotification.className = `toast-notification ${type}`;
        newNotification.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        
        document.body.appendChild(newNotification);
        
        // Add close functionality
        const closeBtn = newNotification.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            newNotification.classList.remove('show');
        });
        
        // Show the notification
        setTimeout(() => {
            newNotification.classList.add('show');
        }, 100);
        
        // Hide after 4 seconds
        setTimeout(() => {
            newNotification.classList.remove('show');
        }, 4000);
    } else {
        // Update existing notification
        const messageElement = notificationElement.querySelector('.toast-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        // Update type
        notificationElement.className = `toast-notification ${type}`;
        
        // Show notification
        notificationElement.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 4000);
    }
} 