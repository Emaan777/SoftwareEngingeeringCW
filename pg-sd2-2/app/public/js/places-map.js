document.addEventListener('DOMContentLoaded', function() {
    // Initialize Mapbox with your access token
    mapboxgl.accessToken = 'pk.eyJ1IjoibmFoYTIxMTIiLCJhIjoiY205aDB4Z2JjMDBrNzJqcjE1c3c3aHBwMCJ9.HM9Cv2F3r_ejqYsnkW0AMw';
    
    // Create the map
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v11', // Outdoor style better for parks and trails
        center: [-0.1278, 51.5074], // Default to London
        zoom: 13
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Variables for user location and markers
    let userLocation = null;
    let userMarker = null;
    let placeMarkers = [];
    
    // Sample data for places (in a real app, this would come from an API)
    const samplePlaces = {
        parks: [
            { id: 'p1', name: "Hyde Park", type: "Park", coordinates: [-0.1657, 51.5073], address: "Hyde Park, London", suitableFor: ["running", "cycling"] },
            { id: 'p2', name: "Regent's Park", type: "Park", coordinates: [-0.1534, 51.5313], address: "Regent's Park, London", suitableFor: ["running", "cycling"] },
            { id: 'p3', name: "Victoria Park", type: "Park", coordinates: [-0.0372, 51.5362], address: "Victoria Park, London", suitableFor: ["running", "cycling"] },
            { id: 'p4', name: "Battersea Park", type: "Park", coordinates: [-0.1581, 51.4813], address: "Battersea Park, London", suitableFor: ["running", "cycling"] },
            { id: 'p5', name: "Greenwich Park", type: "Park", coordinates: [-0.0014, 51.4769], address: "Greenwich Park, London", suitableFor: ["running"] }
        ],
        trails: [
            { id: 't1', name: "Thames Path", type: "Trail", coordinates: [-0.1195, 51.5080], address: "Thames Path, London", suitableFor: ["running", "cycling"] },
            { id: 't2', name: "Parkland Walk", type: "Trail", coordinates: [-0.1382, 51.5785], address: "Parkland Walk, London", suitableFor: ["running"] },
            { id: 't3', name: "Capital Ring", type: "Trail", coordinates: [-0.2760, 51.5074], address: "Capital Ring, London", suitableFor: ["running", "cycling"] }
        ],
        gyms: [
            { id: 'g1', name: "PureGym London", type: "Gym", coordinates: [-0.1280, 51.5100], address: "123 Oxford St, London", suitableFor: ["running"] },
            { id: 'g2', name: "Fitness First", type: "Gym", coordinates: [-0.1400, 51.5150], address: "45 Baker St, London", suitableFor: ["running", "cycling"] }
        ],
        sports_centers: [
            { id: 's1', name: "Westway Sports Centre", type: "Sports Center", coordinates: [-0.2159, 51.5169], address: "1 Crowthorne Rd, London", suitableFor: ["running", "cycling"] },
            { id: 's2', name: "Copper Box Arena", type: "Sports Center", coordinates: [-0.0170, 51.5454], address: "Queen Elizabeth Olympic Park, London", suitableFor: ["running"] }
        ],
        swimming_pools: [
            { id: 'sw1', name: "London Aquatics Centre", type: "Swimming Pool", coordinates: [-0.0147, 51.5408], address: "Queen Elizabeth Olympic Park, London", suitableFor: [] },
            { id: 'sw2', name: "Hampstead Heath Ponds", type: "Swimming Pool", coordinates: [-0.1636, 51.5575], address: "Hampstead Heath, London", suitableFor: [] }
        ]
    };
    
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
            
            // Use a default location (London) if we can't get the user's location
            userLocation = [-0.1278, 51.5074];
            
            if (!userMarker) {
                userMarker = new mapboxgl.Marker({ color: '#4CAF50' })
                    .setLngLat(userLocation)
                    .setPopup(new mapboxgl.Popup().setHTML("<h3>Default Location (London)</h3>"))
                    .addTo(map);
            } else {
                userMarker.setLngLat(userLocation);
            }
            
            map.flyTo({
                center: userLocation,
                zoom: 13,
                essential: true
            });
            
            return userLocation;
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
        
        const maxDistance = parseFloat(distanceFilter.value) || 5;
        const placeType = placeTypeFilter.value;
        const activity = activityFilter.value;
        
        console.log('Finding places near:', userLocation);
        console.log('Max distance:', maxDistance, 'km');
        console.log('Place type:', placeType);
        console.log('Activity:', activity);
        
        // Clear existing markers
        clearPlaceMarkers();
        
        // Get places based on filters
        let filteredPlaces = [];
        
        // Get places of the selected type
        if (placeType && samplePlaces[placeType]) {
            filteredPlaces = samplePlaces[placeType];
        } else {
            // If no specific type is selected, get all places
            Object.values(samplePlaces).forEach(places => {
                filteredPlaces = filteredPlaces.concat(places);
            });
        }
        
        // Filter by activity if specified
        if (activity && activity !== 'both') {
            filteredPlaces = filteredPlaces.filter(place => 
                place.suitableFor && place.suitableFor.includes(activity)
            );
        }
        
        // Calculate distance for each place and filter by distance
        const nearbyPlaces = filteredPlaces
            .map(place => {
                const distance = calculateDistance(userLocation, place.coordinates);
                return {
                    ...place,
                    distance: distance
                };
            })
            .filter(place => place.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance);
        
        console.log(`Found ${nearbyPlaces.length} places within ${maxDistance}km`);
        
        // Create a bounds object to fit all markers
        const bounds = new mapboxgl.LngLatBounds();
        
        // Add user's location to bounds
        bounds.extend(userLocation);
        
        // Add markers for each place
        nearbyPlaces.forEach(place => {
            // Create marker
            const el = document.createElement('div');
            el.className = 'place-marker';
            el.style.backgroundImage = `url('/images/${placeType === 'park' ? 'park' : placeType === 'trail' ? 'trail' : 'building'}.png')`;
            el.style.width = '32px';
            el.style.height = '32px';
            el.style.backgroundSize = '100%';
            
            const marker = new mapboxgl.Marker(el)
                .setLngLat(place.coordinates)
                .setPopup(new mapboxgl.Popup().setHTML(`
                    <h3>${place.name}</h3>
                    <p><strong>Type:</strong> ${place.type}</p>
                    <p><strong>Distance:</strong> ${place.distance.toFixed(1)} km</p>
                    <p><strong>Address:</strong> ${place.address}</p>
                    <p><strong>Suitable for:</strong> ${place.suitableFor.length > 0 ? place.suitableFor.join(', ') : 'Not specified'}</p>
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
        updatePlacesList(nearbyPlaces);
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
                            <span>${place.suitableFor.length > 0 ? place.suitableFor.join(', ') : 'Not specified'}</span>
                        </p>
                    </div>
                    <div class="place-actions">
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${place.coordinates[1]},${place.coordinates[0]}" target="_blank" class="directions-btn">Get Directions</a>
                        <button class="save-place-btn" data-place-id="${place.id}">Save to Favorites</button>
                    </div>
                </div>
            `;
        });
        
        placesList.innerHTML = html;
        
        // Add event listeners to Save to Favorites buttons
        document.querySelectorAll('.save-place-btn').forEach(button => {
            button.addEventListener('click', function() {
                const placeId = this.getAttribute('data-place-id');
                savePlaceToFavorites(placeId);
            });
        });
    }
    
    // Function to save a place to favorites
    function savePlaceToFavorites(placeId) {
        // In a real app, this would send a request to the server
        console.log('Saving place to favorites:', placeId);
        alert('Place saved to favorites!');
        
        // Change button text and disable it
        const button = document.querySelector(`.save-place-btn[data-place-id="${placeId}"]`);
        if (button) {
            button.textContent = 'Saved';
            button.disabled = true;
            button.classList.add('saved');
        }
    }
    
    // Locate Me button click event
    locateMeBtn.addEventListener('click', async function() {
        await updateCurrentPosition();
    });
    
    // Find Places button click event
    findPlacesBtn.addEventListener('click', async function() {
        await findPlacesNearby();
    });
    
    // Filter change events
    placeTypeFilter.addEventListener('change', async function() {
        await findPlacesNearby();
    });
    
    activityFilter.addEventListener('change', async function() {
        await findPlacesNearby();
    });
    
    distanceFilter.addEventListener('change', async function() {
        await findPlacesNearby();
    });
    
    // Initialize the map when it's loaded
    map.on('load', function() {
        // Get initial position
        updateCurrentPosition();
    });
});
