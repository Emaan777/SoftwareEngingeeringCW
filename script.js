// Function to toggle save state of an activity
function toggleSave(button) {
    const isSaved = button.classList.contains('saved');
    if (isSaved) {
        button.classList.remove('saved');
        button.innerHTML = '<i class="far fa-bookmark"></i> Save Activity';
    } else {
        button.classList.add('saved');
        button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
    }
}

// Sample data for activities (can be replaced with API data)
const activities = [
    {
        name: 'John Smith',
        activityType: 'Running',
        location: 'Hyde Park, London',
        time: 'Morning',
        profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
        name: 'Alice Johnson',
        activityType: 'Cycling',
        location: 'Regent\'s Park, London',
        time: 'Afternoon',
        profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
        name: 'Michelle Rhoades',
        activityType: 'Running',
        location: 'Victoria Park, London',
        time: 'Evening',
        profilePicture: 'https://randomuser.me/api/portraits/women/29.jpg'
    },
    {
        name: 'David Taylor',
        activityType: 'Cycling',
        location: 'Richmond Park, London',
        time: 'Morning',
        profilePicture: 'https://randomuser.me/api/portraits/men/54.jpg'
    },
    {
        name: 'Sarah Williams',
        activityType: 'Running',
        location: 'Hampstead Heath, London',
        time: 'Afternoon',
        profilePicture: 'https://randomuser.me/api/portraits/women/67.jpg'
    },
    {
        name: 'James Wilson',
        activityType: 'Cycling',
        location: 'Olympic Park, London',
        time: 'Evening',
        profilePicture: 'https://randomuser.me/api/portraits/men/78.jpg'
    }
];

// Function to filter activities based on search criteria
function filterActivities(activityType, locationKeyword) {
    return activities.filter(activity => {
        const matchesType = activityType === 'All' || activity.activityType === activityType;
        const matchesLocation = !locationKeyword || 
            activity.location.toLowerCase().includes(locationKeyword.toLowerCase());
        return matchesType && matchesLocation;
    });
}

// Function to create activity cards dynamically
function createActivityCards(activitiesToShow = activities) {
    const activitiesGrid = document.querySelector('.activities-grid');
    activitiesGrid.innerHTML = ''; // Clear existing cards
    
    if (activitiesToShow.length === 0) {
        activitiesGrid.innerHTML = '<p class="no-results">No activities found matching your criteria.</p>';
        return;
    }
    
    activitiesToShow.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        card.innerHTML = `
            <div class="activity-header">
                <img src="${activity.profilePicture}" alt="Profile" class="profile-picture">
                <div class="user-info">
                    <h3>${activity.name}</h3>
                    <span class="activity-type">${activity.activityType}</span>
                </div>
            </div>
            <div class="activity-details">
                <div class="location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${activity.location}</span>
                </div>
                <p><i class="far fa-clock"></i> ${activity.time}</p>
            </div>
            <button class="save-button" onclick="toggleSave(this)">
                <i class="far fa-bookmark"></i> Save Activity
            </button>
        `;
        
        activitiesGrid.appendChild(card);
    });
}

// Handle search form submission
function handleSearch(event) {
    if (event) event.preventDefault();
    
    const activityType = document.getElementById('activity-type').value;
    const locationKeyword = document.getElementById('location-search').value.trim();
    
    const filteredActivities = filterActivities(activityType, locationKeyword);
    createActivityCards(filteredActivities);
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createActivityCards();
    
    // Add event listener for search form if it exists
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
}); 