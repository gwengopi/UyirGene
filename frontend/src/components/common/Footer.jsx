import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { ROUTES } from '../../utils/constants';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'Courses', path: ROUTES.COURSES },
      { label: 'About Us', path: '/about' },
      { label: 'Blog', path: '/blog' },
      { label: 'Careers', path: '/careers' },
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'FAQs', path: '/faq' },
      { label: 'Community', path: '/community' },
    ],
    legal: [
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'Accessibility', path: '/accessibility' },
    ],
  };

  const socialLinks = [
    { label: 'Facebook', icon: <FacebookIcon />, url: 'https://facebook.com' },
    { label: 'Twitter', icon: <TwitterIcon />, url: 'https://twitter.com' },
    { label: 'LinkedIn', icon: <LinkedInIcon />, url: 'https://linkedin.com' },
    { label: 'YouTube', icon: <YouTubeIcon />, url: 'https://youtube.com' },
  ];

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
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Uyirgene
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Empowering learners worldwide with quality education and professional courses.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  aria-label={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Platform links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Platform
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
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
                </li>
              ))}
            </Box>
          </Grid>

          {/* Support links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Support
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.support.map((link) => (
                <li key={link.label}>
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
                </li>
              ))}
            </Box>
          </Grid>

          {/* Legal links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Legal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
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
                </li>
              ))}
            </Box>
          </Grid>
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
            &copy; {currentYear} Uyirgene. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Made with care for learners everywhere
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
