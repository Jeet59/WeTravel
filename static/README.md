# WeTravel Neighborhood Pages Implementation

This folder contains the implementation for the WeTravel Mumbai neighborhood pages. This README provides instructions for adding more neighborhoods to the application.

## Structure

- `index.html` - The main application with neighborhood cards
- `neighborhood-template.html` - Template for creating new neighborhood pages
- `colaba.html` - Example of a fully implemented neighborhood page
- Other neighborhood html files (juhu.html, bandra.html, etc.)

## Adding a New Neighborhood Page

1. Create a new HTML file named after the neighborhood (e.g., `lower-parel.html`)
2. Copy the contents of `neighborhood-template.html` to your new file
3. Replace all placeholder variables (marked with [BRACKETS]) with actual content:
   - `[NEIGHBORHOOD_NAME]` - The name of the neighborhood (e.g., "Lower Parel")
   - `[NEIGHBORHOOD_ID]` - The id of the neighborhood in lowercase (e.g., "lower-parel")
   - `[NEIGHBORHOOD_DESCRIPTION]` - A brief one-line description
   - `[NEIGHBORHOOD_ABOUT]` - Detailed description of the neighborhood
   - `[NEIGHBORHOOD_HISTORY]` - Historical information about the neighborhood
   - `[NEIGHBORHOOD_IMAGE]` - Path to the hero image for the neighborhood
   - `[NEIGHBORHOOD_FEATURE_IMAGE]` - Path to a feature image
   - `[NEIGHBORHOOD_IMAGE_CAPTION]` - Caption for the feature image
   - `[ATTRACTION_X_PHOTO]`, `[ATTRACTION_X_NAME]`, `[ATTRACTION_X_DESCRIPTION]` - Details for each attraction
   - `[RESTAURANT_X_PHOTO]`, `[RESTAURANT_X_NAME]`, `[RESTAURANT_X_DESCRIPTION]` - Details for each restaurant
   - `[TIP_X]` - Local tips (1-5)
   - `[TRAIN_OPTION_X]`, `[BUS_OPTION]` - Transportation options
   - `[SEASON_TO_VISIT]`, `[TIME_TO_VISIT]` - Best time to visit

4. Update the map function and HTML element:
   - Change the map element ID from `neighborhood-map` to your neighborhood ID (e.g., `lower-parel-map`)
   - Update the map function name from `initNeighborhoodMap` to match your neighborhood (e.g., `initLowerParelMap`)
   - Set the actual latitude and longitude coordinates for your neighborhood
   - Update the title property in the marker to your neighborhood name
   - Update the callback parameter in the Google Maps script tag to match your function name

5. Create a new places.js file for the neighborhood:
   - Create a file named `[NEIGHBORHOOD_ID]-places.js` in the `js` directory
   - Use the `colaba-places.js` file as a template
   - Add data for all attractions and restaurants with images, descriptions, and details

6. Ensure high-quality images are available:
   - Add a main neighborhood image (e.g., `lower-parel.jpg`) in the `img` directory
   - Add images for each attraction and restaurant in the same directory
   - Recommended image sizes:
     - Hero image: 1920x1080px
     - Feature image: 1200x800px
     - Card images: 600x400px
   - Use `.jpg` for photos and `.svg` for icons/illustrations

7. Update the index.html file to include the new neighborhood card in the grid

## Image Recommendations

For the best visual appearance:
- Use high-quality, well-lit images for all attractions and restaurants
- Crop images to the same aspect ratio (3:2 recommended)
- Optimize images for web (compress to reasonable file sizes)
- For each card, use a photo that clearly identifies the location
- Consider using a consistent style or filter across images for a cohesive look

## Places Data Structure

When creating your neighborhood's places.js file, follow this structure for each place:

```javascript
const neighborhoodPlaces = {
    "Place Name": {
        name: "Place Name",
        image: "/static/img/place-image.jpg",
        fallbackImage: "/static/img/places/place-icon.svg", // Optional SVG fallback
        description: "Detailed description of this place.",
        type: "Attraction", // or "Restaurant", "Landmark", etc.
        rating: 4.5,
        address: "Full address",
        tags: ["Historic", "Culture", "Food"], // Categories
        tips: [
            "First local tip about this place",
            "Second local tip about visiting",
            "Third interesting fact or recommendation"
        ]
    },
    // More places...
};
```

## SVG Images for Attractions

SVG images for attractions should follow this naming pattern:
- All lowercase
- Hyphens between words (e.g., `gateway-of-india.svg`)
- Stored in the `img/places/` directory

## Updating the Neighborhood Grid

To add a new neighborhood to the main page, add a new card to the neighborhood grid in `index.html`:

```html
<!-- New Neighborhood -->
<div class="neighborhood-card" data-neighborhood="lower-parel" data-category="business">
  <div class="neighborhood-image">
    <img src="/static/img/lower-parel.jpg" alt="Lower Parel">
    <div class="neighborhood-overlay">
      <button class="view-btn" data-neighborhood="lower-parel">View Full Page</button>
    </div>
  </div>
  <div class="neighborhood-content">
    <h3>Lower Parel</h3>
    <p>Mumbai's transformed mill district now a corporate and entertainment hub</p>
    <div class="neighborhood-tags">
      <span class="tag">Business</span>
      <span class="tag">Entertainment</span>
      <span class="rating"><i class="fas fa-star"></i> 4.3</span>
    </div>
    <div class="neighborhood-features">
      <div class="feature" data-tooltip="Where to Eat" data-location="lower-parel" data-section="eat">
        <i class="fas fa-utensils"></i>
      </div>
      <div class="feature" data-tooltip="What to See" data-location="lower-parel" data-section="see">
        <i class="fas fa-camera"></i>
      </div>
      <div class="feature" data-tooltip="Local Tips" data-location="lower-parel" data-section="tips">
        <i class="fas fa-lightbulb"></i>
      </div>
    </div>
  </div>
</div>
```

## Custom Styling

Each neighborhood page can include custom styles in the `<style>` section of the head. Use this to customize specific aspects for each neighborhood:

```css
/* Custom colors for a specific neighborhood */
.hero-section {
    background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/static/img/neighborhood.jpg');
}

.section-header i,
.info-box h3,
.card-content h3 {
    color: #d4500c; /* Custom accent color for this neighborhood */
}

.view-details-btn,
.primary-btn {
    background-color: #d4500c;
}

.view-details-btn:hover,
.primary-btn:hover {
    background-color: #b3450b;
}
```

This allows you to give each neighborhood page a unique identity while maintaining the overall design system. 