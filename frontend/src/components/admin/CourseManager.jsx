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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { Button, EmptyState, LoadingSpinner } from '../common';
import { formatCurrency, formatDurationHours } from '../../utils/formatters';

/**
 * Course Manager component for admin panel
 */
function CourseManager({
  courses = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onTogglePublish,
  onManageVideos,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleMenuOpen = (event, course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleAction = (action) => {
    if (selectedCourse) {
      action(selectedCourse);
    }
    handleMenuClose();
  };

  if (loading) {
    return <LoadingSpinner text="Loading courses..." />;
  }

  if (!courses || courses.length === 0) {
    return (
      <EmptyState
        title="No courses yet"
        description="Create your first course to get started"
        actionLabel="Add Course"
        onAction={onAdd}
      />
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Courses ({courses.length})</Typography>
        <Button variant="contained" onClick={onAdd}>
          Add Course
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="courses table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Duration</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {course.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={course.category || 'Uncategorized'} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right">{formatCurrency(course.price)}</TableCell>
                <TableCell align="right">
                  {course.durationHours ? formatDurationHours(course.durationHours) : '-'}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={course.published ? 'Published' : 'Draft'}
                    size="small"
                    color={course.published ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, course)}
                    aria-label="Course actions"
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
        open={Boolean(anchorEl)}
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
        <MenuItem onClick={() => handleAction(onManageVideos)}>
          <ListItemIcon>
            <VideoLibraryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Videos</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(onTogglePublish)}>
          <ListItemIcon>
            {selectedCourse?.published ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{selectedCourse?.published ? 'Unpublish' : 'Publish'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default CourseManager;
