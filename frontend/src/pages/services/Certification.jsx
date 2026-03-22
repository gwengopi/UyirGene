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
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LockIcon from '@mui/icons-material/Lock';
import GroupsIcon from '@mui/icons-material/Groups';
import { Button, Breadcrumb, SEO } from '../../components/common';
import { useScrollAnimation } from '../../hooks';
import { useConfig, useUI } from '../../store';
import { serviceCertificationService } from '../../services';

const DEFAULT_DESCRIPTION = `Uyir Tech International is an ISO 9001 certified independent organization collaborated with Uyirgenetics Research Pvt Ltd, globally providing certification services and professional development training in Food Safety, FSMS, QMS, HACCP certification, and Industrial Microbiology Technical Programs for students, individuals, and organizations.

Certification of your management system demonstrates your commitment to controlling hazards and managing the safety and quality of your products and services.`;
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

function CertificationCard({ certification, onClick, index, isVisible }) {
  const { isDarkMode } = useUI();
  const { getImage } = useConfig();
  const thumbnailUrl = certification.thumbnailImageUrl
    ? `${getApiBaseUrl()}${certification.thumbnailImageUrl}`
    : getImage('SERVICE_CERTIFICATION', IMAGES.SERVICE_CERTIFICATION);

  return (
    <Paper
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
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
        '&:hover .cert-image': {
          transform: 'scale(1.05)',
        },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={thumbnailUrl}
          alt={certification.title}
          className="cert-image"
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
          icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
          label="Certification"
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
          {certification.title}
        </Typography>
        {certification.subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {certification.subtitle}
          </Typography>
        )}
        {certification.keyElements && certification.keyElements.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2, flex: 1 }}>
            {certification.keyElements.slice(0, 3).map((elem, i) => (
              <Chip key={i} label={elem} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            ))}
            {certification.keyElements.length > 3 && (
              <Chip label={`+${certification.keyElements.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
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

function Certification() {
  const navigate = useNavigate();
  const { getImage, getText } = useConfig();
  const { isDarkMode } = useUI();
  const pageDescription = getText('CERTIFICATION_PAGE_DESCRIPTION', DEFAULT_DESCRIPTION);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const certsAnim = useScrollAnimation({ threshold: 0.1 });
  const whyAnim = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    const loadCertifications = async () => {
      try {
        const data = await serviceCertificationService.getPublishedCertifications();
        setCertifications(data);
      } catch (error) {
        console.error('Failed to load certifications:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCertifications();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="Auditing and Certifications"
        description="ISO auditing, food safety certification, FSSAI compliance, HACCP, internal and external audits, and quality management system certifications from Uyirgene International."
        path="/services/certification"
      />
      <Breadcrumb
        items={[
          { label: 'Services', path: ROUTES.SERVICES },
          { label: 'Auditing and Certifications', path: ROUTES.SERVICES_CERTIFICATION },
        ]}
      />

      {/* Hero */}
      <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 6 }}>
        <CardMedia
          component="img"
          image={getImage('SERVICE_CERTIFICATION', IMAGES.SERVICE_CERTIFICATION)}
          alt="ISO Certification"
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
            Auditing and Certifications
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, maxWidth: 700, mx: 'auto' }}>
            Global Auditing & Certification Services for Quality Management & Food Safety
          </Typography>
        </Box>
      </Box>

      {/* Overview */}
      <Paper sx={{ p: { xs: 3, md: 5 }, mb: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {pageDescription}
        </Typography>
      </Paper>

      {/* Certifications Grid */}
      <Box ref={certsAnim.ref} sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
          Our Certification Programs
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, maxWidth: 650, mx: 'auto' }}>
          Explore our comprehensive range of certification services designed to help your organization achieve excellence.
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
        ) : certifications.length > 0 ? (
          <Grid container spacing={3}>
            {certifications.map((cert, index) => (
              <Grid item xs={12} sm={6} md={4} key={cert.id}>
                <CertificationCard
                  certification={cert}
                  onClick={() => navigate(`/services/certification/${cert.slug || cert.id}`)}
                  index={index}
                  isVisible={certsAnim.isVisible}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <VerifiedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No certifications available at the moment
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
        <GroupsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Request a Quote
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 550, mx: 'auto' }}>
          Contact us today for certification services. Call +91-99 437 123 83 or submit an enquiry online.
        </Typography>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/contact')}
          sx={{ px: 4, py: 1.5 }}
        >
          Contact Us Now
        </Button>
      </Paper>
    </Container>
  );
}

export default Certification;
