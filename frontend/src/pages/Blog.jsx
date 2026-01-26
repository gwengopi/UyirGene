import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Breadcrumb, LoadingSpinner, Button } from '../components/common';
import { blogService } from '../services';
import { formatDate } from '../utils/formatters';
import { getApiBaseUrl } from '../services/api';

function Blog() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Subscription state
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [blogsData, categoriesData] = await Promise.all([
          blogService.getAllBlogs(),
          blogService.getCategoriesWithCount(),
        ]);
        setBlogs(blogsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load blogs:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await blogService.searchBlogs(query);
        setBlogs(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      const data = await blogService.getAllBlogs();
      setBlogs(data);
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    try {
      if (category) {
        const results = await blogService.getBlogsByCategory(category);
        setBlogs(results);
      } else {
        const data = await blogService.getAllBlogs();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Filter failed:', error);
    }
  };

  const getBlogImage = (blog) => {
    if (blog.featuredImage || blog.id) {
      return `${getApiBaseUrl()}/api/blogs/${blog.id}/image`;
    }
    if (blog.imageUrl) {
      return blog.imageUrl;
    }
    return null;
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeError('');
    setSubscribeSuccess(false);

    if (!subscribeEmail.trim()) {
      setSubscribeError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscribeEmail)) {
      setSubscribeError('Please enter a valid email address');
      return;
    }

    setSubscribing(true);
    try {
      await blogService.subscribe(subscribeEmail, subscribeName);
      setSubscribeSuccess(true);
      setSubscribeEmail('');
      setSubscribeName('');
    } catch (error) {
      setSubscribeError(error.response?.data?.error || 'Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading blog posts..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'Blog', path: '/blog' }]} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Blog
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Insights, tips, and news from our learning community.
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="All"
                onClick={() => handleCategoryFilter('')}
                color={selectedCategory === '' ? 'primary' : 'default'}
                variant={selectedCategory === '' ? 'filled' : 'outlined'}
              />
              {categories.map(([category, count]) => (
                <Chip
                  key={category}
                  label={`${category} (${count})`}
                  onClick={() => handleCategoryFilter(category)}
                  color={selectedCategory === category ? 'primary' : 'default'}
                  variant={selectedCategory === category ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {blogs.map((blog) => (
          <Grid item xs={12} md={4} key={blog.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate(`/blog/${blog.urlSlug || blog.id}`)}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: 'grey.800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: getBlogImage(blog) ? `url(${getBlogImage(blog)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!getBlogImage(blog) && (
                  <Typography variant="h4" color="text.secondary">
                    Blog
                  </Typography>
                )}
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip label={blog.category || 'General'} size="small" />
                  {blog.language && blog.language !== 'en' && (
                    <Chip label={blog.language.toUpperCase()} size="small" variant="outlined" />
                  )}
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {blog.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {blog.shortDescription || blog.content?.substring(0, 150) + '...'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">
                    By {blog.authorName || 'Editorial Team'}
                  </Typography>
                  {blog.readingTimeMinutes && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14 }} />
                      <Typography variant="caption" color="text.secondary">
                        {blog.readingTimeMinutes} min read
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {blog.publishDate ? formatDate(blog.publishDate) : formatDate(blog.createdAt)}
                  </Typography>
                  {blog.viewCount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <VisibilityIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14 }} />
                      <Typography variant="caption" color="text.secondary">
                        {blog.viewCount}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {blogs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery || selectedCategory
              ? 'No blog posts match your search.'
              : 'No blog posts yet. Check back soon!'}
          </Typography>
        </Box>
      )}

      {/* Newsletter Subscription */}
      <Paper
        sx={{
          p: 4,
          mt: 6,
          background: 'linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)',
          color: 'white',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <NotificationsActiveIcon />
              <Typography variant="h5" fontWeight={600}>
                Stay Updated
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Subscribe to our newsletter and get notified when we publish new articles.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            {subscribeSuccess ? (
              <Alert severity="success" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}>
                Thank you for subscribing! You'll receive notifications for new blog posts.
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubscribe}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      placeholder="Your name (optional)"
                      value={subscribeName}
                      onChange={(e) => setSubscribeName(e.target.value)}
                      size="small"
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { border: 'none' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      placeholder="Your email *"
                      type="email"
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      size="small"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { border: 'none' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      type="submit"
                      fullWidth
                      disabled={subscribing}
                      sx={{
                        bgcolor: 'white',
                        color: '#8E44AD',
                        height: '40px',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                        },
                      }}
                    >
                      {subscribing ? <CircularProgress size={20} /> : 'Subscribe'}
                    </Button>
                  </Grid>
                </Grid>
                {subscribeError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {subscribeError}
                  </Alert>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Blog;
