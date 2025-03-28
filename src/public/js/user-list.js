console.log('User-list.js loaded successfully!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing user list page');
    
    // Debug info
    console.log('Current location:', window.location.href);
    
    // Elements
    const searchInput = document.getElementById('search-input');
    const activitySelect = document.getElementById('activity-select');
    const applyFilterButton = document.getElementById('apply-filter');
    const runningActivitiesContainer = document.getElementById('running-activities');
    const cyclingActivitiesContainer = document.getElementById('cycling-activities');

    console.log('Elements found:', {
        searchInput: !!searchInput,
        activitySelect: !!activitySelect,
        applyFilterButton: !!applyFilterButton,
        runningActivitiesContainer: !!runningActivitiesContainer,
        cyclingActivitiesContainer: !!cyclingActivitiesContainer
    });

    // Saved users array in local storage
    let savedUsers = JSON.parse(localStorage.getItem('savedUsers')) || [];

    // Fetch users data
    fetchUsers();

    // Event listeners
    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', filterUsers);
    }
    
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('save-button')) {
            toggleSave(e.target);
        }
    });

    // Functions
    function fetchUsers() {
        console.log('Fetching users data from API...');
        fetch('/api/users')
            .then(response => {
                console.log('API response status:', response.status);
                return response.json();
            })
            .then(users => {
                console.log('Users data received:', users);
                renderUsers(users);
                initializeSavedButtons();
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                // Fallback to sample data if API fails
                const sampleUsers = [
                    {
                        FirstName: "John",
                        LastName: "Smith",
                        Email: "john.smith@gmail.com",
                        ExercisePreference: "Running",
                        Expertise: "Beginner",
                        Location: "Edinburgh City Center",
                        PreferredTime: "Morning (6-8 AM)",
                        LastActive: "Today"
                    },
                    {
                        FirstName: "Sarah",
                        LastName: "Johnson",
                        Email: "sarah.j@example.com",
                        ExercisePreference: "Running",
                        Expertise: "Advanced",
                        Location: "Leith",
                        PreferredTime: "Evening (5-7 PM)",
                        LastActive: "Yesterday"
                    },
                    {
                        FirstName: "Michael",
                        LastName: "Brown",
                        Email: "mike.brown@example.com",
                        ExercisePreference: "Cycling",
                        Expertise: "Intermediate",
                        Location: "Portobello",
                        PreferredTime: "Afternoon (2-4 PM)",
                        LastActive: "2 days ago"
                    }
                ];
                
                console.log('Using fallback sample data');
                renderUsers(sampleUsers);
                initializeSavedButtons();
            });
    }

    function renderUsers(users) {
        const runningUsers = users.filter(user => user.ExercisePreference === 'Running');
        const cyclingUsers = users.filter(user => user.ExercisePreference === 'Cycling');
        
        console.log('Rendering users:', { 
            runningCount: runningUsers.length, 
            cyclingCount: cyclingUsers.length 
        });
        
        // Render running activities
        if (runningActivitiesContainer) {
            if (runningUsers.length === 0) {
                runningActivitiesContainer.innerHTML = '<p class="no-users">No running activities found.</p>';
            } else {
                runningActivitiesContainer.innerHTML = runningUsers.map(user => createUserCard(user, 'Running')).join('');
            }
        }
        
        // Render cycling activities
        if (cyclingActivitiesContainer) {
            if (cyclingUsers.length === 0) {
                cyclingActivitiesContainer.innerHTML = '<p class="no-users">No cycling activities found.</p>';
            } else {
                cyclingActivitiesContainer.innerHTML = cyclingUsers.map(user => createUserCard(user, 'Cycling')).join('');
            }
        }
    }

    function createUserCard(user, activity) {
        const activityClass = activity.toLowerCase();
        return `
            <div class="activity-card">
                <div class="card-header">
                    <span class="activity-tag ${activityClass}">${activity}</span>
                </div>
                <div class="card-body">
                    <div class="user-info">
                        <h3>${user.FirstName} ${user.LastName}</h3>
                        <p class="location">${user.Location || 'Not specified'}</p>
                        ${user.PreferredTime ? 
                            `<p class="time">${user.PreferredTime}</p>` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="save-button" data-email="${user.Email}">${savedUsers.includes(user.Email) ? 'Saved' : 'Save for Later'}</button>
                        <a class="view-profile" href="/profile/${user.Email}">View Profile</a>
                    </div>
                </div>
            </div>
        `;
    }

    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedActivity = activitySelect.value;
        
        fetch('/api/users')
            .then(response => response.json())
            .then(users => {
                // Filter by search term
                let filteredUsers = users.filter(user => {
                    const matchesSearch = !searchTerm ||
                        user.FirstName.toLowerCase().includes(searchTerm) ||
                        user.LastName.toLowerCase().includes(searchTerm) ||
                        (user.Location && user.Location.toLowerCase().includes(searchTerm));
                    
                    // Filter by activity
                    const matchesActivity = selectedActivity === 'all' || 
                        user.ExercisePreference === selectedActivity;
                    
                    return matchesSearch && matchesActivity;
                });
                
                renderUsers(filteredUsers);
                initializeSavedButtons();
            })
            .catch(error => {
                console.error('Error filtering users:', error);
            });
    }

    function toggleSave(button) {
        const email = button.getAttribute('data-email');
        
        if (button.classList.contains('saved')) {
            // Remove from saved
            savedUsers = savedUsers.filter(userEmail => userEmail !== email);
            button.classList.remove('saved');
            button.textContent = 'Save for Later';
        } else {
            // Add to saved
            savedUsers.push(email);
            button.classList.add('saved');
            button.textContent = 'Saved';
        }
        
        // Update local storage
        localStorage.setItem('savedUsers', JSON.stringify(savedUsers));
    }

    function initializeSavedButtons() {
        const saveButtons = document.querySelectorAll('.save-button');
        saveButtons.forEach(button => {
            const email = button.getAttribute('data-email');
            if (savedUsers.includes(email)) {
                button.classList.add('saved');
                button.textContent = 'Saved';
            } else {
                button.classList.remove('saved');
                button.textContent = 'Save for Later';
            }
        });
    }
}); 