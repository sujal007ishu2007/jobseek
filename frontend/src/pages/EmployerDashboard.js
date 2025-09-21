import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Work,
  People,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationsDialogOpen, setApplicationsDialogOpen] = useState(false);
  const [selectedJobApplications, setSelectedJobApplications] = useState([]);
  const [applicationsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  const fetchEmployerJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await jobService.getEmployerJobs();
      setJobs(jobsData);
      
      // Calculate stats
      const totalJobs = jobsData.length;
      const activeJobs = jobsData.filter(job => job.status === 'active').length;
      const totalApplications = jobsData.reduce((sum, job) => sum + job.applicationsCount, 0);
      
      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications: totalApplications, // This would need to be calculated differently with real application data
      });
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, job) => {
    setMenuAnchor(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedJob(null);
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await jobService.deleteJob(jobToDelete._id);
      setJobs(jobs.filter(job => job._id !== jobToDelete._id));
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const handleStatusToggle = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active';
      const updatedJob = await jobService.updateJob(job._id, { status: newStatus });
      setJobs(jobs.map(j => j._id === job._id ? updatedJob : j));
      handleMenuClose();
    } catch (err) {
      setError('Failed to update job status');
    }
  };

  const handleViewApplications = async (job) => {
    // Navigate to the dedicated application management page
    navigate(`/applications/job/${job._id}`);
  };

  const handleApplicationsDialogClose = () => {
    setApplicationsDialogOpen(false);
    setSelectedJob(null);
    setSelectedJobApplications([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'closed':
        return 'error';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
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
          Employer Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.name}! Manage your job postings and applications.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.totalJobs}</Typography>
                  <Typography color="text.secondary">Total Jobs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 2, color: 'success.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.activeJobs}</Typography>
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
                <People sx={{ mr: 2, color: 'info.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.totalApplications}</Typography>
                  <Typography color="text.secondary">Total Applications</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Visibility sx={{ mr: 2, color: 'warning.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.pendingApplications}</Typography>
                  <Typography color="text.secondary">Pending Reviews</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/post-job')}
            >
              Post New Job
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/jobs')}
            >
              Browse All Jobs
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Job Postings
          </Typography>
          
          {jobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No job postings yet
              </Typography>
              <Typography color="text.secondary" paragraph>
                Start by creating your first job posting to attract talented candidates.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/employer/post-job')}
              >
                Post Your First Job
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Applications</TableCell>
                    <TableCell>Posted Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{job.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.company}
                        </Typography>
                      </TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={job.type.replace('-', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleViewApplications(job)}
                          disabled={job.applicationsCount === 0}
                          variant={job.applicationsCount > 0 ? "contained" : "outlined"}
                          color={job.applicationsCount > 0 ? "primary" : "default"}
                        >
                          {job.applicationsCount || 0} {job.applicationsCount === 1 ? 'Application' : 'Applications'}
                        </Button>
                      </TableCell>
                      <TableCell>{formatDate(job.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={job.status}
                          color={getStatusColor(job.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            View
                          </Button>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, job)}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          // Navigate to edit job (we'll implement this later)
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit Job
        </MenuItem>
        <MenuItem onClick={() => handleStatusToggle(selectedJob)}>
          <TrendingUp sx={{ mr: 1 }} />
          {selectedJob?.status === 'active' ? 'Close Job' : 'Activate Job'}
        </MenuItem>
        <MenuItem onClick={() => {
          handleViewApplications(selectedJob);
          handleMenuClose();
        }}>
          <People sx={{ mr: 1 }} />
          View Applications
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteClick(selectedJob)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Job
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Job Posting</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog 
        open={applicationsDialogOpen} 
        onClose={handleApplicationsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Applications for "{selectedJob?.title}"
          <Typography variant="subtitle2" color="text.secondary">
            {selectedJobApplications.length} {selectedJobApplications.length === 1 ? 'Application' : 'Applications'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {applicationsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : selectedJobApplications.length === 0 ? (
            <Typography variant="body1" align="center" py={3}>
              No applications yet for this job.
            </Typography>
          ) : (
            <Box>
              {selectedJobApplications.map((application) => (
                <Card key={application._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6">
                          {application.applicant.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.applicant.email}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Applied: {formatDate(application.createdAt)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Chip 
                            label={application.status} 
                            color={application.status === 'pending' ? 'warning' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Cover Letter:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.coverLetter}
                        </Typography>
                      </Grid>
                      {application.resume && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Resume:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.resume}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApplicationsDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployerDashboard;
