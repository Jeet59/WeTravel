/**
 * WeTravel Mumbai - Enhanced UI Features
 * Handles advanced UI interactions and visualizations
 */

document.addEventListener('DOMContentLoaded', function() {
    initChatEnhancements();
    initMapFeatures();
    initTripPlanner();
    initModalSystem();
    initProfileFeatures();
});

/**
 * Enhance the chat interface with additional features
 */
function initChatEnhancements() {
    // Add typing indicator functionality
    const messagesContainer = document.getElementById('messages');
    const inputMessage = document.getElementById('input-message');
    const chatForm = document.getElementById('chat-form');
    const sendButton = document.getElementById('send-button');
    
    if (!messagesContainer || !inputMessage) return;
    
    // Track chat history for context
    let chatHistory = [];
    
    // Handle form submission
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
    
    // Handle send button click
    if (sendButton) {
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
    
    // Function to send a message
    function sendMessage() {
        const message = inputMessage.value.trim();
        if (message === '') return; // Don't send empty messages
        
        // Add user message to chat
        addMessageToChat(message, true);
        
        // Clear input
        inputMessage.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Add to chat history
        chatHistory.push({
            role: "user",
            content: message
        });
        
        // Track API success for fallback mode
        let useFallbackMode = localStorage.getItem('chat_fallback_mode') === 'true';
        let apiTimeout;
        
        // Set a timeout - if API doesn't respond in 8 seconds, use fallback
        apiTimeout = setTimeout(() => {
            // If this timeout executes, the API didn't respond in time
            if (document.getElementById('typing-indicator')) {
                console.log('API timeout - switching to fallback mode');
                localStorage.setItem('chat_fallback_mode', 'true');
                handleFallbackResponse(message);
            }
        }, 8000);
        
        // If we're already in fallback mode, don't even try the API
        if (useFallbackMode) {
            console.log('Using fallback mode based on previous failures');
            setTimeout(() => {
                clearTimeout(apiTimeout);
                handleFallbackResponse(message);
            }, 1500); // Simulate a small delay
            return;
        }
        
        // Send message to backend API
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: chatHistory
            })
        })
        .then(response => {
            clearTimeout(apiTimeout); // Clear the timeout since we got a response
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // API worked, so disable fallback mode
            localStorage.setItem('chat_fallback_mode', 'false');
            return response.json();
        })
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // If successful response
            if (data && data.response) {
                // Add to chat history
                chatHistory.push({
                    role: "assistant",
                    content: data.response
                });
                
                // Add assistant response to chat
                addMessageToChat(data.response, false);
                
                // Update chat counter in localStorage
                const chatCount = parseInt(localStorage.getItem('chat_count') || '0');
                localStorage.setItem('chat_count', chatCount + 1);
            } else {
                // Handle empty or invalid response
                handleFallbackResponse(message);
            }
        })
        .catch(error => {
            clearTimeout(apiTimeout); // Clear the timeout
            console.error('Error sending message:', error);
            // Set fallback mode
            localStorage.setItem('chat_fallback_mode', 'true');
            handleFallbackResponse(message);
        });
    }
    
    // Function to handle fallback responses when API fails
    function handleFallbackResponse(message) {
        hideTypingIndicator();
        
        // Generate a simple fallback response based on keywords
        let response = "I'm here to help with your Mumbai travel questions!";
        
        // Simple keyword matching for demo responses
        const msgLower = message.toLowerCase();
        if (msgLower.includes('restaurant') || msgLower.includes('food') || msgLower.includes('eat')) {
            response = "Mumbai has amazing food options! Some popular restaurants include Leopold Cafe in Colaba, Britannia & Co. for Parsi cuisine, and street food at Juhu Beach.";
        } else if (msgLower.includes('hotel') || msgLower.includes('stay') || msgLower.includes('accommodation')) {
            response = "There are great accommodation options in Mumbai ranging from luxury hotels like the Taj Mahal Palace to boutique hotels in Bandra and budget-friendly options in Colaba.";
        } else if (msgLower.includes('transport') || msgLower.includes('travel') || msgLower.includes('get around')) {
            response = "Mumbai has a comprehensive public transport system including local trains, buses, taxis, and auto-rickshaws. The local train is the fastest way to travel long distances.";
        } else if (msgLower.includes('weather') || msgLower.includes('climate') || msgLower.includes('rain')) {
            response = "Mumbai has a tropical climate. The best time to visit is from October to February when the weather is pleasant. June to September is monsoon season with heavy rainfall.";
        } else if (msgLower.includes('gateway') || msgLower.includes('monument') || msgLower.includes('see')) {
            response = "The Gateway of India is Mumbai's most iconic monument. Other must-see places include Marine Drive, Elephanta Caves, and the Taj Mahal Palace Hotel.";
        } else if (msgLower.includes('shopping') || msgLower.includes('buy') || msgLower.includes('market')) {
            response = "Colaba Causeway is great for souvenirs and street shopping. For malls, check out High Street Phoenix in Lower Parel or Palladium Mall.";
        }
        
        // Add to chat history
        chatHistory.push({
            role: "assistant",
            content: response
        });
        
        // Display the fallback response
        addMessageToChat(response, false);
    }
    
    // Function to add message to chat
    function addMessageToChat(message, isUser) {
        const messageElement = document.createElement('div');
        messageElement.className = isUser ? 'message message-user' : 'message message-assistant';
        
        if (isUser) {
            messageElement.innerHTML = `
                <div class="message-content">${message}</div>
                <span class="timestamp">Just now</span>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="assistant-avatar">
                    <img src="/static/img/assistant-avatar.svg" alt="Assistant">
                </div>
                <div class="message-bubble">
                    <div class="message-content">${message}</div>
                    <span class="timestamp">Just now</span>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Add suggested prompts to chat
    const suggestedPrompts = [
        "What are the best street foods in Mumbai?",
        "Top 5 museums in Mumbai",
        "How to use public transport in Mumbai",
        "Best time to visit Gateway of India"
    ];
    
    // Create and add suggested prompts to chat
    const promptsContainer = document.createElement('div');
    promptsContainer.className = 'suggested-prompts';
    
    suggestedPrompts.forEach(prompt => {
        const promptButton = document.createElement('button');
        promptButton.className = 'prompt-btn';
        promptButton.textContent = prompt;
        
        promptButton.addEventListener('click', function() {
            inputMessage.value = prompt;
            document.getElementById('send-button').click();
        });
        
        promptsContainer.appendChild(promptButton);
    });
    
    // Insert after messages container
    if (messagesContainer.parentNode) {
        messagesContainer.parentNode.insertBefore(promptsContainer, messagesContainer.nextSibling);
    }
    
    // Add "Assistant is typing..." indicator
    window.showTypingIndicator = function() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message message-assistant typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        typingDiv.id = 'typing-indicator';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    
    window.hideTypingIndicator = function() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };
    
    // Override the global fetch to show typing indicator for chat requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string' && url.includes('/chat') && options && options.method === 'POST') {
            showTypingIndicator();
            
            return originalFetch(url, options).then(response => {
                setTimeout(() => {
                    hideTypingIndicator();
                }, 500);
                return response;
            }).catch(err => {
                hideTypingIndicator();
                throw err;
            });
        }
        
        return originalFetch(url, options);
    };
}

/**
 * Initialize interactive map features
 */
function initMapFeatures() {
    const mapContainer = document.getElementById('map-canvas');
    if (!mapContainer) return;
    
    // Check if we've already initialized the map
    if (mapContainer.hasChildNodes()) return;
    
    // Create a basic map UI if no actual map is available
    mapContainer.innerHTML = `
        <div class="map-placeholder">
            <img src="/static/img/mumbai-map.svg" alt="Mumbai Map" class="map-image">
            <div class="map-overlay">
                <div class="map-pin" style="top: 45%; left: 30%;" data-place="Colaba">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="pin-label">Colaba</span>
                </div>
                <div class="map-pin" style="top: 35%; left: 55%;" data-place="Bandra">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="pin-label">Bandra</span>
                </div>
                <div class="map-pin" style="top: 25%; left: 60%;" data-place="Juhu">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="pin-label">Juhu</span>
                </div>
                <div class="map-pin" style="top: 20%; left: 70%;" data-place="Andheri">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="pin-label">Andheri</span>
                </div>
                <div class="map-pin" style="top: 40%; left: 45%;" data-place="Dadar">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="pin-label">Dadar</span>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners to map pins
    const mapPins = document.querySelectorAll('.map-pin');
    mapPins.forEach(pin => {
        pin.addEventListener('click', function() {
            const placeName = this.getAttribute('data-place');
            
            // Create info window
            const infoWindow = document.createElement('div');
            infoWindow.className = 'map-info-window';
            infoWindow.innerHTML = `
                <h3>${placeName}</h3>
                <p>A popular area in Mumbai known for its attractions and culture.</p>
                <button class="btn-sm btn-primary view-details-btn">View Details</button>
            `;
            
            // Remove any existing info windows
            const existingInfoWindows = document.querySelectorAll('.map-info-window');
            existingInfoWindows.forEach(window => window.remove());
            
            // Add the info window to the map
            this.appendChild(infoWindow);
            
            // Add click event to view details button
            const viewDetailsBtn = infoWindow.querySelector('.view-details-btn');
            viewDetailsBtn.addEventListener('click', function() {
                // Find corresponding neighborhood card and simulate click
                const cards = document.querySelectorAll('.neighborhood-card');
                cards.forEach(card => {
                    const cardName = card.querySelector('h3').textContent;
                    if (cardName === placeName) {
                        // Switch to neighborhoods tab first
                        const neighborhoodsTab = document.querySelector('[data-tab="neighborhoods"]');
                        if (neighborhoodsTab) {
                            neighborhoodsTab.click();
                        }
                        
                        // Then click the card
                        setTimeout(() => {
                            card.querySelector('.view-btn').click();
                        }, 300);
                    }
                });
            });
            
            // Close the info window when clicking outside
            document.addEventListener('click', function closeInfoWindow(e) {
                if (!infoWindow.contains(e.target) && !pin.contains(e.target)) {
                    infoWindow.remove();
                    document.removeEventListener('click', closeInfoWindow);
                }
            });
        });
    });
    
    // Add event listeners to map controls
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const currentLocationBtn = document.getElementById('current-location');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            const mapImage = document.querySelector('.map-image');
            if (mapImage) {
                mapImage.style.transform = mapImage.style.transform ? 
                    mapImage.style.transform.replace(/scale\([^)]*\)/, `scale(${parseFloat(mapImage.style.transform.match(/scale\(([^)]*)\)/)?.[1] || 1) + 0.1})`) : 
                    'scale(1.1)';
            }
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            const mapImage = document.querySelector('.map-image');
            if (mapImage) {
                const currentScale = parseFloat(mapImage.style.transform.match(/scale\(([^)]*)\)/)?.[1] || 1);
                const newScale = Math.max(0.5, currentScale - 0.1);
                
                mapImage.style.transform = mapImage.style.transform ? 
                    mapImage.style.transform.replace(/scale\([^)]*\)/, `scale(${newScale})`) : 
                    `scale(${newScale})`;
            }
        });
    }
    
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', function() {
            // Reset map view
            const mapImage = document.querySelector('.map-image');
            if (mapImage) {
                mapImage.style.transform = 'scale(1)';
            }
            
            // Show current location toast
            showNotification('Current location: Mumbai, India');
        });
    }
}

