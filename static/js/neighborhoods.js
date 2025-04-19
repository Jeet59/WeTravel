/**
 * WeTravel Mumbai - Neighborhoods Functionality
 * Handles neighborhood browsing, filtering, and saved places
 */

document.addEventListener('DOMContentLoaded', () => {
    initNeighborhoods();
});

/**
 * Initialize the neighborhoods functionality
 */
function initNeighborhoods() {
    initNeighborhoodFilters();
    initNeighborhoodCards();
    initPlaceCards();
    initSavedPlacesTracker();
}

/**
 * Initialize the neighborhood filter functionality
 */
function initNeighborhoodFilters() {
    const filterContainer = document.querySelector('.neighborhood-filters');
    if (!filterContainer) return;
    
    const filters = filterContainer.querySelectorAll('.filter-item');
    
    // Add click event to each filter
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            filters.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked filter
            filter.classList.add('active');
            
            // Get the filter value
            const filterValue = filter.getAttribute('data-filter');
            
            // Filter the neighborhoods grid
            filterNeighborhoods(filterValue);
        });
    });
    
    // Set "All" filter as active by default
    const allFilter = filterContainer.querySelector('[data-filter="all"]');
    if (allFilter) {
        allFilter.classList.add('active');
    }
}

/**
 * Filter the neighborhoods based on the selected filter
 */
function filterNeighborhoods(filterValue) {
    const neighborhoods = document.querySelectorAll('.neighborhood-card');
    
    neighborhoods.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filterValue === 'all' || category === filterValue) {
            card.style.display = 'block';
            // Add animation for smooth appearance
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300); // Match transition duration in CSS
        }
    });
}

/**
 * Initialize the neighborhood cards with click events
 */
function initNeighborhoodCards() {
    const cards = document.querySelectorAll('.neighborhood-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const neighborhoodId = card.getAttribute('data-id');
            const neighborhoodName = card.querySelector('h3').textContent;
            
            // Show the neighborhood detail view
            showNeighborhoodDetail(neighborhoodId, neighborhoodName);
            
            // Log this as a "view" in recent activity
            logActivity('viewed', neighborhoodName);
        });
    });
}

/**
 * Show the neighborhood detail view
 */
function showNeighborhoodDetail(neighborhoodId, neighborhoodName) {
    // In a production app, this would fetch data from an API
    // For demo purposes, we'll use hardcoded data
    
    // First, show the detail modal or navigate to detail page
    const detailContainer = document.getElementById('neighborhood-detail');
    if (!detailContainer) return;
    
    // Update the header with neighborhood name
    const header = detailContainer.querySelector('.detail-header h2');
    if (header) {
        header.textContent = neighborhoodName;
    }
    
    // Load places for this neighborhood
    loadPlacesForNeighborhood(neighborhoodId, detailContainer);
    
    // Update neighborhood stats
    updateNeighborhoodStats(neighborhoodId, detailContainer);
    
    // Show the detail container
    detailContainer.classList.add('active');
    
    // Add close functionality
    const closeBtn = detailContainer.querySelector('.close-detail');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            detailContainer.classList.remove('active');
        });
    }
}

/**
 * Load places for a specific neighborhood
 */
function loadPlacesForNeighborhood(neighborhoodId, container) {
    // In a production app, this would fetch data from an API
    // For demo purposes, we'll use hardcoded data based on the ID
    
    const placesContainer = container.querySelector('.places-grid');
    if (!placesContainer) return;
    
    // Clear existing places
    placesContainer.innerHTML = '';
    
    // Get places for this neighborhood (this would be from an API in production)
    const places = getPlacesForNeighborhood(neighborhoodId);
    
    // Add each place to the grid
    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = 'place-card';
        placeCard.setAttribute('data-id', place.id);
        
        placeCard.innerHTML = `
            <div class="place-image">
                <img src="${place.image}" alt="${place.name}">
                <div class="place-category">${place.category}</div>
            </div>
            <div class="place-details">
                <h3>${place.name}</h3>
                <div class="place-rating">
                    ${generateStarRating(place.rating)}
                    <span>${place.rating}</span>
                    <span class="review-count">(${place.reviews} reviews)</span>
                </div>
                <p>${place.description}</p>
                <div class="place-actions">
                    <button class="btn save-place" data-id="${place.id}">
                        <i class="fas fa-bookmark"></i> Save
                    </button>
                    <button class="btn view-place" data-id="${place.id}">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `;
        
        placesContainer.appendChild(placeCard);
    });
    
    // Initialize place buttons
    initPlaceButtons();
}

