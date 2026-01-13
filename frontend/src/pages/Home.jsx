import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import DevicesIcon from '@mui/icons-material/Devices';
import { Button } from '../components/common';
import { CourseCard } from '../components/course';
import { courseService } from '../services';
import { useAuth, useToast } from '../store';
import { ROUTES } from '../utils/constants';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showError } = useToast();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedCourses = async () => {
      try {
        const courses = await courseService.getAllCourses();
        setFeaturedCourses(courses.slice(0, 3));
      } catch (error) {
        showError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCourses();
  }, [showError]);

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 48 }} />,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with real-world experience',
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 48 }} />,
      title: 'Certificates',
      description: 'Earn certificates upon course completion to showcase your skills',
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 48 }} />,
      title: 'Learn Anywhere',
      description: 'Access courses on any device, anytime, anywhere',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(79, 102, 114, 0.3) 0%, rgba(22, 22, 22, 1) 100%)',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Unlock Your Potential with Uyirgene
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Transform your career with expert-led courses designed to help you succeed in today's digital world.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(ROUTES.COURSES)}
            >
              Explore Courses
            </Button>
            {!isAuthenticated() && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(ROUTES.REGISTER)}
              >
                Get Started Free
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
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

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
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
      </Container>

      {/* Featured Courses Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" fontWeight={600}>
              Featured Courses
            </Typography>
            <Button variant="text" onClick={() => navigate(ROUTES.COURSES)}>
              View All Courses
            </Button>
          </Box>

          <Grid container spacing={3}>
            {loading
              ? [1, 2, 3].map((i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <CourseCard loading />
                  </Grid>
                ))
              : featuredCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <CourseCard course={course} />
                  </Grid>
                ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
          Ready to Start Learning?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Join thousands of learners who have transformed their careers with Uyirgene.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(isAuthenticated() ? ROUTES.COURSES : ROUTES.REGISTER)}
        >
          {isAuthenticated() ? 'Browse Courses' : 'Create Free Account'}
        </Button>
      </Container>
    </Box>
  );
}

export default Home;
