        // Current user - you would set this based on login
        let currentUserType = "employee"; // Change this to "manager" or "employee" to test

        // Function to set user profile
        function setUserProfile(userType) {
            const user = users[userType];
            if (user) {
                document.getElementById('userName').textContent = user.name;
                document.getElementById('userPosition').textContent = user.position;
                document.getElementById('userPosition').className = `user-position ${user.position}`;
                document.getElementById('userAvatar').textContent = user.initials;
            }
        }

function updateDateTime() {
            const now = new Date();

            // Get the current date in the format: Day, Month Date, Year
            const dateString = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Get the current time in the format: hh:mm:ss AM/PM
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            // Update the content of the date and time elements
            document.getElementById('date').textContent = dateString;
            document.getElementById('time').textContent = timeString;
        }

        // Call the update function every second to keep the time updated
        setInterval(updateDateTime, 1000);

