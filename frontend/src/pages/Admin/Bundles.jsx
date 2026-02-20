import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Avatar } from '@mui/material';
import { getApiBaseUrl } from '../../services/api';
import { AdminLayout } from '../../components/admin';
import BundleForm from '../../components/admin/BundleForm';
import { Button, Modal, LoadingSpinner } from '../../components/common';
import * as bundleService from '../../services/bundleService';
import { courseService } from '../../services';
import { useToast } from '../../store';
import { formatCurrency } from '../../utils/formatters';

function AdminBundles() {
  const { showSuccess, showError } = useToast();
  const [bundles, setBundles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [bundlesData, coursesData] = await Promise.all([
        bundleService.getAllBundles(),
        courseService.getAdminCourses(),
      ]);
      setBundles(bundlesData);
      setCourses(coursesData);
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingBundle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (bundle) => {
    setEditingBundle(bundle);
    setIsFormOpen(true);
  };

  const handleDelete = async (bundle) => {
    if (!window.confirm(`Are you sure you want to delete "${bundle.title}"?`)) return;
    try {
      await bundleService.deleteBundle(bundle.id);
      showSuccess('Bundle deleted successfully');
      loadData();
    } catch (error) {
      showError('Failed to delete bundle');
    }
  };

  const handleTogglePublish = async (bundle) => {
    try {
      await bundleService.togglePublish(bundle.id);
      showSuccess(bundle.published ? 'Bundle unpublished' : 'Bundle published');
      loadData();
    } catch (error) {
      showError('Failed to update bundle');
    }
  };

  const handleSave = async (bundleData, imageFile) => {
    setSaving(true);
    try {
      if (editingBundle) {
        await bundleService.updateBundle(editingBundle.id, bundleData, imageFile);
        showSuccess('Bundle updated successfully');
      } else {
        await bundleService.createBundle(bundleData, imageFile);
        showSuccess('Bundle created successfully');
      }
      setIsFormOpen(false);
      setEditingBundle(null);
      loadData();
    } catch (error) {
      showError(editingBundle ? 'Failed to update bundle' : 'Failed to create bundle');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBundle(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen text="Loading bundles..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Bundle Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create combo offers to boost course purchases.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Add Bundle
          </Button>
        </Box>

        {bundles.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No bundles yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first combo offer to attract more enrollments.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Create Bundle
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bundle</TableCell>
                  <TableCell>Courses</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Savings</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bundles.map((bundle) => (
                  <TableRow key={bundle.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={bundle.thumbnailImageUrl ? `${getApiBaseUrl()}${bundle.thumbnailImageUrl}` : undefined}
                          variant="rounded"
                          sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: 20 }}
                        >
                          {bundle.title?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {bundle.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bundle.bundleCode}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {bundle.courses?.map((c) => (
                          <Chip key={c.id} label={c.title} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(bundle.price, 'INR')}
                      </Typography>
                      {bundle.originalPrice > 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          {formatCurrency(bundle.originalPrice, 'INR')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {bundle.savingsPercent > 0 && (
                        <Chip label={`${bundle.savingsPercent}%`} color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bundle.published ? 'Published' : 'Draft'}
                        color={bundle.published ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{bundle.displayOrder}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={bundle.published ? 'Unpublish' : 'Publish'}>
                        <IconButton size="small" onClick={() => handleTogglePublish(bundle)}>
                          {bundle.published ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(bundle)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(bundle)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Modal
          open={isFormOpen}
          onClose={handleCloseForm}
          title={editingBundle ? 'Edit Bundle' : 'Create New Bundle'}
          maxWidth="md"
        >
          <BundleForm
            bundle={editingBundle}
            courses={courses}
            onSave={handleSave}
            onCancel={handleCloseForm}
            loading={saving}
          />
        </Modal>
      </Container>
    </AdminLayout>
  );
}

export default AdminBundles;
