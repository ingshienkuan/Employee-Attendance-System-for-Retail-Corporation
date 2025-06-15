
window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    });
};

       // Mock data arrays to store requests
        let leaveRequests = [
            {
                id: 1,
                type: 'Vacation',
                dates: 'Jul 15, 2023 - Jul 20, 2023',
                duration: '5 days',
                status: 'Approved'
            },
            {
                id: 2,
                type: 'Sick Leave',
                dates: 'Aug 5, 2023',
                duration: '1 day',
                status: 'Pending'
            },
            {
                id: 3,
                type: 'Personal Leave',
                dates: 'Jun 10, 2023',
                duration: 'Half day (Morning)',
                status: 'Rejected'
            }
        ];

        let shiftRequests = [
            {
                id: 1,
                currentShift: 'Aug 12, 2023 (Morning)',
                requestedShift: 'Aug 13, 2023 (Afternoon)',
                requestedOn: 'Aug 5, 2023',
                status: 'Pending'
            },
            {
                id: 2,
                currentShift: 'Jul 28, 2023 (Evening)',
                requestedShift: 'Jul 29, 2023 (Morning)',
                requestedOn: 'Jul 20, 2023',
                status: 'Approved'
            }
        ];

        // Modal functions
        function openLeaveModal() {
            document.getElementById('leaveModal').style.display = 'block';
        }

        function closeLeaveModal() {
            document.getElementById('leaveModal').style.display = 'none';
            document.getElementById('leaveForm').reset();
        }

        function openShiftModal() {
            document.getElementById('shiftModal').style.display = 'block';
        }

        function closeShiftModal() {
            document.getElementById('shiftModal').style.display = 'none';
            document.getElementById('shiftForm').reset();
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const leaveModal = document.getElementById('leaveModal');
            const shiftModal = document.getElementById('shiftModal');
            
            if (event.target == leaveModal) {
                closeLeaveModal();
            }
            if (event.target == shiftModal) {
                closeShiftModal();
            }
        }

        // Submit functions
        function submitLeaveRequest() {
            const form = document.getElementById('leaveForm');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const leaveType = document.getElementById('leaveType').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const durationType = document.getElementById('durationType').value;
            const reason = document.getElementById('reason').value;

            // Calculate duration and format dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            let formattedDates = formatDate(start);
            if (start.getTime() !== end.getTime()) {
                formattedDates += ' - ' + formatDate(end);
            }

            let duration = durationType;
            if (durationType === 'Full Day' && diffDays > 1) {
                duration = `${diffDays} days`;
            } else if (durationType === 'Full Day') {
                duration = '1 day';
            }

            // Add new request to the array
            const newRequest = {
                id: leaveRequests.length + 1,
                type: leaveType,
                dates: formattedDates,
                duration: duration,
                status: 'Pending'
            };

            leaveRequests.push(newRequest);
            renderLeaveRequests();
            closeLeaveModal();
            
            alert('Leave request submitted successfully!');
        }

        function submitShiftRequest() {
            const form = document.getElementById('shiftForm');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const currentShiftDate = document.getElementById('currentShiftDate').value;
            const currentShiftTime = document.getElementById('currentShiftTime').value;
            const requestedShiftDate = document.getElementById('requestedShiftDate').value;
            const requestedShiftTime = document.getElementById('requestedShiftTime').value;
            const shiftReason = document.getElementById('shiftReason').value;

            const currentShiftFormatted = formatDate(new Date(currentShiftDate)) + ` (${currentShiftTime})`;
            const requestedShiftFormatted = formatDate(new Date(requestedShiftDate)) + ` (${requestedShiftTime})`;
            const today = formatDate(new Date());

            // Add new request to the array
            const newRequest = {
                id: shiftRequests.length + 1,
                currentShift: currentShiftFormatted,
                requestedShift: requestedShiftFormatted,
                requestedOn: today,
                status: 'Pending'
            };

            shiftRequests.push(newRequest);
            renderShiftRequests();
            closeShiftModal();
            
            alert('Shift change request submitted successfully!');
        }

        // Render functions
        function renderLeaveRequests() {
            const tbody = document.getElementById('leaveRequestsTable');
            tbody.innerHTML = '';

            leaveRequests.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.type}</td>
                    <td>${request.dates}</td>
                    <td>${request.duration}</td>
                    <td><span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span></td>
                `;
                tbody.appendChild(row);
            });
        }

        function renderShiftRequests() {
            const tbody = document.getElementById('shiftRequestsTable');
            tbody.innerHTML = '';

            shiftRequests.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.currentShift}</td>
                    <td>${request.requestedShift}</td>
                    <td>${request.requestedOn}</td>
                    <td><span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span></td>
                `;
                tbody.appendChild(row);
            });
        }

        // Utility function to format dates
        function formatDate(date) {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            };
            return date.toLocaleDateString('en-US', options);
        }

        // Set minimum date to today for date inputs
        document.addEventListener('DOMContentLoaded', function() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('startDate').setAttribute('min', today);
            document.getElementById('endDate').setAttribute('min', today);
            document.getElementById('currentShiftDate').setAttribute('min', today);
            document.getElementById('requestedShiftDate').setAttribute('min', today);

            // Update end date minimum when start date changes
            document.getElementById('startDate').addEventListener('change', function() {
                document.getElementById('endDate').setAttribute('min', this.value);
            });
        });