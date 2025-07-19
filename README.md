# Attendance Tracker

A modern, user-friendly web app for tracking class attendance, built with HTML, CSS, JavaScript, Bootstrap 5, and FullCalendar.

## Features
- **User Authentication**: Sign up and log in securely (localStorage-based demo).
- **Attendance Calendar**: Visualize and manage attendance records on a beautiful calendar (FullCalendar with Bootstrap 5 theme).
- **Subject Management**: Add, edit, and delete your subjects for the academic year.
- **Multiple Classes per Day**: Record multiple classes of the same subject on the same day.
- **Statistics**: View attendance percentages per subject.
- **Responsive Design**: Works great on desktop and mobile.

## Screenshots
<!-- Optionally add screenshots here -->

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/attendance-tracker.git
cd attendance-tracker
```

### 2. Open in Browser
Just open `index.html` in your browser. No build step or backend required!

## Usage
- **Sign Up / Log In**: Create a new account or log in with an existing one.
- **Manage Subjects**: Go to the "Subjects" tab to add, edit, or delete your subjects.
- **Add Attendance**: Click on a calendar day or the "Add Record" button, select a subject, date, and status, and save.
- **Multiple Classes**: Add as many records as needed for the same subject and date.
- **View Stats**: See your attendance stats per subject at a glance.

## Customization
- **Styling**: Edit `styles.css` for custom colors and layout.
- **Calendar Options**: See `dashboard.js` for FullCalendar configuration.
- **Persistence**: This demo uses `localStorage` for all data. For production, connect to a real backend.

## Technologies Used
- [Bootstrap 5](https://getbootstrap.com/)
- [FullCalendar](https://fullcalendar.io/) (with Bootstrap 5 theme)
- HTML5, CSS3, JavaScript (ES6)

## License
MIT License. See [LICENSE](LICENSE) for details. 