document.addEventListener("DOMContentLoaded", function () {
    const bioParagraph = document.getElementById("user-bio");
    const editButton = document.getElementById("edit-bio-btn");

    editButton.addEventListener("click", function () {
        const newBio = prompt("Enter your new bio:", bioParagraph.textContent);
        if (newBio !== null) {
            bioParagraph.textContent = newBio;

            // Send the new bio to the backend
            fetch("/api/update-bio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, bio: newBio }) // Make sure 'userEmail' is available
            })
            .then(response => response.json())
            .then(data => {
                console.log("Bio updated successfully:", data);
            })
            .catch(error => console.error("Error updating bio:", error));
        }
    });
});
