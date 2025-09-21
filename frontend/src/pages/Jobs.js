import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { LocationOn, Business, CalendarToday } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services';

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    category: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const jobTypes = [
    'full-time',
    'part-time',
    'contract',
    'internship',
    'freelance',
  ];

  const fetchJobs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...filters,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const data = await jobService.getJobs(params);
      setJobs(data.jobs);
      setPagination({
        page: data.currentPage,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    fetchJobs(1);
  };

  const handlePageChange = (event, value) => {
    fetchJobs(value);
  };

  const formatSalary = (salary) => {
    if (!salary.min && !salary.max) return 'Salary not specified';
    if (salary.min && salary.max) {
      return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    if (salary.min) return `${salary.currency} ${salary.min.toLocaleString()}+`;
    return `Up to ${salary.currency} ${salary.max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && jobs.length === 0) {
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
      <Typography variant="h4" gutterBottom>
        Job Opportunities
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              name="search"
              label="Search jobs..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              name="location"
              label="Location"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              name="type"
              label="Job Type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All Types</MenuItem>
              {jobTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              name="category"
              label="Category"
              value={filters.category}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
            >
              Search Jobs
            </Button>
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {pagination.total} jobs found
        </Typography>
      </Box>

      {/* Job Cards */}
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} key={job._id}>
            <Card sx={{ '&:hover': { boxShadow: 4 }, cursor: 'pointer' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      {job.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Business sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.company}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        size="small"
                        label={job.type.replace('-', ' ')}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={job.category}
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {job.description.length > 200
                        ? `${job.description.substring(0, 200)}...`
                        : job.description}
                    </Typography>
                    {job.salary && (
                      <Typography variant="body2" fontWeight="bold">
                        {formatSalary(job.salary)}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                          Posted {formatDate(job.createdAt)}
                        </Typography>
                        {job.applicationDeadline && (
                          <Typography variant="body2" color="text.secondary">
                            Deadline: {formatDate(job.applicationDeadline)}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        sx={{ mb: 1 }}
                      >
                        View Details
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {job.applicationsCount} applications
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {jobs.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No jobs found matching your criteria
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setFilters({
                search: '',
                location: '',
                type: '',
                category: '',
              });
              fetchJobs(1);
            }}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Jobs;
