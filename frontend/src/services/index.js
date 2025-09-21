import api from './api';

export const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Store user data
  storeUserData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const jobService = {
  // Get all jobs with filters
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // Get single job
  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create new job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update job
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Get employer's jobs
  getEmployerJobs: async () => {
    const response = await api.get('/jobs/employer/my-jobs');
    return response.data;
  }
};

export const applicationService = {
  // Apply for job
  applyForJob: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  // Get user's applications
  getMyApplications: async () => {
    const response = await api.get('/applications/my-applications');
    return response.data;
  },

  // Get applications for a job
  getJobApplications: async (jobId) => {
    try {
      console.log('Getting applications for job ID:', jobId);
      const response = await api.get(`/applications/job/${jobId}`);
      console.log('Job applications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get job applications error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (applicationId, statusData) => {
    const response = await api.put(`/applications/${applicationId}/status`, statusData);
    return response.data;
  },

  // Get single application
  getApplication: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  // Delete application
  deleteApplication: async (applicationId) => {
    const response = await api.delete(`/applications/${applicationId}`);
    return response.data;
  },

  // Accept application
  acceptApplication: async (applicationId, notes = '') => {
    try {
      console.log('Accepting application:', applicationId, 'with notes:', notes);
      const response = await api.put(`/applications/${applicationId}/accept`, { notes });
      console.log('Accept response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Accept application error:', error);
      throw error;
    }
  },

  // Reject application
  rejectApplication: async (applicationId, notes = '') => {
    try {
      console.log('Rejecting application:', applicationId, 'with notes:', notes);
      const response = await api.put(`/applications/${applicationId}/reject`, { notes });
      console.log('Reject response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Reject application error:', error);
      throw error;
    }
  }
};
