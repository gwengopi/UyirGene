import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  CardMedia,
  Avatar,
  Divider,
  Chip,
  Skeleton,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import DevicesIcon from '@mui/icons-material/Devices';
import ScienceIcon from '@mui/icons-material/Science';
import PeopleIcon from '@mui/icons-material/People';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GoogleIcon from '@mui/icons-material/Google';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BiotechIcon from '@mui/icons-material/Biotech';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SecurityIcon from '@mui/icons-material/Security';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button, SEO } from '../components/common';
import { organizationSchema } from '../components/common/SEO';
import FlagshipProgramCard from '../components/course/FlagshipProgramCard';
import { reviewService } from '../services';
import { flagshipService } from '../services/flagshipService';
import { useAuth, useToast, useConfig, useUI } from '../store';
import { useScrollAnimation, useAnimatedCounter } from '../hooks';
import { ROUTES, IMAGES } from '../utils/constants';

// Stat counter sub-component
function StatItem({ value, suffix, label, icon, isVisible }) {
  const { displayValue } = useAnimatedCounter(value, isVisible, { suffix, duration: 2000 });
  return (
    <Box sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
      <Box sx={{ color: 'primary.main', mb: 1 }}>{icon}</Box>
      <Typography variant="h3" fontWeight={700} color="primary.main">
        {displayValue}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showError } = useToast();
  const { getImage } = useConfig();
  const { isDarkMode } = useUI();
  const [flagshipPrograms, setFlagshipPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [googleReviewLink, setGoogleReviewLink] = useState('');

  // Scroll animation refs
  const statsAnim = useScrollAnimation({ threshold: 0.2 });
  const featuresAnim = useScrollAnimation({ threshold: 0.1 });
  const servicesAnim = useScrollAnimation({ threshold: 0.1 });
  const coursesAnim = useScrollAnimation({ threshold: 0.1 });
  const testimonialsAnim = useScrollAnimation({ threshold: 0.1 });
  const certsAnim = useScrollAnimation({ threshold: 0.2 });
  const ctaAnim = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    const loadFlagshipPrograms = async () => {
      try {
        const programs = await flagshipService.getActivePrograms();
        setFlagshipPrograms(programs);
      } catch {
        // Non-critical — section will be hidden
      } finally {
        setLoading(false);
      }
    };
    loadFlagshipPrograms();

    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviews();
        if (Array.isArray(data)) {
          setReviews(data);
        } else {
          setReviews(data.reviews || []);
          if (data.googleReviewLink) setGoogleReviewLink(data.googleReviewLink);
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
      }
    };
    loadReviews();
  }, [showError]);

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 48 }} />,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with real-world experience in ISO & Regulatory compliance',
      image: getImage('COURSE_TRAINERS', IMAGES.COURSE_TRAINERS),
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 48 }} />,
      title: 'Certification Support',
      description: 'Earn certificates upon course completion to showcase your skills and boost your career',
      image: getImage('COURSE_CERTIFICATION', IMAGES.COURSE_CERTIFICATION),
    },
    {
      icon: <ScienceIcon sx={{ fontSize: 48 }} />,
      title: 'Practical Learning',
      description: 'Hands-on training with real-world case studies and practical exercises',
      image: getImage('COURSE_PRACTICAL', IMAGES.COURSE_PRACTICAL),
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 48 }} />,
      title: 'Learn Anywhere',
      description: 'Access courses on any device, anytime, anywhere with our responsive platform',
      image: getImage('COURSE_REGULATORY', IMAGES.COURSE_REGULATORY),
    },
  ];

  const servicesList = [
    {
      icon: <MenuBookIcon sx={{ fontSize: 44 }} />,
      title: 'Training',
      description: 'Professional online courses in ISO standards, food safety, quality management and life sciences.',
      image: getImage('SERVICE_LEARNING', IMAGES.SERVICE_LEARNING),
      path: ROUTES.SERVICES_LEARNING,
    },
    {
      icon: <BiotechIcon sx={{ fontSize: 44 }} />,
      title: 'Microbial Research',
      description: 'Environmental, food, and product microbiology testing with advanced lab technology.',
      image: getImage('SERVICE_MICROBIOLOGY', IMAGES.SERVICE_MICROBIOLOGY),
      path: ROUTES.SERVICES_MICROBIOLOGY,
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 44 }} />,
      title: 'Auditing and Certifications',
      description: 'ISO auditing, food safety certification, and quality management system compliance services.',
      image: getImage('SERVICE_CERTIFICATION', IMAGES.SERVICE_CERTIFICATION),
      path: ROUTES.SERVICES_CERTIFICATION,
    },
    {
      icon: <ScienceIcon sx={{ fontSize: 44 }} />,
      title: 'Testing',
      description: 'Comprehensive testing services including GMO detection using molecular biology techniques.',
      image: getImage('SERVICE_GMO_TESTING', IMAGES.SERVICE_GMO_TESTING),
      path: ROUTES.SERVICES_TESTING,
    },
    {
      icon: <LocalHospitalIcon sx={{ fontSize: 44 }} />,
      title: 'Clinical Research',
      description: 'Clinical research, pathogen identification, and advanced medical testing.',
      image: getImage('SERVICE_CLINICAL_DIAGNOSTICS', IMAGES.SERVICE_CLINICAL_DIAGNOSTICS),
      path: ROUTES.SERVICES_CLINICAL_RESEARCH,
    },
  ];

  const statistics = [
    { value: 5000, suffix: '+', label: 'Professionals Trained', icon: <PeopleIcon sx={{ fontSize: 40 }} /> },
    { value: 50, suffix: '+', label: 'Professional Courses', icon: <SchoolIcon sx={{ fontSize: 40 }} /> },
    { value: 15, suffix: '+', label: 'Expert Trainers', icon: <WorkspacePremiumIcon sx={{ fontSize: 40 }} /> },
    { value: 100, suffix: '%', label: 'Satisfaction Rate', icon: <ThumbUpIcon sx={{ fontSize: 40 }} /> },
  ];


  const certifications = [
    { icon: <SecurityIcon sx={{ fontSize: 36 }} />, label: 'ISO 9001 Certified' },
    { icon: <HandshakeIcon sx={{ fontSize: 36 }} />, label: 'Skill India Digital Hub Partner' },
  ];

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/919943712383?text=' + encodeURIComponent('Hi! I would like to know more about your courses.'),
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <Box>
      <SEO
        title="Home"
        description="Uyirgene International - Professional Training Institute | ISO 9001 Certified | Courses in Food Safety, Quality Management, Microbiology, ISO Standards & more."
        path="/"
        structuredData={organizationSchema()}
      />
      {/* ===== SECTION 1: Hero — Full-screen immersive background ===== */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '100vh', md: '88vh' },
          mt: { xs: '-48px', sm: '-52px' },
          pt: { xs: '48px', sm: '52px' },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          /* Keyframes used only inside this hero section */
          '@keyframes heroFadeUp': {
            from: { opacity: 0, transform: 'translateY(40px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes heroBgZoom': {
            from: { transform: 'scale(1.08)' },
            to: { transform: 'scale(1)' },
          },
          '@keyframes heroFloat': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-12px)' },
          },
          '@keyframes heroPulseRing': {
            '0%': { transform: 'scale(1)', opacity: 0.5 },
            '100%': { transform: 'scale(1.8)', opacity: 0 },
          },
          '@keyframes heroScrollBounce': {
            '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
            '40%': { transform: 'translateY(8px)' },
            '60%': { transform: 'translateY(4px)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            '& *': {
              animation: 'none !important',
              transition: 'none !important',
            },
          },
        }}
      >
        {/* Full background image with slow zoom animation */}
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${getImage('HERO_MAIN', IMAGES.HERO_MAIN)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            animation: 'heroBgZoom 20s ease-out forwards',
            zIndex: 0,
          }}
        />

        {/* Gradient overlay for text readability */}
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: [
              'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.4) 100%)',
              'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 60%)',
            ].join(', '),
            zIndex: 1,
          }}
        />

        {/* Decorative floating shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%', right: '8%',
            width: { xs: 60, md: 120 },
            height: { xs: 60, md: 120 },
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.08)',
            animation: 'heroFloat 6s ease-in-out infinite',
            zIndex: 2,
            display: { xs: 'none', sm: 'block' },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%', right: '15%',
            width: { xs: 30, md: 60 },
            height: { xs: 30, md: 60 },
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.06)',
            animation: 'heroFloat 8s ease-in-out infinite 1s',
            zIndex: 2,
            display: { xs: 'none', sm: 'block' },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '35%', left: '5%',
            width: 40,
            height: 40,
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.05)',
            transform: 'rotate(45deg)',
            animation: 'heroFloat 7s ease-in-out infinite 2s',
            zIndex: 2,
            display: { xs: 'none', md: 'block' },
          }}
        />

        {/* Hero content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3, py: { xs: 12, md: 0 } }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left: main text block */}
            <Grid item xs={12} md={7}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {/* Logo */}
                <Box
                  component="img"
                  src={getImage('LOGO_MAIN', IMAGES.LOGO)}
                  alt="Uyirgene International"
                  sx={{
                    height: { xs: 40, md: 55 },
                    mb: 3,
                    filter: 'brightness(1.3) drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                    animation: 'heroFadeUp 0.8s ease-out both',
                  }}
                />

                {/* Heading with gradient accent */}
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    color: '#fff',
                    lineHeight: 1.15,
                    fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' },
                    animation: 'heroFadeUp 0.8s ease-out 0.15s both',
                    textShadow: '0 2px 30px rgba(0,0,0,0.25)',
                    mb: 1,
                  }}
                >
                  Professional Training Courses
                </Typography>
                <Typography
                  variant="h2"
                  component="span"
                  sx={{
                    display: 'block',
                    fontWeight: 800,
                    fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' },
                    lineHeight: 1.15,
                    background: 'linear-gradient(90deg, #64B5F6 0%, #81D4FA 50%, #B2EBF2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'heroFadeUp 0.8s ease-out 0.25s both',
                    mb: 3,
                  }}
                >
                  for Scientific Excellence
                </Typography>

                {/* Subtitle */}
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    mb: 4,
                    maxWidth: { md: 520 },
                    mx: { xs: 'auto', md: 0 },
                    fontWeight: 400,
                    lineHeight: 1.7,
                    animation: 'heroFadeUp 0.8s ease-out 0.4s both',
                    textShadow: '0 1px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  Industry-oriented training, HACCP certification, microbiology courses, and scientific laboratory training trusted by professionals, CROs, and food & pharma industries.
                </Typography>

                {/* CTA buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    animation: 'heroFadeUp 0.8s ease-out 0.55s both',
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(ROUTES.COURSES)}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 3,
                      py: 1,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(79, 102, 114, 0.5)',
                    }}
                  >
                    Explore Courses
                  </Button>
                  {!isAuthenticated() && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate(ROUTES.REGISTER)}
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        px: 3,
                        py: 1,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.4)',
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        '&:hover': {
                          borderColor: '#fff',
                          backgroundColor: 'rgba(255,255,255,0.15)',
                        },
                      }}
                    >
                      Get Started Free
                    </Button>
                  )}
                </Box>

                {/* Trust badges row */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 2, md: 4 },
                    mt: 3,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    animation: 'heroFadeUp 0.8s ease-out 0.7s both',
                  }}
                >
                  {[
                    { val: '5000+', label: 'Professionals Trained' },
                    { val: '50+', label: 'Professional Courses' },
                    { val: 'ISO', label: 'Certified Institute' },
                  ].map((stat, i) => (
                    <Box
                      key={i}
                      sx={{
                        textAlign: 'center',
                        px: { xs: 1, md: 2 },
                        borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                        pr: i < 2 ? { xs: 2, md: 4 } : 0,
                      }}
                    >
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                        {stat.val}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.65rem' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Right: floating glass card with course preview (desktop only) */}
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  animation: 'heroFadeUp 1s ease-out 0.6s both',
                }}
              >
                {/* Glow ring behind the card */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: 280, height: 280,
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(100,181,246,0.15) 0%, transparent 70%)',
                    animation: 'heroPulseRing 4s ease-out infinite',
                  }}
                />
                {/* Glass card */}
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(ROUTES.COURSES)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.COURSES)}
                  sx={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 4,
                    p: 3,
                    width: 320,
                    animation: 'heroFloat 6s ease-in-out infinite',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                      borderColor: 'rgba(255,255,255,0.25)',
                    },
                    '&:focus-visible': { outline: '2px solid rgba(255,255,255,0.6)', outlineOffset: 2 },
                  }}
                >
                  {/* Mini course image */}
                  <Box
                    component="img"
                    src={getImage('HERO_STUDENTS', IMAGES.HERO_STUDENTS)}
                    alt="Students learning"
                    sx={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                      borderRadius: 2,
                      mb: 2,
                    }}
                  />
                  <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                    Start Your Learning Journey
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, lineHeight: 1.6 }}>
                    ISO Auditing, Food Safety, Quality Management & more professional courses.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex' }}>
                      {['P', 'R', 'A'].map((letter, i) => (
                        <Avatar
                          key={i}
                          sx={{
                            width: 28, height: 28,
                            bgcolor: `hsl(${200 + i * 30}, 60%, ${50 + i * 5}%)`,
                            fontSize: '0.75rem',
                            border: '2px solid rgba(255,255,255,0.15)',
                            ml: i > 0 ? -1 : 0,
                          }}
                        >
                          {letter}
                        </Avatar>
                      ))}
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      5000+ professionals trained
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Scroll indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'heroFadeUp 0.8s ease-out 1s both',
            cursor: 'pointer',
          }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontSize: '0.6rem', mb: 0.5 }}>
            Scroll Down
          </Typography>
          <KeyboardArrowDownIcon
            sx={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 28,
              animation: 'heroScrollBounce 2s ease infinite',
            }}
          />
        </Box>
      </Box>

      {/* ===== SECTION 3: Why Choose Us ===== */}
      <Box
        ref={featuresAnim.ref}
        sx={{
          py: { xs: 6, md: 8 },
          background: isDarkMode ? undefined : '#f4f6fb',
          opacity: featuresAnim.isVisible ? 1 : 0,
          transform: featuresAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight={600}>
            Why Choose Uyirgene?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            We provide the best learning experience with cutting-edge courses and professional certification.
          </Typography>

          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    height: '100%',
                    opacity: featuresAnim.isVisible ? 1 : 0,
                    transform: featuresAnim.isVisible ? 'translateY(0)' : 'translateY(40px)',
                    transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
                  }}
                >
                  <Paper
                    elevation={isDarkMode ? 1 : 0}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(ROUTES.COURSES)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.COURSES)}
                    sx={{
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      borderRadius: 3,
                      cursor: 'pointer',
                      background: isDarkMode ? undefined : '#ffffff',
                      border: isDarkMode ? undefined : '1px solid rgba(69,90,100,0.08)',
                      boxShadow: isDarkMode ? undefined : '0 2px 12px rgba(69,90,100,0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: isDarkMode
                          ? '0 12px 24px rgba(0, 0, 0, 0.6)'
                          : '0 12px 36px rgba(69,90,100,0.18)',
                      },
                      '&:hover .feature-card-overlay': { opacity: 1 },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                    }}
                  >
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <CardMedia
                        component="img"
                        image={feature.image}
                        alt={feature.title}
                        sx={{ height: 160, objectFit: 'cover' }}
                      />
                      <Box
                        className="feature-card-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0, bottom: 0,
                          background: 'linear-gradient(to top, rgba(38, 50, 56, 0.7), transparent)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        }}
                      />
                    </Box>
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1.5,
                          mx: 'auto',
                          flexShrink: 0,
                          color: isDarkMode ? 'primary.main' : '#fff',
                          background: isDarkMode
                            ? 'rgba(79,102,114,0.15)'
                            : 'linear-gradient(135deg, #37474f, #546e7a)',
                          boxShadow: isDarkMode ? undefined : '0 4px 12px rgba(55,71,79,0.25)',
                        }}
                      >
                        {React.cloneElement(feature.icon, { sx: { fontSize: 26 } })}
                      </Box>
                      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ fontSize: '1.05rem', flexShrink: 0 }}>
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== SECTION 3.5: Our Services ===== */}
      <Box
        ref={servicesAnim.ref}
        sx={{
          py: { xs: 6, md: 8 },
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(79,102,114,0.12) 0%, rgba(22,22,22,0.25) 100%)'
            : '#ffffff',
          opacity: servicesAnim.isVisible ? 1 : 0,
          transform: servicesAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight={600}>
            Our Services
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Beyond training, we offer scientific research, testing, certification, and diagnostic services.
          </Typography>

          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {servicesList.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    height: '100%',
                    opacity: servicesAnim.isVisible ? 1 : 0,
                    transform: servicesAnim.isVisible ? 'translateY(0)' : 'translateY(40px)',
                    transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
                  }}
                >
                  <Paper
                    elevation={isDarkMode ? 1 : 0}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(service.path)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(service.path)}
                    sx={{
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: isDarkMode ? undefined : '#f7f9fc',
                      border: isDarkMode ? undefined : '1px solid rgba(69,90,100,0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        background: isDarkMode ? undefined : '#ffffff',
                        boxShadow: isDarkMode
                          ? '0 12px 24px rgba(0,0,0,0.5)'
                          : '0 12px 32px rgba(69,90,100,0.14)',
                      },
                      '&:hover .service-card-overlay': { opacity: 1 },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                    }}
                  >
                    <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
                      <CardMedia
                        component="img"
                        image={service.image}
                        alt={service.title}
                        sx={{ height: 160, objectFit: 'cover' }}
                      />
                      <Box
                        className="service-card-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0, bottom: 0,
                          background: 'linear-gradient(to top, rgba(38, 50, 56, 0.7), transparent)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        }}
                      />
                    </Box>
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          flexShrink: 0,
                          color: isDarkMode ? 'primary.main' : '#fff',
                          background: isDarkMode
                            ? 'rgba(79,102,114,0.15)'
                            : 'linear-gradient(135deg, #455a64, #607d8b)',
                          boxShadow: isDarkMode ? undefined : '0 4px 12px rgba(69,90,100,0.2)',
                        }}
                      >
                        {service.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: '1.05rem', flexShrink: 0 }}>
                        {service.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {service.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(ROUTES.SERVICES)}
            >
              View All Services
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ===== SECTION 4: Flagship Programmes ===== */}
      <Box
        ref={coursesAnim.ref}
        sx={{
          background: isDarkMode
            ? 'linear-gradient(180deg, rgba(22,22,22,1) 0%, rgba(30,30,30,1) 100%)'
            : 'linear-gradient(180deg, #f4f6fb 0%, #eef1f6 100%)',
          py: { xs: 6, md: 10 },
          opacity: coursesAnim.isVisible ? 1 : 0,
          transform: coursesAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: { xs: 4, md: 5 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  letterSpacing: 3,
                  fontSize: '0.75rem',
                  mb: 0.5,
                  display: 'block',
                }}
              >
                OUR PROGRAMMES
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                fontWeight={700}
                sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}
              >
                Flagship Programmes
              </Typography>
            </Box>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(ROUTES.COURSES_FLAGSHIP)}
              sx={{ borderRadius: 2, fontWeight: 600, flexShrink: 0 }}
            >
              View All Programs
            </Button>
          </Box>

          {/* Flagship Programs Grid */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 3 }} animation="wave" />
                </Grid>
              ))}
            </Grid>
          ) : flagshipPrograms.length > 0 ? (
            <Grid container spacing={3}>
              {flagshipPrograms.slice(0, 3).map((program) => (
                <Grid item xs={12} sm={6} md={4} key={program.id}>
                  <FlagshipProgramCard program={program} />
                </Grid>
              ))}
            </Grid>
          ) : null}
        </Container>
      </Box>

      {/* ===== SECTION 5: Testimonials / Google Reviews ===== */}
      {reviews.length > 0 && (
      <Box
        ref={testimonialsAnim.ref}
        sx={{
          py: { xs: 6, md: 8 },
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(79,102,114,0.12) 0%, rgba(22,22,22,0.25) 100%)'
            : '#ffffff',
          opacity: testimonialsAnim.isVisible ? 1 : 0,
          transform: testimonialsAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography variant="h4" component="h2" fontWeight={700} gutterBottom>
              What Our Students Say
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 560, mx: 'auto' }}
            >
              Real feedback from professionals who have advanced their careers with Uyirgene.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {reviews.slice(0, 6).map((review, index) => (
              <Grid item xs={12} sm={6} md={4} key={review.id || index}>
                <Box
                  sx={{
                    opacity: testimonialsAnim.isVisible ? 1 : 0,
                    transform: testimonialsAnim.isVisible ? 'translateY(0)' : 'translateY(40px)',
                    transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
                    height: '100%',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 0,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      background: isDarkMode
                        ? 'rgba(255,255,255,0.04)'
                        : '#f7f9fc',
                      border: '1px solid',
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(69,90,100,0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        background: isDarkMode ? 'rgba(255,255,255,0.06)' : '#ffffff',
                        boxShadow: isDarkMode
                          ? '0 16px 40px rgba(0,0,0,0.4)'
                          : '0 12px 36px rgba(69,90,100,0.14)',
                      },
                    }}
                  >
                    {/* Accent bar */}
                    <Box
                      sx={{
                        height: 4,
                        background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)',
                      }}
                    />

                    <Box sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Header: Stars + Google badge */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            star <= (review.rating || 5)
                              ? <StarIcon key={star} sx={{ fontSize: 20, color: '#FBBC05' }} />
                              : <StarBorderIcon key={star} sx={{ fontSize: 20, color: isDarkMode ? 'rgba(251,188,5,0.3)' : 'rgba(251,188,5,0.4)' }} />
                          ))}
                        </Box>
                        {review.source === 'GOOGLE_API' && (
                          <GoogleIcon sx={{ fontSize: 18, color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }} />
                        )}
                      </Box>

                      {/* Quote */}
                      <Box sx={{ position: 'relative', flex: 1, mb: 2.5 }}>
                        <FormatQuoteIcon
                          sx={{
                            position: 'absolute',
                            top: -6,
                            left: -4,
                            fontSize: 32,
                            color: 'primary.main',
                            opacity: 0.15,
                            transform: 'scaleX(-1)',
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            pl: 3,
                            lineHeight: 1.75,
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: { sm: 112 },
                          }}
                        >
                          {review.reviewText}
                        </Typography>
                      </Box>

                      {/* Divider */}
                      <Divider sx={{ mb: 2, borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

                      {/* Author */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={review.profilePhotoUrl || undefined}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'primary.main',
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          {review.authorName?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {review.authorName}
                          </Typography>
                          {review.relativeTimeDescription && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {review.relativeTimeDescription}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            ))}
          </Grid>

          {googleReviewLink && (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                onClick={() => window.open(googleReviewLink, '_blank', 'noopener,noreferrer')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Review us on Google
              </Button>
            </Box>
          )}
        </Container>
      </Box>
      )}

      {/* ===== SECTION 6: Trusted & Certified ===== */}
      <Box
        ref={certsAnim.ref}
        sx={{
          background: isDarkMode
            ? 'rgba(79, 102, 114, 0.12)'
            : 'linear-gradient(135deg, #f4f6fb 0%, #eef1f6 100%)',
          py: { xs: 5, md: 6 },
          opacity: certsAnim.isVisible ? 1 : 0,
          transform: certsAnim.isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h5" textAlign="center" gutterBottom fontWeight={600}>
            Trusted &amp; Certified
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: { xs: 2, md: 4 },
              mt: 3,
            }}
          >
            {certifications.map((cert, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(69,90,100,0.1)',
                  boxShadow: isDarkMode ? undefined : '0 2px 8px rgba(69,90,100,0.06)',
                }}
              >
                <Box sx={{ color: 'primary.main' }}>{cert.icon}</Box>
                <Typography variant="body2" fontWeight={600}>
                  {cert.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ===== SECTION 7: CTA — Full immersive background ===== */}
      <Box
        ref={ctaAnim.ref}
        sx={{
          position: 'relative',
          py: { xs: 10, md: 14 },
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Full background image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${getImage('BG_TECHNOLOGY', IMAGES.BG_TECHNOLOGY)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: { md: 'fixed' },
            zIndex: 0,
          }}
        />
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(79,102,114,0.6) 100%)',
            zIndex: 1,
          }}
        />
        <Container
          maxWidth="md"
          sx={{
            position: 'relative',
            zIndex: 2,
            color: '#fff',
            opacity: ctaAnim.isVisible ? 1 : 0,
            transform: ctaAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight={700}
            gutterBottom
            sx={{
              color: '#fff',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
              fontSize: { xs: '1.8rem', md: '2.5rem' },
            }}
          >
            Ready to Transform Your Career?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 5,
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 560,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            Join thousands of professionals who trust Uyirgene for quality training and certification.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(isAuthenticated() ? ROUTES.COURSES : ROUTES.REGISTER)}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(79, 102, 114, 0.5)',
              }}
            >
              {isAuthenticated() ? 'Browse Courses' : 'Create Free Account'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<WhatsAppIcon />}
              onClick={handleWhatsApp}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                '&:hover': {
                  borderColor: '#25D366',
                  backgroundColor: 'rgba(37,211,102,0.15)',
                  color: '#25D366',
                },
              }}
            >
              Talk to an Expert
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ===== Statistics ===== */}
      <Box
        ref={statsAnim.ref}
        sx={{
          position: 'relative',
          py: { xs: 6, md: 8 },
          overflow: 'hidden',
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(79,102,114,0.15) 0%, rgba(22,22,22,0.3) 100%)'
            : 'linear-gradient(160deg, #263238 0%, #37474f 50%, #455a64 100%)',
          opacity: statsAnim.isVisible ? 1 : 0,
          transform: statsAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {statistics.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    textAlign: 'center',
                    p: { xs: 2, md: 3 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRadius: 3,
                    background: isDarkMode
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(255,255,255,0.1)',
                    backdropFilter: isDarkMode ? undefined : 'blur(8px)',
                    border: '1px solid',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)',
                    transition: 'transform 0.3s ease, background 0.3s ease',
                    '& .MuiTypography-root': isDarkMode ? {} : { color: '#fff' },
                    '& .MuiBox-root': isDarkMode ? {} : { color: 'rgba(255,255,255,0.85)' },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: isDarkMode
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(255,255,255,0.18)',
                    },
                  }}
                >
                  <StatItem {...stat} isVisible={statsAnim.isVisible} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;
