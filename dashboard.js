document.addEventListener('DOMContentLoaded', function() {
  // Authentication check
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (!loggedInUser) {
    window.location.href = 'index.html';
    return;
  }

  // Modal instance (create once and reuse)
  const modalEl = document.getElementById('addAttendanceModal');
  const attendanceModal = new bootstrap.Modal(modalEl);

  // Attendance record management
  function loadAttendanceRecords() {
    const stored = localStorage.getItem(loggedInUser + '_attendanceRecords');
    return stored ? JSON.parse(stored) : [];
  }

  function saveAttendanceRecords(records) {
    localStorage.setItem(loggedInUser + '_attendanceRecords', JSON.stringify(records));
  }

  // Convert attendance records to FullCalendar events
  function recordsToEvents(records) {
    return records.map((record, idx) => ({
      id: String(idx),
      title: record.subject + ' (' + record.status + ')',
      start: record.date,
      allDay: true,
      extendedProps: { ...record }
    }));
  }

  // Modal helpers
  function openAddModal(date = '') {
    editingIndex = -1;
    document.getElementById('modalTitle').textContent = 'Add Attendance Record';
    document.getElementById('saveButton').textContent = 'Save Record';
    document.getElementById('subject').value = '';
    document.getElementById('date').value = date;
    document.getElementById('status').value = 'present';
    attendanceModal.show();
  }

  function openEditModal(record, idx) {
    editingIndex = idx;
    document.getElementById('modalTitle').textContent = 'Edit Attendance Record';
    document.getElementById('saveButton').textContent = 'Update Record';
    document.getElementById('subject').value = record.subject;
    document.getElementById('date').value = record.date;
    document.getElementById('status').value = record.status;
    attendanceModal.show();
  }

  // Stats update
  function updateStats(records) {
    const subjects = {};
    records.forEach(record => {
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
      const percentage = subjects[subject].total > 0 ?
        (subjects[subject].present / subjects[subject].total) * 100 : 0;
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
            <p class="text-muted mb-0">Click \"Add Record\" or click on a date to get started!</p>
          </div>
        </div>
      `;
    }
  }

  // State
  let attendanceRecords = loadAttendanceRecords();
  let editingIndex = -1;
  let calendar;

  // FullCalendar initialization
  var calendarEl = document.getElementById('calendar');
  if (calendarEl) {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      themeSystem: 'bootstrap5',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      events: recordsToEvents(attendanceRecords),
      dateClick: function(info) {
        openAddModal(info.dateStr);
      },
      eventClick: function(info) {
        const idx = attendanceRecords.findIndex(r =>
          r.subject + ' (' + r.status + ')' === info.event.title &&
          r.date === info.event.startStr
        );
        if (idx > -1) {
          openEditModal(attendanceRecords[idx], idx);
        }
      },
      eventDidMount: function(info) {
        // Add custom coloring for present/absent
        if (info.event.extendedProps.status === 'absent') {
          info.el.style.background = 'linear-gradient(45deg, #dc3545, #fd7e14)';
        } else {
          info.el.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        }
        info.el.style.color = 'white';
      }
    });
    calendar.render();
  }

  // Add/Edit Attendance
  document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const subject = document.getElementById('subject').value.trim();
    const date = document.getElementById('date').value;
    const status = document.getElementById('status').value;
    if (!subject || !date) {
      alert('Please fill in all fields');
      return;
    }
    const newRecord = { subject, date, status };
    if (editingIndex >= 0) {
      attendanceRecords[editingIndex] = newRecord;
    } else {
      const existingIndex = attendanceRecords.findIndex(r => r.subject === subject && r.date === date);
      if (existingIndex >= 0) {
        if (confirm(`A record for ${subject} on ${date} already exists. Do you want to update it?`)) {
          attendanceRecords[existingIndex] = newRecord;
        } else {
          return;
        }
      } else {
        attendanceRecords.push(newRecord);
      }
    }
    saveAttendanceRecords(attendanceRecords);
    updateStats(attendanceRecords);
    calendar.removeAllEvents();
    calendar.addEventSource(recordsToEvents(attendanceRecords));
    attendanceModal.hide();
  });

  // Delete all records
  document.getElementById('deleteAllButton').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete all records?')) {
      attendanceRecords = [];
      saveAttendanceRecords(attendanceRecords);
      updateStats(attendanceRecords);
      calendar.removeAllEvents();
    }
  });

  // Logout
  document.getElementById('logoutButton').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('loggedInUser');
      window.location.href = 'index.html';
    }
  });

  // Initial stats
  updateStats(attendanceRecords);

  // Add Record button
  document.querySelector('[data-bs-target="#addAttendanceModal"]').addEventListener('click', function() {
    openAddModal();
  });

  // --- SUBJECTS MANAGEMENT ---
  // Subject storage key
  const subjectsKey = loggedInUser + '_subjects';

  function loadSubjects() {
    const stored = localStorage.getItem(subjectsKey);
    return stored ? JSON.parse(stored) : [];
  }

  function saveSubjects(subjects) {
    localStorage.setItem(subjectsKey, JSON.stringify(subjects));
  }

  // State for subjects
  let subjects = loadSubjects();
  let editingSubjectIndex = -1;
  // Only create subjectModal instance after DOM is ready and only once
  const subjectModalEl = document.getElementById('subjectModal');
  let subjectModal = bootstrap.Modal.getInstance(subjectModalEl);
  if (!subjectModal) {
    subjectModal = new bootstrap.Modal(subjectModalEl);
  }

  // Render subjects list in tab
  function renderSubjectsList() {
    const list = document.getElementById('subjectsList');
    list.innerHTML = '';
    if (subjects.length === 0) {
      list.innerHTML = '<li class="list-group-item text-center text-muted">No subjects yet. Click "Add Subject" to get started.</li>';
    } else {
      subjects.forEach((subj, idx) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
          <span>${subj}</span>
          <div>
            <button class="btn btn-sm btn-outline-primary me-2 edit-subject-btn" data-idx="${idx}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger delete-subject-btn" data-idx="${idx}"><i class="fas fa-trash"></i></button>
          </div>
        `;
        list.appendChild(li);
      });
    }
    updateSubjectDropdown();
  }

  // Add/Edit Subject Modal logic
  document.getElementById('addSubjectBtn').addEventListener('click', function() {
    editingSubjectIndex = -1;
    document.getElementById('subjectModalTitle').textContent = 'Add Subject';
    document.getElementById('subjectName').value = '';
    // subjectModal.show(); // No longer needed, modal opens via data attributes
  });

  document.getElementById('subjectsList').addEventListener('click', function(e) {
    if (e.target.closest('.edit-subject-btn')) {
      const idx = parseInt(e.target.closest('.edit-subject-btn').getAttribute('data-idx'));
      editingSubjectIndex = idx;
      document.getElementById('subjectModalTitle').textContent = 'Edit Subject';
      document.getElementById('subjectName').value = subjects[idx];
      subjectModal.show();
    } else if (e.target.closest('.delete-subject-btn')) {
      const idx = parseInt(e.target.closest('.delete-subject-btn').getAttribute('data-idx'));
      if (confirm(`Delete subject "${subjects[idx]}"?`)) {
        subjects.splice(idx, 1);
        saveSubjects(subjects);
        renderSubjectsList();
      }
    }
  });

  document.getElementById('subjectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('subjectName').value.trim();
    if (!name) return;
    if (editingSubjectIndex >= 0) {
      subjects[editingSubjectIndex] = name;
    } else {
      if (subjects.includes(name)) {
        alert('Subject already exists.');
        return;
      }
      subjects.push(name);
    }
    saveSubjects(subjects);
    renderSubjectsList();
    subjectModal.hide();
  });

  // --- ATTENDANCE MODAL SUBJECT DROPDOWN ---
  function updateSubjectDropdown() {
    const subjectSelect = document.getElementById('subject');
    if (!subjectSelect) return;
    // If it's an input, replace with select
    if (subjectSelect.tagName.toLowerCase() === 'input') {
      const parent = subjectSelect.parentElement;
      const select = document.createElement('select');
      select.className = 'form-select';
      select.id = 'subject';
      select.required = true;
      parent.replaceChild(select, subjectSelect);
    }
    const select = document.getElementById('subject');
    select.innerHTML = '';
    if (subjects.length === 0) {
      select.innerHTML = '<option value="" disabled selected>No subjects available</option>';
    } else {
      select.innerHTML = subjects.map(subj => `<option value="${subj}">${subj}</option>`).join('');
    }
  }

  // Initial render
  renderSubjectsList();

  // When switching to attendance tab, update dropdown in case subjects changed
  document.getElementById('attendance-tab').addEventListener('click', updateSubjectDropdown);
  document.getElementById('subjects-tab').addEventListener('click', renderSubjectsList);
});