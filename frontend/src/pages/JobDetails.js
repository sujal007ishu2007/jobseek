import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import { 
  LocationOn, 
  Business, 
  CalendarToday, 
  AttachMoney,
  Send,
  ArrowBack,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService, applicationService } from '../services';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: '',
  });
  
  // Applications management state
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getJob(id);
      setJob(jobData);
    } catch (err) {
      setError('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'employer' || !job) return;
    
    try {
      setApplicationsLoading(true);
      setApplicationsError('');
      console.log('Fetching applications for job:', id);
      
      const fetchedApplications = await applicationService.getJobApplications(id);
      console.log('Fetched applications:', fetchedApplications);
      setApplications(fetchedApplications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplicationsError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setApplicationsLoading(false);
    }
  }, [id, isAuthenticated, user?.role, job]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    if (job && isAuthenticated && user?.role === 'employer' && job.postedBy._id === user.id) {
      fetchApplications();
    }
  }, [job, fetchApplications, isAuthenticated, user?.role, user?.id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      await applicationService.applyForJob({
        jobId: id,
        coverLetter: applicationData.coverLetter,
        resume: applicationData.resume,
      });
      setApplyDialogOpen(false);
      setApplicationData({ coverLetter: '', resume: '' });
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleAction = async (applicationId, action) => {
    try {
      setApplicationsError('');
      setSuccessMessage('');
      
      console.log(`${action}ing application:`, applicationId);
      
      if (action === 'accept') {
        await applicationService.acceptApplication(applicationId);
        setSuccessMessage('Application accepted successfully!');
      } else if (action === 'reject') {
        await applicationService.rejectApplication(applicationId);
        setSuccessMessage('Application rejected successfully!');
      }
      
      // Refresh applications list
      await fetchApplications();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(`Error ${action}ing application:`, err);
      setApplicationsError(err.response?.data?.message || `Failed to ${action} application`);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salary not specified';
    if (salary.min && salary.max) {
      return `${salary.currency || 'USD'} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    if (salary.min) return `${salary.currency || 'USD'} ${salary.min.toLocaleString()}+`;
    return `Up to ${salary.currency || 'USD'} ${salary.max.toLocaleString()}`;
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

  if (error || !job) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Job not found'}
        </Alert>
      </Container>
    );
  }

  const canApply = isAuthenticated && user?.role === 'jobseeker';
  const isOwner = isAuthenticated && user?.role === 'employer' && job.postedBy._id === user.id;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/jobs')}
          sx={{ mb: 2 }}
        >
          Back to Jobs
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {job.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6">{job.company}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography color="text.secondary">{job.location}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Chip
                  label={job.type.replace('-', ' ')}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={job.category}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  label={job.status}
                  color={job.status === 'active' ? 'success' : 'default'}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Job Description
              </Typography>
              <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
                {job.description}
              </Typography>

              {job.requirements && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Requirements
                  </Typography>
                  {job.requirements.experience && (
                    <Typography paragraph>
                      <strong>Experience:</strong> {job.requirements.experience}
                    </Typography>
                  )}
                  {job.requirements.education && (
                    <Typography paragraph>
                      <strong>Education:</strong> {job.requirements.education}
                    </Typography>
                  )}
                  {job.requirements.skills && job.requirements.skills.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        <strong>Skills:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {job.requirements.skills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Benefits
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {job.benefits.map((benefit, index) => (
                      <Typography component="li" key={index} paragraph>
                        {benefit}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} />
                  Salary
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatSalary(job.salary)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                  Posted
                </Typography>
                <Typography variant="body1">
                  {formatDate(job.createdAt)}
                </Typography>
              </Box>

              {job.applicationDeadline && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Application Deadline
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(job.applicationDeadline)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Applications
                </Typography>
                <Typography variant="body1">
                  {job.applicationsCount} candidates
                </Typography>
              </Box>

              {canApply && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Send />}
                  onClick={() => setApplyDialogOpen(true)}
                  disabled={job.status !== 'active'}
                >
                  Apply Now
                </Button>
              )}

              {isOwner && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/employer/jobs/${job._id}/edit`)}
                  >
                    Edit Job
                  </Button>
                </Box>
              )}

              {!isAuthenticated && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Please log in to apply for this job
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Applications Section for Job Owners */}
      {isOwner && (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Job Applications
          </Typography>

          {/* Debug Information */}
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Debug Information:</Typography>
            <Typography variant="body2">Job ID: {id}</Typography>
            <Typography variant="body2">Job Title: {job.title}</Typography>
            <Typography variant="body2">Authenticated: {localStorage.getItem('token') ? 'Yes' : 'No'}</Typography>
            <Typography variant="body2">User Role: {user?.role || 'Not found'}</Typography>
            <Typography variant="body2">User Email: {user?.email || 'Not found'}</Typography>
            <Typography variant="body2">Applications Count: {applications.length}</Typography>
          </Box>

          {applicationsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {applicationsError}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {applicationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading applications...</Typography>
            </Box>
          ) : applications.length === 0 ? (
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
                          label={application.status}
                          color={
                            application.status === 'accepted' ? 'success' :
                            application.status === 'rejected' ? 'error' : 'default'
                          }
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

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Resume:
                        </Typography>
                        <Button 
                          size="small" 
                          href={application.resume} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          variant="outlined"
                        >
                          View Resume
                        </Button>
                      </Box>
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<AcceptIcon />}
                          onClick={() => handleAction(application._id, 'accept')}
                          disabled={application.status !== 'pending'}
                          fullWidth
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<RejectIcon />}
                          onClick={() => handleAction(application._id, 'reject')}
                          disabled={application.status !== 'pending'}
                          fullWidth
                        >
                          Reject
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      )}

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cover Letter"
            value={applicationData.coverLetter}
            onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Resume URL"
            value={applicationData.resume}
            onChange={(e) => setApplicationData(prev => ({ ...prev, resume: e.target.value }))}
            required
            helperText="Please provide a link to your resume (Google Drive, Dropbox, etc.)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApply}
            variant="contained"
            disabled={applying || !applicationData.coverLetter || !applicationData.resume}
          >
            {applying ? <CircularProgress size={20} /> : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetails;
