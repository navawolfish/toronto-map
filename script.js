// script.js

// Set access token
mapboxgl.accessToken = 'pk.eyJ1IjoibmF2YXdvbGZpc2giLCJhIjoiY21iOWxyczk5MHV1ZDJrcHQ5aW12YTZ2MCJ9.asecPSLeRToQBLK9UlzVwA';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'my-map', // ID of the container
  style: 'mapbox://styles/navawolfish/cmbf5x65d006m01s1dsru502y', // Map style
  center: [-79.3832, 43.6532], // [lng, lat] — Toronto
  zoom: 12
});
// Load external GeoJSON file
const geojsonURL = 'https://raw.githubusercontent.com/navawolfish/toronto-map/refs/heads/main/toronto.geojson'
const subtypeToEmoji = {
  "home": "🏠",
  "park": "🌳",
  "school": "🏫",
  "fast food": "🍔",
  "coffee shop": "☕️",
  "restaurant": "🍽️",
  "grocery": "🍎",
  "trails": "🏞️",
  "lunch": "🥗",
  "bakery": "🥐",
  "ice cream": "🍦",
  "brunch": "🍳",
  "drag": "💅",
  "pizza": "🍕",
  "library": "📚",
  "shop": "🛍️",
  "museum": "🏛️",
  "Default": "📍" // fallback
};

fetch(geojsonURL)
  .then(response => response.json())
  .then(geojson => {
    geojson.features.forEach((feature) => {
      const subtype = feature.properties.subtype;
      const emoji = subtypeToEmoji[subtype] || subtypeToEmoji["Default"];

      const el = document.createElement('div'); // Creates the marker
      el.textContent = emoji;
      el.style.fontSize = '17px';
      el.style.textShadow = '1px 1px 2px black';

      const marker = new mapboxgl.Marker(el) // adds marker to map
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);

      // If address...
      const address = feature.properties.address?.trim();
      const addressHTML = address ? `<div id = "row-box" class="row"> <div class="address-info">Address: </div><div class = "address-info"> ${address}</div></div>` : '';

      //If website...
      const website = feature.properties.website?.trim();
      const websiteHTML = website ? `<button onclick="window.open('${feature.properties.website}', '_blank')">
        Go to Website
        </button>` : '';

      // Hover popup (temporary)
      const clickPopup = new mapboxgl.Popup({ // hover popup
        offset: 10,
        closeButton: true,
        closeOnClick: true
      })
        .setHTML(`<div style = "font-size: 1.5em;">${emoji}</div>
          <div class = "popuptitle">${feature.properties.title}</div>
        <div id = "row-box" class = "row" >
          <div class = "inner-popup">${feature.properties.type}</div>
          <div class = "inner-popup"> ${feature.properties.subtype}</div>
        </div>
        <div class = "address-info"> ${addressHTML}
        </div>
        ${websiteHTML}
        `);

      // Click popup (persistent)
      const hoverPopup = new mapboxgl.Popup({
        offset: 10,
        closeButton: false,
        closeOnClick: false
      }).setText(`${feature.properties.title} (${subtype})`);

      // Hover events
      el.addEventListener('mouseenter', () => {
        if (!clickPopup.isOpen()) {
          hoverPopup.setLngLat(feature.geometry.coordinates).addTo(map);
        }
      });

      el.addEventListener('mouseleave', () => {
        if (!clickPopup.isOpen()) {
          hoverPopup.remove();
        }
      });

      // Click toggle
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent bubbling
        if (clickPopup.isOpen()) {
          clickPopup.remove();
        } else {
          hoverPopup.remove(); // ensure hover popup goes away
          clickPopup.setLngLat(feature.geometry.coordinates).addTo(map);
        }
      });

      // Close click popup if clicking anywhere else on map
      map.on('click', () => {
        clickPopup.remove();
      });

    });
  })
  .catch(error => console.error('Error loading GeoJSON:', error));





// Add zoom and rotation controls
map.addControl(new mapboxgl.NavigationControl());

