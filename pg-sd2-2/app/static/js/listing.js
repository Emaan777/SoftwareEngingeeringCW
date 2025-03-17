document.addEventListener('DOMContentLoaded', function() {
    // Main tabs and content sections
    const availableTab = document.getElementById('available-tab');
    const pendingTab = document.getElementById('pending-tab');
    const availableSection = document.getElementById('available-section');
    const pendingSection = document.getElementById('pending-section');
    
    // Search and filter elements
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    
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
    let pendingRequests = [];

    // Hardcoded sample data
    const sampleUsers = [
        {
            FirstName: "Sunjog",
            LastName: "Singh",
            Email: "sunjog.singh@example.com",
            ExercisePreference: "Running",
            ProfilePicture: null,
            Location: "Edinburgh City Center",
            PreferredTime: "Morning (6-8 AM)",
            LastActive: "2 days ago",
            requestSent: false
        },
        {
            FirstName: "Harbajsd",
            LastName: "Kaur",
            Email: "harbajsd.kaur@example.com",
            ExercisePreference: "Cycling",
            ProfilePicture: null,
            Location: "Leith, Edinburgh",
            PreferredTime: "Weekend afternoons",
            LastActive: "1 week ago",
            requestSent: false
        },
        {
            FirstName: "Emaan",
            LastName: "Ahmed",
            Email: "emaan.ahmed@example.com",
            ExercisePreference: "Running",
            ProfilePicture: null,
            Location: "Bruntsfield, Edinburgh",
            PreferredTime: "Evenings (after 6 PM)",
            LastActive: "Just now",
            requestSent: false
        },
        {
            FirstName: "Naha",
            LastName: "Patel",
            Email: "naha.patel@example.com",
            ExercisePreference: "Cycling",
            ProfilePicture: null,
            Location: "Portobello, Edinburgh",
            PreferredTime: "Early mornings and weekends",
            LastActive: "3 hours ago",
            requestSent: false
        }
    ];

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

    // Function to filter users based on search and activity
    function filterUsers(params = {}) {
        return sampleUsers.filter(user => {
            const matchesSearch = !params.search || 
                user.FirstName.toLowerCase().includes(params.search.toLowerCase()) ||
                user.LastName.toLowerCase().includes(params.search.toLowerCase()) ||
                user.Email.toLowerCase().includes(params.search.toLowerCase()) ||
                user.Location.toLowerCase().includes(params.search.toLowerCase());

            const matchesActivity = !params.activity || 
                user.ExercisePreference === params.activity;

            return matchesSearch && matchesActivity;
        });
    }

    // Function to create user list item
    function createUserListItem(user) {
        const item = userTemplate.content.cloneNode(true);
        
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
    
    // Function to create pending request item
    function createPendingRequestItem(request) {
        const item = pendingTemplate.content.cloneNode(true);
        
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
        
        // Set location and request date
        item.querySelector('.location span').textContent = request.user.Location;
        item.querySelector('.request-date span').textContent = `Sent ${request.date}`;
        
        // Set up cancel button
        const cancelButton = item.querySelector('.cancel-request-btn');
        cancelButton.addEventListener('click', function() {
            // Remove from pending requests
            removeFromPendingRequests(request.id);
            
            // Update the user object
            request.user.requestSent = false;
            
            // Re-render both views
            renderUsers();
            renderPendingRequests();
        });

        return item;
    }
    
    // Function to add to pending requests
    function addToPendingRequests(user) {
        const request = {
            id: Date.now().toString(), // unique ID
            user: user,
            date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        pendingRequests.push(request);
        
        // If we're on the pending tab, update the view
        if (pendingTab.classList.contains('active')) {
            renderPendingRequests();
        }
    }
    
    // Function to remove from pending requests
    function removeFromPendingRequests(requestId) {
        pendingRequests = pendingRequests.filter(req => req.id !== requestId);
    }

    // Function to render users
    function renderUsers(params = {}) {
        const users = filterUsers(params);
        usersList.innerHTML = '';
        
        if (users.length === 0) {
            const noUsers = document.createElement('p');
            noUsers.className = 'no-users';
            noUsers.textContent = 'No users found.';
            usersList.appendChild(noUsers);
            return;
        }

        users.forEach(user => {
            usersList.appendChild(createUserListItem(user));
        });
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
            pendingList.appendChild(createPendingRequestItem(request));
        });
    }

    // Function to update filters and re-render
    function updateFilters() {
        const params = {
            search: searchInput.value,
            activity: filterSelect.value !== 'all' ? filterSelect.value : ''
        };

        // Update URL without reloading the page
        const queryString = new URLSearchParams(params).toString();
        window.history.pushState({}, '', `${window.location.pathname}?${queryString}`);

        // Re-render users with new filters
        renderUsers(params);
    }

    // Add event listeners for tabs
    availableTab.addEventListener('click', function() {
        switchTab('available');
    });
    
    pendingTab.addEventListener('click', function() {
        switchTab('pending');
    });

    // Add event listeners with debounce for search
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(updateFilters, 500);
    });

    // Add event listeners for select filters
    filterSelect.addEventListener('change', updateFilters);
    
    // Modal close button event
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Set initial values from URL params and render
    const urlParams = new URLSearchParams(window.location.search);
    searchInput.value = urlParams.get('search') || '';
    filterSelect.value = urlParams.get('activity') || 'all';

    // Initial render
    renderUsers({
        search: searchInput.value,
        activity: filterSelect.value !== 'all' ? filterSelect.value : ''
    });
}); 