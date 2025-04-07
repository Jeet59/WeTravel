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

  // Location Tabs Functionality
  const locationTabs = document.querySelectorAll(".location-tab");
  const locationContents = document.querySelectorAll(".location-content");
  
  locationTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const location = tab.getAttribute("data-location");
      
      // Remove active class from all tabs and contents
      locationTabs.forEach((t) => t.classList.remove("active"));
      locationContents.forEach((c) => c.classList.remove("active"));
      
      // Add active class to selected tab and content
      tab.classList.add("active");
      document.getElementById(`${location}-content`).classList.add("active");
      
      // Smooth scroll to top of content (for mobile)
      if (window.innerWidth <= 768) {
        const contentContainer = document.querySelector(".location-content-container");
        if (contentContainer) {
          contentContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

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
}); 