/**
 * Generate HTML for star ratings
 */
function generateStarRating(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

/**
 * Update neighborhood statistics
 */
function updateNeighborhoodStats(neighborhoodId, container) {
    const statsContainer = container.querySelector('.neighborhood-stats');
    if (!statsContainer) return;
    
    // In a production app, this would fetch data from an API
    // For demo purposes, we'll use hardcoded data
    const stats = getNeighborhoodStats(neighborhoodId);
    
    // Update stats in the container
    const statItems = statsContainer.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        const key = item.getAttribute('data-stat');
        if (stats[key]) {
            const valueEl = item.querySelector('.stat-value');
            if (valueEl) {
                valueEl.textContent = stats[key];
            }
        }
    });
}

/**
 * Initialize place action buttons
 */
function initPlaceButtons() {
    // Save place buttons
    const saveButtons = document.querySelectorAll('.save-place');
    saveButtons.forEach(button => {
        const placeId = button.getAttribute('data-id');
        
        // Check if this place is already saved
        if (isPlaceSaved(placeId)) {
            updateSaveButton(button, true);
        }
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSavePlace(button, placeId);
        });
    });
    
    // View details buttons
    const viewButtons = document.querySelectorAll('.view-place');
    viewButtons.forEach(button => {
        const placeId = button.getAttribute('data-id');
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            showPlaceDetails(placeId);
        });
    });
}

/**
 * Toggle saving a place to the trip
 */
function toggleSavePlace(button, placeId) {
    const isSaved = isPlaceSaved(placeId);
    
    if (isSaved) {
        // Remove from saved places
        removeFromSavedPlaces(placeId);
        updateSaveButton(button, false);
        showNotification('Removed from your saved places', 'info');
    } else {
        // Get place details
        const placeCard = button.closest('.place-card');
        if (!placeCard) return;
        
        const placeName = placeCard.querySelector('h3').textContent;
        const placeImage = placeCard.querySelector('img').src;
        const placeCategory = placeCard.querySelector('.place-category').textContent;
        const placeDescription = placeCard.querySelector('p').textContent;
        
        // Create place object
        const placeData = {
            id: placeId,
            name: placeName,
            image: placeImage,
            category: placeCategory,
            description: placeDescription,
            dateSaved: new Date().toISOString()
        };
        
        // Add to saved places
        addToSavedPlaces(placeData);
        updateSaveButton(button, true);
        showNotification('Added to your saved places', 'success');
    }
    
    // Update saved places count in the UI
    updateSavedPlacesCount();
}

/**
 * Update the save button appearance
 */
function updateSaveButton(button, isSaved) {
    if (isSaved) {
        button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        button.classList.add('saved');
    } else {
        button.innerHTML = '<i class="far fa-bookmark"></i> Save';
        button.classList.remove('saved');
    }
}

/**
 * Check if a place is already saved
 */
function isPlaceSaved(placeId) {
    const savedPlaces = getSavedPlaces();
    return savedPlaces.some(place => place.id === placeId);
}

/**
 * Get saved places from localStorage
 */
function getSavedPlaces() {
    try {
        const savedPlaces = localStorage.getItem('saved_trips');
        return savedPlaces ? JSON.parse(savedPlaces) : [];
    } catch (error) {
        console.error('Error getting saved places:', error);
        return [];
    }
}

/**
 * Add a place to saved places in localStorage
 */
function addToSavedPlaces(placeData) {
    try {
        const savedPlaces = getSavedPlaces();
        
        // Add only if not already saved
        if (!savedPlaces.some(place => place.id === placeData.id)) {
            savedPlaces.push(placeData);
            localStorage.setItem('saved_trips', JSON.stringify(savedPlaces));
        }
    } catch (error) {
        console.error('Error saving place:', error);
    }
}

