import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import { AdminLayout, BlogManager, BlogForm } from '../../components/admin';
import { Button, Modal, LoadingSpinner } from '../../components/common';
import { blogService } from '../../services';
import { useToast } from '../../store';
import { formatDate } from '../../utils/formatters';

function AdminBlogs() {
  const { showSuccess, showError } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const loadBlogs = async () => {
    try {
      const data = await blogService.getAdminBlogs();
      setBlogs(data);
    } catch (error) {
      showError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribers = async () => {
    try {
      const data = await blogService.getActiveSubscribers();
      setSubscribers(data);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    }
  };

  useEffect(() => {
    loadBlogs();
    loadSubscribers();
  }, []);

  const handleCreate = () => {
    setEditingBlog(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (blog) => {
    try {
      const blogData = await blogService.getAdminBlog(blog.id);
      setEditingBlog(blogData);
      setIsFormOpen(true);
    } catch (error) {
      setEditingBlog(blog);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (blog) => {
    const blogId = blog?.id || blog;
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await blogService.deleteBlog(blogId);
      showSuccess('Blog deleted successfully');
      loadBlogs();
    } catch (error) {
      showError('Failed to delete blog');
    }
  };

  const handleUpdateStatus = async (blog, status) => {
    try {
      await blogService.updateBlogStatus(blog.id, status);
      showSuccess(`Blog ${status.toLowerCase()} successfully`);
      loadBlogs();
    } catch (error) {
      showError('Failed to update blog status');
    }
  };

  const handleSave = async (blogData, options = {}) => {
    setSaving(true);
    try {
      let savedBlog;
      if (editingBlog) {
        savedBlog = await blogService.updateBlog(editingBlog.id, blogData);
        showSuccess('Blog updated successfully');
      } else {
        savedBlog = await blogService.createBlog(blogData);
        showSuccess('Blog created successfully');
      }

      // Upload image if provided
      if (options.imageFile && savedBlog.id) {
        try {
          await blogService.uploadFeaturedImage(savedBlog.id, options.imageFile);
        } catch (imgError) {
          showError('Blog saved but image upload failed');
        }
      }

      setIsFormOpen(false);
      setEditingBlog(null);
      loadBlogs();
    } catch (error) {
      showError(editingBlog ? 'Failed to update blog' : 'Failed to create blog');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBlog(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen text="Loading blogs..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Blog Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create, edit, and manage your blog posts.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Blog
          </Button>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="blog management tabs"
          >
            <Tab
              icon={<ArticleIcon />}
              iconPosition="start"
              label={`Blog Posts (${blogs.length})`}
            />
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label={`Subscribers (${subscribers.length})`}
            />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <BlogManager
            blogs={blogs}
            onAdd={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Subscribers
            </Typography>
            {subscribers.length === 0 ? (
              <Typography color="text.secondary">
                No subscribers yet.
              </Typography>
            ) : (
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box component="th" sx={{ py: 1.5, px: 2, textAlign: 'left' }}>Email</Box>
                    <Box component="th" sx={{ py: 1.5, px: 2, textAlign: 'left' }}>Name</Box>
                    <Box component="th" sx={{ py: 1.5, px: 2, textAlign: 'left' }}>Subscribed At</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {subscribers.map((sub) => (
                    <Box
                      component="tr"
                      key={sub.id}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>{sub.email}</Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>{sub.name || '-'}</Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        {sub.subscribedAt ? formatDate(sub.subscribedAt) : '-'}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}

        <Modal
          open={isFormOpen}
          onClose={handleCloseForm}
          title={editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
          maxWidth="lg"
          fullWidth
        >
          <BlogForm
            key={editingBlog?.id ?? 'new'}
            blog={editingBlog}
            onSave={handleSave}
            onCancel={handleCloseForm}
            loading={saving}
          />
        </Modal>
      </Container>
    </AdminLayout>
  );
}

export default AdminBlogs;
