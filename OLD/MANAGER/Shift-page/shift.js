// Shift Management System JavaScript

class ShiftManagement {
    constructor() {
        this.currentWeek = new Date('2023-05-15');
        this.selectedDepartment = 'all';
        this.activeView = 'upcoming';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDateRange();
        this.initializeReassignView();
    }

    bindEvents() {
        // Department tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDepartmentChange(e));
        });

        // Sub navigation (View toggle)
        document.querySelectorAll('.sub-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleViewChange(e));
        });

        // Date navigation
        document.getElementById('prevWeek').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('nextWeek').addEventListener('click', () => this.navigateWeek(1));

        // Date controls
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDateControl(e));
        });

        // Create new shift button
        document.getElementById('createShiftBtn').addEventListener('click', () => this.createNewShift());

        // More buttons on shift cards
        document.querySelectorAll('.more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleShiftMenu(e));
        });

        // Employee profile modal triggers
        document.querySelectorAll('.clickable-avatar').forEach(avatar => {
            avatar.addEventListener('click', (e) => this.showEmployeeProfile(e));
        });

        // Employee profile modal close
        const closeProfileModal = document.getElementById('closeProfileModal');
        if (closeProfileModal) {
            closeProfileModal.addEventListener('click', () => this.closeEmployeeProfile());
        }

        // Close profile modal when clicking outside
        const profileModal = document.getElementById('employeeProfileModal');
        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target === profileModal) {
                    this.closeEmployeeProfile();
                }
            });
        }
    }

    handleDepartmentChange(e) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked tab
        e.target.classList.add('active');
        
        this.selectedDepartment = e.target.dataset.dept;
        this.filterShiftsByDepartment();
    }

    handleViewChange(e) {
        // Remove active class from all sub-nav buttons
        document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        this.activeView = e.target.dataset.view;
        this.updateMainContent();
    }

    navigateWeek(direction) {
        const newDate = new Date(this.currentWeek);
        newDate.setDate(newDate.getDate() + (direction * 7));
        this.currentWeek = newDate;
        this.updateDateRange();
        this.updateScheduleData();
    }

    updateDateRange() {
        const startDate = new Date(this.currentWeek);
        const endDate = new Date(this.currentWeek);
        endDate.setDate(endDate.getDate() + 6);
        
        const options = { month: 'long', day: 'numeric' };
        const startStr = startDate.toLocaleDateString('en-US', options);
        const endStr = endDate.toLocaleDateString('en-US', options);
        
        // Format: "May 15 - May 21, 2023"
        const startParts = startStr.split(' ');
        const endParts = endStr.split(' ');
        
        let dateRangeText;
        if (startParts[0] === endParts[0]) { // Same month
            dateRangeText = `${startParts[0]} ${startParts[1]} - ${endParts[1]}, ${this.currentWeek.getFullYear()}`;
        } else { // Different months
            dateRangeText = `${startParts[0]} ${startParts[1]} - ${endParts[0]} ${endParts[1]}, ${this.currentWeek.getFullYear()}`;
        }
        
        document.querySelector('.date-range').textContent = dateRangeText;
    }

    handleDateControl(e) {
        const control = e.target.textContent.trim();
        
        switch(control) {
            case 'Today':
                this.goToToday();
                break;
            case 'This Week':
                this.goToThisWeek();
                break;
            case '📅 Calendar':
                this.openCalendar();
                break;
        }
    }

    goToToday() {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        this.currentWeek = monday;
        this.updateDateRange();
        this.updateScheduleData();
    }

    goToThisWeek() {
        this.goToToday();
    }

    openCalendar() {
        // Placeholder for calendar functionality
        this.showNotification('Calendar feature coming soon!', 'info');
    }

    filterShiftsByDepartment() {
        const shiftCards = document.querySelectorAll('.shift-card');
        
        shiftCards.forEach(card => {
            const department = card.querySelector('h4').textContent;
            const shouldShow = this.selectedDepartment === 'all' || 
                              this.matchesDepartmentFilter(department);
            
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    matchesDepartmentFilter(department) {
        const filterMap = {
            'sales': 'Sales & Customer Service',
            'inventory': 'Inventory & Supply Chain',
            'it': 'IT & E-commerce'
        };
        
        return department === filterMap[this.selectedDepartment];
    }

    updateMainContent() {
        const upcomingView = document.getElementById('upcomingView');
        const reassignView = document.getElementById('reassignView');
        
        if (this.activeView === 'upcoming') {
            upcomingView.classList.add('active');
            reassignView.classList.remove('active');
        } else if (this.activeView === 'reassign') {
            upcomingView.classList.remove('active');
            reassignView.classList.add('active');
        }
    }

    initializeReassignView() {
        // Initialize reassign view functionality
        const selectAllBtn = document.getElementById('selectAllBtn');
        const bulkReassignBtn = document.getElementById('bulkReassignBtn');
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.toggleSelectAll());
        }
        
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', () => this.toggleSelectAll());
        }
        
        if (bulkReassignBtn) {
            bulkReassignBtn.addEventListener('click', () => this.handleBulkReassign());
        }

        // Individual shift checkboxes
        document.querySelectorAll('.shift-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateReassignSelection());
        });

        // Individual action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditShift(e));
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRemoveShift(e));
        });
    }

    toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.shift-checkbox');
        const selectAllBtn = document.getElementById('selectAllBtn');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
        
        selectAllBtn.textContent = allChecked ? 'Select All' : 'Deselect All';
        this.updateReassignSelection();
    }

    updateReassignSelection() {
        const checkboxes = document.querySelectorAll('.shift-checkbox');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const bulkReassignBtn = document.getElementById('bulkReassignBtn');
        const selectedCountSpan = document.getElementById('selectedCount');
        
        selectedCountSpan.textContent = checkedCount;
        bulkReassignBtn.disabled = checkedCount === 0;
        
        // Enable/disable replacement selects and reassign buttons
        checkboxes.forEach(checkbox => {
            const reassignItem = checkbox.closest('.reassign-item');
            const replacementSelect = reassignItem.querySelector('.replacement-select');
            const reassignBtn = reassignItem.querySelector('.btn-reassign');
            
            replacementSelect.disabled = !checkbox.checked;
            if (!checkbox.checked) {
                replacementSelect.value = '';
                reassignBtn.disabled = true;
            }
        });
    }

    handleReplacementSelect(e) {
        const reassignItem = e.target.closest('.reassign-item');
        const reassignBtn = reassignItem.querySelector('.btn-reassign');
        reassignBtn.disabled = !e.target.value;
    }

    handleIndividualReassign(e) {
        const reassignItem = e.target.closest('.reassign-item');
        const shiftId = reassignItem.dataset.shiftId;
        const replacementSelect = reassignItem.querySelector('.replacement-select');
        const currentEmployee = reassignItem.querySelector('.current-employee span').textContent;
        const newEmployee = replacementSelect.options[replacementSelect.selectedIndex].textContent;
        
        if (confirm(`Reassign this shift from ${currentEmployee.replace('Currently assigned to ', '')} to ${newEmployee}?`)) {
            this.performReassignment(shiftId, replacementSelect.value);
            this.showNotification(`Shift reassigned to ${newEmployee}`, 'success');
        }
    }

    handleBulkReassign() {
        const checkedBoxes = document.querySelectorAll('.shift-checkbox:checked');
        const reassignments = [];
        
        checkedBoxes.forEach(checkbox => {
            const reassignItem = checkbox.closest('.reassign-item');
            const replacementSelect = reassignItem.querySelector('.replacement-select');
            if (replacementSelect.value) {
                reassignments.push({
                    shiftId: reassignItem.dataset.shiftId,
                    newEmployeeId: replacementSelect.value,
                    newEmployeeName: replacementSelect.options[replacementSelect.selectedIndex].textContent
                });
            }
        });
        
        if (reassignments.length === 0) {
            this.showNotification('Please select replacements for all selected shifts', 'warning');
            return;
        }
        
        if (confirm(`Bulk reassign ${reassignments.length} shift(s)?`)) {
            reassignments.forEach(reassignment => {
                this.performReassignment(reassignment.shiftId, reassignment.newEmployeeId);
            });
            this.showNotification(`${reassignments.length} shift(s) reassigned successfully`, 'success');
        }
    }

    performReassignment(shiftId, newEmployeeId) {
        // In a real application, this would make an API call
        console.log(`Reassigning shift ${shiftId} to employee ${newEmployeeId}`);
        
        // Update UI to reflect the change
        // This is a simplified example - in reality you'd update the main schedule view too
    }

    showEmployeeProfile(e) {
        const avatar = e.target;
        const employeeId = avatar.dataset.employee;
        const employeeInfo = avatar.closest('.employee-info');
        const employeeName = employeeInfo.querySelector('.employee-name').textContent;
        const employeeRole = employeeInfo.querySelector('.employee-role').textContent;
        
        // Get employee data (in real app, this would come from an API)
        const employeeData = this.getEmployeeData(employeeId);
        
        // Populate modal
        document.getElementById('profileName').textContent = employeeName;
        document.getElementById('profileRole').textContent = employeeRole;
        document.getElementById('profileDepartment').textContent = employeeData.department;
        document.getElementById('profileAvatar').textContent = avatar.textContent;
        document.getElementById('profileAvatar').className = `profile-avatar ${avatar.classList[1]}`;
        document.getElementById('weekHours').textContent = employeeData.weekHours;
        document.getElementById('monthHours').textContent = employeeData.monthHours;
        document.getElementById('attendanceRate').textContent = employeeData.attendanceRate;
        
        // Show modal
        document.getElementById('employeeProfileModal').classList.add('show');
    }

    closeEmployeeProfile() {
        document.getElementById('employeeProfileModal').classList.remove('show');
    }

    getEmployeeData(employeeId) {
        // Mock employee data - in real app, this would come from an API
        const mockData = {
            'sarah-johnson': {
                department: 'Sales & Customer Service',
                weekHours: '32 hours',
                monthHours: '128 hours',
                attendanceRate: '95%'
            },
            'michael-chen': {
                department: 'Inventory & Supply Chain',
                weekHours: '40 hours',
                monthHours: '160 hours',
                attendanceRate: '98%'
            },
            'alex-rivera': {
                department: 'IT & E-commerce',
                weekHours: '35 hours',
                monthHours: '140 hours',
                attendanceRate: '92%'
            },
            // Add more as needed
        };
        
        return mockData[employeeId] || {
            department: 'Unknown',
            weekHours: '0 hours',
            monthHours: '0 hours',
            attendanceRate: '0%'
        };
    }

    updateScheduleData() {
        // Placeholder for updating schedule data based on current week
        console.log(`Loading schedule data for week of ${this.currentWeek.toDateString()}`);
        // In a real application, this would fetch data from an API and update the schedule grid
    }

    createNewShift() {
        if (window.shiftModal) {
            window.shiftModal.openModal();
        }
    }

    handleShiftMenu(e) {
        e.stopPropagation();
        
        // Create context menu
        const menu = this.createContextMenu([
            { label: 'Edit Shift', action: 'edit' },
            { label: 'Reassign', action: 'reassign' },
            { label: 'Cancel Shift', action: 'cancel' },
            { label: 'View Details', action: 'details' }
        ]);
        
        this.showContextMenu(menu, e.target);
    }

    createContextMenu(items) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 120px;
        `;
        
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.label;
            menuItem.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                border-bottom: 1px solid #eee;
            `;
            
            menuItem.addEventListener('click', () => {
                this.handleContextMenuAction(item.action);
                menu.remove();
            });
            
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = '#f8f9fa';
            });
            
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'white';
            });
            
            menu.appendChild(menuItem);
        });
        
        // Remove border from last item
        if (menu.lastChild) {
            menu.lastChild.style.borderBottom = 'none';
        }
        
        return menu;
    }

    showContextMenu(menu, trigger) {
        document.body.appendChild(menu);
        
        const rect = trigger.getBoundingClientRect();
        menu.style.left = rect.left + 'px';
        menu.style.top = (rect.bottom + 5) + 'px';
        
        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }

    handleContextMenuAction(action) {
        switch(action) {
            case 'edit':
                this.showNotification('Edit shift feature coming soon!', 'info');
                break;
            case 'reassign':
                // Switch to reassign view
                document.querySelector('[data-view="reassign"]').click();
                this.showNotification('Switched to reassign view', 'info');
                break;
            case 'cancel':
                if (confirm('Are you sure you want to cancel this shift?')) {
                    this.showNotification('Shift cancelled', 'success');
                }
                break;
            case 'details':
                this.showNotification('Shift details feature coming soon!', 'info');
                break;
        }
    }

    // Utility method to add notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        const colors = {
            info: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        if (type === 'warning') {
            notification.style.color = '#000';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Shift Modal Management
class ShiftModal {
    constructor() {
        this.modal = null;
        this.form = null;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.modal = document.getElementById('assignShiftModal');
        this.form = document.getElementById('assignShiftForm');
        
        if (this.modal && this.form) {
            this.bindEvents();
            this.setDefaultDate();
        }
    }

    bindEvents() {
        // Close modal events
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Department-Employee synchronization
        const departmentSelect = document.getElementById('departmentSelect');
        const employeeSelect = document.getElementById('employeeSelect');
        
        if (departmentSelect && employeeSelect) {
            departmentSelect.addEventListener('change', () => {
                this.filterEmployeesByDepartment();
            });
        }
    }

    setDefaultDate() {
        const dateInput = document.getElementById('shiftDate');
        if (dateInput) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
            dateInput.min = today.toISOString().split('T')[0];
        }
    }

    openModal() {
        if (this.modal) {
            this.modal.classList.add('show');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
            
            // Focus on first input
            setTimeout(() => {
                const firstInput = this.modal.querySelector('.form-select');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
            this.isOpen = false;
            document.body.style.overflow = '';
            this.resetForm();
        }
    }

    resetForm() {
        this.form.reset();
        this.setDefaultDate();
        this.removeMessage();
        
        // Reset field border colors
        const fields = ['employeeSelect', 'departmentSelect', 'shiftTypeSelect', 'shiftDate'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.style.borderColor = '';
            }
        });
    }

    filterEmployeesByDepartment() {
        const departmentSelect = document.getElementById('departmentSelect');
        const employeeSelect = document.getElementById('employeeSelect');
        const selectedDept = departmentSelect.value;

        // Employee-Department mapping based on the HTML
        const employeeDepartments = {
            'sarah-johnson': 'sales',
            'jessica-lee': 'sales',
            'michael-chen': 'inventory',
            'emily-wilson': 'inventory',
            'david-thompson': 'inventory',
            'robert-kim': 'inventory',
            'james-wilson': 'inventory',
            'alex-rivera': 'it',
            'sophia-martinez': 'it'
        };

        // Show/hide employees based on department
        Array.from(employeeSelect.options).forEach(option => {
            if (option.value === '') return; // Keep default option
            
            const employeeId = option.value;
            const employeeDept = employeeDepartments[employeeId];
            
            if (selectedDept === '' || selectedDept === employeeDept) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });

        // Reset employee selection if current selection doesn't match department
        const currentEmployee = employeeSelect.value;
        if (currentEmployee && selectedDept && employeeDepartments[currentEmployee] !== selectedDept) {
            employeeSelect.value = '';
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();
        this.submitShift(formData);
    }

    validateForm() {
        const requiredFields = ['employeeSelect', 'departmentSelect', 'shiftTypeSelect', 'shiftDate'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                if (field) {
                    field.style.borderColor = '#ef4444';
                }
                isValid = false;
            } else {
                field.style.borderColor = '#10b981';
            }
        });

        // Validate date is not in the past
        const dateField = document.getElementById('shiftDate');
        if (dateField) {
            const selectedDate = new Date(dateField.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                dateField.style.borderColor = '#ef4444';
                this.showMessage('Please select a future date', 'error');
                isValid = false;
            }
        }

        if (!isValid) {
            this.showMessage('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    getFormData() {
        return {
            employee: document.getElementById('employeeSelect').value,
            department: document.getElementById('departmentSelect').value,
            shiftType: document.getElementById('shiftTypeSelect').value,
            date: document.getElementById('shiftDate').value
        };
    }

    async submitShift(formData) {
        const submitBtn = document.querySelector('.btn-assign');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Assigning...';

        try {
            // Simulate API call
            await this.simulateApiCall(formData);
            
            // Show success message
            this.showMessage('Shift assigned successfully!', 'success');
            
            // Close modal after delay
            setTimeout(() => {
                this.closeModal();
                this.notifyShiftAssigned(formData);
            }, 1500);
            
        } catch (error) {
            this.showMessage('Error assigning shift. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    simulateApiCall(formData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 10% failure rate
                if (Math.random() < 0.1) {
                    reject(new Error('API Error'));
                } else {
                    resolve(formData);
                }
            }, 1000);
        });
    }

    showMessage(text, type) {
        this.removeMessage();
        
        const message = document.createElement('div');
        message.className = `form-message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
        `;
        
        if (type === 'success') {
            message.style.backgroundColor = '#d4edda';
            message.style.color = '#155724';
            message.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            message.style.backgroundColor = '#f8d7da';
            message.style.color = '#721c24';
            message.style.border = '1px solid #f5c6cb';
        }
        
        const form = document.getElementById('assignShiftForm');
        form.insertBefore(message, form.firstChild);
    }

    removeMessage() {
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    notifyShiftAssigned(formData) {
        // Notify the main shift management system
        if (window.shiftManagement && window.shiftManagement.showNotification) {
            window.shiftManagement.showNotification('Shift assigned successfully!', 'success');
        }
        
        // Dispatch custom event for other components to listen
        document.dispatchEvent(new CustomEvent('shiftAssigned', {
            detail: formData
        }));
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .modal.show {
        display: flex !important;
    }
    
    .view-container {
        display: none;
    }
    
    .view-container.active {
        display: block;
    }
    
    .shift-card.reassignable {
        cursor: pointer;
        border: 2px dashed #007bff;
    }
    
    .shift-card.reassignable:hover {
        background-color: #f8f9ff;
    }
    
    .clickable-avatar {
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .clickable-avatar:hover {
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shiftManagement = new ShiftManagement();
    window.shiftModal = new ShiftModal();
});

// Export for external use
window.ShiftManagement = ShiftManagement;
window.ShiftModal = ShiftModal;