/**
 * Initialize trip planner functionality
 */
function initTripPlanner() {
    const tripContainer = document.getElementById('trip');
    if (!tripContainer) return;
    
    // Initialize day tabs
    const dayTabs = tripContainer.querySelectorAll('.day-tab');
    const dayContents = tripContainer.querySelectorAll('.itinerary-day');
    
    dayTabs.forEach((tab, index) => {
        if (index < dayTabs.length - 1) { // Ignore the "Add Day" button
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and contents
                dayTabs.forEach(t => t.classList.remove('active'));
                dayContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                if (dayContents[index]) {
                    dayContents[index].classList.add('active');
                }
            });
        }
    });
    
    // Add Day functionality
    const addDayButton = dayTabs[dayTabs.length - 1];
    if (addDayButton) {
        addDayButton.addEventListener('click', function() {
            const dayCount = dayTabs.length - 1; // Minus the "Add Day" button
            
            // Create new day tab
            const newTab = document.createElement('button');
            newTab.className = 'day-tab';
            newTab.textContent = `Day ${dayCount + 1}`;
            
            // Insert before the "Add Day" button
            addDayButton.parentNode.insertBefore(newTab, addDayButton);
            
            // Create new day content
            const newContent = document.createElement('div');
            newContent.className = 'itinerary-day';
            newContent.innerHTML = `
                <div class="timeline">
                    <div class="empty-timeline">
                        <p>No activities planned for this day yet.</p>
                        <p>Add activities using the form below or drag saved places here.</p>
                    </div>
                </div>
                
                <div class="add-activity">
                    <input type="text" placeholder="Add a new activity...">
                    <button class="btn-primary">Add</button>
                </div>
            `;
            
            // Add to the container
            const itineraryContainer = tripContainer.querySelector('.itinerary-container');
            itineraryContainer.appendChild(newContent);
            
            // Activate click event for the new tab
            newTab.addEventListener('click', function() {
                // Remove active class from all tabs and contents
                dayTabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.itinerary-day').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                newContent.classList.add('active');
            });
            
            // Activate the new tab
            newTab.click();
        });
    }
    
    // Initialize saved places
    const savedPlacesContainer = document.getElementById('saved-places');
    if (savedPlacesContainer) {
        updateSavedTripsUI();
    }
    
    // Add Activity functionality
    const addActivityForms = tripContainer.querySelectorAll('.add-activity');
    addActivityForms.forEach(form => {
        const input = form.querySelector('input');
        const button = form.querySelector('button');
        
        if (input && button) {
            button.addEventListener('click', function() {
                addActivity(input, form);
            });
            
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addActivity(input, form);
                }
            });
        }
    });
    
    function addActivity(input, form) {
        const activity = input.value.trim();
        
        if (!activity) return;
        
        const timeline = form.parentNode.querySelector('.timeline');
        const emptyTimeline = timeline.querySelector('.empty-timeline');
        
        if (emptyTimeline) {
            emptyTimeline.remove();
        }
        
        // Get current time for the new activity
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Create new timeline item
        const newItem = document.createElement('div');
        newItem.className = 'timeline-item';
        newItem.innerHTML = `
            <div class="timeline-time">${timeString}</div>
            <div class="timeline-card">
                <h4>${activity}</h4>
                <p>Added activity</p>
                <button class="remove-activity-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        timeline.appendChild(newItem);
        
        // Add remove functionality
        const removeBtn = newItem.querySelector('.remove-activity-btn');
        removeBtn.addEventListener('click', function() {
            newItem.remove();
            
            // If timeline is empty, show empty state
            if (timeline.children.length === 0) {
                timeline.innerHTML = `
                    <div class="empty-timeline">
                        <p>No activities planned for this day yet.</p>
                        <p>Add activities using the form below or drag saved places here.</p>
                    </div>
                `;
            }
        });
        
        // Clear input
        input.value = '';
    }
}

/**
 * Update the saved trips UI
 */
function updateSavedTripsUI() {
    const savedPlacesContainer = document.getElementById('saved-places');
    if (!savedPlacesContainer) return;
    
    // Get saved trips
    const savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
    
    // Clear container
    savedPlacesContainer.innerHTML = '';
    
    if (savedTrips.length === 0) {
        savedPlacesContainer.innerHTML = `
            <div class="empty-saved-places">
                <i class="fas fa-bookmark"></i>
                <p>You haven't saved any places yet.</p>
                <p>Explore neighborhoods and save places to your trip!</p>
            </div>
        `;
        return;
    }
    
    // Add saved places to the container
    savedTrips.forEach(place => {
        const placeName = place.name || place.id;
        const placeCard = document.createElement('div');
        placeCard.className = 'saved-place-card';
        placeCard.innerHTML = `
            <img src="${place.image || `/static/img/${placeName.toLowerCase().replace(/\s+/g, '-')}.jpg`}" 
                 alt="${placeName}" class="saved-place-img">
            <div class="saved-place-details">
                <h4>${placeName}</h4>
                <p>${place.description || `A great place to visit in ${place.neighborhood || 'Mumbai'}`}</p>
                <div class="saved-place-actions">
                    <button class="view-details-btn" data-place="${placeName}">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="add-to-itinerary-btn" data-place="${placeName}">
                        <i class="fas fa-calendar-plus"></i>
                    </button>
                    <button class="remove-from-saved-btn" data-place="${placeName}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        savedPlacesContainer.appendChild(placeCard);
        
        // Add event listeners to buttons
        const viewDetailsBtn = placeCard.querySelector('.view-details-btn');
        const addToItineraryBtn = placeCard.querySelector('.add-to-itinerary-btn');
        const removeBtn = placeCard.querySelector('.remove-from-saved-btn');
        
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', function() {
                showPlaceDetails(place);
            });
        }
        
        if (addToItineraryBtn) {
            addToItineraryBtn.addEventListener('click', function() {
                // Find active day in itinerary
                const activeDay = document.querySelector('.itinerary-day.active');
                if (!activeDay) {
                    showNotification('Please select a day in your itinerary first', 'info');
                    return;
                }
                
                const timeline = activeDay.querySelector('.timeline');
                const emptyTimeline = timeline.querySelector('.empty-timeline');
                
                if (emptyTimeline) {
                    emptyTimeline.remove();
                }
                
                // Get current time
                const now = new Date();
                const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Create new timeline item
                const newItem = document.createElement('div');
                newItem.className = 'timeline-item';
                newItem.innerHTML = `
                    <div class="timeline-time">${timeString}</div>
                    <div class="timeline-card">
                        <h4>Visit ${placeName}</h4>
                        <p>${place.description || `Explore ${placeName}`}</p>
                        <button class="remove-activity-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                timeline.appendChild(newItem);
                
                // Add remove functionality
                const removeBtn = newItem.querySelector('.remove-activity-btn');
                removeBtn.addEventListener('click', function() {
                    newItem.remove();
                    
                    // If timeline is empty, show empty state
                    if (timeline.children.length === 0) {
                        timeline.innerHTML = `
                            <div class="empty-timeline">
                                <p>No activities planned for this day yet.</p>
                                <p>Add activities using the form below or drag saved places here.</p>
                            </div>
                        `;
                    }
                });
                
                showNotification(`Added ${placeName} to your itinerary`, 'success');
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                if (typeof saveToTrip === 'function') {
                    saveToTrip(placeName);
                } else {
                    // Fallback if saveToTrip not available
                    // Remove from localStorage
                    const updatedTrips = savedTrips.filter(item => (item.name || item.id) !== placeName);
                    localStorage.setItem('wetravel_saved_places', JSON.stringify(updatedTrips));
                    localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
                    localStorage.setItem('saved_trips', JSON.stringify(updatedTrips));
                    
                    // Remove card from UI
                    placeCard.remove();
                    
                    // Show notification
                    showNotification(`Removed ${placeName} from your saved places`);
                    
                    // If container is now empty, show empty state
                    if (savedPlacesContainer.children.length === 0) {
                        savedPlacesContainer.innerHTML = `
                            <div class="empty-saved-places">
                                <i class="fas fa-bookmark"></i>
                                <p>You haven't saved any places yet.</p>
                                <p>Explore neighborhoods and save places to your trip!</p>
                            </div>
                        `;
                    }
                }
            });
        }
    });
}

/**
 * Initialize the modal system for place details
 */
function initModalSystem() {
    window.showPlaceDetails = function(place) {
        const placeName = place.name || place.id;
        const placeDescription = place.description || `A great place to visit in ${place.neighborhood || 'Mumbai'}`;
        const placeImage = place.image || `/static/img/${placeName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        const placeCategory = place.category || place.tags?.[0] || 'Attraction';
        
        // Get the modal elements
        const modalOverlay = document.querySelector('.modal-overlay');
        const modalTitle = document.querySelector('.modal-title');
        const modalBody = document.querySelector('.modal-body');
        const modalSaveBtn = document.querySelector('.modal-footer .btn-primary');
        
        if (!modalOverlay || !modalTitle || !modalBody) return;
        
        // Set the modal content
        modalTitle.textContent = placeName;
        
        modalBody.innerHTML = `
            <div class="modal-place-details">
                <img src="${placeImage}" alt="${placeName}" class="modal-place-image">
                
                <div class="modal-place-info">
                    <p class="modal-place-description">${placeDescription}</p>
                    
                    <div class="modal-place-meta">
                        <div class="modal-place-category">
                            <i class="fas fa-tag"></i>
                            <span>${placeCategory}</span>
                        </div>
                        
                        <div class="modal-place-rating">
                            <i class="fas fa-star"></i>
                            <span>${place.rating || '4.5'}</span>
                        </div>
                    </div>
                    
                    <div class="modal-place-address">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${place.address || 'Mumbai, India'}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Setup save button
        if (modalSaveBtn) {
            // Check if place is already saved
            const savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
            const isAlreadySaved = savedTrips.some(item => (item.name || item.id) === placeName);
            
            if (isAlreadySaved) {
                modalSaveBtn.textContent = 'Remove from Trip';
                modalSaveBtn.classList.add('btn-danger');
                modalSaveBtn.classList.remove('btn-primary');
            } else {
                modalSaveBtn.textContent = 'Save to Trip';
                modalSaveBtn.classList.add('btn-primary');
                modalSaveBtn.classList.remove('btn-danger');
            }
            
            // Clear any existing event listeners
            const newBtn = modalSaveBtn.cloneNode(true);
            modalSaveBtn.parentNode.replaceChild(newBtn, modalSaveBtn);
            
            // Add event listener for save button
            newBtn.addEventListener('click', function() {
                if (typeof saveToTrip === 'function') {
                    saveToTrip(placeName, place);
                    
                    // Close modal
                    modalOverlay.classList.remove('active');
                }
            });
        }
        
        // Show the modal
        modalOverlay.classList.add('active');
        
        // Add close event listeners if not already added
        const closeButtons = modalOverlay.querySelectorAll('.modal-close, .btn-secondary');
        closeButtons.forEach(btn => {
            // Clear existing listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add new listener
            newBtn.addEventListener('click', function() {
                modalOverlay.classList.remove('active');
            });
        });
        
        // Close on outside click
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    };
}

/**
 * Initialize profile features
 */
function initProfileFeatures() {
    // Get profile elements
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profileContents = document.querySelectorAll('.profile-tab-content');
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    
    // Setup profile tabs
    if (profileTabs.length > 0 && profileContents.length > 0) {
        profileTabs.forEach((tab, index) => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and content
                profileTabs.forEach(t => t.classList.remove('active'));
                profileContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                const tabId = this.getAttribute('data-tab');
                const targetContent = document.getElementById(`${tabId}-tab`);
                
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
    
    // Handle edit profile button
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Show a modal or form for editing profile
            const modalOverlay = document.querySelector('.modal-overlay');
            const modalTitle = document.querySelector('.modal-title');
            const modalBody = document.querySelector('.modal-body');
            const modalPrimaryBtn = document.querySelector('.modal-footer .btn-primary');
            
            if (!modalOverlay || !modalTitle || !modalBody) return;
            
            // Get user data
            const userData = JSON.parse(sessionStorage.getItem('wetravel_auth') || '{}');
            
            // Set modal content
            modalTitle.textContent = 'Edit Profile';
            
            modalBody.innerHTML = `
                <div class="edit-profile-form">
                    <div class="form-group">
                        <label for="edit-name">Full Name</label>
                        <input type="text" id="edit-name" value="${userData.name || 'Guest User'}" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-email">Email</label>
                        <input type="email" id="edit-email" value="${userData.email || 'guest@example.com'}" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-preferences">Travel Preferences</label>
                        <select id="edit-preferences" class="form-control">
                            <option value="culture" ${userData.preferences === 'culture' ? 'selected' : ''}>Cultural Experiences</option>
                            <option value="food" ${userData.preferences === 'food' ? 'selected' : ''}>Food & Dining</option>
                            <option value="adventure" ${userData.preferences === 'adventure' ? 'selected' : ''}>Adventure & Outdoors</option>
                            <option value="relaxation" ${userData.preferences === 'relaxation' ? 'selected' : ''}>Relaxation & Wellness</option>
                            <option value="shopping" ${userData.preferences === 'shopping' ? 'selected' : ''}>Shopping & Entertainment</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Profile Photo</label>
                        <div class="profile-photo-upload">
                            <img src="/static/img/default-avatar.jpg" alt="Profile" class="edit-profile-avatar">
                            <button type="button" class="btn-sm btn-secondary">Change Photo</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Setup save button
            if (modalPrimaryBtn) {
                modalPrimaryBtn.textContent = 'Save Changes';
                
                // Clear existing listeners
                const newBtn = modalPrimaryBtn.cloneNode(true);
                modalPrimaryBtn.parentNode.replaceChild(newBtn, modalPrimaryBtn);
                
                // Add new listener
                newBtn.addEventListener('click', function() {
                    const name = document.getElementById('edit-name').value;
                    const email = document.getElementById('edit-email').value;
                    const preferences = document.getElementById('edit-preferences').value;
                    
                    // Update user data
                    userData.name = name;
                    userData.email = email;
                    userData.preferences = preferences;
                    
                    // Save to session storage
                    sessionStorage.setItem('wetravel_auth', JSON.stringify(userData));
                    
                    // Update UI
                    const userNameElements = document.querySelectorAll('.user-name');
                    const userEmailElements = document.querySelectorAll('.user-email');
                    
                    userNameElements.forEach(el => {
                        el.textContent = name;
                    });
                    
                    userEmailElements.forEach(el => {
                        el.textContent = email;
                    });
                    
                    // Close modal
                    modalOverlay.classList.remove('active');
                    
                    // Show notification
                    if (typeof showNotification === 'function') {
                        showNotification('Profile updated successfully', 'success');
                    }
                });
            }
            
            // Show the modal
            modalOverlay.classList.add('active');
        });
    }
    
    // Initialize saved places in the profile tab
    updateProfileSavedPlaces();
    
    // Listen for changes to saved places
    document.addEventListener('savedTripsUpdated', function() {
        updateProfileSavedPlaces();
    });
}

