import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: user?.company?.name || '',
    location: '',
    type: 'full-time',
    category: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    requirements: {
      experience: '',
      education: '',
      skills: []
    },
    benefits: [],
    applicationDeadline: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const jobTypes = [
    'full-time',
    'part-time',
    'contract',
    'internship',
    'freelance'
  ];

  const jobCategories = [
    'Technology',
    'Marketing',
    'Sales',
    'Design',
    'Finance',
    'Human Resources',
    'Operations',
    'Customer Service',
    'Healthcare',
    'Education',
    'Engineering',
    'Legal',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    if (error) setError(null);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.requirements.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          skills: [...prev.requirements.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills: prev.requirements.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove)
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Job description is required';
    }

    if (!formData.company.trim()) {
      errors.company = 'Company name is required';
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    if (formData.salary.min && formData.salary.max) {
      if (parseInt(formData.salary.min) > parseInt(formData.salary.max)) {
        errors['salary.min'] = 'Minimum salary cannot be greater than maximum salary';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      // Prepare job data
      const jobData = {
        ...formData,
        salary: {
          min: formData.salary.min ? parseInt(formData.salary.min) : undefined,
          max: formData.salary.max ? parseInt(formData.salary.max) : undefined,
          currency: formData.salary.currency
        },
        applicationDeadline: formData.applicationDeadline || undefined
      };

      // Remove empty fields
      if (!jobData.salary.min && !jobData.salary.max) {
        delete jobData.salary;
      }

      await jobService.createJob(jobData);
      setSuccess(true);
      
      // Redirect to employer dashboard after 2 seconds
      setTimeout(() => {
        navigate('/employer-dashboard');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="md">
        <Alert severity="success" sx={{ mt: 4 }}>
          Job posted successfully! Redirecting to dashboard...
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        Post a New Job
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                error={!!formErrors.company}
                helperText={formErrors.company}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                error={!!formErrors.location}
                helperText={formErrors.location}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Job Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                {jobTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                error={!!formErrors.category}
                helperText={formErrors.category}
              >
                {jobCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Job Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                error={!!formErrors.description}
                helperText={formErrors.description}
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
              />
            </Grid>

            {/* Salary Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Salary Information (Optional)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Minimum Salary"
                name="salary.min"
                type="number"
                value={formData.salary.min}
                onChange={handleChange}
                error={!!formErrors['salary.min']}
                helperText={formErrors['salary.min']}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Maximum Salary"
                name="salary.max"
                type="number"
                value={formData.salary.max}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Currency"
                name="salary.currency"
                value={formData.salary.currency}
                onChange={handleChange}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="INR">INR</MenuItem>
              </TextField>
            </Grid>

            {/* Requirements */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Requirements
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience Required"
                name="requirements.experience"
                value={formData.requirements.experience}
                onChange={handleChange}
                placeholder="e.g., 2-3 years experience in..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Education Required"
                name="requirements.education"
                value={formData.requirements.education}
                onChange={handleChange}
                placeholder="e.g., Bachelor's degree in..."
              />
            </Grid>

            {/* Skills */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={addSkill}
                  startIcon={<Add />}
                  disabled={!newSkill.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.requirements.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => removeSkill(skill)}
                    deleteIcon={<Remove />}
                  />
                ))}
              </Box>
            </Grid>

            {/* Benefits */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Benefits (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Benefit"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={addBenefit}
                  startIcon={<Add />}
                  disabled={!newBenefit.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.benefits.map((benefit, index) => (
                  <Chip
                    key={index}
                    label={benefit}
                    onDelete={() => removeBenefit(benefit)}
                    deleteIcon={<Remove />}
                  />
                ))}
              </Box>
            </Grid>

            {/* Application Deadline */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Application Deadline"
                name="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/employer/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Posting Job...' : 'Post Job'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default PostJob;
