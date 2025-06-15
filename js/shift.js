class ShiftModal 
{
    constructor() 
    {
        this.modal = document.getElementById('assignShiftModal');
        this.form = document.getElementById('assignShiftForm');
        this.isOpen = false;
        
        this.init();
    }

    init() 
    {
        this.bindEvents();
        this.setDefaultDate();
    }

    bindEvents() 
    {
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (closeBtn) 
        {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (cancelBtn) 
        {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        this.modal.addEventListener('click', (e) => 
        {
            if (e.target === this.modal) 
            {
                this.closeModal();
            }
        });

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setDefaultDate() 
    {
        const dateInput = document.getElementById('shiftDate');
        if (dateInput) 
        {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
            dateInput.min = today.toISOString().split('T')[0];
        }
    }

    openModal() 
    {
        if (this.modal) 
        {
            this.modal.classList.add('show');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() 
    {
        if (this.modal) 
        {
            this.modal.classList.remove('show');
            this.isOpen = false;
            document.body.style.overflow = '';
            this.resetForm();
        }
    }

    resetForm() 
    {
        this.form.reset();
        this.setDefaultDate();
    }

    validateForm() 
    {
        const requiredFields = ['employeeSelect', 'shiftTypeSelect', 'shiftDate'];
        let isValid = true;

        requiredFields.forEach(fieldId => 
        {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) 
            {
                if (field) 
                {
                    field.style.borderColor = '#ef4444';
                }
                isValid = false;
            } 
            else 
            {
                field.style.borderColor = '#10b981';
            }
        });

        if (!isValid) 
        {
            this.showMessage('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    getFormData() 
    {
        return {
            action: 'assign',
            employee: document.getElementById('employeeSelect').value,
            shiftType: document.getElementById('shiftTypeSelect').value,
            date: document.getElementById('shiftDate').value
        };
    }

    async submitShift(formData) 
    {
        const submitBtn = document.querySelector('.btn-assign');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Assigning...';

        try 
        {
            const response = await fetch('assign_shift.php', 
            {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json',
                },
                 body: JSON.stringify(
                    {
                        action: 'assign',
                        employee_id: employeeSelect.value,  
                        shift_type: formData.shiftType,
                        date: formData.date
                    })
            });

            const result = await response.json();

            if (result.success) 
            {
                this.showMessage('Shift assigned successfully!', 'success');
                
                setTimeout(() => 
                {
                    this.closeModal();
                    location.reload();
                }, 1500);
            } 
            else 
            {
                throw new Error(result.message);
            }
        } 
        catch (error) 
        {
            this.showMessage(error.message || 'Error assigning shift. Please try again.', 'error');
        } 
        finally 
        {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    handleSubmit(e) 
    {
        e.preventDefault();
        
        if (!this.validateForm()) 
        {
            return;
        }

        const formData = this.getFormData();
        this.submitShift(formData);
    }

    showMessage(text, type) 
    {
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
        
        if (type === 'success') 
        {
            message.style.backgroundColor = '#d4edda';
            message.style.color = '#155724';
            message.style.border = '1px solid #c3e6cb';
        } 
        else if (type === 'error') 
        {
            message.style.backgroundColor = '#f8d7da';
            message.style.color = '#721c24';
            message.style.border = '1px solid #f5c6cb';
        }
        
        const form = document.getElementById('assignShiftForm');
        form.insertBefore(message, form.firstChild);
    }

    removeMessage() 
    {
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) 
        {
            existingMessage.remove();
        }
    }
}

class EditShiftModal 
{
    constructor() 
    {
        this.modal = document.getElementById('editShiftModal');
        this.form = document.getElementById('editShiftForm');
        this.isOpen = false;
        
        this.init();
    }

    init() 
    {
        this.bindEvents();
    }

    bindEvents() 
    {
        const closeBtn = document.getElementById('closeEditModal');
        const cancelBtn = document.getElementById('cancelEditBtn');
        
        if (closeBtn) 
        {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (cancelBtn) 
        {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        this.modal.addEventListener('click', (e) => 
        {
            if (e.target === this.modal) 
            {
                this.closeModal();
            }
        });

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    openModal(shiftData) 
    {
        if (this.modal) 
        {
            document.getElementById('editAssignmentId').value = shiftData.assignment_id;
            document.getElementById('editEmployeeSelect').value = shiftData.employee_id;
            document.getElementById('editShiftTypeSelect').value = this.getShiftTypeFromId(shiftData.shift_id);
            document.getElementById('editShiftDate').value = shiftData.assignment_date;
            
            //const today = new Date().toISOString().split('T')[0];
            //document.getElementById('editShiftDate').min = today;
            this.modal.classList.add('show');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    getShiftTypeFromId(shiftId) 
    {
        const shiftTypeMap = 
        {
            1: 'morning',
            2: 'evening',
            3: 'night',
            4: 'standard'
        };
        return shiftTypeMap[shiftId] || '';
    }

    closeModal() 
    {
        if (this.modal) 
        {
            this.modal.classList.remove('show');
            this.isOpen = false;
            document.body.style.overflow = '';
            this.form.reset();
        }
    }

    validateForm() 
    {
        const requiredFields = ['editEmployeeSelect', 'editShiftTypeSelect', 'editShiftDate'];
        let isValid = true;

        requiredFields.forEach(fieldId => 
        {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) 
            {
                if (field) 
                {
                    field.style.borderColor = '#ef4444';
                }
                isValid = false;
            } 
            else 
            {
                field.style.borderColor = '#10b981';
            }
        });

        if (!isValid) 
        {
            this.showMessage('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    async handleSubmit(e) 
    {
        e.preventDefault();
        
        if (!this.validateForm()) 
        {
            return;
        }

        const formData = 
        {
            action: 'edit',
            assignment_id: document.getElementById('editAssignmentId').value,
            employee_id: document.getElementById('editEmployeeSelect').value,
            shift_type: document.getElementById('editShiftTypeSelect').value,
            date: document.getElementById('editShiftDate').value
        };

        const submitBtn = this.form.querySelector('.btn-assign');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        try
        {
            const response = await fetch('assign_shift.php', 
            {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) 
            {
                this.showMessage('Shift updated successfully!', 'success');
                this.closeModal();
                location.reload();
            } 
            else 
            {
                throw new Error(result.message);
            }
        } 
        catch (error) 
        {
            this.showMessage(error.message || 'Error updating shift', 'error');
        } 
        finally 
        {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showMessage(text, type) 
    {
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
        
        if (type === 'success') 
        {
            message.style.backgroundColor = '#d4edda';
            message.style.color = '#155724';
            message.style.border = '1px solid #c3e6cb';
        }
        else if (type === 'error') 
        {
            message.style.backgroundColor = '#f8d7da';
            message.style.color = '#721c24';
            message.style.border = '1px solid #f5c6cb';
        }
        
        const form = document.getElementById('editShiftForm');
        form.insertBefore(message, form.firstChild);
    }

    removeMessage() 
    {
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) 
        {
            existingMessage.remove();
        }
    }
}

class ShiftManagement 
{
    constructor() 
    {
        const dateRangeElement = document.querySelector('.date-range');
        this.currentWeekStart = dateRangeElement.dataset.start;
        this.currentWeekEnd = dateRangeElement.dataset.end;
        this.selectedDepartment = 'all';
        this.activeView = 'upcoming';
        this.bindMoreButtons();
        
        this.init();
    }

    init() 
    {
        this.bindEvents();
        this.initializeReassignView();
        this.bindEditRemoveButtons();
        
        window.editShiftModal = new EditShiftModal();
    }

    bindMoreButtons() 
    {
        document.addEventListener('click', (e) => 
        {
            if (e.target.classList.contains('more-btn')) 
            {
                this.handleMoreButtonClick(e.target);
            }
        });
    }
    async handleMoreButtonClick(button) 
    {
        const assignmentId = button.dataset.assignmentId;
        
        try 
        {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            button.disabled = true;

            const response = await fetch(`get_shift.php?assignment_id=${assignmentId}`);
            const shiftData = await response.json();

            if (shiftData.success) 
            {
                window.editShiftModal.openModal(shiftData.data);
            } 
            else 
            {
                throw new Error(shiftData.message || 'Failed to fetch shift data');
            }
        } 
        catch (error) 
        {
            this.showNotification(error.message || 'Error loading shift details', 'error');
        } 
        finally 
        {
            button.innerHTML = '⋯';
            button.disabled = false;
        }
    }
    bindEvents() 
    {
        document.querySelectorAll('.tab-btn').forEach(btn => 
        {
            btn.addEventListener('click', (e) => this.handleDepartmentChange(e));
        });

        document.querySelectorAll('.sub-nav-btn').forEach(btn => 
        {
            btn.addEventListener('click', (e) => this.handleViewChange(e));
        });

        document.getElementById('prevWeek').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('nextWeek').addEventListener('click', () => this.navigateWeek(1));

        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());
        document.getElementById('thisWeekBtn').addEventListener('click', () => this.goToThisWeek());

        document.getElementById('createShiftBtn').addEventListener('click', () => this.createNewShift());

        document.querySelectorAll('.clickable-avatar').forEach(avatar =>
        {
            avatar.addEventListener('click', (e) => this.showEmployeeProfile(e));
        });

        const closeProfileModal = document.getElementById('closeProfileModal');
        if (closeProfileModal) 
        {
            closeProfileModal.addEventListener('click', () => this.closeEmployeeProfile());
        }

        const profileModal = document.getElementById('employeeProfileModal');
        if (profileModal) 
        {
            profileModal.addEventListener('click', (e) => 
            {
                if (e.target === profileModal) 
                {
                    this.closeEmployeeProfile();
                }
            });
        }
    }

    handleDepartmentChange(e) 
    {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedDepartment = e.target.dataset.dept;
        this.filterShiftsByDepartment();
    }

    handleViewChange(e) 
    {
        document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.activeView = e.target.dataset.view;
        this.updateMainContent();
    }

    navigateWeek(direction) 
    {
        const startDate = new Date(this.currentWeekStart);
        const endDate = new Date(this.currentWeekEnd);
        
        startDate.setDate(startDate.getDate() + (direction * 7));
        endDate.setDate(endDate.getDate() + (direction * 7));
        
        const formatDate = (date) => 
        {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        window.location.href = `?start=${formatDate(startDate)}&end=${formatDate(endDate)}`;
    }

    goToToday() 
    {
        const today = new Date();
        const formatDate = (date) => 
        {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`; 
        };
        window.location.href = `?date=${formatDate(today)}`;
    }

    goToThisWeek() 
    {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const formatDate = (date) => 
        {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        window.location.href = `?start=${formatDate(monday)}&end=${formatDate(sunday)}`;
    }

    filterShiftsByDepartment() 
    {
        const shiftCards = document.querySelectorAll('.shift-card');
        shiftCards.forEach(card => 
        {
            const department = card.querySelector('h4').textContent.toLowerCase().replace(/\s+/g, '-');
            const shouldShow = this.selectedDepartment === 'all' || 
                              this.selectedDepartment === department;
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    updateMainContent() 
    {
        const upcomingView = document.getElementById('upcomingView');
        const reassignView = document.getElementById('reassignView');
        
        if (this.activeView === 'upcoming') 
        {
            upcomingView.classList.add('active');
            reassignView.classList.remove('active');
        } 
        else if (this.activeView === 'reassign') 
        {
            upcomingView.classList.remove('active');
            reassignView.classList.add('active');
        }
    }

    initializeReassignView() 
    {
        const selectAllBtn = document.getElementById('selectAllBtn');
        const bulkReassignBtn = document.getElementById('bulkReassignBtn');
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        
        if (selectAllBtn) 
        {
            selectAllBtn.addEventListener('click', () => this.toggleSelectAll());
        }
        
        if (selectAllCheckbox)
        {
            selectAllCheckbox.addEventListener('change', () => this.toggleSelectAll());
        }
        
        if (bulkReassignBtn) 
        {
            bulkReassignBtn.addEventListener('click', () => this.handleBulkReassign());
        }

        document.querySelectorAll('.shift-checkbox').forEach(checkbox => 
        {
            checkbox.addEventListener('change', () => this.updateReassignSelection());
        });
    }

    bindEditRemoveButtons() 
    {
        document.querySelector('.reassign-table-container').addEventListener('click', (e) => 
            {
            const row = e.target.closest('.reassign-row');
            if (!row) return;

            const assignmentId = row.dataset.shiftId;
            
            if (e.target.classList.contains('edit-btn')) 
            {
                this.handleEditShift(row, assignmentId);
            } 
            else if (e.target.classList.contains('remove-btn')) 
            {
                this.handleRemoveShift(assignmentId);
            }
        });
    }

    async handleEditShift(row, assignmentId) 
    {
        try 
        {
            const editBtn = row.querySelector('.edit-btn');
            const originalText = editBtn.textContent;
            editBtn.disabled = true;
            editBtn.textContent = 'Loading...';

            const response = await fetch(`get_shift.php?assignment_id=${assignmentId}`);
            const shiftData = await response.json();

            if (shiftData.success) 
            {
                window.editShiftModal.openModal(shiftData.data);
            } 
            else 
            {
                throw new Error(shiftData.message || 'Failed to fetch shift data');
            }
        } 
        catch (error) 
        {
            this.showNotification(error.message || 'Error loading shift details', 'error');
        } 
        finally 
        {
            const editBtn = row.querySelector('.edit-btn');
            if (editBtn) 
            {
                editBtn.disabled = false;
                editBtn.textContent = 'Edit';
            }
        }
    }

    async handleRemoveShift(assignmentId) 
    {
        if (confirm('Are you sure you want to remove this shift assignment?')) 
        {
            try 
            {
                const removeBtn = document.querySelector(`.reassign-row[data-shift-id="${assignmentId}"] .remove-btn`);
                const originalText = removeBtn.textContent;
                removeBtn.disabled = true;
                removeBtn.textContent = 'Removing...';

                const response = await fetch('assign_shift.php', 
                {
                    method: 'POST',
                    headers: 
                    {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                    {
                        action: 'remove',
                        assignment_id: assignmentId
                    })
                });

                const result = await response.json();

                if (result.success) 
                {
                    this.showNotification('Shift removed successfully', 'success');
                    document.querySelector(`.reassign-row[data-shift-id="${assignmentId}"]`).remove();
                    this.updateReassignSelection();
                } 
                else 
                {
                    throw new Error(result.message);
                }
            } 
            catch (error) 
            {
                this.showNotification(error.message || 'Error removing shift', 'error');
            }
        }
    }

    toggleSelectAll() 
    {
        const checkboxes = document.querySelectorAll('.shift-checkbox');
        const selectAllBtn = document.getElementById('selectAllBtn');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => 
        {
            checkbox.checked = !allChecked;
        });
        
        selectAllBtn.textContent = allChecked ? 'Select All' : 'Deselect All';
        this.updateReassignSelection();
    }

    updateReassignSelection() 
    {
        const checkboxes = document.querySelectorAll('.shift-checkbox');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const bulkReassignBtn = document.getElementById('bulkReassignBtn');
        const selectedCountSpan = document.getElementById('selectedCount');
        
        selectedCountSpan.textContent = checkedCount;
        bulkReassignBtn.disabled = checkedCount === 0;
    }

    async handleBulkReassign() 
    {
        try 
        {
            const checkedBoxes = document.querySelectorAll('.shift-checkbox:checked');
            const assignmentIds = Array.from(checkedBoxes).map(cb => cb.id.replace('shift-', ''));
        
            if (assignmentIds.length === 0) 
            {
                this.showNotification('Please select at least one shift to unassign', 'warning');
                return;
            }

            if (!confirm(`Are you sure you want to unassign ${assignmentIds.length} selected shift(s)?`)) 
            {
                return;
            }

            const bulkBtn = document.getElementById('bulkReassignBtn');
            if (!bulkBtn) 
            {
                console.error('Bulk reassign button not found');
                return;
            }

            const originalText = bulkBtn.innerHTML;
            const originalDisabled = bulkBtn.disabled;

            bulkBtn.disabled = true;
            bulkBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;

            const response = await fetch('assign_shift.php', 
            {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                {
                    action: 'bulk_remove',
                    assignment_ids: assignmentIds
                })
            });

            if (!response.ok) 
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) 
            {
                throw new Error(result.message || 'Failed to unassign shifts');
            }

            this.showNotification(`${assignmentIds.length} shift(s) unassigned successfully`, 'success');
        
            assignmentIds.forEach(id => 
            {
                const row = document.querySelector(`.reassign-row[data-shift-id="${id}"]`);
                if (row) row.remove();
            });

            const selectedCountSpan = document.getElementById('selectedCount');
            if (selectedCountSpan) 
            {
                selectedCountSpan.textContent = '0';
            }

            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            if (selectAllCheckbox) 
            {
                selectAllCheckbox.checked = false;
            }

        } 
        
        catch (error) 
        {
            console.error('Bulk unassign error:', error);
            this.showNotification(error.message || 'Error unassigning shifts', 'error');
        } 
        finally 
        {
            const bulkBtn = document.getElementById('bulkReassignBtn');
            if (bulkBtn) 
            {
                bulkBtn.disabled = false;
                bulkBtn.innerHTML = `Bulk Unassign (<span id="selectedCount">0</span>)`;
            }
        }
    }

    createNewShift() 
    {
        if (window.shiftModal) 
        {
            window.shiftModal.openModal();
        }
    }

    showEmployeeProfile(e) 
    {
        const avatar = e.target;
        const employeeId = avatar.dataset.employee;
        const employeeInfo = avatar.closest('.employee-info');
        const employeeName = employeeInfo.querySelector('.employee-name').textContent;
        const employeeRole = employeeInfo.querySelector('.employee-role').textContent;
        const departmentName = employeeInfo.closest('.shift-card').querySelector('h4').textContent;
        
        document.getElementById('profileName').textContent = employeeName;
        document.getElementById('profileRole').textContent = employeeRole;
        document.getElementById('profileDepartment').textContent = departmentName;
        document.getElementById('profileAvatar').textContent = avatar.textContent;
        document.getElementById('profileAvatar').className = `profile-avatar ${avatar.className.split(' ')[1]}`;
        
        document.getElementById('employeeProfileModal').classList.add('show');
    }

    closeEmployeeProfile() 
    {
        document.getElementById('employeeProfileModal').classList.remove('show');
    }

    showNotification(message, type = 'info') 
    {
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
        
        const colors = 
        {
            info: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        if (type === 'warning') 
        {
            notification.style.color = '#000';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => 
        {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

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
    
    .clickable-avatar {
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .clickable-avatar:hover {
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => 
{
    window.shiftManagement = new ShiftManagement();
    window.shiftModal = new ShiftModal();
});