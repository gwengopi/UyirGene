import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Button, SEO } from '../components/common';

function Offline() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <SEO title="You're Offline" noindex />
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <WifiOffIcon
          sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }}
        />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          You're Offline
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          It looks like you've lost your internet connection.
          Some features may not be available until you're back online.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" onClick={handleRetry}>
            Try Again
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Offline;
