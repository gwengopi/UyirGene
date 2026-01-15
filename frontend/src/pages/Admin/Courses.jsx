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

  const handleEdit = (course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleDelete = async (courseId) => {
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

  const handleSave = async (courseData, imageFile = null, removeImage = false) => {
    setSaving(true);
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, courseData, imageFile, removeImage);
        showSuccess('Course updated successfully');
      } else {
        await courseService.createCourse(courseData, imageFile);
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
          onEdit={handleEdit}
          onDelete={handleDelete}
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
