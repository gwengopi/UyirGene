import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { Button } from '../components/common';
import { ROUTES } from '../utils/constants';

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <BlockIcon
          sx={{ fontSize: 100, color: 'error.main', mb: 2 }}
        />
        <Typography variant="h1" fontWeight={700} sx={{ mb: 1 }}>
          403
        </Typography>
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You don't have permission to access this page.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" onClick={() => navigate(ROUTES.HOME)}>
            Go Home
          </Button>
          <Button variant="outlined" onClick={() => navigate(ROUTES.DASHBOARD)}>
            Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Unauthorized;
