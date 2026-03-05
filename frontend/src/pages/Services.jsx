import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CardMedia,
} from '@mui/material';
import BiotechIcon from '@mui/icons-material/Biotech';
import VerifiedIcon from '@mui/icons-material/Verified';
import ScienceIcon from '@mui/icons-material/Science';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button, Breadcrumb, SEO } from '../components/common';
import { useScrollAnimation } from '../hooks';
import { useConfig, useUI } from '../store';
import { ROUTES, IMAGES } from '../utils/constants';

const services = [
  {
    icon: MenuBookIcon,
    title: 'Training',
    path: ROUTES.SERVICES_LEARNING,
    imageKey: 'SERVICE_LEARNING',
    imageFallback: IMAGES.SERVICE_LEARNING,
    description:
      'Professional online courses covering ISO standards, food safety, quality management, regulatory compliance, and life sciences. Learn from industry experts at your own pace.',
  },
  {
    icon: BiotechIcon,
    title: 'Microbiology Research',
    path: ROUTES.SERVICES_MICROBIOLOGY,
    imageKey: 'SERVICE_MICROBIOLOGY',
    imageFallback: IMAGES.SERVICE_MICROBIOLOGY,
    description:
      'Comprehensive microbiological research spanning environmental, food, and product testing. Our lab uses advanced technology for microbial identification, process validation, and antimicrobial resistance research.',
  },
  {
    icon: VerifiedIcon,
    title: 'Auditing and Certifications',
    path: ROUTES.SERVICES_CERTIFICATION,
    imageKey: 'SERVICE_CERTIFICATION',
    imageFallback: IMAGES.SERVICE_CERTIFICATION,
    description:
      'ISO 22000 food safety certification, HACCP implementation, internal and external auditing, regulatory compliance, and quality management system certification services.',
  },
  {
    icon: ScienceIcon,
    title: 'Testing Services',
    path: ROUTES.SERVICES_TESTING,
    imageKey: 'SERVICE_GMO_TESTING',
    imageFallback: IMAGES.SERVICE_GMO_TESTING,
    description:
      'Comprehensive testing services including GMO testing, food product microbiology, and quality analysis. PCR-based detection and advanced equipment for accurate and reliable results.',
  },
  {
    icon: LocalHospitalIcon,
    title: 'Clinical Research',
    path: ROUTES.SERVICES_CLINICAL_RESEARCH,
    imageKey: 'SERVICE_CLINICAL_DIAGNOSTICS',
    imageFallback: IMAGES.SERVICE_CLINICAL_DIAGNOSTICS,
    description:
      'Advanced clinical research and medical testing including thyroid profiling, dengue detection, sepsis bacteria identification, vitamin assessments, and molecular diagnostics with rapid turnaround.',
  },
];

function Services() {
  const navigate = useNavigate();
  const { getImage } = useConfig();
  const { isDarkMode } = useUI();
  const cardsAnim = useScrollAnimation({ threshold: 0.1 });

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/919943712383?text=' + encodeURIComponent('Hi! I would like to know more about your services.'),
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="Services"
        description="Explore Uyirgene International's services: microbiology research, auditing and certifications, food & environmental testing, clinical diagnostics, and training."
        path="/services"
      />
      <Breadcrumb items={[{ label: 'Services', path: ROUTES.SERVICES }]} />

      {/* Hero */}
      <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 6 }}>
        <CardMedia
          component="img"
          image={getImage('ABOUT_MISSION', IMAGES.ABOUT_MISSION)}
          alt="Uyirgene Services"
          sx={{ objectFit: 'cover', filter: 'brightness(0.35)', height: { xs: 180, sm: 220, md: 260 } }}
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
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight={700}
            sx={{ color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
          >
            Our Services
          </Typography>
          <Typography
            variant="h6"
            sx={{ maxWidth: 700, mx: 'auto', color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}
          >
            Comprehensive scientific research, testing, certification, and diagnostic services powered by expert professionals and advanced technology.
          </Typography>
        </Box>
      </Box>

      {/* Service Cards */}
      <Box ref={cardsAnim.ref}>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                role="button"
                tabIndex={0}
                sx={{
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  opacity: cardsAnim.isVisible ? 1 : 0,
                  transform: cardsAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: isDarkMode
                      ? '0 12px 32px rgba(0,0,0,0.5)'
                      : '0 12px 32px rgba(0,0,0,0.12)',
                  },
                  '&:hover .service-overlay': { opacity: 1 },
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                }}
                onClick={() => navigate(service.path)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(service.path)}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={getImage(service.imageKey, service.imageFallback)}
                    alt={service.title}
                    sx={{ objectFit: 'cover', height: 180 }}
                  />
                  <Box
                    className="service-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to top, rgba(79,102,114,0.6), transparent)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      pb: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                      Explore Now
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <service.icon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h5" fontWeight={600}>
                      {service.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ flex: 1, lineHeight: 1.7, mb: 2 }}>
                    {service.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(service.path);
                    }}
                    fullWidth
                  >
                    Explore Now
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Bottom CTA */}
      <Paper
        sx={{
          p: { xs: 4, md: 6 },
          mt: 6,
          textAlign: 'center',
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(79,102,114,0.2) 0%, rgba(22,22,22,0.4) 100%)'
            : 'linear-gradient(135deg, rgba(69,90,100,0.08) 0%, rgba(255,255,255,0.95) 100%)',
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Need More Information?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          Get in touch with our experts to learn how our services can support your organization.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsApp}
            sx={{ px: 4, py: 1.5, bgcolor: '#25D366', '&:hover': { bgcolor: '#1eba57' } }}
          >
            Talk to an Expert
          </Button>
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate(ROUTES.COURSES)}
            sx={{ px: 4, py: 1.5 }}
          >
            View Courses
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Services;
