import React from 'react';
import { Container, Typography, Box, Grid, Paper, Avatar } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Breadcrumb } from '../components/common';

function About() {
  const stats = [
    { label: 'Students', value: '10,000+', icon: GroupsIcon },
    { label: 'Courses', value: '50+', icon: SchoolIcon },
    { label: 'Certificates Issued', value: '5,000+', icon: EmojiEventsIcon },
  ];

  const team = [
    { name: 'John Doe', role: 'Founder & CEO', avatar: '' },
    { name: 'Jane Smith', role: 'Head of Education', avatar: '' },
    { name: 'Mike Johnson', role: 'Lead Instructor', avatar: '' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'About Us', path: '/about' }]} />

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          About Uyirgene
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Empowering learners worldwide with quality education and professional development opportunities.
        </Typography>
      </Box>

      {/* Mission Section */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Our Mission
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          At Uyirgene, we believe that education is the key to unlocking human potential. Our mission is to provide accessible, high-quality learning experiences that help individuals grow professionally and personally.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We are committed to creating an inclusive learning environment where everyone can thrive, regardless of their background or circumstances.
        </Typography>
      </Paper>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <stat.icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight={700}>
                {stat.value}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Story Section */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Our Story
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Uyirgene was founded with a simple idea: make quality education accessible to everyone. What started as a small initiative has grown into a thriving community of learners and educators.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Our platform brings together expert instructors, comprehensive course materials, and a supportive learning community to help you achieve your goals.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Today, we continue to expand our offerings and improve our platform to better serve our growing community of learners.
        </Typography>
      </Paper>

      {/* Team Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center">
          Meet Our Team
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {team.map((member, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                >
                  {member.name.charAt(0)}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {member.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.role}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Values Section */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Our Values
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Excellence
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We strive for excellence in everything we do, from course content to student support.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Accessibility
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Education should be accessible to everyone, regardless of their background.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Innovation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We continuously innovate to provide the best learning experience possible.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Community
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We foster a supportive community where learners can grow together.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default About;
