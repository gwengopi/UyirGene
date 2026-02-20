import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Grid, Paper, Chip, Skeleton, Alert } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Breadcrumb, Button, SEO } from '../components/common';
import { careerService } from '../services';

function Careers() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await careerService.getPublishedCareers();
        if (results && results.length > 0) {
          setData(results[0]);
        }
      } catch (err) {
        setError('Failed to load careers data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pageTitle = data?.title || 'Join Our Team';
  const pageSubtitle = data?.subtitle || 'Help us transform education and empower learners around the world.';
  const whyJoinTitle = data?.whyJoinTitle || 'Why Join Uyirgene?';
  const whyJoinDescription = data?.whyJoinDescription || '';
  const benefits = data?.benefits || [];
  const positions = data?.positions || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO title="Careers" description="Join Uyirgene International. Explore career opportunities in food safety, quality management, microbiology research, and professional training." path="/careers" />
      <Breadcrumb items={[{ label: 'Careers', path: '/careers' }]} />

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {pageTitle}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          {pageSubtitle}
        </Typography>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Why Join Us */}
      {loading ? (
        <Paper sx={{ p: 4, mb: 6 }}>
          <Skeleton variant="text" width={250} height={36} />
          <Skeleton variant="text" width="100%" height={24} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="90%" height={24} />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="text" width="80%" height={20} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      ) : (whyJoinDescription || benefits.length > 0) ? (
        <Paper sx={{ p: 4, mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            {whyJoinTitle}
          </Typography>
          {whyJoinDescription && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {whyJoinDescription}
            </Typography>
          )}
          {benefits.length > 0 && (
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
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2">{benefit}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      ) : null}

      {/* Open Positions */}
      {loading ? (
        <Box sx={{ mb: 6 }}>
          <Skeleton variant="text" width={200} height={36} sx={{ mb: 2 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
          ))}
        </Box>
      ) : positions.length > 0 ? (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Open Positions
          </Typography>
          <Grid container spacing={3}>
            {positions.map((position, index) => (
              <Grid item xs={12} key={index}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {position.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                        {position.department && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WorkIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {position.department}
                            </Typography>
                          </Box>
                        )}
                        {position.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {position.location}
                            </Typography>
                          </Box>
                        )}
                        {position.type && <Chip label={position.type} size="small" />}
                      </Box>
                      {position.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          {position.description}
                        </Typography>
                      )}
                    </Box>
                    <Button variant="outlined" onClick={() => navigate('/contact')}>
                      Apply Now
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : !loading ? (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Open Positions
          </Typography>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No open positions at the moment. Check back soon!
            </Typography>
          </Paper>
        </Box>
      ) : null}

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
