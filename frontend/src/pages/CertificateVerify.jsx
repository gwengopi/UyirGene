import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, Alert, Chip, Divider } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorIcon from '@mui/icons-material/Error';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { LoadingSpinner, Breadcrumb } from '../components/common';
import { certificateService } from '../services';

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
        setError(err.message || 'Certificate not found or invalid');
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying certificate..." />;
  }

  const getCertificateTypeInfo = (type) => {
    if (type === 'COMPLETION') {
      return {
        label: 'Certificate of Completion',
        color: 'primary',
        icon: <EmojiEventsIcon />,
        description: 'Successfully completed the course requirements',
      };
    }
    return {
      label: 'Certificate of Participation',
      color: 'secondary',
      icon: <SchoolIcon />,
      description: 'Participated in the course',
    };
  };

  const typeInfo = certificate ? getCertificateTypeInfo(certificate.certificateType) : null;

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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              The certificate ID "{id}" could not be verified. Please check the ID and try again.
            </Typography>
          </>
        ) : (
          <>
            <VerifiedIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Certificate Verified
            </Typography>
            <Chip label="Valid" color="success" sx={{ mb: 2 }} />

            {typeInfo && (
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={typeInfo.icon}
                  label={typeInfo.label}
                  color={typeInfo.color}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Certificate ID
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {certificate?.certificateId}
                </Typography>
              </Box>

              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Recipient
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {certificate?.studentName}
                </Typography>
              </Box>

              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Course
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {certificate?.courseName}
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Issue Date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {certificate?.issuedAt}
                </Typography>
              </Box>
            </Box>

            <Alert severity="success" sx={{ mt: 3 }}>
              {certificate?.message || 'This certificate is valid and was issued by UyirGene.'}
            </Alert>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default CertificateVerify;
