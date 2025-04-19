/**
 * WeTravel Mumbai - Dashboard Functionality
 * Handles dashboard metrics, charts, and interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

/**
 * Initialize the dashboard functionality
 */
function initDashboard() {
    updateMetricsCards();
    initWeatherWidget();
    initTrendingPlaces();
    initRecentActivity();
}

/**
 * Update the metrics cards with current data
 */
function updateMetricsCards() {
    // In a real app, this would fetch actual data from a backend API
    // For demo purposes, we'll use placeholder data
    
    const visitedPlaces = getFromLocalStorage('visited_places') || [];
    const savedTrips = getFromLocalStorage('saved_trips') || [];
    
    // Update metrics cards with data
    updateMetricCard('places-visited', visitedPlaces.length);
    updateMetricCard('saved-places', savedTrips.length);
    updateMetricCard('trip-completion', calculateTripCompletion());
    updateMetricCard('chat-interactions', getFromLocalStorage('chat_count') || 0);
}

/**
 * Update a single metric card with new data
 */
function updateMetricCard(id, value) {
    const card = document.getElementById(id);
    if (!card) return;
    
    const valueElement = card.querySelector('.metric-value');
    if (valueElement) {
        // Animate the count up
        animateCountUp(valueElement, 0, value);
    }
}

/**
 * Animate a count up effect for metrics
 */
function animateCountUp(element, start, end) {
    let current = start;
    const duration = 1000; // 1 second
    const stepTime = 16; // ~60fpsst some 
    const steps = duration / stepTime;
    const increment = (end - start) / steps;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            clearInterval(timer);
            current = end;
        }
        element.textContent = Math.round(current).toString();
    }, stepTime);
}

/**
 * Calculate trip completion percentage
 */
function calculateTripCompletion() {
    // In a real app, this would be based on places visited vs planned
    // For demo purposes, return a random percentage
    const visited = getFromLocalStorage('visited_places') || [];
    const saved = getFromLocalStorage('saved_trips') || [];
    
    if (saved.length === 0) return 0;
    
    // Get unique place IDs from visited places
    const visitedIds = new Set(visited.map(place => place.id));
    
    // Count how many saved places have been visited
    let visitedCount = 0;
    saved.forEach(place => {
        if (visitedIds.has(place.id)) {
            visitedCount++;
        }
    });
    
    return Math.round((visitedCount / saved.length) * 100);
}

/**
 * Initialize the weather widget with current Mumbai weather
 */
function initWeatherWidget() {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;
    
    // In a real app, this would fetch actual weather data from an API
    // For demo purposes, we'll use placeholder data
    const weatherData = {
        temp: 32,
        condition: 'Sunny',
        humidity: 65,
        windSpeed: 12
    };
    
    weatherWidget.querySelector('.weather-temp').textContent = `${weatherData.temp}°C`;
    weatherWidget.querySelector('.weather-condition').textContent = weatherData.condition;
    weatherWidget.querySelector('.weather-humidity').textContent = `${weatherData.humidity}%`;
    weatherWidget.querySelector('.weather-wind').textContent = `${weatherData.windSpeed} km/h`;
}

/**
 * Initialize the trending places section
 */
function initTrendingPlaces() {
    const trendingPlaces = document.getElementById('trending-places');
    if (!trendingPlaces) return;
    
    // In a real app, this would fetch actual trending data from a backend API
    // For demo purposes, we'll use placeholder data
    const places = [
        { name: 'Gateway of India', neighborhood: 'Colaba', visitors: 256 },
        { name: 'Marine Drive', neighborhood: 'South Mumbai', visitors: 195 },
        { name: 'Juhu Beach', neighborhood: 'Juhu', visitors: 178 },
        { name: 'Bandra-Worli Sea Link', neighborhood: 'Bandra', visitors: 142 }
    ];
    
    // Clear existing content
    const trendingList = trendingPlaces.querySelector('.trending-list');
    if (trendingList) {
        trendingList.innerHTML = '';
        
        // Add each trending place
        places.forEach(place => {
            const item = document.createElement('div');
            item.className = 'trending-item';
            item.innerHTML = `
                <div class="trending-details">
                    <h4>${place.name}</h4>
                    <p>${place.neighborhood}</p>
                </div>
                <div class="trending-visitors">
                    <span>${place.visitors}</span>
                    <small>visitors</small>
                </div>
            `;
            trendingList.appendChild(item);
        });
    }
}

/**
 * Initialize the recent activity section
 */
function initRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    
    // In a real app, this would fetch actual activity data from a backend API
    // For demo purposes, we'll use placeholder data
    const activities = [
        { 
            type: 'saved', 
            place: 'Elephant Caves', 
            time: '2 hours ago' 
        },
        { 
            type: 'visited', 
            place: 'Marine Drive', 
            time: 'Yesterday' 
        },
        { 
            type: 'reviewed', 
            place: 'Taj Mahal Palace', 
            rating: 4.5, 
            time: '3 days ago' 
        },
        { 
            type: 'planned', 
            place: 'Sanjay Gandhi National Park', 
            date: 'Next Saturday', 
            time: '1 week ago' 
        }
    ];
    
    // Clear existing content
    const activityList = activityContainer.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = '';
        
        // Add each activity
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            let icon, details;
            switch(activity.type) {
                case 'saved':
                    icon = '<i class="fas fa-bookmark"></i>';
                    details = `Saved ${activity.place} to your trip`;
                    break;
                case 'visited':
                    icon = '<i class="fas fa-check-circle"></i>';
                    details = `Visited ${activity.place}`;
                    break;
                case 'reviewed':
                    icon = '<i class="fas fa-star"></i>';
                    details = `Reviewed ${activity.place} with ${activity.rating} stars`;
                    break;
                case 'planned':
                    icon = '<i class="fas fa-calendar"></i>';
                    details = `Planned a visit to ${activity.place} for ${activity.date}`;
                    break;
            }
            
            item.innerHTML = `
                <div class="activity-icon">${icon}</div>
                <div class="activity-details">
                    <p>${details}</p>
                    <small>${activity.time}</small>
                </div>
            `;
            activityList.appendChild(item);
        });
    }
}

/**
 * Helper function to get data from localStorage
 */
function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
} 