/**
 * Update saved places in the profile tab
 */
function updateProfileSavedPlaces() {
    const savedPlacesContainer = document.querySelector('#saved-tab .saved-places');
    if (!savedPlacesContainer) return;
    
    // Get saved trips
    const savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
    
    // Clear container
    savedPlacesContainer.innerHTML = '';
    
    if (savedTrips.length === 0) {
        savedPlacesContainer.innerHTML = `
            <div class="empty-saved-places">
                <i class="fas fa-bookmark"></i>
                <p>You haven't saved any places yet.</p>
                <p>Explore neighborhoods and save places to your trip!</p>
                <button class="btn-primary explore-btn">
                    <i class="fas fa-map-marked-alt"></i> Explore Neighborhoods
                </button>
            </div>
        `;
        
        // Add event listener to explore button
        const exploreBtn = savedPlacesContainer.querySelector('.explore-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', function() {
                // Navigate to neighborhoods tab
                const neighborhoodsTab = document.querySelector('[data-tab="neighborhoods"]');
                if (neighborhoodsTab) {
                    neighborhoodsTab.click();
                }
            });
        }
        
        return;
    }
    
    // Add saved places to the container
    savedTrips.forEach(place => {
        const placeName = place.name || place.id;
        const placeCard = document.createElement('div');
        placeCard.className = 'saved-place-card';
        placeCard.innerHTML = `
            <img src="${place.image || `/static/img/${placeName.toLowerCase().replace(/\s+/g, '-')}.jpg`}" 
                 alt="${placeName}" class="saved-place-img">
            <div class="saved-place-details">
                <h4>${placeName}</h4>
                <p>${place.description || `A great place to visit in ${place.neighborhood || 'Mumbai'}`}</p>
                <div class="saved-place-actions">
                    <button class="view-details-btn" data-place="${placeName}">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="remove-from-saved-btn" data-place="${placeName}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        
        savedPlacesContainer.appendChild(placeCard);
        
        // Add event listeners to buttons
        const viewDetailsBtn = placeCard.querySelector('.view-details-btn');
        const removeBtn = placeCard.querySelector('.remove-from-saved-btn');
        
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', function() {
                showPlaceDetails(place);
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                if (typeof saveToTrip === 'function') {
                    saveToTrip(placeName);
                } else {
                    // Fallback if saveToTrip not available
                    // Remove from localStorage
                    const updatedTrips = savedTrips.filter(item => (item.name || item.id) !== placeName);
                    localStorage.setItem('wetravel_saved_places', JSON.stringify(updatedTrips));
                    localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
                    localStorage.setItem('saved_trips', JSON.stringify(updatedTrips));
                    
                    // Remove card from UI
                    placeCard.remove();
                    
                    // Show notification
                    if (typeof showNotification === 'function') {
                        showNotification(`Removed ${placeName} from your saved places`);
                    }
                    
                    // If container is now empty, show empty state
                    if (savedPlacesContainer.children.length === 0) {
                        updateProfileSavedPlaces();
                    }
                }
            });
        }
    });
    
    // Update profile stats
    const statValue = document.querySelector('.profile-stats .stat-value');
    if (statValue) {
        statValue.textContent = savedTrips.length;
    }
}

// Enhanced UI Interactions for WeTravel Mumbai
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initTooltips();
  initScrollEffects();
  initFilterAnimations();
  initMetricsCounters();
  initMobileOptimizations();
  
  // Load and display user data in profile
  function loadUserProfile() {
    // Check if user is logged in
    const userData = JSON.parse(sessionStorage.getItem('wetravel_auth') || '{}');
    
    if (userData.name) {
      // Update sidebar user info
      const sidebarUserName = document.getElementById('user-name');
      const sidebarUserEmail = document.getElementById('user-email');
      
      if (sidebarUserName) sidebarUserName.textContent = userData.name;
      if (sidebarUserEmail) sidebarUserEmail.textContent = userData.email;
      
      // Update profile page
      const profileName = document.getElementById('profile-name');
      const profileEmail = document.getElementById('profile-email');
      
      if (profileName) profileName.textContent = userData.name;
      if (profileEmail) profileEmail.textContent = userData.email;
      
      // Calculate and display member since date
      const profileMember = document.querySelector('.profile-member');
      if (profileMember) {
        const registerDate = userData.registerDate || new Date().toISOString();
        const date = new Date(registerDate);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        profileMember.textContent = `Member since: ${formattedDate}`;
      }
    }
  }
  
  // Initial load of user profile
  loadUserProfile();
  
  // Quick reply functionality in chat
  const quickReplies = document.querySelectorAll('.quick-reply-chip');
  const inputMessage = document.getElementById('input-message');
  const sendButton = document.getElementById('send-button');
  
  quickReplies.forEach(chip => {
    chip.addEventListener('click', function() {
      const message = this.getAttribute('data-message');
      if (inputMessage) {
        inputMessage.value = message;
        if (sendButton) {
          // Simulate button click
          sendButton.click();
        }
      }
    });
  });
  
  // Gallery category filtering
  const galleryCategories = document.querySelectorAll('.gallery-category');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryCategories.forEach(category => {
    category.addEventListener('click', function() {
      // Remove active class from all categories
      galleryCategories.forEach(cat => cat.classList.remove('active'));
      
      // Add active class to clicked category
      this.classList.add('active');
      
      const selectedCategory = this.getAttribute('data-category');
      
      galleryItems.forEach(item => {
        if (selectedCategory === 'all' || item.getAttribute('data-category') === selectedCategory) {
          item.style.display = 'block';
          // Add fade-in animation
          item.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
  
  // Gallery image lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const imgSrc = this.querySelector('img').getAttribute('src');
      const imgTitle = this.querySelector('h4').textContent;
      const imgDesc = this.querySelector('p').textContent;
      
      // Create lightbox
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close">&times;</button>
          <img src="${imgSrc}" alt="${imgTitle}">
          <div class="lightbox-caption">
            <h3>${imgTitle}</h3>
            <p>${imgDesc}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(lightbox);
      
      // Animation
      setTimeout(() => lightbox.classList.add('active'), 10);
      
      // Close lightbox
      const closeBtn = lightbox.querySelector('.lightbox-close');
      closeBtn.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });
      
      function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(() => lightbox.remove(), 300);
      }
    });
  });
  
  // Modal handling
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      
      const modalId = this.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      
      if (modal) {
        modal.classList.add('active');
        
        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
          });
        }
        
        // Close on outside click
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            modal.classList.remove('active');
          }
        });
      }
    });
  });
  
  // Itinerary Plan Generator animation
  const generatePlanBtn = document.querySelector('.generate-plan-btn');
  if (generatePlanBtn) {
    generatePlanBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
      this.disabled = true;
      
      // Simulate loading
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-magic"></i> Generate Plan';
        this.disabled = false;
        
        // Show success message
        const itineraryContainer = document.querySelector('.itinerary-container');
        if (itineraryContainer) {
          const successMsg = document.createElement('div');
          successMsg.className = 'success-message';
          successMsg.innerHTML = 'Your personalized plan has been generated!';
          
          itineraryContainer.prepend(successMsg);
          
          setTimeout(() => {
            successMsg.classList.add('show');
          }, 100);
          
          setTimeout(() => {
            successMsg.classList.remove('show');
            setTimeout(() => successMsg.remove(), 500);
          }, 3000);
        }
      }, 2000);
    });
  }
  
  // Plan duration and interest selectors
  const planDuration = document.getElementById('plan-duration');
  const planInterest = document.getElementById('plan-interest');
  
  if (planDuration && planInterest) {
    [planDuration, planInterest].forEach(select => {
      select.addEventListener('change', function() {
        // Simulate loading
        const generateBtn = document.querySelector('.generate-plan-btn');
        if (generateBtn) {
          generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
          generateBtn.disabled = true;
          
          setTimeout(() => {
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Plan';
            generateBtn.disabled = false;
          }, 1000);
        }
      });
    });
  }
  
  // Saved plans selection
  const savedPlans = document.querySelectorAll('.saved-plans li');
  savedPlans.forEach(plan => {
    plan.addEventListener('click', function() {
      savedPlans.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      
      // Update plan name in header
      const planName = this.textContent;
      const headerTitle = document.querySelector('.itinerary-header h3');
      if (headerTitle) {
        headerTitle.textContent = planName;
      }
    });
  });
  
  // Profile navigation tabs
  const profileNavButtons = document.querySelectorAll('.profile-navigation button');
  profileNavButtons.forEach(button => {
    button.addEventListener('click', function() {
      profileNavButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Check if this is the "Account Settings" button
      if (this.textContent.trim() === 'Account Settings') {
        // Show account settings section (could be expanded in the future)
        const accountSettings = document.createElement('div');
        accountSettings.className = 'account-settings-section';
        accountSettings.innerHTML = `
          <div class="setting-group">
            <h4>Password</h4>
            <button class="btn-outline">Change Password</button>
          </div>
          <div class="setting-group">
            <h4>Email Notifications</h4>
            <label class="toggle-switch">
              <input type="checkbox" checked>
              <span class="toggle-slider"></span>
              <span class="toggle-label">Receive travel updates</span>
            </label>
          </div>
          <div class="setting-group">
            <h4>Account Actions</h4>
            <button id="confirm-logout" class="btn-danger">Logout</button>
          </div>
        `;
        
        // Replace current profile section content
        const profileSection = document.querySelector('.profile-section');
        if (profileSection) {
          profileSection.innerHTML = '';
          profileSection.appendChild(accountSettings);
          
          // Add logout handler
          const confirmLogoutBtn = document.getElementById('confirm-logout');
          if (confirmLogoutBtn) {
            confirmLogoutBtn.addEventListener('click', function() {
              // Clear auth data
              sessionStorage.removeItem('wetravel_auth');
              // Redirect to login page
              window.location.href = '/';
            });
          }
        }
      }
    });
  });
  
  // Connect logout button in sidebar
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      // Clear auth data
      sessionStorage.removeItem('wetravel_auth');
      // Redirect to login page
      window.location.href = '/';
    });
  }
  
  // Footer subscribe form
  const subscribeForm = document.querySelector('.footer-subscribe');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const input = this.querySelector('input');
      const button = this.querySelector('button');
      
      if (input.value.trim() !== '') {
        // Disable input and button
        input.disabled = true;
        button.disabled = true;
        button.innerHTML = 'Subscribing...';
        
        // Simulate API call
        setTimeout(() => {
          this.innerHTML = '<p class="success">Thanks for subscribing!</p>';
        }, 1500);
      }
    });
  }
  
  // Contact form
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;
      
      // Simulate form submission
      setTimeout(() => {
        contactForm.innerHTML = `
          <div class="success-message show">
            <i class="fas fa-check-circle"></i>
            <h3>Message Sent!</h3>
            <p>We'll get back to you soon.</p>
          </div>
        `;
      }, 2000);
    });
  }
  
  // Add animations to cards and sections
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.resource-card, .gallery-item, .profile-section, .itinerary-day');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      
      if (elementTop < window.innerHeight && elementBottom > 0) {
        element.classList.add('animated');
      }
    });
  };
  
  // Initial check and add scroll listener
  animateOnScroll();
  window.addEventListener('scroll', animateOnScroll);
});

// Initialize smooth animations for UI elements
function initAnimations() {
  // Fade in main content
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.classList.add('fade-in');
  }
  
  // Add hover effects to cards
  document.querySelectorAll('.card, .recommendation-card, .neighborhood-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('card-hover');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('card-hover');
    });
  });
  
  // Add ripple effect to buttons
  document.querySelectorAll('button:not(.no-ripple)').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      this.appendChild(ripple);
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size/2}px`;
      ripple.style.top = `${e.clientY - rect.top - size/2}px`;
      
      ripple.classList.add('active');
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// Initialize tooltips for icons and buttons
function initTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach(element => {
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.textContent = element.getAttribute('data-tooltip');
    
    element.addEventListener('mouseenter', function() {
      document.body.appendChild(tooltip);
      const rect = this.getBoundingClientRect();
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
      tooltip.style.left = `${rect.left + (rect.width/2) - (tooltip.offsetWidth/2)}px`;
      setTimeout(() => tooltip.classList.add('visible'), 10);
    });
    
    element.addEventListener('mouseleave', function() {
      tooltip.classList.remove('visible');
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 200);
    });
  });
}

