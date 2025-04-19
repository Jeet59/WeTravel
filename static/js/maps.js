/**
 * WeTravel Mumbai - Interactive Map
 * Provides an interactive map of Mumbai with key locations and features
 */

document.addEventListener('DOMContentLoaded', initMap);

let map;
let markers = [];
let infoWindow;
const mumbaiCenter = { lat: 19.0760, lng: 72.8777 };

/**
 * Initialize the interactive map
 */
function initMap() {
  // Check if map container exists
  const mapContainer = document.getElementById('map-canvas');
  if (!mapContainer) return;
  
  // Initialize map
  map = new google.maps.Map(mapContainer, {
    center: mumbaiCenter,
    zoom: 12,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ],
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true
  });
  
  // Initialize standard InfoWindow with offset
  infoWindow = new google.maps.InfoWindow({
    pixelOffset: new google.maps.Size(0, -40),
    maxWidth: 300
  });
  
  // Add markers for neighborhoods
  addNeighborhoodMarkers();
  
  // Add event listener for place cards to update map
  document.querySelectorAll('.recommendation-card').forEach(card => {
    card.addEventListener('click', function() {
      const placeId = this.dataset.placeId;
      const place = findPlaceById(placeId);
      if (place && place.coordinates) {
        highlightPlace(place);
      }
    });
  });
  
  // Listen for tab changes to resize map
  document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', function() {
      if (this.getAttribute('data-tab') === 'map' && map) {
        setTimeout(() => {
          google.maps.event.trigger(map, 'resize');
          map.setCenter(mumbaiCenter);
        }, 100);
      }
    });
  });
  
  // Initialize map control buttons
  initMapControls();
}

/**
 * Initialize map control buttons
 */
function initMapControls() {
  // Zoom in button
  const zoomInBtn = document.getElementById('zoom-in');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function() {
      if (map) {
        const currentZoom = map.getZoom();
        map.setZoom(currentZoom + 1);
      }
    });
  }
  
  // Zoom out button
  const zoomOutBtn = document.getElementById('zoom-out');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function() {
      if (map) {
        const currentZoom = map.getZoom();
        map.setZoom(currentZoom - 1);
      }
    });
  }
  
  // Current location button
  const currentLocationBtn = document.getElementById('current-location');
  if (currentLocationBtn) {
    currentLocationBtn.addEventListener('click', function() {
      if (navigator.geolocation) {
        // Show loading toast
        if (typeof showToast === 'function') {
          showToast('Getting your location...', 'info');
        }
        
        navigator.geolocation.getCurrentPosition(
          function(position) {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            // Create a marker for user's location
            const userMarker = new google.maps.Marker({
              position: pos,
              map: map,
              title: 'Your Location',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
              },
              animation: google.maps.Animation.DROP
            });
            
            // Center map on user's location
            map.setCenter(pos);
            map.setZoom(15);
            
            // Show info window for user location
            infoWindow.setContent(`
              <div class="map-info-window">
                <h3 style="margin: 0 0 8px 0; font-size: 16px;">Your Location</h3>
                <p style="margin: 0; font-size: 13px;">You are here! Explore nearby attractions in Mumbai.</p>
              </div>
            `);
            infoWindow.open(map, userMarker);
            
            // Add to markers array for cleanup
            markers.push(userMarker);
            
            // Show success notification
            if (typeof showToast === 'function') {
              showToast('Located you on the map!', 'success');
            } else if (typeof showNotification === 'function') {
              showNotification('Located you on the map!', 'success');
            }
          },
          function(error) {
            // Handle location error
            console.error('Error getting location:', error);
            
            // Create error message based on error code
            let message = 'Could not get your location.';
            switch(error.code) {
              case error.PERMISSION_DENIED:
                message += ' Location access was denied.';
                break;
              case error.POSITION_UNAVAILABLE:
                message += ' Location information is unavailable.';
                break;
              case error.TIMEOUT:
                message += ' Location request timed out.';
                break;
            }
            
            // Show error notification
            if (typeof showToast === 'function') {
              showToast(message, 'error');
            } else if (typeof showNotification === 'function') {
              showNotification(message, 'error');
            }
            
            // Center on Mumbai as fallback
            map.setCenter(mumbaiCenter);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        // Browser doesn't support geolocation
        if (typeof showToast === 'function') {
          showToast('Your browser does not support geolocation.', 'error');
        } else if (typeof showNotification === 'function') {
          showNotification('Your browser does not support geolocation.', 'error');
        }
      }
    });
  }
}

