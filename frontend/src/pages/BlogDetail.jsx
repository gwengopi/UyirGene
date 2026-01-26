import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Breadcrumb, LoadingSpinner, Button } from '../components/common';
import { blogService } from '../services';
import { formatDate } from '../utils/formatters';
import { getApiBaseUrl } from '../services/api';

function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch by slug first, then by ID
        let blogData;
        try {
          blogData = await blogService.getBlogBySlug(slug);
        } catch (slugError) {
          // If slug fails, try as ID
          blogData = await blogService.getBlog(slug);
        }
        setBlog(blogData);

        // Load recent blogs for sidebar
        const recent = await blogService.getRecentBlogs();
        setRecentBlogs(recent.filter(b => b.id !== blogData.id).slice(0, 3));
      } catch (err) {
        console.error('Failed to load blog:', err);
        setError('Blog post not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadBlog();
    }
  }, [slug]);

  const getBlogImage = (blogItem) => {
    if (blogItem?.id) {
      return `${getApiBaseUrl()}/api/blogs/${blogItem.id}/image`;
    }
    if (blogItem?.imageUrl) {
      return blogItem.imageUrl;
    }
    return null;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading blog post..." />;
  }

  if (error || !blog) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Blog Post Not Found
        </Typography>
        <Typography color="text.secondary" paragraph>
          The blog post you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/blog')}
        >
          Back to Blog
        </Button>
      </Container>
    );
  }

  const breadcrumbItems = [
    { label: 'Blog', path: '/blog' },
    { label: blog.title, path: `/blog/${slug}` },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={breadcrumbItems} />

      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/blog')}
        sx={{ mb: 3 }}
      >
        Back to Blog
      </Button>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Featured Image */}
          {getBlogImage(blog) && (
            <Box
              sx={{
                width: '100%',
                height: 400,
                borderRadius: 2,
                overflow: 'hidden',
                mb: 4,
                backgroundImage: `url(${getBlogImage(blog)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                bgcolor: 'grey.800',
              }}
            />
          )}

          {/* Category and Tags */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={blog.category || 'General'} color="primary" />
            {blog.tags && blog.tags.split(',').map((tag, index) => (
              tag.trim() && (
                <Chip
                  key={index}
                  label={tag.trim()}
                  size="small"
                  variant="outlined"
                />
              )
            ))}
          </Box>

          {/* Title */}
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            {blog.title}
          </Typography>

          {/* Meta Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {(blog.authorName || 'E')[0]}
              </Avatar>
              <Typography variant="body2">
                {blog.authorName || 'Editorial Team'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {blog.publishDate ? formatDate(blog.publishDate) : formatDate(blog.createdAt)}
              </Typography>
            </Box>
            {blog.readingTimeMinutes && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {blog.readingTimeMinutes} min read
                </Typography>
              </Box>
            )}
            {blog.viewCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VisibilityIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {blog.viewCount} views
                </Typography>
              </Box>
            )}
          </Box>

          {/* Short Description */}
          {blog.shortDescription && (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, fontStyle: 'italic' }}
            >
              {blog.shortDescription}
            </Typography>
          )}

          <Divider sx={{ mb: 4 }} />

          {/* Blog Content */}
          <Box
            sx={{
              '& p': { mb: 2, lineHeight: 1.8 },
              '& h2': { mt: 4, mb: 2 },
              '& h3': { mt: 3, mb: 2 },
              '& ul, & ol': { mb: 2, pl: 3 },
              '& li': { mb: 1 },
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                pl: 2,
                py: 1,
                my: 2,
                bgcolor: 'background.paper',
              },
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <Divider sx={{ my: 4 }} />

          {/* Author Box */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
                {(blog.authorName || 'E')[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {blog.authorName || 'Editorial Team'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Author
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Recent Posts */}
          {recentBlogs.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Recent Posts
              </Typography>
              {recentBlogs.map((recentBlog) => (
                <Card
                  key={recentBlog.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate(`/blog/${recentBlog.urlSlug || recentBlog.id}`)}
                >
                  <Box sx={{ display: 'flex' }}>
                    {getBlogImage(recentBlog) && (
                      <CardMedia
                        component="div"
                        sx={{
                          width: 80,
                          minHeight: 80,
                          backgroundImage: `url(${getBlogImage(recentBlog)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}
                    <CardContent sx={{ flex: 1, py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                        {recentBlog.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {recentBlog.publishDate
                          ? formatDate(recentBlog.publishDate)
                          : formatDate(recentBlog.createdAt)}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              ))}
            </Paper>
          )}

          {/* Categories */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['News', 'Tutorials', 'Industry Insights', 'Research', 'Events'].map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  variant="outlined"
                  onClick={() => navigate(`/blog?category=${cat}`)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default BlogDetail;
