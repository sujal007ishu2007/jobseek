import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Work, People, TrendingUp, Security } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Work sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Find Your Dream Job',
      description: 'Browse thousands of job opportunities from top companies worldwide.',
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Connect with Employers',
      description: 'Get directly connected with hiring managers and recruiters.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Track Applications',
      description: 'Monitor your job applications and get real-time updates.',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure Platform',
      description: 'Your data is safe with our enterprise-grade security.',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white',
          mb: 6,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Find Your Perfect Job
        </Typography>
        <Typography variant="h5" paragraph sx={{ opacity: 0.9 }}>
          Connect with top employers and discover opportunities that match your skills
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/jobs')}
            sx={{
              mr: 2,
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Browse Jobs
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
        Why Choose JobManager?
      </Typography>
      <Typography variant="h6" textAlign="center" color="text.secondary" paragraph>
        Everything you need to find your next career opportunity
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2, mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats Section */}
      <Paper sx={{ p: 4, mb: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              10K+
            </Typography>
            <Typography variant="h6">Active Jobs</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              5K+
            </Typography>
            <Typography variant="h6">Companies</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              50K+
            </Typography>
            <Typography variant="h6">Job Seekers</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* CTA Section */}
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h4" gutterBottom>
          Ready to Start Your Journey?
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Join thousands of professionals who found their dream jobs
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/register')}
          sx={{ mt: 2 }}
        >
          Create Account Today
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
