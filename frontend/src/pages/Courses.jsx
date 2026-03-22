import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Breadcrumb, SEO } from '../components/common';
import { courseService } from '../services';
import { flagshipService } from '../services/flagshipService';
import { getApiBaseUrl } from '../services/api';
import { useUI, useConfig } from '../store';
import { formatCurrency, formatDurationHours } from '../utils/formatters';
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
  const { getImage, getCategoryLabel } = useConfig();

  const [allCourses, setAllCourses] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const apiBase = getApiBaseUrl();

  useEffect(() => {
    Promise.all([
      courseService.getAllCourses(),
      flagshipService.getAllPrograms().catch(() => []),
    ]).then(([courses, programs]) => {
        setAllCourses(courses);
        setAllPrograms(programs || []);
        const countMap = {};
        courses.forEach((c) => {
          (c.categories || []).forEach((cat) => {
            countMap[cat] = (countMap[cat] || 0) + 1;
          });
        });
        const seen = new Set();
        const unique = [];
        courses.forEach((c) => {
          (c.categories || []).forEach((cat) => {
            if (cat && !seen.has(cat)) {
              seen.add(cat);
              const thumb = c.thumbnailImageUrl || c.imageUrl || null;
              unique.push({
                name: cat,
                count: countMap[cat],
                imageUrl: thumb ? `${apiBase}${thumb}` : null,
              });
            }
          });
        });
        // labels resolved after categories load — done in render via getCategoryLabel
        setCategories(unique);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiBase]);

  const isSearchMode = search.trim() !== '';

  const filteredResults = useMemo(() => {
    if (!isSearchMode) return [];
    const q = search.trim().toLowerCase();

    const matchesCourseSearch = (c) =>
      c.title?.toLowerCase().includes(q) ||
      c.shortDescription?.toLowerCase().includes(q) ||
      (c.categories || []).some((cat) => cat.toLowerCase().includes(q));

    const matchesProgramSearch = (p) =>
      p.title?.toLowerCase().includes(q) ||
      p.tagline?.toLowerCase().includes(q) ||
      p.cardDescription?.toLowerCase().includes(q);

    const courses = selectedCategory === 'Flagship'
      ? []
      : allCourses
          .filter((c) => matchesCourseSearch(c) && (!selectedCategory || (c.categories || []).includes(selectedCategory)))
          .map((c) => ({ ...c, _type: 'course' }));

    const programs = (selectedCategory === '' || selectedCategory === 'Flagship')
      ? allPrograms
          .filter((p) => matchesProgramSearch(p))
          .map((p) => ({ ...p, _type: 'flagship' }))
      : [];

    return [...programs, ...courses];
  }, [allCourses, allPrograms, search, selectedCategory, isSearchMode]);

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
    '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
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

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 3, fontSize: '0.72rem', display: 'block', mb: 0.5 }}
          >
            LEARN WITH UYIRGENE
          </Typography>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            All Courses
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Choose a category or explore our flagship programs.
          </Typography>

          {/* Search bar */}
          <TextField
            fullWidth
            placeholder="Search courses by title, description or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Category filter chips */}
          {categories.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="All"
                onClick={() => setSelectedCategory('')}
                color={selectedCategory === '' ? 'primary' : 'default'}
                variant={selectedCategory === '' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label="Flagship"
                icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => setSelectedCategory(selectedCategory === 'Flagship' ? '' : 'Flagship')}
                color={selectedCategory === 'Flagship' ? 'secondary' : 'default'}
                variant={selectedCategory === 'Flagship' ? 'filled' : 'outlined'}
                size="small"
                sx={selectedCategory === 'Flagship' ? { bgcolor: '#7B2D8B', color: '#fff', '& .MuiChip-icon': { color: '#FFD700 !important' } } : {}}
              />
              {categories.map((cat) => (
                <Chip
                  key={cat.name}
                  label={getCategoryLabel(cat.name)}
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
                  color={selectedCategory === cat.name ? 'primary' : 'default'}
                  variant={selectedCategory === cat.name ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : isSearchMode ? (
          /* ── Search / filter results ── */
          filteredResults.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <SearchIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No results found</Typography>
              <Typography variant="body2" color="text.disabled">
                Try a different keyword or clear the filter.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
              </Typography>
              <Grid container spacing={3}>
                {filteredResults.map((item) => {
                  const isFlagship = item._type === 'flagship';
                  const thumb = item.thumbnailImageUrl || item.imageUrl;
                  const thumbUrl = thumb
                    ? (isFlagship ? thumb : `${apiBase}${thumb}`)
                    : (isFlagship ? item.backgroundImageUrl : null);
                  const firstCat = !isFlagship ? (item.categories?.[0] || null) : null;
                  const catIndex = firstCat ? categories.findIndex((c) => c.name === firstCat) : -1;
                  const color = isFlagship ? '#7B2D8B' : CATEGORY_COLORS[catIndex >= 0 ? catIndex % CATEGORY_COLORS.length : 0];
                  const label = isFlagship ? (item.tagline || 'Flagship Program') : getCategoryLabel(firstCat);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={`${item._type}-${item.id}`}>
                      <Paper
                        elevation={0}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(isFlagship ? `/flagship/${item.slug || item.id}` : ROUTES.COURSE_DETAIL(item.slug || item.id))}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(isFlagship ? `/flagship/${item.slug || item.id}` : ROUTES.COURSE_DETAIL(item.slug || item.id))}
                        sx={cardSx}
                      >
                        <Box sx={{ position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                          {thumbUrl ? (
                            <CardMedia
                              component="img"
                              image={thumbUrl}
                              alt={item.title}
                              className="card-img"
                              sx={{ height: 160, objectFit: 'cover', transition: 'transform 0.5s ease' }}
                            />
                          ) : (
                            <Box sx={{
                              height: 160,
                              background: isFlagship
                                ? 'linear-gradient(135deg, #7B2D8B 0%, #4A0072 100%)'
                                : `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Typography sx={{ fontSize: 72, fontWeight: 900, color: 'rgba(255,255,255,0.15)', lineHeight: 1 }}>
                                {item.title?.charAt(0).toUpperCase()}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)',
                          }} />
                          {/* Flagship badge or category chip */}
                          {isFlagship ? (
                            <Box sx={{
                              position: 'absolute', bottom: 10, left: 12,
                              display: 'inline-flex', alignItems: 'center', gap: 0.5,
                              px: 1, py: 0.3, borderRadius: 1,
                              bgcolor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                            }}>
                              <EmojiEventsIcon sx={{ fontSize: 12, color: '#FFD700' }} />
                              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                Flagship
                              </Typography>
                            </Box>
                          ) : firstCat && (
                            <Chip
                              label={getCategoryLabel(firstCat)}
                              size="small"
                              sx={{
                                position: 'absolute', bottom: 10, left: 12,
                                bgcolor: 'rgba(0,0,0,0.65)', color: '#fff',
                                backdropFilter: 'blur(8px)',
                                fontSize: '0.68rem', height: 24, fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                            {item.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ flex: 1, lineHeight: 1.6, mb: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                          >
                            {isFlagship ? (item.cardDescription || item.tagline) : item.shortDescription}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                            {!isFlagship && item.durationHours && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDurationHours(item.durationHours)}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                              <Typography variant="caption" fontWeight={700} sx={{ color }}>
                                {item.price ? (() => {
                                const cp = item.countryPrices?.find((p) => p.countryCode === 'US');
                                return formatCurrency(cp ? cp.amount : item.price, cp ? cp.currencyCode : 'INR');
                              })() : 'Free'}
                              </Typography>
                              <ArrowForwardIcon sx={{ fontSize: 14, color }} />
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )
        ) : (
          <Grid container spacing={3}>

            {/* ── Flagship card — hidden when a course category is selected ── */}
            {(selectedCategory === '' || selectedCategory === 'Flagship') && (
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                role="button"
                tabIndex={0}
                onClick={() => navigate(ROUTES.COURSES_FLAGSHIP)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.COURSES_FLAGSHIP)}
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
            )}

            {/* ── One card per distinct category ── */}
            {categories
              .filter((cat) => selectedCategory === '' || selectedCategory === cat.name)
              .map((cat) => {
              const index = categories.indexOf(cat);
              const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
              return (
                <Grid item xs={12} sm={6} md={4} key={cat.name}>
                  <Paper
                    elevation={0}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(ROUTES.COURSES_CATEGORY(encodeURIComponent(cat.name)))}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.COURSES_CATEGORY(encodeURIComponent(cat.name)))}
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
                            {getCategoryLabel(cat.name).charAt(0).toUpperCase()}
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
                        {getCategoryLabel(cat.name)}
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
