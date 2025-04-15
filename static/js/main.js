// Tab Switching Logic
document.addEventListener('DOMContentLoaded', function() {
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  // Chat history storage
  let chatHistory = [];
  const MAX_HISTORY_LENGTH = 50; // Maximum number of messages to store
  
  // Check authentication
  const checkAuth = () => {
    const auth = JSON.parse(sessionStorage.getItem('wetravel_auth') || '{}');
    if (!auth.authenticated) {
      window.location.href = '/';
      return false;
    }
    
    // Update user info in the sidebar
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    
    if (userNameElement && auth.name) {
      userNameElement.textContent = auth.name;
    }
    
    if (userEmailElement && auth.email) {
      userEmailElement.textContent = auth.email;
    }
    
    return true;
  };
  
  // Check authentication on page load
  if (!checkAuth()) {
    return; // Stop execution if not authenticated
  }
  
  // Handle logout
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      sessionStorage.removeItem('wetravel_auth');
      window.location.href = '/';
    });
  }
  
  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  
  // Toggle sidebar on button click
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
      
      // Toggle active class on button to handle icon change
      this.classList.toggle('active');
      
      // Toggle overlay
      if (sidebarOverlay) {
        if (sidebar.classList.contains('active')) {
          sidebarOverlay.style.display = 'block';
          setTimeout(() => {
            sidebarOverlay.style.opacity = '1';
          }, 10);
        } else {
          sidebarOverlay.style.opacity = '0';
          setTimeout(() => {
            sidebarOverlay.style.display = 'none';
          }, 300);
        }
      }
    });
    
    // Close sidebar when clicking on overlay
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarToggle.classList.remove('active');
        sidebarOverlay.style.opacity = '0';
        setTimeout(() => {
          sidebarOverlay.style.display = 'none';
        }, 300);
      });
    }
    
    // Close sidebar when a link is clicked
    tabLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('active');
          if (sidebarOverlay) sidebarOverlay.style.display = 'none';
        }
      });
    });
  }

  tabLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute("data-tab");

      // Remove active class from all links and tabs
      tabLinks.forEach((link) => link.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to the clicked link and target tab
      link.classList.add("active");
      document.getElementById(targetTab).classList.add("active");

      // If chat tab is activated, check if we need to restore chat history
      if (targetTab === "chat" && chatHistory.length > 0) {
        const messagesContainer = document.getElementById("messages");
        if (messagesContainer && messagesContainer.childElementCount === 0) {
          restoreChatHistory();
        }
      }
    });
  });

  // Handle location tabs
  function initLocationTabs() {
    const locationTabs = document.querySelectorAll('.location-tab');
    const locationContents = document.querySelectorAll('.location-content');
    
    locationTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and content
        locationTabs.forEach(t => t.classList.remove('active'));
        locationContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding content
        const location = tab.getAttribute('data-location');
        const contentToShow = document.getElementById(`${location}-content`);
        if (contentToShow) {
          contentToShow.classList.add('active');
          
          // Smooth scroll on mobile
          if (window.innerWidth < 768) {
            contentToShow.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // Initialize location tabs when DOM is loaded
  initLocationTabs();

  // Chat Functionality
  const sendButton = document.getElementById("send-button");
  const inputMessage = document.getElementById("input-message");
  
  if (sendButton && inputMessage) {
    // Send message when send button is clicked
    sendButton.addEventListener("click", sendMessage);
    
    // Send message when Enter key is pressed
    inputMessage.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Function to send message
  async function sendMessage() {
    const message = inputMessage.value.trim();
    if (!message) return;

    // Add user message to chat and history
    const userMessageObj = { role: "user", content: message, timestamp: new Date().toISOString() };
    addMessageToUI(userMessageObj.content, "user-message");
    addMessageToHistory(userMessageObj);
    
    inputMessage.value = "";

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: message,
          history: chatHistory // Send history with the request
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      
      // Add bot message to chat and history
      const botMessageObj = { role: "assistant", content: data, timestamp: new Date().toISOString() };
      addMessageToUI(botMessageObj.content, "bot-message");
      addMessageToHistory(botMessageObj);
      
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = `Sorry, I encountered an error: ${error.message}`;
      
      // Add error message to chat and history
      const errorMessageObj = { role: "assistant", content: errorMsg, timestamp: new Date().toISOString() };
      addMessageToUI(errorMessageObj.content, "bot-message");
      addMessageToHistory(errorMessageObj);
    }
  }

  // Function to add message to chat UI
  function addMessageToUI(text, className) {
    const messagesContainer = document.getElementById("messages");
    if (!messagesContainer) return;
    
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", className);
    messageElement.textContent = text;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Function to add message to history
  function addMessageToHistory(messageObj) {
    chatHistory.push(messageObj);
    
    // Limit history size
    if (chatHistory.length > MAX_HISTORY_LENGTH) {
      chatHistory = chatHistory.slice(chatHistory.length - MAX_HISTORY_LENGTH);
    }
    
    // Save to session storage for persistence across page refreshes
    saveHistoryToStorage();
  }
  
  // Function to save history to session storage
  function saveHistoryToStorage() {
    try {
      sessionStorage.setItem('weTravelChatHistory', JSON.stringify(chatHistory));
    } catch (error) {
      console.error('Failed to save chat history to session storage:', error);
    }
  }
  
  // Function to load history from session storage
  function loadHistoryFromStorage() {
    try {
      const storedHistory = sessionStorage.getItem('weTravelChatHistory');
      if (storedHistory) {
        chatHistory = JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error('Failed to load chat history from session storage:', error);
      chatHistory = [];
    }
  }
  
  // Function to restore chat history to UI
  function restoreChatHistory() {
    const messagesContainer = document.getElementById("messages");
    if (!messagesContainer) return;
    
    // Clear existing messages
    messagesContainer.innerHTML = '';
    
    // Add each message from history to UI
    chatHistory.forEach(message => {
      const className = message.role === 'user' ? 'user-message' : 'bot-message';
      addMessageToUI(message.content, className);
    });
  }
  
  // Initialize: load chat history from storage
  loadHistoryFromStorage();
  
  // Handle orientation changes and resize events
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('orientationchange', handleWindowResize);
  
  function handleWindowResize() {
    // Reset sidebar state on screen size changes
    if (window.innerWidth > 576 && sidebar) {
      sidebar.classList.remove('active');
      if (sidebarOverlay) sidebarOverlay.style.display = 'none';
    }
  }

  // Place Cards and Modal Functionality
  function initPlaceCards() {
    const placeCards = document.querySelectorAll('.recommendation-card.clickable');
    const modal = document.getElementById('place-modal');
    const closeModal = document.querySelector('.close-modal');
    const startChatBtn = document.getElementById('start-chat-btn');
    const nearbyRecommendationsBtn = document.getElementById('nearby-recommendations-btn');
    const saveToTripBtn = document.getElementById('save-to-trip-btn');
    
    // Close modal when clicking X
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
      });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
      }
    });
    
    // Handle clicks on place cards
    placeCards.forEach(card => {
      card.addEventListener('click', () => {
        const place = card.getAttribute('data-place');
        const category = card.getAttribute('data-category');
        const neighborhood = card.getAttribute('data-neighborhood');
        const address = card.getAttribute('data-address') || 'Address information not available';
        const mapUrl = card.getAttribute('data-map');
        const description = card.querySelector('p').textContent;
        const imageSrc = card.querySelector('.card-image img').src;
        
        // Set category label based on category
        let categoryLabel = 'Place';
        if (category === 'eat') categoryLabel = 'Restaurant & Dining';
        if (category === 'see') categoryLabel = 'Attraction';
        if (category === 'tip') categoryLabel = 'Local Tip';
        
        // Populate modal with place details
        document.getElementById('modal-place-title').textContent = place;
        document.getElementById('modal-place-neighborhood').textContent = neighborhood;
        document.getElementById('modal-place-address').textContent = address;
        document.getElementById('modal-place-description').textContent = description;
        document.getElementById('modal-place-image').src = imageSrc;
        document.getElementById('modal-place-category').textContent = categoryLabel;
        
        // Set map preview (This would ideally be replaced with a proper map embed)
        if (mapUrl) {
          document.getElementById('modal-map-preview').src = '/static/img/map-previews/' + neighborhood.toLowerCase() + '.jpg';
        }
        
        // Configure chat button to open chat with context
        if (startChatBtn) {
          startChatBtn.onclick = () => {
            openChatWithContext(place, neighborhood, category);
          };
        }
        
        // Configure nearby recommendations button
        if (nearbyRecommendationsBtn) {
          nearbyRecommendationsBtn.onclick = () => {
            findNearbyPlaces(place, neighborhood, category);
          };
        }
        
        // Configure save to trip button
        if (saveToTripBtn) {
          // Check if this place is already saved
          const savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
          const isAlreadySaved = savedTrips.some(item => item.name === place);
          
          if (isAlreadySaved) {
            saveToTripBtn.innerHTML = '<i class="fas fa-check"></i> Saved to Trip';
            saveToTripBtn.classList.add('saved');
          } else {
            saveToTripBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save to My Trip';
            saveToTripBtn.classList.remove('saved');
          }
          
          saveToTripBtn.onclick = () => {
            saveToTrip(place, neighborhood, category, description, imageSrc);
          };
        }
        
        // Display modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
      });
    });
  }

  // Open chat with context about the selected place
  function openChatWithContext(place, neighborhood, category) {
    // Default prompts based on category
    let prompt = `I'm interested in ${place} in ${neighborhood}. What can you tell me about it?`;
    
    if (category === 'eat') {
      prompt = `I'm planning to visit ${place} in ${neighborhood}. What's the best time to go, what dishes are they known for, and do I need a reservation?`;
    } else if (category === 'see') {
      prompt = `I want to visit ${place} in ${neighborhood}. What are the visiting hours, entrance fees, and what should I not miss while I'm there?`;
    } else if (category === 'tip') {
      prompt = `Tell me more about ${place} in ${neighborhood}. Is it worth visiting and what should I know before going?`;
    }
    
    // Switch to chat tab
    const chatTab = document.querySelector('.tab-item[data-tab="chat"]');
    if (chatTab) {
      chatTab.click();
    }
    
    // Set the prompt in the chat input
    const chatInput = document.querySelector('.chat-input textarea');
    if (chatInput) {
      chatInput.value = prompt;
      chatInput.focus();
    }
    
    // Close the modal
    const modal = document.getElementById('place-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
  }

  // Find nearby places based on the current place
  function findNearbyPlaces(place, neighborhood, category) {
    // This would ideally query a backend for actual nearby places
    // For now, we'll show a notification with a placeholder
    
    showNotification(`Finding places similar to ${place} in ${neighborhood}...`, 'info');
    
    // Close the modal
    const modal = document.getElementById('place-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
    
    // Simulate loading - in a real app this would fetch data
    setTimeout(() => {
      // Show success message with placeholder
      showNotification(`We've found 5 places similar to ${place} in ${neighborhood}!`, 'success');
      
      // Highlight similar cards (demo only - in real app would show actual similar places)
      const similarCards = document.querySelectorAll(`.recommendation-card[data-neighborhood="${neighborhood}"]`);
      similarCards.forEach(card => {
        if (card.getAttribute('data-place') !== place) {
          card.classList.add('highlight-similar');
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            card.classList.remove('highlight-similar');
          }, 3000);
        }
      });
    }, 1500);
  }

  // Save a place to My Trip
  function saveToTrip(place, neighborhood, category, description, imageSrc) {
    // Get existing saved places
    const savedPlaces = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
    
    // Check if place is already saved
    const existingPlaceIndex = savedPlaces.findIndex(item => item.name === place);
    
    if (existingPlaceIndex >= 0) {
      // Remove place if already saved
      savedPlaces.splice(existingPlaceIndex, 1);
      localStorage.setItem('wetravel_saved_places', JSON.stringify(savedPlaces));
      
      // Update button
      const saveToTripBtn = document.getElementById('save-to-trip-btn');
      if (saveToTripBtn) {
        saveToTripBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save to My Trip';
        saveToTripBtn.classList.remove('saved');
      }
      
      showNotification(`Removed ${place} from your trip`, 'info');
    } else {
      // Add place to saved places
      savedPlaces.push({
        name: place,
        neighborhood: neighborhood,
        category: category,
        description: description,
        image: imageSrc,
        savedAt: new Date().toISOString()
      });
      
      // Save to localStorage
      localStorage.setItem('wetravel_saved_places', JSON.stringify(savedPlaces));
      
      // Update button
      const saveToTripBtn = document.getElementById('save-to-trip-btn');
      if (saveToTripBtn) {
        saveToTripBtn.innerHTML = '<i class="fas fa-check"></i> Saved to Trip';
        saveToTripBtn.classList.add('saved');
      }
      
      showNotification(`Added ${place} to your trip`, 'success');
    }
  }

  // Initialize neighborhood filters
  function initNeighborhoodFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const categoryFilters = document.querySelectorAll('.category-filter');
    
    // Handle neighborhood filter tabs
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        filterTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Apply filtering
        applyFilters();
      });
    });
    
    // Handle category filters
    categoryFilters.forEach(filter => {
      filter.addEventListener('click', () => {
        // Remove active class from all category filters
        categoryFilters.forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked filter
        filter.classList.add('active');
        
        // Apply filtering
        applyFilters();
      });
    });
  }

  // Apply filters based on selected neighborhood and category
  function applyFilters() {
    const selectedNeighborhood = document.querySelector('.filter-tab.active').getAttribute('data-filter');
    const selectedCategory = document.querySelector('.category-filter.active').getAttribute('data-category');
    
    // Get all place cards
    const allCards = document.querySelectorAll('.recommendation-card');
    
    // Show/hide cards based on filters
    allCards.forEach(card => {
      const cardNeighborhood = card.getAttribute('data-neighborhood')?.toLowerCase();
      const cardCategory = card.getAttribute('data-category');
      
      let shouldShow = true;
      
      // Filter by neighborhood
      if (selectedNeighborhood !== 'all' && cardNeighborhood !== selectedNeighborhood) {
        shouldShow = false;
      }
      
      // Filter by category
      if (selectedCategory !== 'all' && cardCategory !== selectedCategory) {
        shouldShow = false;
      }
      
      // Show or hide the card
      if (shouldShow) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Show notification
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Initialize all neighborhood functionality
  function initNeighborhoodFeatures() {
    initPlaceCards();
    initNeighborhoodFilters();
  }

  // Initialize neighborhood features when DOM is loaded
  initNeighborhoodFeatures();
}); 