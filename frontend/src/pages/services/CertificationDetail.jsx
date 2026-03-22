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
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LockIcon from '@mui/icons-material/Lock';
import GroupsIcon from '@mui/icons-material/Groups';
import { Button, Breadcrumb, LoadingSpinner, SEO } from '../../components/common';
import { useScrollAnimation } from '../../hooks';
import { useUI, useConfig } from '../../store';
import { serviceCertificationService } from '../../services';
import { getApiBaseUrl } from '../../services/api';
import { ROUTES, IMAGES } from '../../utils/constants';

const whyChoose = [
  {
    icon: <StarIcon sx={{ fontSize: 36 }} />,
    title: 'Expertise & Experience',
    description: 'Our team comprises highly skilled professionals with diverse backgrounds in food safety management.',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 36 }} />,
    title: 'Commitment to Quality',
    description: 'We maintain the highest standards of quality and professionalism. Our methodologies are based on industry best practices.',
  },
  {
    icon: <HandshakeIcon sx={{ fontSize: 36 }} />,
    title: 'Client-Centric Approach',
    description: 'We prioritize understanding your needs and goals, building strong partnerships through open communication.',
  },
  {
    icon: <LockIcon sx={{ fontSize: 36 }} />,
    title: 'Trust & Confidentiality',
    description: 'We uphold the highest standards of confidentiality and professionalism in all our engagements.',
  },
];

function CertificationDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useUI();
  const { getImage } = useConfig();
  const [certification, setCertification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const overviewAnim = useScrollAnimation({ threshold: 0.1 });
  const whyAnim = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    const loadCertification = async () => {
      setLoading(true);
      try {
        const data = await serviceCertificationService.getCertificationBySlug(slug);
        setCertification(data);
      } catch (err) {
        setError('Failed to load certification details');
      } finally {
        setLoading(false);
      }
    };
    loadCertification();
  }, [slug]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading certification..." />;
  }

  if (error || !certification) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Certification not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.SERVICES_CERTIFICATION)}>
          Back to Certifications
        </Button>
      </Container>
    );
  }

  const heroImageUrl = certification.heroImageUrl
    ? `${getApiBaseUrl()}${certification.heroImageUrl}`
    : getImage('SERVICE_CERTIFICATION', IMAGES.SERVICE_CERTIFICATION);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title={certification.title}
        description={
          certification.subtitle
            ? `${certification.subtitle} | Uyirgene International`
            : `${certification.title} certification services from Uyirgene International. Expert food safety and quality management certification support.`
        }
        path={`/services/certification/${certification?.slug || slug}`}
      />
      <Breadcrumb
        items={[
          { label: 'Services', path: ROUTES.SERVICES },
          { label: 'Certification', path: ROUTES.SERVICES_CERTIFICATION },
          { label: certification.title, path: `/services/certification/${certification?.slug || slug}` },
        ]}
      />

      {/* Hero */}
      <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 6 }}>
        <CardMedia
          component="img"
          image={heroImageUrl}
          alt={certification.title}
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
          <VerifiedIcon sx={{ fontSize: 56, color: '#fff', mb: 1, opacity: 0.9 }} />
          <Typography variant="h3" component="h1" fontWeight={700} sx={{ color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
            {certification.title}
          </Typography>
          {certification.subtitle && (
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, maxWidth: 700, mx: 'auto' }}>
              {certification.subtitle}
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
        {certification.description && (
          <>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {certification.description}
            </Typography>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* What is this Certification? */}
        {certification.whatIs && (
          <>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              What is {certification.title.split(' - ')[0]}?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {certification.whatIs}
            </Typography>
            {certification.keyElements && certification.keyElements.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {certification.keyElements.map((item, i) => (
                  <Chip key={i} label={item} color="primary" variant="outlined" />
                ))}
              </Box>
            )}
          </>
        )}

        {/* Who Needs This? */}
        {certification.whoNeeds && certification.whoNeeds.length > 0 && (
          <>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Who Needs {certification.title.split(' - ')[0]}?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Applicable to all organizations directly or indirectly involved:
            </Typography>
            <Grid container spacing={1}>
              {certification.whoNeeds.map((industry, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">{industry}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* Certification Route */}
        {certification.certificationRoute && certification.certificationRoute.length > 0 && (
          <>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Certification Route
            </Typography>
            <Stepper orientation="vertical" sx={{ mt: 2 }}>
              {certification.certificationRoute.map((step, index) => (
                <Step key={index} active>
                  <StepLabel>
                    <Typography variant="subtitle1" fontWeight={600}>{step.label}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">{step.description}</Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* Benefits */}
        {certification.benefits && certification.benefits.length > 0 && (
          <>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Benefits of Certification
            </Typography>
            <List dense>
              {certification.benefits.map((benefit, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.3 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={benefit} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>

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
        <GroupsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Request a Quote
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 550, mx: 'auto' }}>
          Contact us today for certification services. Call +91-99 437 123 83 or submit an enquiry online.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(ROUTES.SERVICES_CERTIFICATION)}
          >
            All Certifications
          </Button>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/contact')}
            sx={{ px: 4, py: 1.5 }}
          >
            Contact Us Now
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default CertificationDetail;
