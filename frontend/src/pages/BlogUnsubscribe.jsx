import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Button, SEO } from '../components/common';
import { blogService } from '../services';

function BlogUnsubscribe() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid unsubscribe link.');
        return;
      }

      try {
        await blogService.unsubscribe(token);
        setStatus('success');
        setMessage('You have been successfully unsubscribed from our blog newsletter.');
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.status === 404
            ? 'This unsubscribe link is invalid or has already been used.'
            : 'Failed to unsubscribe. Please try again later.'
        );
      }
    };

    handleUnsubscribe();
  }, [token]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <SEO title="Unsubscribe from Blog" noindex />
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {status === 'loading' && (
          <Box>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.secondary">
              Processing your request...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box>
            <CheckCircleIcon
              sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Unsubscribed Successfully
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry to see you go. You will no longer receive blog
              notification emails from us.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Changed your mind? You can always resubscribe from our blog page.
            </Typography>
            <Button component={Link} to="/blog" variant="contained" sx={{ mt: 2 }}>
              Visit Blog
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box>
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Unsubscribe Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography variant="body2" color="text.secondary" paragraph>
              If you continue to have issues, please contact our support team.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
              <Button component={Link} to="/blog" variant="outlined">
                Visit Blog
              </Button>
              <Button component={Link} to="/contact" variant="contained">
                Contact Support
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default BlogUnsubscribe;
