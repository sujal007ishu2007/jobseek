import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Work, Send, Visibility, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationService, jobService } from '../services';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    totalJobs: 0,
  });

  useEffect(() => {
    if (user?.role === 'employer') {
      fetchEmployerData();
    } else {
      fetchJobSeekerData();
    }
  }, [user]);

  const fetchJobSeekerData = async () => {
    try {
      setLoading(true);
      const applicationsData = await applicationService.getMyApplications();
      setApplications(applicationsData);
      
      const totalApplications = applicationsData.length;
      const pendingApplications = applicationsData.filter(app => app.status === 'pending').length;
      const shortlistedApplications = applicationsData.filter(app => app.status === 'shortlisted').length;
      
      setStats({
        totalApplications,
        pendingApplications,
        shortlistedApplications,
      });
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployerData = async () => {
    try {
      setLoading(true);
      const jobsData = await jobService.getEmployerJobs();
      setJobs(jobsData);
      
      const totalJobs = jobsData.length;
      const totalApplications = jobsData.reduce((sum, job) => sum + job.applicationsCount, 0);
      
      setStats({
        totalJobs,
        totalApplications,
      });
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'shortlisted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'hired':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {user?.role === 'employer' ? 'Manage your job postings' : 'Track your job applications'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {user?.role === 'employer' ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Work sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h4">{stats.totalJobs}</Typography>
                      <Typography color="text.secondary">Active Jobs</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Send sx={{ mr: 2, color: 'info.main' }} />
                    <Box>
                      <Typography variant="h4">{stats.totalApplications}</Typography>
                      <Typography color="text.secondary">Total Applications</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Send sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h4">{stats.totalApplications}</Typography>
                      <Typography color="text.secondary">Applications</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Visibility sx={{ mr: 2, color: 'warning.main' }} />
                    <Box>
                      <Typography variant="h4">{stats.pendingApplications}</Typography>
                      <Typography color="text.secondary">Pending</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
                    <Box>
                      <Typography variant="h4">{stats.shortlistedApplications}</Typography>
                      <Typography color="text.secondary">Shortlisted</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {user?.role === 'employer' ? (
              <>
                <Button variant="contained" onClick={() => navigate('/employer/post-job')}>
                  Post New Job
                </Button>
                <Button variant="outlined" onClick={() => navigate('/employer/jobs')}>
                  Manage Jobs
                </Button>
              </>
            ) : (
              <>
                <Button variant="contained" onClick={() => navigate('/jobs')}>
                  Browse Jobs
                </Button>
                <Button variant="outlined" onClick={() => navigate('/profile')}>
                  Update Profile
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {user?.role === 'employer' ? 'Recent Job Postings' : 'Recent Applications'}
          </Typography>
          
          {user?.role === 'employer' ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Applications</TableCell>
                    <TableCell>Posted Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.slice(0, 5).map((job) => (
                    <TableRow key={job._id}>
                      <TableCell>{job.title}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{job.applicationsCount}</TableCell>
                      <TableCell>{formatDate(job.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={job.status}
                          color={job.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => navigate(`/employer/jobs/${job._id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.slice(0, 5).map((application) => (
                    <TableRow key={application._id}>
                      <TableCell>{application.job.title}</TableCell>
                      <TableCell>{application.job.company}</TableCell>
                      <TableCell>{formatDate(application.appliedAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={application.status}
                          color={getStatusColor(application.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => navigate(`/applications/${application._id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {((user?.role === 'employer' && jobs.length === 0) || 
            (user?.role !== 'employer' && applications.length === 0)) && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="text.secondary">
                {user?.role === 'employer' 
                  ? 'No job postings yet. Create your first job posting!'
                  : 'No applications yet. Start applying to jobs!'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;