/**
 * Remove a place from saved places in localStorage
 */
function removeFromSavedPlaces(placeId) {
    try {
        let savedPlaces = getSavedPlaces();
        savedPlaces = savedPlaces.filter(place => place.id !== placeId);
        localStorage.setItem('saved_trips', JSON.stringify(savedPlaces));
    } catch (error) {
        console.error('Error removing saved place:', error);
    }
}

/**
 * Update the saved places count in the UI
 */
function updateSavedPlacesCount() {
    const savedCount = getSavedPlaces().length;
    const counters = document.querySelectorAll('.saved-places-count');
    
    counters.forEach(counter => {
        counter.textContent = savedCount;
    });
    
    // Also update metric card if it exists
    updateMetricCard('saved-places', savedCount);
}

/**
 * Log user activity
 */
function logActivity(type, placeName) {
    // In a production app, this would be sent to a backend API
    // For demo purposes, we'll just store it in localStorage
    
    try {
        const activities = localStorage.getItem('user_activities');
        const activityList = activities ? JSON.parse(activities) : [];
        
        activityList.unshift({
            type,
            place: placeName,
            timestamp: new Date().toISOString()
        });
        
        // Limit to 20 recent activities
        if (activityList.length > 20) {
            activityList.pop();
        }
        
        localStorage.setItem('user_activities', JSON.stringify(activityList));
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

/**
 * Show place details in a modal
 */
function showPlaceDetails(placeId) {
    // Get place details from the DOM
    const placeCard = document.querySelector(`.place-card[data-id="${placeId}"]`);
    if (!placeCard) return;
    
    const placeName = placeCard.querySelector('h3').textContent;
    const placeImage = placeCard.querySelector('img').src;
    const placeCategory = placeCard.querySelector('.place-category').textContent;
    const placeDescription = placeCard.querySelector('p').textContent;
    
    // Get the modal
    const modal = document.getElementById('place-detail-modal');
    if (!modal) return;
    
    // Update modal content
    modal.querySelector('.modal-title').textContent = placeName;
    modal.querySelector('.modal-place-image img').src = placeImage;
    modal.querySelector('.modal-place-category').textContent = placeCategory;
    modal.querySelector('.modal-place-description').textContent = placeDescription;
    
    // Update save button
    const saveButton = modal.querySelector('.modal-save-place');
    if (saveButton) {
        saveButton.setAttribute('data-id', placeId);
        updateSaveButton(saveButton, isPlaceSaved(placeId));
        
        // Add click event
        saveButton.addEventListener('click', () => {
            toggleSavePlace(saveButton, placeId);
        });
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // Add close functionality
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    });
    
    // Log this view
    logActivity('viewed', placeName);
}

/**
 * Initialize place cards on the main neighborhood grid
 */
function initPlaceCards() {
    const cards = document.querySelectorAll('.place-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const placeId = card.getAttribute('data-id');
            showPlaceDetails(placeId);
        });
    });
}

/**
 * Initialize the saved places tracker
 */
function initSavedPlacesTracker() {
    // Update the count initially
    updateSavedPlacesCount();
    
    // Set up the saved places icon in the header
    const savedIcon = document.querySelector('.saved-places-icon');
    if (savedIcon) {
        savedIcon.addEventListener('click', () => {
            // Navigate to the saved places tab
            const savedTab = document.querySelector('[data-tab="itinerary"]');
            if (savedTab) {
                savedTab.click();
            }
        });
    }
}

/**
 * Show a notification message
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after timeout
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Helper functions for demo data

/**
 * Get places for a specific neighborhood
 */
