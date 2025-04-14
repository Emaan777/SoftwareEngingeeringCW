document.addEventListener('DOMContentLoaded', function() {
    // Initialize Mapbox with your access token
    mapboxgl.accessToken = 'pk.eyJ1IjoibmFoYTIxMTIiLCJhIjoiY205aDB4Z2JjMDBrNzJqcjE1c3c3aHBwMCJ9.HM9Cv2F3r_ejqYsnkW0AMw';
    
    // Create the map
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v11', // Outdoor style better for parks and trails
        center: [-0.1278, 51.5074], // Default to London
        zoom: 11
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Variables for user location and markers
    let userLocation = null;
    let userMarker = null;
    let placeMarkers = [];
    
    // DOM elements
    const locateMeBtn = document.getElementById('locate-me');
    const findPlacesBtn = document.getElementById('find-places');
    const placeTypeFilter = document.getElementById('place-type-filter');
    const activityFilter = document.getElementById('activity-filter');
    const distanceFilter = document.getElementById('distance-filter');
    
    // Function to get user's current position
    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }
    
    // Function to update the map with the current position
    async function updateCurrentPosition() {
        try {
            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;
            
            // Save the location
            userLocation = [longitude, latitude];
            
            // Update or create the location marker
            if (!userMarker) {
                userMarker = new mapboxgl.Marker({ color: '#4CAF50' })
                    .setLngLat(userLocation)
                    .setPopup(new mapboxgl.Popup().setHTML("<h3>Your Location</h3>"))
                    .addTo(map);
            } else {
                userMarker.setLngLat(userLocation);
            }
            
            // Center the map on the current position
            map.flyTo({
                center: userLocation,
                zoom: 13,
                essential: true
            });
            
            return userLocation;
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Unable to get your location. Please check your location permissions.');
            return null;
        }
    }
    
    // Function to calculate distance between two points using the Haversine formula
    function calculateDistance(point1, point2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (point2[1] - point1[1]) * Math.PI / 180;
        const dLon = (point2[0] - point1[0]) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1[1] * Math.PI / 180) * Math.cos(point2[1] * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Distance in km
        return distance;
    }
    
    // Function to clear all place markers from the map
    function clearPlaceMarkers() {
        placeMarkers.forEach(marker => marker.remove());
        placeMarkers = [];
    }
    
    // Function to find places nearby
    async function findPlacesNearby() {
        if (!userLocation) {
            userLocation = await updateCurrentPosition();
            if (!userLocation) return;
        }
        
        const maxDistance = parseInt(distanceFilter.value) || 5;
        const activityType = activityFilter.value;
        const placeType = placeTypeFilter.value;
        
        console.log('Finding places near:', userLocation);
        console.log('Max distance:', maxDistance, 'km');
        console.log('Activity type:', activityType);
        console.log('Place type:', placeType);
        
        try {
            // Clear existing markers
            clearPlaceMarkers();
            
            // In a real app, we would fetch places from an API or database
            // For this demo, we'll use the places data from the server
            const response = await fetch('/routes');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract places data from the HTML
            const placesData = [];
            const placeItems = doc.querySelectorAll('.place-item');
            
            placeItems.forEach(item => {
                const name = item.querySelector('.place-header h3').textContent;
                const type = item.querySelector('.type span').textContent;
                const address = item.querySelector('.address span').textContent;
                const directionsLink = item.querySelector('.directions-btn').href;
                
                // Extract coordinates from the directions link
                const coordsMatch = directionsLink.match(/destination=([\d\.]+),([\d\.\-]+)/);
                if (coordsMatch) {
                    const latitude = parseFloat(coordsMatch[1]);
                    const longitude = parseFloat(coordsMatch[2]);
                    
                    placesData.push({
                        name,
                        type,
                        address,
                        coordinates: [longitude, latitude],
                        suitableFor: type.includes('Park') || type.includes('Trail') ? ['running', 'cycling'] : ['running']
                    });
                }
            });
            
            // Create a bounds object to fit all markers
            const bounds = new mapboxgl.LngLatBounds();
            
            // Add user's location to bounds
            bounds.extend(userLocation);
            
            // Filter places based on user preferences
            const filteredPlaces = placesData.filter(place => {
                // Filter by place type if specified
                if (placeType && placeType !== 'all' && !place.type.toLowerCase().includes(placeType.toLowerCase())) {
                    return false;
                }
                
                // Filter by activity type if specified
                if (activityType && activityType !== 'both' && !place.suitableFor.includes(activityType)) {
                    return false;
                }
                
                // Calculate distance from user
                const distance = calculateDistance(userLocation, place.coordinates);
                place.distance = distance;
                
                // Filter by distance
                return distance <= maxDistance;
            }).sort((a, b) => a.distance - b.distance);
            
            console.log(`Found ${filteredPlaces.length} places within ${maxDistance}km`);
            
            // Add markers for each place
            filteredPlaces.forEach(place => {
                // Create marker with custom icon based on place type
                const el = document.createElement('div');
                el.className = 'place-marker';
                el.style.width = '30px';
                el.style.height = '30px';
                el.style.backgroundSize = 'contain';
                el.style.backgroundRepeat = 'no-repeat';
                
                // Set icon based on place type
                if (place.type.toLowerCase().includes('park')) {
                    el.style.backgroundImage = "url('https://cdn-icons-png.flaticon.com/512/2869/2869842.png')";
                } else if (place.type.toLowerCase().includes('trail')) {
                    el.style.backgroundImage = "url('https://cdn-icons-png.flaticon.com/512/1585/1585400.png')";
                } else if (place.type.toLowerCase().includes('gym')) {
                    el.style.backgroundImage = "url('https://cdn-icons-png.flaticon.com/512/2936/2936886.png')";
                } else {
                    el.style.backgroundImage = "url('https://cdn-icons-png.flaticon.com/512/3448/3448513.png')";
                }
                
                const marker = new mapboxgl.Marker(el)
                    .setLngLat(place.coordinates)
                    .setPopup(new mapboxgl.Popup().setHTML(`
                        <h3>${place.name}</h3>
                        <p><strong>Type:</strong> ${place.type}</p>
                        <p><strong>Distance:</strong> ${place.distance.toFixed(1)} km away</p>
                        <p><strong>Address:</strong> ${place.address}</p>
                        <p><strong>Suitable for:</strong> ${place.suitableFor.join(', ')}</p>
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${place.coordinates[1]},${place.coordinates[0]}" target="_blank" class="popup-link">Get Directions</a>
                    `))
                    .addTo(map);
                
                placeMarkers.push(marker);
                
                // Extend bounds to include this place
                bounds.extend(place.coordinates);
            });
            
            // Fit map to show all markers if we have any
            if (placeMarkers.length > 0) {
                map.fitBounds(bounds, {
                    padding: 70,
                    maxZoom: 15
                });
            }
            
            // Update the places list in the UI
            updatePlacesList(filteredPlaces);
            
        } catch (error) {
            console.error('Error finding places:', error);
            alert('Failed to find places nearby. Please try again.');
        }
    }
    
    // Function to update the places list in the UI
    function updatePlacesList(places) {
        const placesList = document.getElementById('places-list');
        
        if (!places || places.length === 0) {
            placesList.innerHTML = '<p class="no-places">No places found nearby. Try expanding your search distance.</p>';
            return;
        }
        
        let html = '';
        
        places.forEach(place => {
            html += `
                <div class="place-item">
                    <div class="place-header">
                        <h3>${place.name}</h3>
                    </div>
                    <div class="place-details">
                        <p class="type">
                            <strong>Type: </strong>
                            <span>${place.type || 'Not specified'}</span>
                        </p>
                        <p class="distance">
                            <strong>Distance: </strong>
                            <span>${place.distance.toFixed(1)} km away</span>
                        </p>
                        <p class="address">
                            <strong>Address: </strong>
                            <span>${place.address || 'Not specified'}</span>
                        </p>
                        <p class="suitable">
                            <strong>Suitable for: </strong>
                            <span>${place.suitableFor.join(', ')}</span>
                        </p>
                    </div>
                    <div class="place-actions">
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${place.coordinates[1]},${place.coordinates[0]}" target="_blank" class="directions-btn">Get Directions</a>
                    </div>
                </div>
            `;
        });
        
        placesList.innerHTML = html;
    }
    
    // Locate Me button click event
    locateMeBtn.addEventListener('click', async function() {
        await updateCurrentPosition();
    });
    
    // Find Buddies button click event
    findBuddiesBtn.addEventListener('click', async function() {
        await findBuddiesNearby();
    });
    
    // Filter change events
    activityFilter.addEventListener('change', async function() {
        await findBuddiesNearby();
    });
    
    distanceFilter.addEventListener('change', async function() {
        await findBuddiesNearby();
    });
    
    // Initialize the map when it's loaded
    map.on('load', function() {
        // Get initial position
        updateCurrentPosition();
    });
});
