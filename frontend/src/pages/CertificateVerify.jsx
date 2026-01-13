import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, Alert, Chip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorIcon from '@mui/icons-material/Error';
import { LoadingSpinner, Breadcrumb } from '../components/common';
import { certificateService } from '../services';
import { formatDate } from '../utils/formatters';

function CertificateVerify() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const data = await certificateService.verifyCertificate(id);
        setCertificate(data);
      } catch (err) {
        setError('Certificate not found or invalid');
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying certificate..." />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Breadcrumb
        items={[{ label: 'Certificate Verification', path: `/certificate/${id}` }]}
      />

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {error ? (
          <>
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Invalid Certificate
            </Typography>
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          </>
        ) : (
          <>
            <VerifiedIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Certificate Verified
            </Typography>
            <Chip label="Valid" color="success" sx={{ mb: 3 }} />

            <Box sx={{ textAlign: 'left', mt: 4 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Certificate ID:</strong> {certificate?.certificateId}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Recipient:</strong> {certificate?.userName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Course:</strong> {certificate?.courseName}
              </Typography>
              <Typography variant="body1">
                <strong>Issue Date:</strong> {formatDate(certificate?.issuedAt)}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default CertificateVerify;
