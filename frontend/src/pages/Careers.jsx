import React from 'react';
import { Container, Typography, Box, Grid, Paper, Chip } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Breadcrumb, Button } from '../components/common';

function Careers() {
  const openPositions = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Chennai / Remote',
      type: 'Full-time',
      description: 'We are looking for an experienced frontend developer to help build our learning platform.',
    },
    {
      id: 2,
      title: 'Content Writer',
      department: 'Content',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create engaging educational content and course materials for our platform.',
    },
    {
      id: 3,
      title: 'Customer Success Manager',
      department: 'Operations',
      location: 'Chennai',
      type: 'Full-time',
      description: 'Help our students succeed by providing excellent support and guidance.',
    },
    {
      id: 4,
      title: 'Video Production Specialist',
      department: 'Content',
      location: 'Chennai',
      type: 'Contract',
      description: 'Produce high-quality video content for our online courses.',
    },
  ];

  const benefits = [
    'Competitive salary and equity',
    'Flexible work arrangements',
    'Health insurance coverage',
    'Learning and development budget',
    'Annual team retreats',
    'Unlimited paid time off',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'Careers', path: '/careers' }]} />

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Join Our Team
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Help us transform education and empower learners around the world.
        </Typography>
      </Box>

      {/* Why Join Us */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Why Join Uyirgene?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          At Uyirgene, we're on a mission to make quality education accessible to everyone.
          Join a team of passionate individuals who are dedicated to making a difference in
          people's lives through learning.
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    mr: 2,
                  }}
                />
                <Typography variant="body2">{benefit}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Open Positions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Open Positions
        </Typography>
        <Grid container spacing={3}>
          {openPositions.map((position) => (
            <Grid item xs={12} key={position.id}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {position.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {position.department}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {position.location}
                        </Typography>
                      </Box>
                      <Chip label={position.type} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {position.description}
                    </Typography>
                  </Box>
                  <Button variant="outlined">
                    Apply Now
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* No Suitable Position */}
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Don't see a suitable position?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
        </Typography>
        <Button variant="contained" href="mailto:careers@uyirgene.com">
          Send Your Resume
        </Button>
      </Paper>
    </Container>
  );
}

export default Careers;
