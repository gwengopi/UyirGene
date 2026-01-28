import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Typography, Link, IconButton, Divider, Skeleton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import { IMAGES } from '../../utils/constants';
import { configService } from '../../services';

// Default fallback data
const DEFAULT_TAGLINE = 'Professional Training Institute | ISO 9001 Certified | Training Partner of Skill India Digital Hub (Govt of India)';
const DEFAULT_COPYRIGHT = 'Uyirgene International. All rights reserved.';
const DEFAULT_BOTTOM_TEXT = 'Excellence in Food Safety & Quality Training';

const DEFAULT_SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://facebook.com', icon: 'facebook' },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
  { name: 'YouTube', url: 'https://youtube.com', icon: 'youtube' },
];

const DEFAULT_PLATFORM_LINKS = [
  { label: 'Courses', path: '/courses' },
  { label: 'About Us', path: '/about' },
  { label: 'Blog', path: '/blogs' },
  { label: 'Careers', path: '/careers' },
];

const DEFAULT_SUPPORT_LINKS = [
  { label: 'Help Center', path: '/help' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'FAQs', path: '/faq' },
  { label: 'Verify Certificate', path: '/verify-certificate' },
  { label: 'Community', path: '/community' },
];

const DEFAULT_LEGAL_LINKS = [
  { label: 'Terms of Service', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Cookie Policy', path: '/cookies' },
  { label: 'Refund Policy', path: '/refund' },
  { label: 'Accessibility', path: '/accessibility' },
];

// Icon mapping
const ICON_MAP = {
  facebook: <FacebookIcon />,
  twitter: <TwitterIcon />,
  linkedin: <LinkedInIcon />,
  youtube: <YouTubeIcon />,
  whatsapp: <WhatsAppIcon />,
  instagram: <InstagramIcon />,
};

// Cache for footer config
let footerCache = null;
let footerCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function Footer() {
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    tagline: DEFAULT_TAGLINE,
    copyright: DEFAULT_COPYRIGHT,
    bottomText: DEFAULT_BOTTOM_TEXT,
    socialLinks: DEFAULT_SOCIAL_LINKS,
    platformLinks: DEFAULT_PLATFORM_LINKS,
    supportLinks: DEFAULT_SUPPORT_LINKS,
    legalLinks: DEFAULT_LEGAL_LINKS,
  });

  useEffect(() => {
    const loadFooterConfig = async () => {
      // Check cache first
      const now = Date.now();
      if (footerCache && (now - footerCacheTime) < CACHE_DURATION) {
        setConfig(footerCache);
        setLoading(false);
        return;
      }

      try {
        const data = await configService.getByCategory('FOOTER');

        // Parse the config map
        const newConfig = {
          tagline: data.FOOTER_TAGLINE || DEFAULT_TAGLINE,
          copyright: data.FOOTER_COPYRIGHT || DEFAULT_COPYRIGHT,
          bottomText: data.FOOTER_BOTTOM_TEXT || DEFAULT_BOTTOM_TEXT,
          socialLinks: parseJsonSafe(data.FOOTER_SOCIAL_LINKS, DEFAULT_SOCIAL_LINKS),
          platformLinks: parseJsonSafe(data.FOOTER_PLATFORM_LINKS, DEFAULT_PLATFORM_LINKS),
          supportLinks: parseJsonSafe(data.FOOTER_SUPPORT_LINKS, DEFAULT_SUPPORT_LINKS),
          legalLinks: parseJsonSafe(data.FOOTER_LEGAL_LINKS, DEFAULT_LEGAL_LINKS),
        };

        // Update cache
        footerCache = newConfig;
        footerCacheTime = now;

        setConfig(newConfig);
      } catch (error) {
        console.error('Failed to load footer config:', error);
        // Keep default values
      } finally {
        setLoading(false);
      }
    };

    loadFooterConfig();
  }, []);

  // Helper to safely parse JSON
  const parseJsonSafe = (jsonString, defaultValue) => {
    if (!jsonString) return defaultValue;
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  };

  // Get icon component by name
  const getIcon = (iconName) => {
    return ICON_MAP[iconName?.toLowerCase()] || <FacebookIcon />;
  };

  // Render link section
  const renderLinkSection = (title, links) => (
    <Grid item xs={6} sm={4} md={2}>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {links.map((link, index) => (
          <li key={link.label || index}>
            {link.path?.startsWith('http') ? (
              <Link
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                color="text.secondary"
                sx={{
                  display: 'block',
                  py: 0.5,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {link.label}
              </Link>
            ) : (
              <Link
                component={RouterLink}
                to={link.path}
                variant="body2"
                color="text.secondary"
                sx={{
                  display: 'block',
                  py: 0.5,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </Box>
    </Grid>
  );

  // Loading skeleton
  if (loading) {
    return (
      <Box
        component="footer"
        sx={{
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          mt: 'auto',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" width={120} height={50} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="circular" width={32} height={32} />
                ))}
              </Box>
            </Grid>
            {[1, 2, 3].map((section) => (
              <Grid item xs={6} sm={4} md={2} key={section}>
                <Skeleton variant="text" width={80} sx={{ mb: 1 }} />
                {[1, 2, 3, 4].map((link) => (
                  <Skeleton key={link} variant="text" width="70%" />
                ))}
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box
                component="img"
                src={IMAGES.LOGO}
                alt="Uyirgene International"
                sx={{ height: 50, filter: 'brightness(0.9)' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {config.tagline}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {config.socialLinks.map((social, index) => (
                <IconButton
                  key={social.name || index}
                  aria-label={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  {getIcon(social.icon)}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Platform links */}
          {renderLinkSection('Platform', config.platformLinks)}

          {/* Support links */}
          {renderLinkSection('Support', config.supportLinks)}

          {/* Legal links */}
          {renderLinkSection('Legal', config.legalLinks)}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} {config.copyright}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {config.bottomText}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
