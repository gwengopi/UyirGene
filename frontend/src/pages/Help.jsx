import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Paper, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Breadcrumb, Button, SEO } from '../components/common';
import { useNavigate } from 'react-router-dom';

function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: SchoolIcon,
      title: 'Getting Started',
      description: 'Learn how to create an account and start your learning journey.',
      articles: 5,
    },
    {
      icon: VideoLibraryIcon,
      title: 'Courses & Content',
      description: 'Information about accessing courses, videos, and learning materials.',
      articles: 8,
    },
    {
      icon: PaymentIcon,
      title: 'Payments & Billing',
      description: 'Help with payments, refunds, and subscription management.',
      articles: 6,
    },
    {
      icon: AccountCircleIcon,
      title: 'Account Settings',
      description: 'Manage your profile, password, and notification preferences.',
      articles: 4,
    },
    {
      icon: CardMembershipIcon,
      title: 'Certificates',
      description: 'Learn about earning and downloading your course certificates.',
      articles: 3,
    },
    {
      icon: HelpOutlineIcon,
      title: 'Technical Issues',
      description: 'Troubleshooting common technical problems and errors.',
      articles: 7,
    },
  ];

  const popularArticles = [
    'How do I reset my password?',
    'How to enroll in a course?',
    'Can I get a refund for a course?',
    'How do I download my certificate?',
    'Video not playing - what should I do?',
    'How to track my course progress?',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO title="Help" description="Get help with Uyirgene International's learning platform. Find guides for enrollment, courses, payments and certifications." path="/help" />
      <Breadcrumb items={[{ label: 'Help Center', path: '/help' }]} />

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Help Center
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          How can we help you today?
        </Typography>
        <TextField
          fullWidth
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: 600 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Categories */}
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Browse by Category
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {categories.map((category, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <category.icon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {category.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {category.description}
              </Typography>
              <Typography variant="caption" color="primary.main">
                {category.articles} articles
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Popular Articles */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Popular Articles
        </Typography>
        <Grid container spacing={2}>
          {popularArticles.map((article, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="body2" color="primary.main">
                  {article}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Contact Support */}
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Still need help?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Our support team is here to assist you with any questions or issues.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/contact')}>
          Contact Support
        </Button>
      </Paper>
    </Container>
  );
}

export default Help;
