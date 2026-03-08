import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import ContrastIcon from '@mui/icons-material/Contrast';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Breadcrumb, Button, SEO } from '../components/common';

function Accessibility() {
  const features = [
    {
      icon: KeyboardIcon,
      title: 'Keyboard Navigation',
      description: 'All functionality is accessible using a keyboard. Use Tab to navigate, Enter to activate, and Escape to close dialogs.',
    },
    {
      icon: ContrastIcon,
      title: 'Color Contrast',
      description: 'We maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text to ensure readability.',
    },
    {
      icon: VolumeUpIcon,
      title: 'Screen Reader Support',
      description: 'Our platform is compatible with screen readers and includes proper ARIA labels and landmarks.',
    },
    {
      icon: AccessibilityNewIcon,
      title: 'Focus Indicators',
      description: 'Clear focus indicators help users navigate the interface and understand their current location.',
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <SEO title="Accessibility" description="Accessibility statement for Uyir Tech (Uyirgene International)'s learning platform." path="/accessibility" noindex />
      <Breadcrumb items={[{ label: 'Accessibility', path: '/accessibility' }]} />

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <AccessibilityNewIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Accessibility Statement
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Our commitment to making learning accessible to everyone.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Our Commitment
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Uyirgene is committed to ensuring digital accessibility for people with disabilities. We continually work to improve the user experience for everyone and apply the relevant accessibility standards.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities.
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom fontWeight={600}>
        Accessibility Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <feature.icon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Keyboard Shortcuts
        </Typography>
        <Box sx={{ '& p': { mb: 1, color: 'text.secondary' } }}>
          <Typography variant="body1">
            <strong>Tab:</strong> Move focus to the next interactive element
          </Typography>
          <Typography variant="body1">
            <strong>Shift + Tab:</strong> Move focus to the previous interactive element
          </Typography>
          <Typography variant="body1">
            <strong>Enter / Space:</strong> Activate buttons and links
          </Typography>
          <Typography variant="body1">
            <strong>Escape:</strong> Close modals and dialogs
          </Typography>
          <Typography variant="body1">
            <strong>Arrow Keys:</strong> Navigate within menus and lists
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Assistive Technologies
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Our website is designed to be compatible with the following assistive technologies:
        </Typography>
        <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
          <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
          <li>Screen magnification software</li>
          <li>Speech recognition software</li>
          <li>Keyboard-only navigation</li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Known Limitations
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          While we strive to ensure accessibility, some content may have limitations:
        </Typography>
        <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
          <li>Some older video content may not have captions (we are actively adding them)</li>
          <li>Third-party content may not meet our accessibility standards</li>
          <li>PDF documents may have varying levels of accessibility</li>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          We are continuously working to address these limitations.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Feedback
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We welcome your feedback on the accessibility of Uyirgene. Please let us know if you encounter any barriers or have suggestions for improvement.
        </Typography>
        <Button variant="contained" href="mailto:accessibility@uyirgene.com">
          Contact Accessibility Team
        </Button>
      </Paper>
    </Container>
  );
}

export default Accessibility;
