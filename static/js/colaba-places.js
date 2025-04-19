/**
 * Colaba Places - Interactive modal system for Colaba attractions and restaurants
 */

// Place data with images, descriptions, and details
const colabaPlaces = {
    "Leopold Cafe": {
        name: "Leopold Cafe",
        image: "/static/img/leopold_cafe.jpeg",
        fallbackImage: "/static/img/places/leopold-cafe.svg",
        description: "A historic cafe and restaurant established in 1871. Famous for its colonial charm, diverse menu, and its mention in the novel 'Shantaram'.",
        type: "Restaurant",
        rating: 4.4,
        address: "Colaba Causeway, Colaba, Mumbai",
        tags: ["Historic", "Cafe", "Restaurant"],
        tips: [
            "Try their famous beer and beef chilly fry",
            "The upper floor has a more restaurant feel, while the ground floor is casual",
            "Expect a busy atmosphere, especially in the evenings"
        ]
    },
    "Taj Mahal Palace Hotel": {
        name: "Taj Mahal Palace Hotel",
        image: "/static/img/Taj-Mahal-Palace.jpg",
        fallbackImage: "/static/img/places/taj-mahal-hotel.svg",
        description: "This luxury hotel opened in 1903 and stands as a symbol of Indian hospitality. Its distinctive architecture combines Oriental, Florentine, and Moorish styles.",
        type: "Landmark",
        rating: 4.7,
        address: "Apollo Bunder, Colaba, Mumbai",
        tags: ["Historic", "Luxury", "Hotel"],
        tips: [
            "Visit the Sea Lounge for high tea with harbor views",
            "The architecture is best admired from across the street near Gateway of India",
            "Look for the small museum in the heritage wing showcasing the hotel's history"
        ]
    },
    "Gateway of India": {
        name: "Gateway of India",
        image: "/static/img/Gateway.jpg",
        fallbackImage: "/static/img/places/gateway-of-india.svg",
        description: "Built to commemorate the visit of King George V and Queen Mary to Mumbai, this iconic monument has become the symbolic entrance to India for visitors arriving by sea.",
        type: "Monument",
        rating: 4.6,
        address: "Apollo Bunder, Colaba, Mumbai",
        tags: ["Historic", "Monument", "Tourist Spot"],
        tips: [
            "Visit during early morning or sunset for the best views and fewer crowds",
            "Take a ferry ride to Elephanta Caves from here",
            "Street food vendors nearby offer tasty local snacks"
        ]
    },
    "Cafe Mondegar": {
        name: "Cafe Mondegar",
        image: "/static/img/colaba dining.jpg",
        fallbackImage: "/static/img/places/cafe-mondegar.svg",
        description: "Known for its jukebox, beer, and walls adorned with cartoons by Mario Miranda. It's a popular hangout spot for locals and tourists alike.",
        type: "Restaurant",
        rating: 4.3,
        address: "Metro House, Colaba Causeway, Mumbai",
        tags: ["Cafe", "Beer", "Art"],
        tips: [
            "Check out the unique caricatures by Mario Miranda on the walls",
            "Try their Chicken Stroganoff and beer",
            "The jukebox is a unique feature - put in a coin to play your choice of music"
        ]
    },
    "Colaba Causeway Market": {
        name: "Colaba Causeway Market",
        image: "/static/img/colaba attractions.jpg",
        fallbackImage: "/static/img/places/colaba-causeway.svg",
        description: "A bustling street market offering everything from clothing and accessories to souvenirs and handicrafts. It's a paradise for shoppers looking for bargains.",
        type: "Market",
        rating: 4.5,
        address: "Shahid Bhagat Singh Road, Colaba, Mumbai",
        tags: ["Shopping", "Market", "Street"],
        tips: [
            "Bargaining is essential - start at around 50% of the initial asking price",
            "Best time to shop is weekday mornings when it's less crowded",
            "Look for unique jewelry and Rajasthani handicrafts"
        ]
    },
    "Bademiya": {
        name: "Bademiya",
        image: "/static/img/colaba dining.jpg",
        fallbackImage: "/static/img/places/bademiya.svg",
        description: "An iconic street food stall known for its mouthwatering kebabs and rolls. It's been serving delicious food since 1946.",
        type: "Restaurant",
        rating: 4.5,
        address: "Tulloch Road, Behind Taj Mahal Hotel, Colaba, Mumbai",
        tags: ["Street Food", "Kebabs", "Late Night"],
        tips: [
            "The chicken seekh kebab and mutton rolls are must-tries",
            "It gets very busy late at night, especially on weekends",
            "You can eat in your car or take food to go - limited seating available"
        ]
    }
};

// Initialize modals when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create modal HTML structure
    createModalStructure();
    
    // Set up place card click handlers
    setupPlaceCards();
    
    // Initialize save functionality
    initSavePlaceSystem();
});

/**
 * Create the modal structure in the DOM
 */
