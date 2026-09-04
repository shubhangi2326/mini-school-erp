# AELYX School CRM

## 1. Project Overview
A full-stack School CRM application built for managing students, teachers, classes, and attendance. It provides Role-Based Access Control (Admin and Teacher roles) with specialized dashboards and management features.

### Demo Credentials
To quickly explore the application, log in with the following default admin credentials:
- **Email:** `admin@school.com`
- **Password:** `admin123`

## 2. Setup / Run Instructions
This project contains two separate folders: `frontend` (React/Vite) and `backend` (Node.js/Express). 

### Prerequisites
- Node.js installed

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder with the following variables:
   ```env
   MONGO_URI="mongodb+srv://..."
   JWT_SECRET="your_secret_key"
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

## 3. Tech Stack + Why
### Frontend
- **React.js & Vite**: Chosen for lightning-fast development experience, fast hot-module replacement, and modular component-based architecture.
- **Lucide React**: Used for crisp, scalable, and customizable SVG icons.

### Backend
- **Node.js & Express**: Provides a lightweight, high-performance web server perfectly suited for building RESTful APIs using Javascript.
- **Mongoose**: Offers elegant MongoDB object modeling, schema validation, and lifecycle hooks.
- **Bcryptjs & JSON Web Tokens (JWT)**: Ensures secure password hashing and stateless, scalable role-based authentication.

### Database
- **MongoDB**: A NoSQL database that offers flexible schema design, excellent for handling relational concepts like Classes populated with Teachers and Students.

## 4. Implemented Features
- **Student Role (Bonus)**: Student login with access to their permitted school data/attendance.
- **Authentication & Roles**: Secure login system with `ADMIN` and `TEACHER` roles. Protects routes based on authorization.
- **Dashboard**: Role-specific dashboards showing quick statistics (total classes, total students, teachers).
- **Teacher Management**: Complete CRUD functionality to add, edit, or remove teachers.
- **Student Management**: Complete CRUD functionality. Handles duplicate roll number conflicts gracefully with client alerts.
- **Class Management**: Complete CRUD functionality to create classes and assign In-Charge Teachers. Safely prevents duplicate class names.
- **Attendance**: Teachers can mark attendance for specific dates. Includes a smart Date filter, view history, and CSV export functionality formatted strictly as text for full Excel compatibility.
- **Pagination & Filtering**: Client-side pagination and real-time search filtering implemented across all management tables.

## 5. What was Skipped / What Would Be Improved With More Time
- **Server-Side Pagination**: Currently uses client-side pagination. With a larger dataset, this should be refactored into backend server-side pagination with limit/offset queries to reduce database and memory load.
- **Automated Testing**: Comprehensive Unit and End-to-End (E2E) testing (e.g. Jest, Cypress) would be added to ensure component stability.
- **Security Enhancements**: Addition of rate-limiting, Helmet.js for secure HTTP headers, and a strict production CORS configuration.
- **Email/SMS Notifications**: Integration with an external service (like SendGrid or Twilio) for password resets or absence alerts to parents.
