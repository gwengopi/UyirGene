import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CardMedia,
  Chip,
  Skeleton,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Button, Breadcrumb, SEO } from '../../components/common';
import { useScrollAnimation } from '../../hooks';
import { useConfig, useUI } from '../../store';
import { serviceTestingService } from '../../services';
import { getApiBaseUrl } from '../../services/api';
import { ROUTES, IMAGES } from '../../utils/constants';

const DEFAULT_DESCRIPTION = `At Uyir Tech Testing Lab, we understand the importance of quality assurance in today's competitive market. We offer a wide range of testing services, including blood culture testing, food product microbiology, and GMO analysis. Our experienced scientists and technicians use advanced equipment and methods to deliver accurate and reliable results.

Our testing services ensure your products comply with both national and international regulations, giving you confidence in your quality assurance processes.`;

const whyChoose = [
  {
    icon: <StarIcon sx={{ fontSize: 36 }} />,
    title: 'Expert Scientists',
    description: 'Our team comprises highly skilled scientists and technicians with diverse backgrounds in testing and quality assurance.',
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 36 }} />,
    title: 'Accurate Results',
    description: 'We use advanced equipment and methodologies to deliver precise and reliable testing outcomes.',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 36 }} />,
    title: 'Fast Turnaround',
    description: 'We understand time-sensitive needs and provide efficient testing services with quick turnaround times.',
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 36 }} />,
    title: 'Dedicated Support',
    description: 'Our customer support team is always ready to assist you with your testing requirements.',
  },
];

function TestingCard({ testing, onClick, index, isVisible }) {
  const { isDarkMode } = useUI();
  const { getImage } = useConfig();
  const thumbnailUrl = testing.thumbnailImageUrl
    ? `${getApiBaseUrl()}${testing.thumbnailImageUrl}`
    : getImage('SERVICE_GMO_TESTING', IMAGES.SERVICE_GMO_TESTING);

  return (
    <Paper
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 3,
        cursor: 'pointer',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s, box-shadow 0.3s ease`,
        '&:hover': {
          transform: isVisible ? 'translateY(-8px)' : 'translateY(30px)',
          boxShadow: isDarkMode
            ? '0 16px 40px rgba(0,0,0,0.4)'
            : '0 16px 40px rgba(69,90,100,0.2)',
        },
        '&:hover .testing-image': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={thumbnailUrl}
          alt={testing.title}
          className="testing-image"
          sx={{
            objectFit: 'cover',
            height: 180,
            transition: 'transform 0.5s ease',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
          }}
        />
        <Chip
          icon={<ScienceIcon sx={{ fontSize: 14 }} />}
          label="Testing"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'primary.main',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Box>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ lineHeight: 1.3 }}>
          {testing.title}
        </Typography>
        {testing.subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {testing.subtitle}
          </Typography>
        )}
        {testing.testingServices && testing.testingServices.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2, flex: 1 }}>
            {testing.testingServices.slice(0, 3).map((service, i) => (
              <Chip key={i} label={service} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            ))}
            {testing.testingServices.length > 3 && (
              <Chip label={`+${testing.testingServices.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            )}
          </Box>
        )}
        <Button
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          sx={{ mt: 'auto' }}
        >
          Explore Now
        </Button>
      </Box>
    </Paper>
  );
}

function Testing() {
  const navigate = useNavigate();
  const { getImage, getText } = useConfig();
  const { isDarkMode } = useUI();
  const pageDescription = getText('TESTING_PAGE_DESCRIPTION', DEFAULT_DESCRIPTION);
  const [testings, setTestings] = useState([]);
  const [loading, setLoading] = useState(true);

  const testingsAnim = useScrollAnimation({ threshold: 0.1 });
  const whyAnim = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    const loadTestings = async () => {
      try {
        const data = await serviceTestingService.getPublishedTestings();
        setTestings(data);
      } catch (error) {
        console.error('Failed to load testings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTestings();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="Testing Services"
        description="Comprehensive food testing, water testing, environmental testing, and product testing services with accredited laboratory facilities."
        path="/services/testing"
      />
      <Breadcrumb
        items={[
          { label: 'Services', path: ROUTES.SERVICES },
          { label: 'Testing', path: ROUTES.SERVICES_TESTING },
        ]}
      />

      {/* Hero */}
      <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 6 }}>
        <CardMedia
          component="img"
          image={getImage('SERVICE_GMO_TESTING', IMAGES.SERVICE_GMO_TESTING)}
          alt="Testing Services"
          sx={{ objectFit: 'cover', filter: 'brightness(0.3)', height: { xs: 180, sm: 220, md: 260 } }}
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
            Testing Services
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, maxWidth: 700, mx: 'auto' }}>
            Your Partner for Quality Assurance & Compliance
          </Typography>
        </Box>
      </Box>

      {/* Overview */}
      <Paper sx={{ p: { xs: 3, md: 5 }, mb: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {pageDescription}
        </Typography>
      </Paper>

      {/* Testings Grid */}
      <Box ref={testingsAnim.ref} sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
          Our Testing Services
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, maxWidth: 650, mx: 'auto' }}>
          Explore our comprehensive range of testing services designed to help your organization maintain quality and compliance.
        </Typography>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Skeleton variant="rectangular" height={180} animation="wave" />
                  <Box sx={{ p: 3 }}>
                    <Skeleton variant="text" width="80%" height={32} animation="wave" />
                    <Skeleton variant="text" width="60%" animation="wave" />
                    <Skeleton variant="text" width="100%" animation="wave" sx={{ mt: 2 }} />
                    <Skeleton variant="rectangular" width="100%" height={40} animation="wave" sx={{ mt: 2, borderRadius: 1 }} />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : testings.length > 0 ? (
          <Grid container spacing={3}>
            {testings.map((testing, index) => (
              <Grid item xs={12} sm={6} md={4} key={testing.id}>
                <TestingCard
                  testing={testing}
                  onClick={() => navigate(`/services/testing/${testing.id}`)}
                  index={index}
                  isVisible={testingsAnim.isVisible}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ScienceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No testing services available at the moment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please check back later or contact us for more information.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Why Choose Us */}
      <Box ref={whyAnim.ref} sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
          Why Choose Uyirgene?
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {whyChoose.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  gap: 2,
                  opacity: whyAnim.isVisible ? 1 : 0,
                  transform: whyAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
                }}
              >
                <Box sx={{ color: 'primary.main', flexShrink: 0 }}>{item.icon}</Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

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

export default Testing;
