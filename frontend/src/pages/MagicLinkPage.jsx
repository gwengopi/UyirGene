import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, CircularProgress, Box, Button } from '@mui/material';
import { useAuth } from '../store';
import { setAuthHeader } from '../services/api';
import api from '../services/api';
import { ROUTES } from '../utils/constants';

/**
 * Handles magic link authentication for guest-enrolled users.
 * URL: /magic-login?token=<token>
 *
 * On valid token: exchanges it for a JWT, logs the user in, and redirects to My Courses.
 * On invalid/expired token: shows a clear error with a link to Forgot Password.
 */
function MagicLinkPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMessage('No access token found in the link. Please contact support.');
      return;
    }

    api.get(`/api/auth/magic?token=${encodeURIComponent(token)}`)
      .then((res) => {
        const { token: jwt, user } = res.data;
        setAuthHeader(jwt);
        loginWithToken(jwt, user);
        setStatus('success');
        // Short delay so the user sees the success state before redirect
        setTimeout(() => navigate(ROUTES.MY_COURSES, { replace: true }), 1000);
      })
      .catch((err) => {
        const msg = err.response?.data?.message
          || 'This access link has expired or is no longer valid.';
        setErrorMessage(msg);
        setStatus('error');
      });
  }, []); // run once on mount

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper sx={{ p: 5, textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Logging you in…</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <Typography variant="h6" color="success.main" gutterBottom>
              Logged in successfully!
            </Typography>
            <Typography color="text.secondary">Redirecting to your courses…</Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <Typography variant="h6" color="error" gutterBottom>
              Access Link Expired
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {errorMessage}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}>
                Forgot Password
              </Button>
              <Button variant="outlined" onClick={() => navigate(ROUTES.LOGIN)}>
                Go to Login
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default MagicLinkPage;
