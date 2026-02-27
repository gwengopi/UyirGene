import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, CircularProgress, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import marketingService from '../services/marketingService';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No unsubscribe token provided.');
      return;
    }
    marketingService.unsubscribe(token)
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'You have been unsubscribed from marketing emails.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired unsubscribe link.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Invalid or expired unsubscribe link.');
      });
  }, [token]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%', textAlign: 'center' }} elevation={3}>
        <CardContent sx={{ py: 5, px: 4 }}>
          {status === 'loading' && (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Processing your request...
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Unsubscribed
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You will no longer receive marketing emails from UyirGene.
                You can still receive important transactional emails related to your courses.
              </Typography>
              <Button component={Link} to="/" variant="contained">
                Back to Home
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Link Invalid
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Button component={Link} to="/" variant="outlined">
                Back to Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
