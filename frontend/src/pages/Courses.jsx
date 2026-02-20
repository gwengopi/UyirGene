import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CardMedia,
  Chip,
  CircularProgress,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Breadcrumb, SEO } from '../components/common';
import { courseService } from '../services';
import { getApiBaseUrl } from '../services/api';
import { useUI, useConfig } from '../store';
import { ROUTES, IMAGES } from '../utils/constants';

const CATEGORY_COLORS = [
  '#1565C0',
  '#2E7D32',
  '#C62828',
  '#E65100',
  '#00695C',
  '#283593',
  '#558B2F',
  '#AD1457',
  '#0277BD',
  '#4A148C',
  '#BF360C',
  '#006064',
];

function Courses() {
  const navigate = useNavigate();
  const { isDarkMode } = useUI();
  const { getImage } = useConfig();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiBase = getApiBaseUrl();

  useEffect(() => {
    courseService.getAllCourses()
      .then((courses) => {
        const countMap = {};
        courses.forEach((c) => {
          if (c.category) countMap[c.category] = (countMap[c.category] || 0) + 1;
        });
        const seen = new Set();
        const unique = [];
        courses.forEach((c) => {
          if (c.category && !seen.has(c.category)) {
            seen.add(c.category);
            // Use the first course thumbnail found in this category
            const thumb = c.thumbnailImageUrl || c.imageUrl || null;
            unique.push({
              name: c.category,
              count: countMap[c.category],
              imageUrl: thumb ? `${apiBase}${thumb}` : null,
            });
          }
        });
        setCategories(unique);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiBase]);

  const breadcrumbItems = [{ label: 'Courses', path: ROUTES.COURSES }];

  const cardSx = {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
    border: '1px solid',
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(69,90,100,0.1)',
    boxShadow: isDarkMode ? 'none' : '0 2px 12px rgba(69,90,100,0.07)',
    transition: 'transform 0.28s ease, box-shadow 0.28s ease',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: isDarkMode
        ? '0 12px 32px rgba(0,0,0,0.5)'
        : '0 12px 36px rgba(69,90,100,0.18)',
    },
    '&:hover .card-img': { transform: 'scale(1.06)' },
    '&:hover .card-overlay': { opacity: 1 },
  };

  const flagshipImage = getImage('HERO_STUDENTS', IMAGES.HERO_STUDENTS);

  return (
    <Box sx={{ background: isDarkMode ? undefined : '#f4f6fb', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <SEO
          title="Courses"
          description="Browse professional training courses in Food Safety, Quality Management, Microbiology, ISO Standards and more. Get certified with Uyirgene International."
          path="/courses"
        />
        <Breadcrumb items={breadcrumbItems} />

        <Box sx={{ mb: 5 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 3, fontSize: '0.72rem', display: 'block', mb: 0.5 }}
          >
            LEARN WITH UYIRGENE
          </Typography>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            All Courses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose a category or explore our flagship programs.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>

            {/* ── Flagship card ── */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                onClick={() => navigate(ROUTES.COURSES_FLAGSHIP)}
                sx={cardSx}
              >
                {/* Image */}
                <Box sx={{ position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    image={flagshipImage}
                    alt="Flagship Programs"
                    className="card-img"
                    sx={{ height: 160, objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  />
                  {/* Bottom-fade overlay */}
                  <Box
                    sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
                    }}
                  />
                  {/* Hover overlay */}
                  <Box
                    className="card-overlay"
                    sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(to top, rgba(74,0,114,0.45), transparent)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                  {/* Badge on image */}
                  <Box
                    sx={{
                      position: 'absolute', top: 12, left: 12,
                      display: 'inline-flex', alignItems: 'center', gap: 0.5,
                      px: 1, py: 0.3, borderRadius: 1,
                      bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 13, color: '#FFD700' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem', color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      Flagship
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 1.5, flexShrink: 0,
                    background: 'linear-gradient(135deg, #7B2D8B, #4A0072)',
                    boxShadow: '0 4px 12px rgba(123,45,139,0.3)',
                  }}>
                    <StarIcon sx={{ color: '#FFD700', fontSize: 24 }} />
                  </Box>

                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                    Flagship Programs
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, flex: 1 }}>
                    Our most comprehensive and industry-recognised certification programs.
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="primary">
                      Explore Programs
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 15 }} color="primary" />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* ── One card per distinct category ── */}
            {categories.map((cat, index) => {
              const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
              return (
                <Grid item xs={12} sm={6} md={4} key={cat.name}>
                  <Paper
                    elevation={0}
                    onClick={() => navigate(ROUTES.COURSES_CATEGORY(encodeURIComponent(cat.name)))}
                    sx={cardSx}
                  >
                    {/* Image or gradient placeholder */}
                    <Box sx={{ position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                      {cat.imageUrl ? (
                        <CardMedia
                          component="img"
                          image={cat.imageUrl}
                          alt={cat.name}
                          className="card-img"
                          sx={{ height: 160, objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 160,
                            background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Typography sx={{ fontSize: 90, fontWeight: 900, color: 'rgba(255,255,255,0.15)', lineHeight: 1, userSelect: 'none' }}>
                            {cat.name.charAt(0).toUpperCase()}
                          </Typography>
                        </Box>
                      )}

                      {/* Bottom-fade */}
                      <Box
                        sx={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)',
                        }}
                      />
                      {/* Hover tint overlay */}
                      <Box
                        className="card-overlay"
                        sx={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          background: `linear-gradient(to top, ${color}55, transparent)`,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        }}
                      />

                      {/* Course count chip on image */}
                      <Chip
                        icon={<SchoolIcon sx={{ fontSize: 14, color: '#fff !important' }} />}
                        label={`${cat.count} ${cat.count === 1 ? 'course' : 'courses'}`}
                        size="small"
                        sx={{
                          position: 'absolute', bottom: 10, left: 12,
                          bgcolor: 'rgba(0,0,0,0.65)', color: '#fff',
                          backdropFilter: 'blur(8px)',
                          fontSize: '0.68rem', height: 24, fontWeight: 600,
                        }}
                      />
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <Box
                        sx={{
                          width: 48, height: 48, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          mb: 1.5, flexShrink: 0, bgcolor: color + '15',
                        }}
                      >
                        <SchoolIcon sx={{ color, fontSize: 24 }} />
                      </Box>

                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                        {cat.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                        Professional courses with certification
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                        <Typography variant="caption" fontWeight={700} sx={{ color }}>
                          Browse Courses
                        </Typography>
                        <ArrowForwardIcon sx={{ fontSize: 15, color }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default Courses;
