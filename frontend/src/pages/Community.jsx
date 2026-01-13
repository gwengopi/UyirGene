import React from 'react';
import { Container, Typography, Box, Grid, Paper, Avatar, AvatarGroup } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import GroupsIcon from '@mui/icons-material/Groups';
import EventIcon from '@mui/icons-material/Event';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Breadcrumb, Button } from '../components/common';

function Community() {
  const features = [
    {
      icon: ForumIcon,
      title: 'Discussion Forums',
      description: 'Connect with fellow learners, ask questions, and share knowledge in our active discussion forums.',
    },
    {
      icon: GroupsIcon,
      title: 'Study Groups',
      description: 'Join or create study groups to learn together and stay motivated throughout your journey.',
    },
    {
      icon: EventIcon,
      title: 'Live Events',
      description: 'Attend webinars, workshops, and Q&A sessions with instructors and industry experts.',
    },
    {
      icon: EmojiEventsIcon,
      title: 'Challenges',
      description: 'Participate in coding challenges and competitions to test and improve your skills.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Community Members' },
    { value: '500+', label: 'Daily Discussions' },
    { value: '50+', label: 'Study Groups' },
    { value: '100+', label: 'Events Hosted' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'Community', path: '/community' }]} />

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Join Our Community
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Learn together, grow together. Connect with thousands of learners from around the world.
        </Typography>
        <AvatarGroup max={7} sx={{ justifyContent: 'center', mb: 3 }}>
          {[...Array(10)].map((_, i) => (
            <Avatar key={i} sx={{ bgcolor: `hsl(${i * 36}, 70%, 50%)` }}>
              {String.fromCharCode(65 + i)}
            </Avatar>
          ))}
        </AvatarGroup>
        <Button variant="contained" size="large">
          Join Community
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Features */}
      <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 4 }}>
        Community Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper sx={{ p: 4, height: '100%' }}>
              <feature.icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
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

      {/* Guidelines */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Community Guidelines
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Our community is built on respect, inclusivity, and a passion for learning. Please follow these guidelines:
        </Typography>
        <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
          <li>Be respectful and supportive of fellow learners</li>
          <li>Share knowledge and help others when you can</li>
          <li>Keep discussions relevant and constructive</li>
          <li>No spam, self-promotion, or inappropriate content</li>
          <li>Protect your privacy and respect others' privacy</li>
        </Box>
      </Paper>

      {/* CTA */}
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.main' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Ready to Connect?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Join our community today and start learning with others.
        </Typography>
        <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
          Get Started
        </Button>
      </Paper>
    </Container>
  );
}

export default Community;