// Initialize scroll effects like parallax and reveal
function initScrollEffects() {
  // Parallax effect for hero banner
  const heroBanner = document.querySelector('.hero-banner');
  if (heroBanner) {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition < 600) {
        heroBanner.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
      }
    });
  }
  
  // Reveal effect for elements as they come into view
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  const revealOnScroll = () => {
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 100) {
        element.classList.add('revealed');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  // Initial check
  setTimeout(revealOnScroll, 100);
}

// Initialize animations for filter bar
function initFilterAnimations() {
  const filterBar = document.querySelector('.filter-bar');
  if (!filterBar) return;
  
  // Sticky filter bar
  const filterBarTop = filterBar.offsetTop;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > filterBarTop) {
      filterBar.classList.add('sticky');
    } else {
      filterBar.classList.remove('sticky');
    }
  });
  
  // Filter button animations
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', function() {
      // Toggle active state
      const wasActive = this.classList.contains('active');
      
      // Reset all filter buttons
      document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // If button wasn't active before, make it active
      if (!wasActive) {
        this.classList.add('active');
      }
      
      // Animate the filter results
      animateFilterResults();
    });
  });
}

// Animate filter results 
function animateFilterResults() {
  const results = document.querySelectorAll('.recommendation-card, .neighborhood-card');
  
  results.forEach((card, index) => {
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity = 1;
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });
}