/**
 * Add markers for main neighborhoods
 */
function addNeighborhoodMarkers() {
  const neighborhoods = [
    { 
      name: 'Colaba', 
      position: { lat: 18.9067, lng: 72.8147 },
      description: 'Historic district with Gateway of India and colonial architecture'
    },
    { 
      name: 'Bandra', 
      position: { lat: 19.0596, lng: 72.8295 },
      description: 'Trendy suburb with shopping, cafes and seafront'
    },
    { 
      name: 'Juhu', 
      position: { lat: 19.0883, lng: 72.8264 },
      description: 'Famous beach area with luxury hotels and street food'
    },
    { 
      name: 'Andheri', 
      position: { lat: 19.1136, lng: 72.8697 },
      description: 'Business and entertainment hub with malls and studios'
    },
    { 
      name: 'Dadar', 
      position: { lat: 19.0178, lng: 72.8478 },
      description: 'Cultural heart of Mumbai with Shivaji Park and flower market'
    },
    { 
      name: 'Powai', 
      position: { lat: 19.1176, lng: 72.9060 },
      description: 'Modern tech hub with lakeside views and premium lifestyle'
    },
    { 
      name: 'Lower Parel', 
      position: { lat: 18.9982, lng: 72.8311 },
      description: 'Modern commercial hub with upscale malls and restaurants'
    }
  ];
  
  neighborhoods.forEach(hood => {
    const marker = new google.maps.Marker({
      position: hood.position,
      map: map,
      title: hood.name,
      icon: {
        path: google.maps.SymbolPath.MAP_PIN,
        fillColor: '#ea4335',
        fillOpacity: 0.9,
        scale: 18,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      animation: google.maps.Animation.DROP
    });
    
    marker.addListener('click', () => {
      const locationName = hood.name.toLowerCase();
      
      // Create content for info window
      const infoContent = `
        <div class="map-info-window">
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">${hood.name}</h3>
          <p style="margin: 0 0 10px 0; font-size: 13px;">${hood.description}</p>
          <div class="map-info-actions" style="display: flex; gap: 8px;">
            <button class="btn-sm btn-primary view-location-btn" 
              onclick="showNeighborhoodTab('${hood.name.toLowerCase()}')">
              <i class="fas fa-search"></i> Explore
            </button>
            <button class="btn-sm btn-outline save-location-btn" id="save-${locationName}"
              onclick="saveLocationToTrip('${hood.name}', '${hood.description}')">
              <i class="far fa-heart"></i> Save
            </button>
          </div>
        </div>
      `;
      
      infoWindow.setContent(infoContent);
      infoWindow.open(map, marker);
      
      // Check if location is saved
      setTimeout(() => {
        checkSavedStatus(hood.name);
      }, 100);
    });
    
    markers.push(marker);
  });
}

/**
 * Check if a location is saved to trip
 */
function checkSavedStatus(locationName) {
  setTimeout(() => {
    const savedBtn = document.getElementById(`save-${locationName.toLowerCase()}`);
    if (!savedBtn) return;
    
    const savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
    const isSaved = savedTrips.some(place => place.name === locationName);
    
    if (isSaved) {
      savedBtn.innerHTML = '<i class="fas fa-heart"></i> Saved';
      savedBtn.classList.add('saved');
    }
  }, 100);
}

/**
 * Save a location to trip
 */
function saveLocationToTrip(locationName, description) {
  if (typeof saveToTrip === 'function') {
    const locationData = {
      name: locationName,
      description: description,
      image: `/static/img/${locationName.toLowerCase().replace(/\s+/g, '-')}.jpg`
    };
    
    saveToTrip(locationName, locationData);
    
    // Update button state
    const saveBtn = document.getElementById(`save-${locationName.toLowerCase()}`);
    if (saveBtn) {
      const savedTrips = JSON.parse(localStorage.getItem('wetravel_saved_places') || '[]');
      const isSaved = savedTrips.some(place => place.name === locationName);
      
      if (isSaved) {
        saveBtn.innerHTML = '<i class="fas fa-heart"></i> Saved';
        saveBtn.classList.add('saved');
      } else {
        saveBtn.innerHTML = '<i class="far fa-heart"></i> Save';
        saveBtn.classList.remove('saved');
      }
    }
  }
}

/**
 * Show specific place on map
 */
function highlightPlace(place) {
  // Clear existing markers
  clearPlaceMarkers();
  
  // Create new marker
  const marker = new google.maps.Marker({
    position: place.coordinates,
    map: map,
    title: place.name,
    animation: google.maps.Animation.BOUNCE,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#4285F4',
      fillOpacity: 0.9,
      scale: 12,
      strokeColor: '#ffffff',
      strokeWeight: 2
    }
  });
  
  // Add to markers array
  markers.push(marker);
  
  // Center map on marker
  map.setCenter(place.coordinates);
  map.setZoom(16);
  
  // Show info window for place
  infoWindow.setContent(`
    <div class="map-info-window">
      <h3 style="margin: 0 0 8px 0; font-size: 16px;">${place.name}</h3>
      <p style="margin: 0 0 10px 0; font-size: 13px;">${place.description}</p>
      <div class="map-info-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px;">${place.category || 'Attraction'} • ${place.priceRange || '₹₹'}</span>
        <button class="btn-sm btn-primary"
          onclick="saveLocationToTrip('${place.name}', '${place.description}')">
          Add to Trip
        </button>
      </div>
    </div>
  `);
  infoWindow.open(map, marker);
}

