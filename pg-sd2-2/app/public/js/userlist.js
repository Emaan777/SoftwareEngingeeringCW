// User list functionality 

function handleRequestClick(event, userId) {
    const button = event.target;
    if (!button.classList.contains('sent')) {
        // If we have a userId, use the sendRequest function
        if (userId) {
            sendRequest(userId, button);
        } else {
            // Fallback to simple UI update if no userId provided
            button.textContent = 'Request Sent';
            button.classList.add('sent');
            button.disabled = true;
            button.style.background = '#999';
        }
    }
} 

async function sendRequest(userId, button) {
    try {
        const response = await fetch('/api/buddy-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ receiverId: userId })
        });

        if (response.ok) {
            button.textContent = 'Request Sent';
            button.disabled = true;
            button.style.background = '#999';
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to send request');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send request');
    }
} 

async function acceptRequest(userId, button) {
    try {
        const response = await fetch('/api/buddy-request/accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ senderId: userId })
        });

        if (response.ok) {
            button.textContent = 'Request Accepted';
            button.disabled = true;
            button.style.background = '#999';
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to accept request');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to accept request');
    }
} 