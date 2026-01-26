import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArchiveIcon from '@mui/icons-material/Archive';
import PublishIcon from '@mui/icons-material/Publish';
import DraftsIcon from '@mui/icons-material/Drafts';
import { Button, EmptyState, LoadingSpinner } from '../common';
import { formatDate } from '../../utils/formatters';

const STATUS_COLORS = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  SCHEDULED: 'info',
  ARCHIVED: 'warning',
};

const STATUS_ICONS = {
  DRAFT: <DraftsIcon fontSize="small" />,
  PUBLISHED: <VisibilityIcon fontSize="small" />,
  SCHEDULED: <PublishIcon fontSize="small" />,
  ARCHIVED: <ArchiveIcon fontSize="small" />,
};

function BlogManager({
  blogs = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onUpdateStatus,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);

  const handleMenuOpen = (event, blog) => {
    setAnchorEl(event.currentTarget);
    setSelectedBlog(blog);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBlog(null);
    setStatusAnchorEl(null);
  };

  const handleAction = (action) => {
    if (selectedBlog) {
      action(selectedBlog);
    }
    handleMenuClose();
  };

  const handleStatusMenuOpen = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusChange = (status) => {
    if (selectedBlog && onUpdateStatus) {
      onUpdateStatus(selectedBlog, status);
    }
    handleMenuClose();
  };

  if (loading) {
    return <LoadingSpinner text="Loading blogs..." />;
  }

  if (!blogs || blogs.length === 0) {
    return (
      <EmptyState
        title="No blogs yet"
        description="Create your first blog post to get started"
        actionLabel="Add Blog"
        onAction={onAdd}
      />
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table aria-label="blogs table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Visibility</TableCell>
              <TableCell align="right">Views</TableCell>
              <TableCell>Publish Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {blog.title}
                    </Typography>
                    {blog.urlSlug && (
                      <Typography variant="caption" color="text.secondary">
                        /{blog.urlSlug}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {blog.authorName || 'Editorial Team'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={blog.category || 'Uncategorized'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={STATUS_ICONS[blog.status]}
                    label={blog.status || 'DRAFT'}
                    size="small"
                    color={STATUS_COLORS[blog.status] || 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={blog.visibility || 'PUBLIC'}
                    size="small"
                    variant="outlined"
                    color={blog.visibility === 'PUBLIC' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {blog.viewCount || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {blog.publishDate ? formatDate(blog.publishDate) : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, blog)}
                    aria-label="Blog actions"
                    aria-haspopup="true"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && !Boolean(statusAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleAction(onEdit)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleStatusMenuOpen}>
          <ListItemIcon>
            <PublishIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Status</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Status submenu */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem
          onClick={() => handleStatusChange('DRAFT')}
          disabled={selectedBlog?.status === 'DRAFT'}
        >
          <ListItemIcon>
            <DraftsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Draft</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('PUBLISHED')}
          disabled={selectedBlog?.status === 'PUBLISHED'}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Publish</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('ARCHIVED')}
          disabled={selectedBlog?.status === 'ARCHIVED'}
        >
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default BlogManager;
