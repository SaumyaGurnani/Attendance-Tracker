document.addEventListener('DOMContentLoaded', function () {
    class AttendanceCalendar {
        constructor() {
            this.currentDate = new Date();
            this.attendanceRecords = [];
            this.editingIndex = -1;
            this.loggedInUser = null;
            
            this.init();
        }

        init() {
            this.checkAuth();
            this.loadData();
            this.bindEvents();
            this.renderCalendar();
            this.updateStats();
        }

        checkAuth() {
            this.loggedInUser = localStorage.getItem('loggedInUser');
            if (!this.loggedInUser) {
                window.location.href = 'index.html';
                return;
            }
        }

        loadData() {
            const stored = localStorage.getItem(this.loggedInUser + '_attendanceRecords');
            this.attendanceRecords = stored ? JSON.parse(stored) : [];
        }

        saveData() {
            localStorage.setItem(this.loggedInUser + '_attendanceRecords', JSON.stringify(this.attendanceRecords));
        }

        bindEvents() {
            document.getElementById('prevMonth').addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            });

            document.getElementById('nextMonth').addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            });

            document.getElementById('attendanceForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAttendance();
            });

            document.getElementById('logoutButton').addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('loggedInUser');
                    window.location.href = 'index.html';
                }
            });

            document.getElementById('deleteAllButton').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete all records?')) {
                    this.attendanceRecords = [];
                    this.saveData();
                    this.renderCalendar();
                    this.updateStats();
                }
            });
        }

        renderCalendar() {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            
            document.getElementById('currentMonth').textContent = 
                new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(this.currentDate);

            const firstDay = new Date(year, month, 1);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());

            const calendarGrid = document.getElementById('calendarGrid');
            calendarGrid.innerHTML = '';

            // Add day headers
            const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayHeaders.forEach(day => {
                const header = document.createElement('div');
                header.className = 'calendar-day-header';
                header.textContent = day;
                calendarGrid.appendChild(header);
            });

            // Add calendar days
            const currentDate = new Date(startDate);
            for (let week = 0; week < 6; week++) {
                for (let day = 0; day < 7; day++) {
                    const dayElement = this.createDayElement(currentDate, month);
                    calendarGrid.appendChild(dayElement);
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
        }

        createDayElement(date, currentMonth) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (date.getMonth() !== currentMonth) {
                dayElement.classList.add('other-month');
            }
            
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = date.getDate();
            dayElement.appendChild(dayNumber);

            const dateString = date.toISOString().split('T')[0];
            const dayRecords = this.attendanceRecords.filter(record => record.date === dateString);

            dayRecords.forEach((record) => {
                const attendanceItem = document.createElement('div');
                attendanceItem.className = `attendance-item ${record.status}`;
                
                const subjectSpan = document.createElement('span');
                subjectSpan.textContent = record.subject.length > 8 ? record.subject.substring(0, 8) + '...' : record.subject;
                subjectSpan.title = record.subject;
                attendanceItem.appendChild(subjectSpan);

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'attendance-actions';
                
                const editBtn = document.createElement('button');
                editBtn.className = 'action-btn';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.editRecord(record);
                };
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.deleteRecord(record);
                };
                
                actionsDiv.appendChild(editBtn);
                actionsDiv.appendChild(deleteBtn);
                attendanceItem.appendChild(actionsDiv);
                
                dayElement.appendChild(attendanceItem);
            });

            dayElement.addEventListener('click', () => {
                if (date.getMonth() === currentMonth || date.getMonth() === currentMonth - 1 || date.getMonth() === currentMonth + 1) {
                    this.openAddModal(dateString);
                }
            });

            return dayElement;
        }

        openAddModal(date = '') {
            this.editingIndex = -1;
            document.getElementById('modalTitle').textContent = 'Add Attendance Record';
            document.getElementById('saveButton').textContent = 'Save Record';
            
            document.getElementById('subject').value = '';
            document.getElementById('date').value = date || new Date().toISOString().split('T')[0];
            document.getElementById('status').value = 'present';
            
            new bootstrap.Modal(document.getElementById('addAttendanceModal')).show();
        }

        editRecord(record) {
            this.editingIndex = this.attendanceRecords.findIndex(r => 
                r.subject === record.subject && r.date === record.date && r.status === record.status
            );
            
            document.getElementById('modalTitle').textContent = 'Edit Attendance Record';
            document.getElementById('saveButton').textContent = 'Update Record';
            
            document.getElementById('subject').value = record.subject;
            document.getElementById('date').value = record.date;
            document.getElementById('status').value = record.status;
            
            new bootstrap.Modal(document.getElementById('addAttendanceModal')).show();
        }

        deleteRecord(record) {
            if (confirm(`Delete attendance record for ${record.subject} on ${record.date}?`)) {
                const index = this.attendanceRecords.findIndex(r => 
                    r.subject === record.subject && r.date === record.date && r.status === record.status
                );
                if (index > -1) {
                    this.attendanceRecords.splice(index, 1);
                    this.saveData();
                    this.renderCalendar();
                    this.updateStats();
                }
            }
        }

        saveAttendance() {
            const subject = document.getElementById('subject').value;
            const date = document.getElementById('date').value;
            const status = document.getElementById('status').value;

            const newRecord = { subject, date, status };

            if (this.editingIndex >= 0) {
                this.attendanceRecords[this.editingIndex] = newRecord;
            } else {
                this.attendanceRecords.push(newRecord);
            }

            this.saveData();
            this.renderCalendar();
            this.updateStats();
            
            bootstrap.Modal.getInstance(document.getElementById('addAttendanceModal')).hide();
        }

        updateStats() {
            const subjects = {};
            this.attendanceRecords.forEach(record => {
                if (!subjects[record.subject]) {
                    subjects[record.subject] = { present: 0, total: 0 };
                }
                subjects[record.subject].total++;
                if (record.status === 'present') {
                    subjects[record.subject].present++;
                }
            });

            const statsContainer = document.getElementById('statsContainer');
            statsContainer.innerHTML = '';

            Object.keys(subjects).forEach(subject => {
                const percentage = (subjects[subject].present / subjects[subject].total) * 100;
                
                const col = document.createElement('div');
                col.className = 'col-md-4 col-lg-3 mb-3';
                
                col.innerHTML = `
                    <div class="stats-card">
                        <h5 class="mb-2">${subject}</h5>
                        <div class="stats-number">${percentage.toFixed(1)}%</div>
                        <small class="text-muted">${subjects[subject].present}/${subjects[subject].total} classes</small>
                    </div>
                `;
                
                statsContainer.appendChild(col);
            });

            if (Object.keys(subjects).length === 0) {
                statsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="stats-card">
                            <i class="fas fa-calendar-plus fa-3x mb-3 text-muted"></i>
                            <h5>No attendance records yet</h5>
                            <p class="text-muted mb-0">Click "Add Record" or click on a date to get started!</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Initialize the calendar
    new AttendanceCalendar();
});