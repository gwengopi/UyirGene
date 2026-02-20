import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CardMedia,
  Divider,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Button, Breadcrumb, SEO } from '../../components/common';
import { useScrollAnimation } from '../../hooks';
import { useConfig, useUI } from '../../store';
import { ROUTES, IMAGES } from '../../utils/constants';
import { serviceDiagnosticsService } from '../../services';

const categoryColors = {
  Hormonal: 'primary',
  'Infectious Disease': 'error',
  Molecular: 'secondary',
  Bacteriology: 'warning',
  Nutritional: 'success',
};

function ClinicalResearch() {
  const navigate = useNavigate();
  const { getImage } = useConfig();
  const { isDarkMode } = useUI();
  const overviewAnim = useScrollAnimation({ threshold: 0.1 });
  const testsAnim = useScrollAnimation({ threshold: 0.1 });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await serviceDiagnosticsService.getPublishedDiagnostics();
        if (results && results.length > 0) {
          setData(results[0]);
        }
      } catch (err) {
        setError('Failed to load clinical research data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const testProfiles = data?.testProfiles || [];
  const pageTitle = data?.title || 'Clinical Research & Medical Testing';
  const pageSubtitle = data?.subtitle || 'Advanced Testing Solutions at Uyirgene Research Lab';
  const description = data?.description || '';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="Clinical Diagnostics"
        description="Clinical diagnostic services including pathology, molecular diagnostics, and specialized testing from Uyirgene International."
        path="/services/clinical-research"
      />
      <Breadcrumb
        items={[
          { label: 'Services', path: ROUTES.SERVICES },
          { label: 'Clinical Research', path: ROUTES.SERVICES_CLINICAL_RESEARCH },
        ]}
      />

      {/* Hero */}
      <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 6 }}>
        <CardMedia
          component="img"
          height={300}
          image={getImage('SERVICE_CLINICAL_DIAGNOSTICS', IMAGES.SERVICE_CLINICAL_DIAGNOSTICS)}
          alt="Clinical Research Lab"
          sx={{ objectFit: 'cover', filter: 'brightness(0.3)' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '90%',
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: 56, color: '#fff', mb: 1, opacity: 0.9 }} />
          <Typography variant="h3" component="h1" fontWeight={700} sx={{ color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
            {pageTitle}
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, maxWidth: 700, mx: 'auto' }}>
            {pageSubtitle}
          </Typography>
        </Box>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Overview */}
      {loading ? (
        <Paper sx={{ p: { xs: 3, md: 5 }, mb: 4 }}>
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="80%" height={24} />
        </Paper>
      ) : description ? (
        <Paper
          ref={overviewAnim.ref}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            opacity: overviewAnim.isVisible ? 1 : 0,
            transform: overviewAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          {description.split('\n\n').map((paragraph, i) => (
            <Typography key={i} variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
              {paragraph}
            </Typography>
          ))}
        </Paper>
      ) : null}

      {/* Test Profiles */}
      {loading ? (
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={250} height={40} sx={{ mx: 'auto', mb: 2 }} />
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : testProfiles.length > 0 ? (
        <Box ref={testsAnim.ref} sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
            Our Test Profiles
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, maxWidth: 650, mx: 'auto' }}>
            Comprehensive diagnostic testing services with accurate results and rapid turnaround times.
          </Typography>

          <Grid container spacing={3}>
            {testProfiles.map((test, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: testsAnim.isVisible ? 1 : 0,
                    transform: testsAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
                    borderTop: '3px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    {test.category && (
                      <Chip
                        label={test.category}
                        size="small"
                        color={categoryColors[test.category] || 'default'}
                        variant="outlined"
                      />
                    )}
                    {test.reportingTime && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {test.reportingTime}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: '1rem' }}>
                    {test.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.7 }}>
                    {test.description}
                  </Typography>

                  {test.reportingTime && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Reporting Time
                        </Typography>
                        <Chip label={test.reportingTime} size="small" color="primary" />
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}

      {/* Contact Info */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: 'center',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Book Your Test Today
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For appointments and enquiries, contact our lab at <strong>+91 9943712383</strong>. Walk-in sample collection available during working hours.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/contact')}
          sx={{ px: 4, py: 1.5, whiteSpace: 'nowrap' }}
        >
          Book Now
        </Button>
      </Paper>

      {/* CTA */}
      <Paper
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(79,102,114,0.2) 0%, rgba(22,22,22,0.4) 100%)'
            : 'linear-gradient(135deg, rgba(69,90,100,0.08) 0%, rgba(255,255,255,0.95) 100%)',
          borderRadius: 3,
        }}
      >
        <LocalHospitalIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Request a Quote
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 550, mx: 'auto' }}>
          Contact us for custom testing packages and bulk pricing. Our friendly staff will help you find the right solution.
        </Typography>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/contact')}
          sx={{ px: 4, py: 1.5 }}
        >
          Enquire Now
        </Button>
      </Paper>
    </Container>
  );
}

export default ClinicalResearch;
