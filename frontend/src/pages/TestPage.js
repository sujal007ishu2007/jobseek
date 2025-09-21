import React, { useState } from 'react';
import { Button, Container, Typography, Box, Alert } from '@mui/material';
import { jobService } from '../services';

const TestPage = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testGetJobs = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await jobService.getJobs();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testApiDirect = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/jobs');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        API Test Page
      </Typography>
      
      <Box sx={{ mt: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testGetJobs} 
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Test Job Service
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testApiDirect} 
          disabled={loading}
        >
          Test Direct API
        </Button>
      </Box>

      {loading && (
        <Alert severity="info">Loading...</Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error: {error}
        </Alert>
      )}

      {result && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6">Result:</Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {result}
          </pre>
        </Box>
      )}
    </Container>
  );
};

export default TestPage;
