document.addEventListener('DOMContentLoaded', function () {
    const attendanceForm = document.getElementById('attendanceForm');
    const attendanceTable = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];
    const attendancePercentage = document.getElementById('attendancePercentage');
    const logoutButton = document.getElementById('logoutButton');
    const deleteAllButton = document.getElementById('deleteAllButton');

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'index.html';
    }

    let attendanceRecords = JSON.parse(localStorage.getItem(loggedInUser + '_attendanceRecords')) || [];

    // Sort attendance records by date
    function sortRecords() {
        attendanceRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Update table display with sorted records
    function updateAttendanceTable() {
        attendanceTable.innerHTML = '';
        sortRecords();
        attendanceRecords.forEach((record, index) => {
            const row = attendanceTable.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);

            cell1.innerText = record.subject;
            cell2.innerText = record.date;
            cell3.innerText = record.status;
            cell4.innerHTML = `
                <button onclick="editRecord(${index})">Edit</button>
                <button onclick="deleteRecord(${index})">Delete</button>
            `;
        });
    }

    // Calculate and display attendance percentage
    function calculateAttendancePercentage() {
        const subjects = {};
        attendanceRecords.forEach(record => {
            if (!subjects[record.subject]) {
                subjects[record.subject] = { present: 0, total: 0 };
            }
            subjects[record.subject].total++;
            if (record.status === 'present') {
                subjects[record.subject].present++;
            }
        });

        attendancePercentage.innerHTML = '';
        for (const subject in subjects) {
            const percentage = (subjects[subject].present / subjects[subject].total) * 100;
            const listItem = document.createElement('li');
            listItem.innerText = `${subject}: ${percentage.toFixed(2)}%`;
            attendancePercentage.appendChild(listItem);
        }
    }

    // Add new attendance record
    attendanceForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const subject = document.getElementById('subject').value;
        const date = document.getElementById('date').value;
        const status = document.getElementById('status').value;

        attendanceRecords.push({ subject, date, status });
        localStorage.setItem(loggedInUser + '_attendanceRecords', JSON.stringify(attendanceRecords));
        updateAttendanceTable();
        calculateAttendancePercentage();
    });

    // Delete all attendance records
    deleteAllButton.addEventListener('click', function () {
        if (confirm('Are you sure you want to delete all records?')) {
            attendanceRecords = [];
            localStorage.removeItem(loggedInUser + '_attendanceRecords');
            updateAttendanceTable();
            calculateAttendancePercentage();
        }
    });

    // Delete a specific attendance record
    window.deleteRecord = function (index) {
        if (confirm('Are you sure you want to delete this record?')) {
            attendanceRecords.splice(index, 1);
            localStorage.setItem(loggedInUser + '_attendanceRecords', JSON.stringify(attendanceRecords));
            updateAttendanceTable();
            calculateAttendancePercentage();
        }
    };

    // Edit a specific attendance record
    window.editRecord = function (index) {
        const record = attendanceRecords[index];
        const newSubject = prompt('Enter new subject name:', record.subject);
        const newDate = prompt('Enter new date (yyyy-mm-dd):', record.date);
        const newStatus = prompt('Enter new status (present/absent):', record.status);

        if (newSubject && newDate && newStatus) {
            attendanceRecords[index] = { subject: newSubject, date: newDate, status: newStatus };
            localStorage.setItem(loggedInUser + '_attendanceRecords', JSON.stringify(attendanceRecords));
            updateAttendanceTable();
            calculateAttendancePercentage();
        }
    };

    // Logout functionality
    logoutButton.addEventListener('click', function () {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });

    // Initialize table and percentage display on page load
    updateAttendanceTable();
    calculateAttendancePercentage();
});
