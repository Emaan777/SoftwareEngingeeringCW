document.addEventListener('DOMContentLoaded', function() {
    // Main tabs and content sections
    const availableTab = document.getElementById('available-tab');
    const pendingTab = document.getElementById('pending-tab');
    const availableSection = document.getElementById('available-section');
    const pendingSection = document.getElementById('pending-section');
    
    // Search and filter elements
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const searchButton = document.getElementById('search-button');
    
    // Lists and templates
    const usersList = document.getElementById('users-list');
    const pendingList = document.getElementById('pending-list');
    const userTemplate = document.getElementById('user-list-item-template');
    const pendingTemplate = document.getElementById('pending-list-item-template');
    const noPendingMsg = document.getElementById('no-pending');
    
    // Modal elements
    const modal = document.getElementById('request-modal');
    const closeModal = document.querySelector('.close-modal');

    // Arrays to store users and pending requests
    let users = [];
    let pendingRequests = [];

    // Function to switch tabs
    function switchTab(tab) {
        // Remove active class from all tabs and sections
        availableTab.classList.remove('active');
        pendingTab.classList.remove('active');
        availableSection.classList.remove('active');
        pendingSection.classList.remove('active');
        
        // Add active class to selected tab and its content
        if (tab === 'pending') {
            pendingTab.classList.add('active');
            pendingSection.classList.add('active');
            renderPendingRequests();
        } else {
            availableTab.classList.add('active');
            availableSection.classList.add('active');
        }
    }

    // Fetch users from API
    function fetchUsers() {
        // Get filter values
        const search = searchInput.value.trim();
        const activity = filterSelect.value !== 'all' ? filterSelect.value : '';
        
        // Build query parameters
        let queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (activity) queryParams.append('activity', activity);
        
        // Show loading message
        usersList.innerHTML = '<p class="no-users">Loading users...</p>';
        
        // Make API request
        fetch(`/api/users?${queryParams.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                users = data.map(user => ({
                    ...user,
                    requestSent: pendingRequests.some(req => req.user.Email === user.Email)
                }));
                renderUsers();
                console.log('Users loaded:', users.length);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                usersList.innerHTML = '<p class="no-users">Error loading users. Please try again.</p>';
                
                // Fallback to sample data if API fails
                users = sampleUsers.map(user => ({
                    ...user,
                    requestSent: pendingRequests.some(req => req.user.Email === user.Email)
                }));
                renderUsers();
                console.log('Using sample data due to API error');
            });
    }

    // Sample users for fallback
    const sampleUsers = [
        {
            FirstName: "Sunjog",
            LastName: "Singh",
            Email: "sunjog.singh@example.com",
            ExercisePreference: "Running",
            ProfilePicture: null,
            Location: "Edinburgh City Center",
            PreferredTime: "Morning (6-8 AM)",
            LastActive: "2 days ago"
        },
        {
            FirstName: "Harbajsd",
            LastName: "Kaur",
            Email: "harbajsd.kaur@example.com",
            ExercisePreference: "Cycling",
            ProfilePicture: null,
            Location: "Leith, Edinburgh",
            PreferredTime: "Weekend afternoons",
            LastActive: "1 week ago"
        },
        {
            FirstName: "Emaan",
            LastName: "Ahmed",
            Email: "emaan.ahmed@example.com",
            ExercisePreference: "Running",
            ProfilePicture: null,
            Location: "Bruntsfield, Edinburgh",
            PreferredTime: "Evenings (after 6 PM)",
            LastActive: "Just now"
        },
        {
            FirstName: "Naha",
            LastName: "Patel",
            Email: "naha.patel@example.com",
            ExercisePreference: "Cycling",
            ProfilePicture: null,
            Location: "Portobello, Edinburgh",
            PreferredTime: "Early mornings and weekends",
            LastActive: "3 hours ago"
        }
    ];

    // Function to render users
    function renderUsers() {
        usersList.innerHTML = '';
        
        if (users.length === 0) {
            usersList.innerHTML = '<p class="no-users">No users found matching your criteria.</p>';
            return;
        }
        
        users.forEach(user => {
            const item = createUserListItem(user);
            usersList.appendChild(item);
        });
    }
    
    // Function to create user list item
    function createUserListItem(user) {
        const item = document.importNode(userTemplate.content, true);
        
        // Set activity icon
        const activityIcon = item.querySelector('.activity-icon');
        const iconElement = activityIcon.querySelector('i');
        
        if (user.ExercisePreference === "Running") {
            activityIcon.classList.add('running');
            iconElement.classList.add('fas', 'fa-running');
        } else if (user.ExercisePreference === "Cycling") {
            activityIcon.classList.add('cycling');
            iconElement.classList.add('fas', 'fa-biking');
        }
        
        // Set user image or initials
        const placeholderImage = item.querySelector('.placeholder-image');
        const span = placeholderImage.querySelector('span');
        if (user.ProfilePicture) {
            const img = document.createElement('img');
            img.src = user.ProfilePicture;
            img.alt = `${user.FirstName}'s profile picture`;
            placeholderImage.parentNode.replaceChild(img, placeholderImage);
        } else {
            span.textContent = `${user.FirstName[0]}${user.LastName[0]}`;
        }

        // Set user info
        item.querySelector('h3').textContent = `${user.FirstName} ${user.LastName}`;
        item.querySelector('.exercise-preference span').textContent = user.ExercisePreference;
        
        // Set location and time info
        item.querySelector('.location span').textContent = user.Location;
        item.querySelector('.preferred-time span').textContent = user.PreferredTime;
        item.querySelector('.last-active span').textContent = user.LastActive;
        
        // Set up request button
        const requestButton = item.querySelector('.send-request-btn');
        if (user.requestSent) {
            requestButton.textContent = 'Request Sent';
            requestButton.classList.add('sent');
            requestButton.disabled = true;
        } else {
            requestButton.addEventListener('click', function() {
                // Update the user object
                user.requestSent = true;
                
                // Update button state
                this.textContent = 'Request Sent';
                this.classList.add('sent');
                this.disabled = true;
                
                // Add to pending requests
                addToPendingRequests(user);
                
                // Show confirmation modal
                modal.style.display = 'flex';
                
                // Log the action
                console.log(`Request sent to ${user.FirstName} ${user.LastName} (${user.Email})`);
            });
        }

        return item;
    }
    
    // Function to add to pending requests
    function addToPendingRequests(user) {
        const now = new Date();
        const request = {
            id: Date.now(),
            user: user,
            date: now.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric'
            }),
            status: 'pending'
        };
        
        pendingRequests.push(request);
        renderPendingRequests();
    }
    
    // Function to render pending requests
    function renderPendingRequests() {
        pendingList.innerHTML = '';
        
        if (pendingRequests.length === 0) {
            noPendingMsg.style.display = 'block';
            return;
        }
        
        noPendingMsg.style.display = 'none';
        
        pendingRequests.forEach(request => {
            const item = createPendingRequestItem(request);
            pendingList.appendChild(item);
        });
    }
    
    // Function to create pending request item
    function createPendingRequestItem(request) {
        const item = document.importNode(pendingTemplate.content, true);
        
        // Set activity icon
        const activityIcon = item.querySelector('.activity-icon');
        const iconElement = activityIcon.querySelector('i');
        
        if (request.user.ExercisePreference === "Running") {
            activityIcon.classList.add('running');
            iconElement.classList.add('fas', 'fa-running');
        } else if (request.user.ExercisePreference === "Cycling") {
            activityIcon.classList.add('cycling');
            iconElement.classList.add('fas', 'fa-biking');
        }
        
        // Set user image or initials
        const placeholderImage = item.querySelector('.placeholder-image');
        const span = placeholderImage.querySelector('span');
        if (request.user.ProfilePicture) {
            const img = document.createElement('img');
            img.src = request.user.ProfilePicture;
            img.alt = `${request.user.FirstName}'s profile picture`;
            placeholderImage.parentNode.replaceChild(img, placeholderImage);
        } else {
            span.textContent = `${request.user.FirstName[0]}${request.user.LastName[0]}`;
        }

        // Set user info
        item.querySelector('h3').textContent = `${request.user.FirstName} ${request.user.LastName}`;
        item.querySelector('.exercise-preference span').textContent = request.user.ExercisePreference;
        
        // Set location info
        item.querySelector('.location span').textContent = request.user.Location;
        
        // Set request date
        item.querySelector('.request-date span').textContent = request.date;
        
        // Set up cancel button
        const cancelButton = item.querySelector('.cancel-request-btn');
        cancelButton.addEventListener('click', function() {
            cancelRequest(request.id);
        });

        return item;
    }
    
    // Function to cancel a request
    function cancelRequest(requestId) {
        const index = pendingRequests.findIndex(req => req.id === requestId);
        if (index !== -1) {
            const email = pendingRequests[index].user.Email;
            
            // Remove from pending requests
            pendingRequests.splice(index, 1);
            renderPendingRequests();
            
            // Update user in users list if they exist there
            const userIndex = users.findIndex(user => user.Email === email);
            if (userIndex !== -1) {
                users[userIndex].requestSent = false;
                renderUsers();
            }
            
            console.log(`Request cancelled for ${email}`);
        }
    }
    
    // Event listeners
    
    // Tab switching
    availableTab.addEventListener('click', () => switchTab('available'));
    pendingTab.addEventListener('click', () => switchTab('pending'));
    
    // Search button
    searchButton.addEventListener('click', fetchUsers);
    
    // Search input - search on enter key
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            fetchUsers();
        }
    });
    
    // Modal close button
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Initialize - fetch users on page load
    fetchUsers();
}); 