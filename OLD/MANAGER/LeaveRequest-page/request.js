document.addEventListener('DOMContentLoaded', () => {
    // Sample data for leave requests with enhanced information
    const requestData = [
        { 
            id: "EMP001", 
            name: "Sarah Johnson", 
            email: "sarah.johnson@example.com",
            initials: "SJ",
            avatarColor: "avatar-blue",
            department: "Sales & Customer Service", 
            requestType: "Shift Change",
            requestSubtitle: "Monday to Wednesday", 
            date: "May 15, 2023", 
            status: "Pending" 
        },
        { 
            id: "EMP002", 
            name: "Michael Chen", 
            email: "michael.chen@example.com",
            initials: "MC",
            avatarColor: "avatar-orange",
            department: "Inventory & Supply Chain", 
            requestType: "Leave Request",
            requestSubtitle: "Personal Leave", 
            date: "May 16-18, 2023", 
            status: "Pending" 
        },
        { 
            id: "EMP003", 
            name: "Alex Rivera", 
            email: "alex.rivera@example.com",
            initials: "AR",
            avatarColor: "avatar-purple",
            department: "IT & E-commerce", 
            requestType: "Shift Change",
            requestSubtitle: "Evening to Morning", 
            date: "May 15, 2023", 
            status: "Pending" 
        }
    ];

    // Render the requests data in the table
    const tableBody = document.querySelector('#requestLogs');
    
    const renderTable = (data) => {
        tableBody.innerHTML = ''; // Clear previous table data
        
        data.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="employee-cell">
                        <div class="employee-avatar ${entry.avatarColor}">
                            ${entry.initials}
                        </div>
                        <div class="employee-info">
                            <div class="employee-name">${entry.name}</div>
                            <div class="employee-email">${entry.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="department-cell">${entry.department}</div>
                </td>
                <td>
                    <div class="request-type-cell">
                        <div class="request-type-title">${entry.requestType}</div>
                        <div class="request-type-subtitle">${entry.requestSubtitle}</div>
                    </div>
                </td>
                <td>
                    <div class="date-cell">${entry.date}</div>
                </td>
                <td>
                    <div class="status-cell">
                        <span class="status-badge ${entry.status.toLowerCase()}">${entry.status}</span>
                    </div>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn view-btn" onclick="viewRequest('${entry.id}')">View</button>
                        <button class="action-btn approve-btn" onclick="approveRequest('${entry.id}')">Approve</button>
                        <button class="action-btn reject-btn" onclick="rejectRequest('${entry.id}')">Reject</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    // Initial render
    renderTable(requestData);

    // Action handlers
    window.viewRequest = (id) => {
        const request = requestData.find(req => req.id === id);
        if (request) {
            alert(`Viewing request for ${request.name}\nType: ${request.requestType}\nDate: ${request.date}`);
            // Here you would typically open a modal or navigate to a detailed view
        }
    };

    window.approveRequest = (id) => {
        const requestIndex = requestData.findIndex(req => req.id === id);
        if (requestIndex !== -1) {
            requestData[requestIndex].status = 'Approved';
            renderTable(requestData);
            showNotification(`Request approved for ${requestData[requestIndex].name}`, 'success');
        }
    };

    window.rejectRequest = (id) => {
        const requestIndex = requestData.findIndex(req => req.id === id);
        if (requestIndex !== -1) {
            requestData[requestIndex].status = 'Rejected';
            renderTable(requestData);
            showNotification(`Request rejected for ${requestData[requestIndex].name}`, 'error');
        }
    };

    // Notification function
    const showNotification = (message, type) => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            ${type === 'success' ? 'background-color: #10b981;' : 'background-color: #ef4444;'}
        `;
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    };

    // Apply Filters (placeholder for future implementation)
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            // Implement filter logic
            console.log('Filter functionality to be implemented');
        });
    }

    // Export Data (placeholder for future implementation)
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataToExport = requestData.map(item => ({
                ID: item.id,
                Name: item.name,
                Email: item.email,
                Department: item.department,
                RequestType: item.requestType,
                RequestDetails: item.requestSubtitle,
                Date: item.date,
                Status: item.status,
            }));
            console.log("Exporting Data:", dataToExport);
            showNotification("Export functionality is under development", 'success');
        });
    }
});