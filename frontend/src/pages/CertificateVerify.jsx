import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorIcon from '@mui/icons-material/Error';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { LoadingSpinner, Breadcrumb, Button } from '../components/common';
import { certificateService } from '../services';

function CertificateVerify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [certificateId, setCertificateId] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // If ID is provided in URL, verify immediately
  useEffect(() => {
    if (id) {
      setCertificateId(id);
      verifyCertificate(id);
    }
  }, [id]);

  const verifyCertificate = async (idToVerify) => {
    if (!idToVerify || !idToVerify.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);
    setHasSearched(true);

    try {
      const data = await certificateService.verifyCertificate(idToVerify.trim());
      setCertificate(data);
    } catch (err) {
      setError(err.message || 'Certificate not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (certificateId.trim()) {
      // Update URL to reflect the certificate being verified
      navigate(`/certificate/${certificateId.trim()}`, { replace: true });
      verifyCertificate(certificateId.trim());
    }
  };

  const handleReset = () => {
    setCertificate(null);
    setCertificateId('');
    setError(null);
    setHasSearched(false);
    navigate('/verify-certificate', { replace: true });
  };

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

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying certificate..." />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Breadcrumb
        items={[{ label: 'Verify Certificate', path: '/verify-certificate' }]}
      />

      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <VerifiedUserIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Certificate Verification
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter a certificate ID or scan the QR code on a certificate to verify its authenticity.
          </Typography>
        </Box>

        {/* Search Form - Always visible */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Certificate ID"
            placeholder="e.g., CERT-A1B2C3D4"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!certificateId.trim()}
            >
              Verify Certificate
            </Button>
            {hasSearched && (
              <Button
                type="button"
                variant="outlined"
                onClick={handleReset}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>

        {/* Results Section */}
        {hasSearched && (
          <>
            <Divider sx={{ mb: 4 }} />

            {error ? (
              <Box sx={{ textAlign: 'center' }}>
                <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Invalid Certificate
                </Typography>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  The certificate ID "{certificateId}" could not be verified. Please check the ID and try again.
                </Typography>
              </Box>
            ) : certificate ? (
              <Box sx={{ textAlign: 'center' }}>
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
              </Box>
            ) : null}
          </>
        )}

        {/* Help Text */}
        {!hasSearched && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>How to verify:</strong>
            </Typography>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Enter the Certificate ID printed on the certificate</li>
              <li>Or scan the QR code on the certificate using your phone</li>
            </ul>
          </Alert>
        )}
      </Paper>
    </Container>
  );
}

export default CertificateVerify;
