#!/bin/bash

# Generate HTML files for all neighborhoods based on the template
# Usage: ./generate_neighborhood_pages.sh

# Define neighborhoods with corrected image paths
neighborhoods=(
  "andheri:business:Andheri:Mumbai's entertainment and business hub with film studios, shopping malls, and vibrant nightlife:andheri shopping.jpg:19.1136:72.8697"
  "dadar:cultural:Dadar:Cultural heart with flower market and authentic street food:Shivaji Park.jpg:19.0178:72.8478"
  "lowerparel:modern:Lower Parel:Modern commercial hub with upscale malls and restaurants:Lower Parel.jpg:18.9916:72.8266"
  "santacruz:residential:Santacruz:Upscale residential area with parks and shopping options:Santacruz.jpg:19.0795:72.8495"
  "goregaon:entertainment:Goregaon:Entertainment district with film city and nature parks:Film City.jpg:19.1663:72.8526"
  "chembur:residential:Chembur:Residential neighborhood known for incredible street food:mumbai street scenes.jpg:19.0522:72.9005"
  "powai:modern:Powai:Modern tech hub with lakeside views and premium lifestyle:IIT Bombay.jpg:19.1176:72.9075"
)

# Colaba and Bandra already exist, so we're not generating them

# Template format
create_neighborhood_html() {
  local id=$1
  local category=$2
  local name=$3
  local description=$4
  local image=$5
  local lat=$6
  local lng=$7
  
  cat > "static/${id}.html" << EOL
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - WeTravel Mumbai</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <header class="colaba-header">
        <div class="container">
            <nav class="navbar">
                <a href="index.html" class="logo">
                    <img src="img/logo.svg" alt="WeTravel Logo">
                </a>
                <div class="nav-links">
                    <a href="index.html">Home</a>
                    <a href="index.html#neighborhoods">Neighborhoods</a>
                    <a href="index.html#map">Map</a>
                </div>
            </nav>
        </div>
    </header>

    <main class="colaba-content">
        <section class="hero-section">
            <div class="container">
                <h1>Explore ${name}</h1>
                <p>${description}</p>
            </div>
        </section>

        <section class="neighborhood-details">
            <div class="container">
                <div class="two-column-layout">
                    <div class="main-content">
                        <h2>About ${name}</h2>
                        <p>
                            ${name} is one of Mumbai's fascinating neighborhoods with its own unique character and charm.
                            Visitors can experience the local culture, explore markets, and enjoy authentic cuisine.
                        </p>
                        
                        <div class="image-gallery">
                            <img src="img/${image}" alt="${name}" class="feature-image">
                            <div class="image-caption">Exploring the vibrant streets of ${name}</div>
                        </div>
                        
                        <h2 id="see">What to See</h2>
                        <div class="attractions-list">
                            <div class="attraction-card">
                                <h3>Key Attraction 1</h3>
                                <p>
                                    A popular landmark in ${name} that attracts visitors with its unique features and 
                                    cultural significance.
                                </p>
                            </div>
                            
                            <div class="attraction-card">
                                <h3>Key Attraction 2</h3>
                                <p>
                                    Another notable site in ${name} worth visiting for its historical or cultural 
                                    importance.
                                </p>
                            </div>
                            
                            <div class="attraction-card">
                                <h3>Key Attraction 3</h3>
                                <p>
                                    A third interesting place in ${name} that provides a unique experience 
                                    for visitors.
                                </p>
                            </div>
                        </div>
                        
                        <h2 id="eat">Where to Eat</h2>
                        <div class="restaurant-list">
                            <div class="restaurant-card">
                                <h3>Popular Restaurant 1</h3>
                                <p>
                                    A well-known eatery in ${name} that serves delicious local or international cuisine.
                                </p>
                            </div>
                            
                            <div class="restaurant-card">
                                <h3>Popular Restaurant 2</h3>
                                <p>
                                    Another great dining option in ${name}, known for its signature dishes and 
                                    atmosphere.
                                </p>
                            </div>
                            
                            <div class="restaurant-card">
                                <h3>Street Food Spot</h3>
                                <p>
                                    A fantastic place to try local street food specialties unique to ${name} 
                                    or Mumbai.
                                </p>
                            </div>
                        </div>
                        
                        <h2 id="tips">Local Tips</h2>
                        <ul class="tips-list">
                            <li>Best time to visit ${name} to avoid crowds</li>
                            <li>Transportation tips for getting around ${name} efficiently</li>
                            <li>Insider advice on hidden gems in the neighborhood</li>
                            <li>Cultural etiquette to be aware of when visiting</li>
                            <li>Safety and practical tips for enjoying your time in ${name}</li>
                        </ul>
                    </div>
                    
                    <div class="sidebar">
                        <div class="info-box">
                            <h3>Getting There</h3>
                            <p><i class="fas fa-train"></i> Nearest Railway Station</p>
                            <p><i class="fas fa-bus"></i> Multiple BEST bus routes available</p>
                            <p><i class="fas fa-car"></i> Taxi or rideshare recommended</p>
                        </div>
                        
                        <div class="info-box">
                            <h3>Best Time to Visit</h3>
                            <p>October to March (Winter season)</p>
                            <p>Mornings or evenings preferred</p>
                        </div>
                        
                        <div class="map-container">
                            <h3>Location</h3>
                            <div id="${id}-map" class="map"></div>
                        </div>
                        
                        <div class="save-to-trip">
                            <button id="save-${id}-btn" class="btn primary-btn">
                                <i class="fas fa-bookmark"></i> Save to My Trip
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="logo-section">
                    <img src="img/logo.svg" alt="WeTravel Logo">
                    <p>Discover the best of Mumbai with WeTravel</p>
                </div>
                <div class="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="index.html#neighborhoods">Neighborhoods</a></li>
                        <li><a href="index.html#map">Map</a></li>
                        <li><a href="index.html#chat">Ask Assistant</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h3>Contact</h3>
                    <p><i class="fas fa-envelope"></i> info@wetravel.com</p>
                    <p><i class="fas fa-phone"></i> +91 1234567890</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2023 WeTravel. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Notification toast -->
    <div id="notification-toast" class="notification-toast">
        <div class="notification-content">
            <span class="notification-message">Notification message</span>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        </div>
    </div>

    <script src="js/main.js"></script>
    <script>
        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            // Set up save button
            const saveButton = document.getElementById('save-${id}-btn');
            if (saveButton) {
                saveButton.addEventListener('click', function() {
                    // Create a place object representing ${name}
                    const place = {
                        name: '${name}',
                        description: '${description}',
                        image: 'img/${image}',
                        type: 'neighborhood'
                    };
                    
                    // Use the saveToTrip function from main.js
                    if (typeof saveToTrip === 'function') {
                        saveToTrip(place);
                    } else {
                        // Fallback if function not available
                        console.log('Saving ${name} to trip...');
                        showNotification('${name} added to your trip!', 'success');
                    }
                });
            }
            
            // Initialize notification system
            function showNotification(message, type = 'info') {
                const toast = document.getElementById('notification-toast');
                const messageEl = toast.querySelector('.notification-message');
                
                if (toast && messageEl) {
                    // Remove previous classes
                    toast.classList.remove('success', 'error', 'info', 'warning');
                    // Add appropriate class
                    toast.classList.add(type);
                    // Set message
                    messageEl.textContent = message;
                    // Show toast
                    toast.classList.add('active');
                    
                    // Hide after 3 seconds
                    setTimeout(() => {
                        toast.classList.remove('active');
                    }, 3000);
                    
                    // Close button
                    const closeBtn = toast.querySelector('.close-notification');
                    if (closeBtn) {
                        closeBtn.onclick = function() {
                            toast.classList.remove('active');
                        };
                    }
                }
            }
        });
    </script>
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=init${name}Map" async defer></script>
    <script>
        // Initialize map
        function init${name}Map() {
            const location = { lat: ${lat}, lng: ${lng} };
            const map = new google.maps.Map(document.getElementById('${id}-map'), {
                zoom: 15,
                center: location,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false
            });
            
            // Add marker for ${name}
            const marker = new google.maps.Marker({
                position: location,
                map: map,
                title: '${name}'
            });
        }
    </script>
</body>
</html>
EOL
  
  echo "Created ${id}.html for ${name}"
}

# Create HTML files for each neighborhood
for n in "${neighborhoods[@]}"; do
  IFS=':' read -r id category name description image lat lng <<< "$n"
  create_neighborhood_html "$id" "$category" "$name" "$description" "$image" "$lat" "$lng"
done

echo "All neighborhood HTML files have been generated."
echo "You can now access them at /static/[neighborhood].html" 