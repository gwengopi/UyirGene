import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, Chip } from '@mui/material';
import { Breadcrumb, LoadingSpinner } from '../components/common';
import { blogService } from '../services';
import { formatDate } from '../utils/formatters';

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const data = await blogService.getAllBlogs();
        setBlogs(data);
      } catch (error) {
        // Use placeholder data if API fails
        setBlogs([
          {
            id: 1,
            title: 'Getting Started with Online Learning',
            excerpt: 'Tips and tricks to make the most of your online learning experience.',
            author: 'Admin',
            createdAt: new Date().toISOString(),
            category: 'Learning Tips',
            imageUrl: '',
          },
          {
            id: 2,
            title: 'Top Skills to Learn in 2024',
            excerpt: 'Discover the most in-demand skills for career growth this year.',
            author: 'Admin',
            createdAt: new Date().toISOString(),
            category: 'Career',
            imageUrl: '',
          },
          {
            id: 3,
            title: 'How to Stay Motivated While Learning',
            excerpt: 'Strategies to keep yourself motivated throughout your learning journey.',
            author: 'Admin',
            createdAt: new Date().toISOString(),
            category: 'Motivation',
            imageUrl: '',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

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

      <Grid container spacing={4}>
        {blogs.map((blog) => (
          <Grid item xs={12} md={4} key={blog.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: 'grey.800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" color="text.secondary">
                  Blog
                </Typography>
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Chip label={blog.category} size="small" sx={{ mb: 1 }} />
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {blog.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {blog.excerpt}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  By {blog.author} | {formatDate(blog.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {blogs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No blog posts yet. Check back soon!
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default Blog;