/**
 * Clear place markers but keep neighborhood markers
 */
function clearPlaceMarkers() {
  markers.forEach(marker => {
    marker.setMap(null);
  });
  markers = [];
  addNeighborhoodMarkers();
}

/**
 * Helper to find place by ID - get actual place data from the DOM
 */
function findPlaceById(id) {
  // Look for the place card in the DOM
  const placeCard = document.querySelector(`.recommendation-card[data-place-id="${id}"]`);
  
  if (placeCard) {
    // Extract coordinates from data attributes (fallback to neighborhood position if not found)
    let coordinates = { lat: 19.0760, lng: 72.8777 }; // Mumbai center as default
    
    if (placeCard.dataset.lat && placeCard.dataset.lng) {
      coordinates = {
        lat: parseFloat(placeCard.dataset.lat),
        lng: parseFloat(placeCard.dataset.lng)
      };
    }
    
    // Get place name and description from the card
    const placeName = placeCard.querySelector('.card-title')?.textContent || 'Unknown Place';
    const placeDesc = placeCard.querySelector('.card-text')?.textContent || 'No description available';
    const category = placeCard.dataset.category || 'Attraction';
    const priceRange = placeCard.dataset.priceRange || '₹₹';
    
    // Get the neighborhood from the parent container
    const neighborhoodTab = placeCard.closest('.location-content');
    const neighborhood = neighborhoodTab ? neighborhoodTab.dataset.location : '';
    
    return {
      id: id,
      name: placeName,
      description: placeDesc,
      coordinates: coordinates,
      category: category,
      priceRange: priceRange,
      neighborhood: neighborhood
    };
  }
  
  // If no card found, return a default place at Mumbai center
  return {
    id: id,
    name: 'Mumbai Attraction',
    description: 'A great place to visit in Mumbai',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    category: 'Attraction',
    priceRange: '₹₹'
  };
}

/**
 * Navigate to neighborhood tab
 */
function showNeighborhoodTab(neighborhood) {
  // Activate neighborhoods tab
  const neighborhoodsTab = document.querySelector('a.nav-link[data-tab="neighborhoods"]');
  if (neighborhoodsTab) {
    // Click the neighborhoods tab to activate it
    neighborhoodsTab.click();
    
    // Small delay to ensure tab content is loaded
    setTimeout(() => {
      // Find the neighborhood card and click it
      const neighborhoodCard = document.querySelector(`.neighborhood-card[data-neighborhood="${neighborhood.toLowerCase()}"]`);
      if (neighborhoodCard) {
        // Find the explore button within the card and click it
        const exploreButton = neighborhoodCard.querySelector('.view-btn');
        if (exploreButton) {
          exploreButton.click();
        } else {
          // If no explore button, just scroll to the card
          neighborhoodCard.scrollIntoView({ behavior: 'smooth' });
          // Trigger a click on the card itself
          neighborhoodCard.click();
        }
      } else {
        console.error(`Neighborhood card not found for: ${neighborhood}`);
        // Show notification for debugging
        if (typeof showToast === 'function') {
          showToast(`Could not find neighborhood: ${neighborhood}`, 'error');
        }
      }
    }, 500);
  }
}

// Export map to global scope for API callback
window.initMap = initMap; 