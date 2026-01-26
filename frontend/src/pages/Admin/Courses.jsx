import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AdminLayout, CourseManager, CourseForm } from '../../components/admin';
import { Button, Modal, LoadingSpinner } from '../../components/common';
import { courseService } from '../../services';
import { useToast } from '../../store';

function AdminCourses() {
  const { showSuccess, showError } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      showError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreate = () => {
    setEditingCourse(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (course) => {
    // Load course with videos for editing
    try {
      const courseWithVideos = await courseService.getCourse(course.id);
      const videos = await courseService.getAdminCourseVideos(course.id);
      setEditingCourse({ ...courseWithVideos, videos });
      setIsFormOpen(true);
    } catch (error) {
      // Fallback to basic course data
      setEditingCourse(course);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (course) => {
    const courseId = course?.id || course;
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      showSuccess('Course deleted successfully');
      loadCourses();
    } catch (error) {
      showError('Failed to delete course');
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      await courseService.updateCourse(course.id, {
        ...course,
        published: !course.published,
      });
      showSuccess(course.published ? 'Course unpublished' : 'Course published');
      loadCourses();
    } catch (error) {
      showError('Failed to update course');
    }
  };

  const handleManageVideos = (course) => {
    // Open edit form with videos tab or navigate to videos management
    handleEdit(course);
  };

  const handleSave = async (courseData, imageOptions = {}) => {
    setSaving(true);
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, courseData, imageOptions);
        showSuccess('Course updated successfully');
      } else {
        await courseService.createCourse(courseData, imageOptions);
        showSuccess('Course created successfully');
      }
      setIsFormOpen(false);
      setEditingCourse(null);
      loadCourses();
    } catch (error) {
      showError(editingCourse ? 'Failed to update course' : 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen text="Loading courses..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Course Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create, edit, and manage your courses.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Course
          </Button>
        </Box>

        <CourseManager
          courses={courses}
          onAdd={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
          onManageVideos={handleManageVideos}
        />

        <Modal
          open={isFormOpen}
          onClose={handleCloseForm}
          title={editingCourse ? 'Edit Course' : 'Create New Course'}
          maxWidth="md"
        >
          <CourseForm
            course={editingCourse}
            onSave={handleSave}
            onCancel={handleCloseForm}
            loading={saving}
          />
        </Modal>
      </Container>
    </AdminLayout>
  );
}

export default AdminCourses;
