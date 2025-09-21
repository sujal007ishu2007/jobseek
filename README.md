# Job Management Application

# JobSeek - Job Management Application

A full-stack web application for job management with separate dashboards for employers and job seekers.

## 🚀 Features

### For Job Seekers
- Browse and search job listings
- Apply for jobs with cover letter and resume
- Track application status
- User dashboard to manage applications

### For Employers
- Post new job listings
- Manage job postings
- Review job applications with accept/reject functionality
- Employer dashboard with analytics

### Authentication & Security
- JWT-based authentication
- Role-based access control (Job Seeker vs Employer)
- Secure password hashing with bcrypt

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
jobseek/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── services/        # API services
│   └── package.json
├── backend/                  # Express server
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   └── server.js
└── README.md
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sujal007ishu2007/jobseek.git
   cd jobseek
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

1. **Backend Environment Variables**
   Create `.env` file in the backend directory:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   PORT=5000
   ```

2. **Frontend Environment Variables**
   Create `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Server runs on http://localhost:5000

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Application runs on http://localhost:3000

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (Employer only)
- `PUT /api/jobs/:id` - Update job (Employer only)
- `DELETE /api/jobs/:id` - Delete job (Employer only)

### Applications
- `POST /api/applications` - Apply for job (Job Seeker only)
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get job applications (Employer only)
- `PUT /api/applications/:id/accept` - Accept application (Employer only)
- `PUT /api/applications/:id/reject` - Reject application (Employer only)

## 🚀 Deployment

### Backend (Render)
1. Create account on Render.com
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### Frontend (Vercel)
1. Create account on Vercel.com
2. Import GitHub repository
3. Set framework preset: Create React App
4. Add environment variable: `REACT_APP_API_URL`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sujal Kommawar**
- GitHub: [@sujal007ishu2007](https://github.com/sujal007ishu2007)

## 🙏 Acknowledgments

- Material-UI for the beautiful components
- MongoDB Atlas for database hosting
- Render and Vercel for deployment platforms

## Features

- Create, read, update, and delete job postings
- User authentication and authorization
- Job application tracking
- Search and filter jobs
- Responsive design
- User dashboard

## Project Structure

```
job-management-app/
├── client/          # React frontend
├── server/          # Express backend
├── README.md
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for both client and server
3. Set up environment variables
4. Start the development servers

### Environment Variables

Create a `.env` file in the server directory with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Development

```bash
# Install dependencies
npm install

# Start both client and server
npm run dev

# Start only server
npm run server

# Start only client
npm run client
```

## Deployment

This application can be deployed to various platforms:
- Heroku
- Vercel
- Railway
- DigitalOcean

## Technologies Used

- **Frontend**: React, React Router, Axios, Material-UI
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS3, Material-UI