function createModalStructure() {
    const modalHTML = `
        <div id="place-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Place Details</h2>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="place-details">
                        <div class="place-image-container">
                            <img src="" alt="" class="place-image">
                        </div>
                        <div class="place-info">
                            <div class="place-meta">
                                <span class="place-type"></span>
                                <span class="place-rating"><i class="fas fa-star"></i> <span class="rating-value"></span></span>
                            </div>
                            <p class="place-description"></p>
                            <p class="place-address"><i class="fas fa-map-marker-alt"></i> <span class="address-text"></span></p>
                            
                            <div class="place-tags">
                                <!-- Tags will be inserted here dynamically -->
                            </div>
                        </div>
                        
                        <div class="place-tips">
                            <h3>Local Tips</h3>
                            <ul class="tips-list">
                                <!-- Tips will be inserted here dynamically -->
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn btn-secondary close-modal-btn">Close</button>
                    <button class="modal-btn btn-primary save-place-btn">
                        <i class="fas fa-bookmark"></i> Save to My Trip
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up modal close handlers
    const modal = document.getElementById('place-modal');
    const closeButtons = modal.querySelectorAll('.modal-close, .close-modal-btn');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
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
}

/**
 * Set up click handlers for place cards
 */
function setupPlaceCards() {
    // Find all attraction and restaurant cards
    const placeCards = document.querySelectorAll('.attraction-card, .restaurant-card');
    
    placeCards.forEach(card => {
        // Get place name from the heading
        const titleElement = card.querySelector('h3');
        if (!titleElement) return;
        
        const placeName = titleElement.textContent.trim();
        
        // Make the card clickable
        card.style.cursor = 'pointer';
        card.classList.add('interactive-card');
        
        // Check if card already has a view details button
        const existingButton = card.querySelector('.view-details-btn');
        
        // Add view details button if it doesn't exist
        let viewButton;
        if (!existingButton) {
            viewButton = document.createElement('button');
            viewButton.className = 'view-details-btn';
            viewButton.innerHTML = '<i class="fas fa-info-circle"></i> View Details';
            
            // Create or find a footer to add the button to
            let footer = card.querySelector('.card-footer');
            if (!footer) {
                footer = document.createElement('div');
                footer.className = 'card-footer';
                card.appendChild(footer);
            }
            
            footer.appendChild(viewButton);
        } else {
            viewButton = existingButton;
        }
        
        // Add click handler to both card and button
        card.addEventListener('click', function(e) {
            // Don't trigger if they clicked on the button (let the button handler take care of it)
            if (e.target === viewButton || viewButton.contains(e.target)) {
                return;
            }
            openPlaceModal(placeName);
        });
        
        viewButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            openPlaceModal(placeName);
        });
    });
}

/**
 * Open modal with place details
 */
function openPlaceModal(placeName) {
    const placeData = colabaPlaces[placeName];
    if (!placeData) return;
    
    const modal = document.getElementById('place-modal');
    
    // Set modal content
    modal.querySelector('.modal-title').textContent = placeData.name;
    
    // Set image with fallback
    const imageElement = modal.querySelector('.place-image');
    imageElement.src = placeData.image;
    imageElement.alt = placeData.name;
    imageElement.onerror = function() {
        this.src = placeData.fallbackImage;
    };
    
    modal.querySelector('.place-type').textContent = placeData.type;
    modal.querySelector('.rating-value').textContent = placeData.rating;
    modal.querySelector('.place-description').textContent = placeData.description;
    modal.querySelector('.address-text').textContent = placeData.address;
    
    // Set tags
    const tagsContainer = modal.querySelector('.place-tags');
    tagsContainer.innerHTML = '';
    placeData.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'place-tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
    
    // Set tips
    const tipsList = modal.querySelector('.tips-list');
    tipsList.innerHTML = '';
    placeData.tips.forEach(tip => {
        const tipItem = document.createElement('li');
        tipItem.innerHTML = `<i class="fas fa-lightbulb"></i> ${tip}`;
        tipsList.appendChild(tipItem);
    });
    
    // Update save button state
    updateSaveButtonState(placeData.name);
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/**
 * Initialize the save place functionality
 */
function initSavePlaceSystem() {
    const saveButton = document.querySelector('.save-place-btn');
    if (!saveButton) return;
    
    saveButton.addEventListener('click', function() {
        const placeName = document.querySelector('.modal-title').textContent;
        savePlace(placeName);
    });
}

/**
 * Save a place to localStorage
 */
function savePlace(placeName) {
    const placeData = colabaPlaces[placeName];
    if (!placeData) return;
    
    // Get saved places from localStorage
    let savedPlaces = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
    
    // Check if place is already saved
    const isAlreadySaved = savedPlaces.some(place => place.name === placeName);
    
    if (isAlreadySaved) {
        // Remove from saved places
        savedPlaces = savedPlaces.filter(place => place.name !== placeName);
        showNotification(`Removed ${placeName} from your trip`, 'info');
    } else {
        // Add to saved places
        savedPlaces.push({
            name: placeData.name,
            description: placeData.description,
            image: placeData.image,
            type: placeData.type,
            neighborhood: 'Colaba',
            rating: placeData.rating,
            address: placeData.address
        });
        showNotification(`Added ${placeName} to your trip`, 'success');
    }
    
    // Save updated list
    localStorage.setItem('wetravel_saved_places', JSON.stringify(savedPlaces));
    
    // Update button state
    updateSaveButtonState(placeName);
    
    // Trigger saved trips updated event
    document.dispatchEvent(new CustomEvent('savedTripsUpdated', {
        detail: { trips: savedPlaces }
    }));
}

/**
 * Update save button state based on whether the place is saved
 */
function updateSaveButtonState(placeName) {
    const saveButton = document.querySelector('.save-place-btn');
    if (!saveButton) return;
    
    // Get saved places from localStorage
    const savedPlaces = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
    
    // Check if place is already saved
    const isAlreadySaved = savedPlaces.some(place => place.name === placeName);
    
    if (isAlreadySaved) {
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved to Trip';
        saveButton.classList.add('saved');
    } else {
        saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Save to My Trip';
        saveButton.classList.remove('saved');
    }
}

/**
 * Show a notification
 */
function showNotification(message, type = 'success') {
    // Try to use existing notification function if available
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback to our own implementation
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    
    const messageElement = toast.querySelector('.notification-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    // Set type class
    toast.className = 'notification-toast';
    toast.classList.add(`notification-${type}`);
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
} 