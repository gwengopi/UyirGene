import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BiotechIcon from '@mui/icons-material/Biotech';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Button, Breadcrumb, LoadingSpinner, SEO } from '../../components/common';
import { useScrollAnimation } from '../../hooks';
import { useUI } from '../../store';
import { serviceTestingService } from '../../services';
import { getApiBaseUrl } from '../../services/api';
import { ROUTES, IMAGES } from '../../utils/constants';

function TestingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useUI();
  const [testing, setTesting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const overviewAnim = useScrollAnimation({ threshold: 0.1 });
  const highlightsAnim = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    const loadTesting = async () => {
      setLoading(true);
      try {
        const data = await serviceTestingService.getTesting(id);
        setTesting(data);
      } catch (err) {
        setError('Failed to load testing details');
      } finally {
        setLoading(false);
      }
    };
    loadTesting();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading testing details..." />;
  }

  if (error || !testing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Testing not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.SERVICES_TESTING)}>
          Back to Testing Services
        </Button>
      </Container>
    );
  }

  const heroImageUrl = testing.heroImageUrl
    ? `${getApiBaseUrl()}${testing.heroImageUrl}`
    : IMAGES.SERVICE_GMO_TESTING;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title={testing.title}
        description={
          testing.subtitle
            ? `${testing.subtitle} | Uyirgene International`
            : `${testing.title} testing services from Uyirgene International. Accredited laboratory testing with reliable, accurate results.`
        }
        path={`/services/testing/${id}`}
      />
      <Breadcrumb
        items={[
          { label: 'Services', path: ROUTES.SERVICES },
          { label: 'Testing', path: ROUTES.SERVICES_TESTING },
          { label: testing.title, path: `/services/testing/${id}` },
        ]}
      />

      {/* Hero */}
      <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 6 }}>
        <CardMedia
          component="img"
          height={300}
          image={heroImageUrl}
          alt={testing.title}
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
          <ScienceIcon sx={{ fontSize: 56, color: '#fff', mb: 1, opacity: 0.9 }} />
          <Typography variant="h3" component="h1" fontWeight={700} sx={{ color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
            {testing.title}
          </Typography>
          {testing.subtitle && (
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, maxWidth: 700, mx: 'auto' }}>
              {testing.subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Overview Section */}
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
        {testing.description && (
          <>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {testing.description}
            </Typography>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* What is this Testing? */}
        {testing.whatIs && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <BiotechIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight={600}>
                What is {testing.title.split(' - ')[0]}?
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {testing.whatIs}
            </Typography>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* Why Testing Matters */}
        {testing.whyMatters && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <WarningAmberIcon sx={{ fontSize: 32, color: 'warning.main' }} />
              <Typography variant="h5" fontWeight={600}>
                Why {testing.title.split(' - ')[0]} Matters
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {testing.whyMatters}
            </Typography>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* Certificate */}
        {testing.certificate && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <VerifiedUserIcon sx={{ fontSize: 32, color: 'success.main' }} />
              <Typography variant="h5" fontWeight={600}>
                {testing.title.split(' - ')[0]} Certificate
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {testing.certificate}
            </Typography>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* Our Testing Services */}
        {testing.testingServices && testing.testingServices.length > 0 && (
          <>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Our {testing.title.split(' - ')[0]} Services
            </Typography>
            <List>
              {testing.testingServices.map((service, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleOutlineIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={service}
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>

      {/* Company Highlights */}
      {testing.highlights && testing.highlights.length > 0 && (
        <Box ref={highlightsAnim.ref} sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
            Why Choose Us
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {testing.highlights.map((highlight, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    opacity: highlightsAnim.isVisible ? 1 : 0,
                    transform: highlightsAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
                    '&:hover': {
                      boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {highlight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {highlight.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

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
        <ScienceIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Request a Quote
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 550, mx: 'auto' }}>
          Contact us today for your testing needs. Our staff will provide a customized solution with competitive pricing and flexible scheduling.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(ROUTES.SERVICES_TESTING)}
          >
            All Testing Services
          </Button>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/contact')}
            sx={{ px: 4, py: 1.5 }}
          >
            Enquire Now
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default TestingDetail;