function getPlacesForNeighborhood(neighborhoodId) {
    // This would come from an API in a production app
    const placesData = {
        'colaba': [
            {
                id: 'colaba-1',
                name: 'Gateway of India',
                image: '/static/img/gateway.jpg',
                category: 'Monument',
                description: 'Historic monument built during the British Raj, overlooking the Arabian Sea.',
                rating: 4.7,
                reviews: 1243
            },
            {
                id: 'colaba-2',
                name: 'Taj Mahal Palace',
                image: '/static/img/taj-hotel.jpg',
                category: 'Landmark',
                description: 'Iconic 5-star luxury hotel in the Colaba region of Mumbai, Maharashtra, India.',
                rating: 4.8,
                reviews: 856
            },
            {
                id: 'colaba-3',
                name: 'Colaba Causeway',
                image: '/static/img/colaba-causeway.jpg',
                category: 'Shopping',
                description: 'Popular shopping street known for boutique shops, street food, and souvenirs.',
                rating: 4.5,
                reviews: 721
            }
        ],
        'bandra': [
            {
                id: 'bandra-1',
                name: 'Bandra-Worli Sea Link',
                image: '/static/img/sea-link.jpg',
                category: 'Landmark',
                description: 'Cable-stayed bridge that links Bandra in the Western Suburbs to Worli in South Mumbai.',
                rating: 4.6,
                reviews: 932
            },
            {
                id: 'bandra-2',
                name: 'Bandstand Promenade',
                image: '/static/img/bandstand.jpg',
                category: 'Waterfront',
                description: 'Popular seaside promenade offering views of the sea and celebrity homes.',
                rating: 4.4,
                reviews: 653
            },
            {
                id: 'bandra-3',
                name: 'Mount Mary Church',
                image: '/static/img/mount-mary.jpg',
                category: 'Religious',
                description: 'Roman Catholic Basilica dedicated to the Virgin Mary, a popular pilgrimage site.',
                rating: 4.5,
                reviews: 487
            }
        ],
        'juhu': [
            {
                id: 'juhu-1',
                name: 'Juhu Beach',
                image: '/static/img/juhu-beach.jpg',
                category: 'Beach',
                description: 'Popular beach known for its street food, especially pav bhaji and chaat.',
                rating: 4.3,
                reviews: 1125
            },
            {
                id: 'juhu-2',
                name: 'ISKCON Temple',
                image: '/static/img/iskcon.jpg',
                category: 'Religious',
                description: 'Spiritual complex dedicated to Lord Krishna, known for its architecture.',
                rating: 4.7,
                reviews: 673
            },
            {
                id: 'juhu-3',
                name: 'Prithvi Theatre',
                image: '/static/img/prithvi.jpg',
                category: 'Entertainment',
                description: 'Intimate theatre hosting plays, workshops, and an excellent café.',
                rating: 4.6,
                reviews: 321
            }
        ],
        'andheri': [
            {
                id: 'andheri-1',
                name: 'Versova Beach',
                image: '/static/img/versova.jpg',
                category: 'Beach',
                description: 'Beach known for the successful clean-up drives and its fishing village.',
                rating: 4.0,
                reviews: 426
            },
            {
                id: 'andheri-2',
                name: 'Fun Republic Mall',
                image: '/static/img/fun-republic.jpg',
                category: 'Shopping',
                description: 'Shopping mall with cinema, food outlets, and retail stores.',
                rating: 4.2,
                reviews: 587
            },
            {
                id: 'andheri-3',
                name: 'Lokhandwala Market',
                image: '/static/img/lokhandwala.jpg',
                category: 'Shopping',
                description: 'Popular shopping area with street vendors and branded stores.',
                rating: 4.1,
                reviews: 512
            }
        ]
    };
    
    return placesData[neighborhoodId] || [];
}

/**
 * Get statistics for a specific neighborhood
 */
function getNeighborhoodStats(neighborhoodId) {
    // This would come from an API in a production app
    const statsData = {
        'colaba': {
            places: 15,
            restaurants: 28,
            hotels: 12,
            attractions: 9
        },
        'bandra': {
            places: 23,
            restaurants: 42,
            hotels: 15,
            attractions: 11
        },
        'juhu': {
            places: 18,
            restaurants: 34,
            hotels: 9,
            attractions: 7
        },
        'andheri': {
            places: 21,
            restaurants: 37,
            hotels: 14,
            attractions: 8
        }
    };
    
    return statsData[neighborhoodId] || {
        places: 0,
        restaurants: 0,
        hotels: 0,
        attractions: 0
    };
} 