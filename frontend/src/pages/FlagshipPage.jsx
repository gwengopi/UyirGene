import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Grid } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Breadcrumb, SEO } from '../components/common';
import FlagshipProgramCard from '../components/course/FlagshipProgramCard';
import { flagshipService } from '../services/flagshipService';
import { ROUTES } from '../utils/constants';

function FlagshipPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    flagshipService.getActivePrograms()
      .then(setPrograms)
      .catch(() => setError('Failed to load flagship programs.'))
      .finally(() => setLoading(false));
  }, []);

  const breadcrumbItems = [
    { label: 'Courses', path: ROUTES.COURSES },
    { label: 'Flagship Programs' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="Flagship Programs"
        description="Explore our most comprehensive and industry-recognised certification programs at Uyirgene International."
        path="/courses/flagship"
      />
      <Breadcrumb items={breadcrumbItems} />

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <StarIcon sx={{ color: '#7B2D8B', fontSize: 32 }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Flagship Programs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Our most comprehensive and industry-recognised certification programs.
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : programs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No flagship programs available yet. Check back soon!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid item xs={12} sm={6} md={4} key={program.id}>
              <FlagshipProgramCard program={program} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default FlagshipPage;