// Initialize animated counters for metrics
function initMetricsCounters() {
  const metricsCards = document.querySelectorAll('.metric-card');
  
  const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 40; // 40 steps to reach target
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.round(current);
    }, 30);
  };
  
  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const valueElement = entry.target.querySelector('.metric-value');
        if (valueElement && !valueElement.dataset.animated) {
          const targetValue = parseInt(valueElement.dataset.value, 10);
          animateCounter(valueElement, targetValue);
          valueElement.dataset.animated = true;
        }
      }
    });
  };
  
  const observer = new IntersectionObserver(observerCallback, {
    threshold: 0.1
  });
  
  metricsCards.forEach(card => {
    observer.observe(card);
  });
}

// Mobile-specific optimizations
function initMobileOptimizations() {
  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    // Adjust heights of specific containers
    setTimeout(() => {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        const windowHeight = window.innerHeight;
        mapContainer.style.height = `${windowHeight * 0.6}px`;
      }
      
      // Reset scroll positions for tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.scrollTop = 0;
      });
      
      // Trigger map resize event
      if (window.google && window.google.maps && window.map) {
        google.maps.event.trigger(window.map, 'resize');
      }
    }, 300);
  });
  
  // Handle back button navigation within tabs
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.tabId) {
      document.querySelector(`[href="#${event.state.tabId}"]`).click();
    }
  });
  
  // Optimize touch interactions
  if ('ontouchstart' in window) {
    document.documentElement.classList.add('touch-device');
    
    // Add touch feedback
    document.querySelectorAll('.card, .recommendation-card, button').forEach(element => {
      element.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      });
      
      element.addEventListener('touchend', function() {
        this.classList.remove('touch-active');
      });
    });
  }
}

// Display notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.classList.add('notification', `notification-${type}`);
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Close notification">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Add dismiss handler
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.add('notification-hiding');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  });
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('notification-visible');
  }, 10);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    notification.classList.add('notification-hiding');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
  
  return notification;
}

// Make showNotification available globally
window.showNotification = showNotification; 