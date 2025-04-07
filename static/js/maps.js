// Google Maps Integration
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Map when location tab is active
  const locationTab = document.querySelector('.tab-link[data-tab="location"]');
  let map;
  let service;
  let infowindow;
  let markers = [];
  
  if (locationTab) {
    locationTab.addEventListener('click', initMap);
  }
  
  // Initialize map function
  function initMap() {
    // Check if map is already initialized
    if (map) return;
    
    // Mumbai coordinates
    const mumbai = { lat: 19.0760, lng: 72.8777 };
    
    // Create map
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Clear the map element in case there's any existing content
    mapElement.innerHTML = '';
    
    // Create the map element using the new API
    const gmpMap = document.createElement('gmp-map');
    gmpMap.setAttribute('center', `${mumbai.lat},${mumbai.lng}`);
    gmpMap.setAttribute('zoom', '12');
    gmpMap.setAttribute('map-id', 'DEMO_MAP_ID'); // Consider creating a custom map ID in Google Cloud Console
    gmpMap.style.width = '100%';
    gmpMap.style.height = '100%';
    mapElement.appendChild(gmpMap);
    
    // Create a marker for Mumbai using the new API
    const marker = document.createElement('gmp-advanced-marker');
    marker.setAttribute('position', `${mumbai.lat},${mumbai.lng}`);
    marker.setAttribute('title', 'Mumbai');
    gmpMap.appendChild(marker);
    
    // Create places service (still using the old API for places functionality)
    // Wait for the map to be ready
    gmpMap.addEventListener('gmp-ready', function() {
      // Access the underlying Google Maps JavaScript API map instance
      map = gmpMap.innerMap;
      
      // Create places service
      service = new google.maps.places.PlacesService(map);
      
      // Create info window
      infowindow = new google.maps.InfoWindow();
      
      // Add event listener for search button
      const searchButton = document.getElementById('search-places');
      if (searchButton) {
        searchButton.addEventListener('click', searchPlaces);
      }
      
      // Add popular places as markers
      addPopularPlaces();
    });
  }
  
  // Search places function
  function searchPlaces() {
    const placeType = document.getElementById('place-type').value;
    if (!placeType) return;
    
    // Clear existing markers
    clearMarkers();
    
    // Search for places
    const request = {
      location: map.getCenter(),
      radius: '5000',
      type: placeType
    };
    
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Clear existing place results
        const placeResults = document.getElementById('place-results');
        placeResults.innerHTML = '';
        
        // Create markers and place cards for each result
        for (let i = 0; i < Math.min(results.length, 10); i++) {
          createMarker(results[i]);
          createPlaceCard(results[i]);
        }
      }
    });
  }
  
  // Create marker function
  function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    
    // Get the gmp-map element
    const gmpMap = document.querySelector('gmp-map');
    if (!gmpMap) return;
    
    // Create the advanced marker
    const advancedMarker = document.createElement('gmp-advanced-marker');
    const position = place.geometry.location;
    advancedMarker.setAttribute('position', `${position.lat()},${position.lng()}`);
    advancedMarker.setAttribute('title', place.name);
    
    // Add the marker to the map
    gmpMap.appendChild(advancedMarker);
    
    // Store reference to the marker
    markers.push(advancedMarker);
    
    // Add click event listener
    advancedMarker.addEventListener('click', () => {
      const content = `
        <div>
          <h3>${place.name}</h3>
          <p>${place.vicinity}</p>
          <p>Rating: ${place.rating || 'N/A'}</p>
        </div>
      `;
      
      infowindow.setContent(content);
      infowindow.open(map, new google.maps.Marker({
        position: place.geometry.location
      }));
    });
  }
  
  // Create place card function
  function createPlaceCard(place) {
    const placeResults = document.getElementById('place-results');
    if (!placeResults) return;
    
    const placeCard = document.createElement('div');
    placeCard.className = 'place-card';
    
    // Get place photo if available
    let photoUrl = 'https://via.placeholder.com/300x150?text=No+Image';
    if (place.photos && place.photos.length > 0) {
      photoUrl = place.photos[0].getUrl();
    }
    
    placeCard.innerHTML = `
      <img src="${photoUrl}" alt="${place.name}" class="place-image">
      <div class="place-info">
        <h3 class="place-name">${place.name}</h3>
        <p class="place-address">${place.vicinity}</p>
        <p class="place-rating">
          <i class="fas fa-star"></i> ${place.rating || 'N/A'}
        </p>
      </div>
    `;
    
    placeCard.addEventListener('click', () => {
      const gmpMap = document.querySelector('gmp-map');
      if (gmpMap && gmpMap.innerMap) {
        gmpMap.innerMap.setCenter(place.geometry.location);
        gmpMap.setAttribute('zoom', '15');
      }
      
      // Find and activate the corresponding marker
      for (let i = 0; i < markers.length; i++) {
        if (markers[i].position && 
            markers[i].position.lat === place.geometry.location.lat() &&
            markers[i].position.lng === place.geometry.location.lng()) {
          markers[i].click();
          break;
        }
      }
    });
    
    placeResults.appendChild(placeCard);
  }
  
  // Clear all markers
  function clearMarkers() {
    const gmpMap = document.querySelector('gmp-map');
    if (!gmpMap) return;
    
    // Remove all marker elements
    markers.forEach(marker => {
      if (marker.parentNode) {
        marker.parentNode.removeChild(marker);
      }
    });
    
    markers = [];
  }
  
  // Add popular places
  function addPopularPlaces() {
    const popularPlaces = [
      { name: "Gateway of India", position: { lat: 18.9220, lng: 72.8347 }, type: "tourist_attraction" },
      { name: "Marine Drive", position: { lat: 18.9442, lng: 72.8239 }, type: "tourist_attraction" },
      { name: "Juhu Beach", position: { lat: 19.0948, lng: 72.8258 }, type: "tourist_attraction" },
      { name: "Chhatrapati Shivaji Terminus", position: { lat: 18.9401, lng: 72.8359 }, type: "tourist_attraction" }
    ];
    
    // Create markers for popular places
    const gmpMap = document.querySelector('gmp-map');
    if (!gmpMap) return;
    
    popularPlaces.forEach(place => {
      const marker = document.createElement('gmp-advanced-marker');
      marker.setAttribute('position', `${place.position.lat},${place.position.lng}`);
      marker.setAttribute('title', place.name);
      
      gmpMap.appendChild(marker);
    });
  }
}); 