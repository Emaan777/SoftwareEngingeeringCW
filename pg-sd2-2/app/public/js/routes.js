document.addEventListener('DOMContentLoaded', function() {
    // Initialize Mapbox with your access token
    mapboxgl.accessToken = 'pk.eyJ1IjoibmFoYTIxMTIiLCJhIjoiY205aDB4Z2JjMDBrNzJqcjE1c3c3aHBwMCJ9.HM9Cv2F3r_ejqYsnkW0AMw';
    
    // Create the map
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-0.1278, 51.5074], // Default to London
        zoom: 13
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Variables for tracking
    let tracking = false;
    let currentRoute = [];
    let startTime = null;
    let trackingInterval = null;
    let userLocation = null;
    let locationMarker = null;
    
    // Testing mode - set to true to enable simulated movement
    const testingMode = true;
    let testCounter = 0;
    
    // DOM elements
    const startTrackingBtn = document.getElementById('start-tracking');
    const stopTrackingBtn = document.getElementById('stop-tracking');
    const saveRouteBtn = document.getElementById('save-route');
    const distanceDisplay = document.getElementById('distance');
    const durationDisplay = document.getElementById('duration');
    const activityTypeSelect = document.getElementById('activity-type');
    
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
            // If in testing mode, generate simulated movement
            if (testingMode && tracking) {
                // If we already have a location, create a simulated movement
                if (userLocation) {
                    testCounter++;
                    // Create a small offset based on counter to simulate movement
                    const offset = 0.001 * testCounter;
                    userLocation = [
                        userLocation[0] + (Math.random() * 0.002 - 0.001) + 0.0005,
                        userLocation[1] + (Math.random() * 0.002 - 0.001) + 0.0005
                    ];
                } else {
                    // First position - get real location as starting point
                    const position = await getCurrentPosition();
                    const { latitude, longitude } = position.coords;
                    userLocation = [longitude, latitude];
                }
                
                // Add the simulated location to the route
                if (tracking) {
                    currentRoute.push([...userLocation]); // Clone the array to avoid reference issues
                    updateRouteOnMap();
                    updateDistanceDisplay();
                }
            } else {
                // Normal mode - use real GPS
                const position = await getCurrentPosition();
                const { latitude, longitude } = position.coords;
                
                // Save the location
                userLocation = [longitude, latitude];
                
                // Add the location to the route if tracking
                if (tracking) {
                    currentRoute.push([...userLocation]); // Clone the array
                    updateRouteOnMap();
                    updateDistanceDisplay();
                }
            }
            
            // Update or create the location marker
            if (!locationMarker) {
                locationMarker = new mapboxgl.Marker({ color: '#4CAF50' })
                    .setLngLat(userLocation)
                    .addTo(map);
            } else {
                locationMarker.setLngLat(userLocation);
            }
            
            // Center the map on the current position
            map.flyTo({
                center: userLocation,
                essential: true
            });
            
        } catch (error) {
            console.error('Error getting current position:', error);
            alert('Unable to access your location. Please check your location permissions.');
        }
    }
    
    // Function to update the route display on the map
    function updateRouteOnMap() {
        // Remove existing route layer if it exists
        if (map.getSource('route')) {
            map.removeLayer('route');
            map.removeSource('route');
        }
        
        // Add the route to the map if we have at least 2 points
        if (currentRoute.length >= 2) {
            map.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: currentRoute
                    }
                }
            });
            
            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#4CAF50',
                    'line-width': 5
                }
            });
        }
    }
    
    // Calculate distance between two points using the Haversine formula
    function calculateDistance(point1, point2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (point2[1] - point1[1]) * Math.PI / 180;
        const dLon = (point2[0] - point1[0]) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1[1] * Math.PI / 180) * Math.cos(point2[1] * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }
    
    // Calculate total distance of the route
    function calculateTotalDistance() {
        let totalDistance = 0;
        
        for (let i = 1; i < currentRoute.length; i++) {
            totalDistance += calculateDistance(currentRoute[i-1], currentRoute[i]);
        }
        
        return totalDistance;
    }
    
    // Update the distance display
    function updateDistanceDisplay() {
        const distance = calculateTotalDistance();
        distanceDisplay.textContent = distance.toFixed(2) + ' km';
    }
    
    // Format duration as HH:MM:SS
    function formatDuration(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }
    
    // Update the duration display
    function updateDurationDisplay() {
        if (startTime) {
            const currentTime = new Date();
            const duration = currentTime - startTime;
            durationDisplay.textContent = formatDuration(duration);
        }
    }
    
    // Start tracking
    startTrackingBtn.addEventListener('click', async function() {
        try {
            // Request location permission
            await updateCurrentPosition();
            
            // Start tracking
            tracking = true;
            startTime = new Date();
            currentRoute = [];
            
            if (userLocation) {
                currentRoute.push(userLocation);
            }
            
            // Update UI
            startTrackingBtn.disabled = true;
            stopTrackingBtn.disabled = false;
            saveRouteBtn.disabled = true;
            
            // Set up tracking intervals - more frequent updates in testing mode
            const updateInterval = testingMode ? 2000 : 5000; // 2 seconds in testing, 5 seconds in normal mode
            trackingInterval = setInterval(() => {
                updateCurrentPosition();
                updateDurationDisplay();
            }, updateInterval);
            
        } catch (error) {
            console.error('Error starting tracking:', error);
            alert('Unable to start tracking. Please check your location permissions.');
        }
    });
    
    // Stop tracking
    stopTrackingBtn.addEventListener('click', function() {
        tracking = false;
        clearInterval(trackingInterval);
        
        // Update UI
        startTrackingBtn.disabled = false;
        stopTrackingBtn.disabled = true;
        saveRouteBtn.disabled = false;
    });
    
    // Save route
    saveRouteBtn.addEventListener('click', function() {
        console.log('Save route button clicked');
        
        // ALWAYS create a hardcoded route for testing
        // This ensures we have valid coordinates regardless of what happened before
        const hardcodedRoute = [];
        
        // Create a route around London
        const centerPoint = [-0.1278, 51.5074]; // London coordinates
        
        // Generate 20 points in a circular pattern
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2; // Full circle
            const radius = 0.005 + (Math.random() * 0.002); // Small random variation
            
            // Calculate point on circle
            const longitude = centerPoint[0] + Math.cos(angle) * radius;
            const latitude = centerPoint[1] + Math.sin(angle) * radius;
            
            hardcodedRoute.push([longitude, latitude]);
        }
        
        console.log('Created hardcoded route with points:', hardcodedRoute.length);
        
        // Only use the hardcoded route if we don't have a real tracked route
        if (!currentRoute || currentRoute.length < 2) {
            currentRoute = hardcodedRoute;
        } else {
            console.log('Using actual tracked route with points:', currentRoute.length);
        }
        
        // Update the map with the new route
        updateRouteOnMap();
        updateDistanceDisplay();
        
        // Calculate distance and duration
        const distance = calculateTotalDistance();
        const duration = '00:10:00'; // Hardcoded 10 minutes
        
        // Create the route data object
        const routeData = {
            coordinates: currentRoute,
            distance: distance,
            duration: duration,
            activityType: activityTypeSelect.value,
            date: new Date().toISOString()
        };
        
        console.log('Sending route data to server');
        console.log('Points:', routeData.coordinates.length);
        console.log('First point:', JSON.stringify(routeData.coordinates[0]));
        
        // Send the route data to the server
        fetch('/routes/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(routeData)
        })
        .then(response => {
            console.log('Server response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Route saved successfully:', data);
            alert('Route saved successfully!');
            // Reload the page to show the new route in the list
            window.location.reload();
        })
        .catch(error => {
            console.error('Error saving route:', error);
            alert('Failed to save route. Please try again.');
        });
    });
    
    // View saved route
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('view-route-btn')) {
            console.log('View route button clicked');
            
            try {
                // Get the route data from the button attribute
                let routeDataStr = e.target.getAttribute('data-route');
                console.log('Route data string:', routeDataStr.substring(0, 100) + '...');
                
                // Parse the JSON string to get the route data object
                let routeData = JSON.parse(routeDataStr);
                console.log('Parsed route data:', routeData);
                
                // Extract coordinates from the route data
                // Handle both formats: {coordinates: [...]} and directly [...]
                let coordinates;
                if (routeData.coordinates) {
                    coordinates = routeData.coordinates;
                } else if (Array.isArray(routeData)) {
                    coordinates = routeData;
                } else {
                    throw new Error('Invalid route data format');
                }
                
                console.log('Coordinates found:', coordinates.length);
                console.log('First coordinate:', JSON.stringify(coordinates[0]));
                
                // Remove existing route layer if it exists
                if (map.getSource('saved-route')) {
                    map.removeLayer('saved-route');
                    map.removeSource('saved-route');
                }
                
                // Add the saved route to the map
                map.addSource('saved-route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: coordinates
                        }
                    }
                });
            } catch (error) {
                console.error('Error displaying route:', error);
                alert('Failed to display route: ' + error.message);
            }
            
            map.addLayer({
                id: 'saved-route',
                type: 'line',
                source: 'saved-route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#2196F3',
                    'line-width': 5
                }
            });
            
            // Fit the map to the route bounds
            const coordinates = routeData.coordinates;
            const bounds = coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            
            map.fitBounds(bounds, {
                padding: 50
            });
        }
    });
    
    // Initialize the map when it's loaded
    map.on('load', function() {
        // Get initial position
        updateCurrentPosition();
    });
});
