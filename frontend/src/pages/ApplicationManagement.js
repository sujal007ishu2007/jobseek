import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { applicationService } from '../services';

const ApplicationManagement = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'accept' or 'reject'
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchApplications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      console.log('Fetching applications for job:', jobId);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('Auth token exists:', !!token);
      console.log('User data:', user ? JSON.parse(user) : 'No user data');
      
      if (!token) {
        setError('You must be logged in to view applications');
        return;
      }
      
      const data = await applicationService.getJobApplications(jobId);
      console.log('Fetched applications:', data);
      setApplications(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length === 0) {
        console.log('No applications found for this job');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('You are not authorized to view these applications. Please make sure you are logged in as an employer.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view applications for this job. Make sure you own this job.');
      } else if (err.response?.status === 404) {
        setError('Job not found or no applications available.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch applications');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      setActionLoading(true);
      setError(''); // Clear any previous errors
      
      console.log('Starting action:', actionType, 'for application:', selectedApplication._id);
      
      let updatedApplication;
      if (actionType === 'accept') {
        updatedApplication = await applicationService.acceptApplication(selectedApplication._id, notes);
      } else {
        updatedApplication = await applicationService.rejectApplication(selectedApplication._id, notes);
      }

      console.log('Action completed. Updated application:', updatedApplication);

      // Update the applications list
      setApplications(apps => 
        apps.map(app => 
          app._id === updatedApplication._id ? updatedApplication : app
        )
      );

      closeDialog();
      
      // Show success message
      setSuccessMessage(`Application ${actionType}ed successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Application ${actionType}ed successfully`);
    } catch (err) {
      console.error(`Error ${actionType}ing application:`, err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message || `Failed to ${actionType} application`);
    } finally {
      setActionLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setNotes('');
    setSelectedApplication(null);
    setActionType('');
    setError(''); // Clear errors when closing dialog
  };

  const openActionDialog = (application, action) => {
    setSelectedApplication(application);
    setActionType(action);
    setDialogOpen(true);
    setError(''); // Clear any previous errors
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'shortlisted': return 'primary';
      case 'hired': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading applications...</Typography>
      </Container>
    );
  }

  // Debug information
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const userData = user ? JSON.parse(user) : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Job Applications
      </Typography>

      {/* Debug Information */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Debug Information:</Typography>
        <Typography variant="body2">Job ID: {jobId}</Typography>
        <Typography variant="body2">Authenticated: {token ? 'Yes' : 'No'}</Typography>
        <Typography variant="body2">User Role: {userData?.role || 'Not found'}</Typography>
        <Typography variant="body2">User Email: {userData?.email || 'Not found'}</Typography>
        <Typography variant="body2">Applications Count: {applications.length}</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Alert severity="info">
          No applications found for this job.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {applications.map((application) => (
            <Grid item xs={12} md={6} lg={4} key={application._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {application.applicant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <EmailIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        {application.applicant.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Status:
                    </Typography>
                    <Chip 
                      label={getStatusText(application.status)}
                      color={getStatusColor(application.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Applied Date:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cover Letter:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        overflow: 'hidden'
                      }}
                    >
                      {application.coverLetter}
                    </Typography>
                  </Box>

                  {application.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Employer Notes:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {(application.status === 'pending' || application.status === 'reviewed' || application.status === 'shortlisted') && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<AcceptIcon />}
                          onClick={() => openActionDialog(application, 'accept')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<RejectIcon />}
                          onClick={() => openActionDialog(application, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => window.open(application.resume, '_blank')}
                    >
                      View Resume
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'accept' ? 'Accept Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Applicant:</strong> {selectedApplication.applicant.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Email:</strong> {selectedApplication.applicant.email}
              </Typography>
            </Box>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Notes (Optional)"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Add notes about your decision to ${actionType} this application...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleAction}
            variant="contained"
            color={actionType === 'accept' ? 'success' : 'error'}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 
             actionType === 'accept' ? 'Accept Application' : 'Reject Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApplicationManagement;