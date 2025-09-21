# Job Management Application Setup

## Quick Start

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 2. Setup Environment Variables

Create `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/jobmanagement
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
```

Create `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB
Make sure MongoDB is running on your system or use MongoDB Atlas cloud database.

### 4. Run the Application

For development (runs both server and client):
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Server
npm run server

# Terminal 2 - Client
npm run client
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Available Scripts

- `npm run dev` - Run both client and server concurrently
- `npm run server` - Run only the Express server
- `npm run client` - Run only the React app
- `npm run build` - Build the React app for production
- `npm start` - Start the production server

## Features

### For Job Seekers
- Browse and search job listings
- Apply for jobs with cover letter and resume
- Track application status
- User dashboard to manage applications

### For Employers
- Post new job listings
- Manage job postings
- Review job applications
- Update application status

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (Job Seeker vs Employer)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job (Employers only)
- `PUT /api/jobs/:id` - Update job (Job owner only)
- `DELETE /api/jobs/:id` - Delete job (Job owner only)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs

### Applications
- `POST /api/applications` - Apply for a job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get applications for a job (Employers)
- `PUT /api/applications/:id/status` - Update application status (Employers)
- `GET /api/applications/:id` - Get single application
- `DELETE /api/applications/:id` - Delete application (Before review)

## Technology Stack

### Frontend
- React 18
- Material-UI (MUI)
- React Router DOM
- Axios for API calls
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Database Schema

### User Model
- name, email, password
- role (jobseeker/employer)
- profile information
- company information (for employers)

### Job Model
- title, description, company, location
- job type, category, salary
- requirements, benefits
- application deadline
- posted by (user reference)
- status (active/closed/draft)

### Application Model
- job reference
- applicant reference
- cover letter, resume
- status (pending/reviewed/shortlisted/rejected/hired)
- application date, review date

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for various platforms.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
