import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tooltip,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button, LoadingSpinner } from '../common';
import { faqService } from '../../services';
import { useToast } from '../../store';

// FAQ Categories
const FAQ_CATEGORIES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'COURSES', label: 'Courses' },
  { value: 'PAYMENTS', label: 'Payments & Refunds' },
  { value: 'CERTIFICATES', label: 'Certificates' },
  { value: 'TECHNICAL', label: 'Technical Support' },
];

const initialFormState = {
  category: 'GENERAL',
  question: '',
  answer: '',
  displayOrder: 0,
  active: true,
};

function FaqManager() {
  const { showSuccess, showError } = useToast();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Load FAQs
  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = await faqService.getAllFaqsAdmin();
      setFaqs(data);
    } catch (error) {
      showError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  // Filter FAQs by category
  const filteredFaqs = filterCategory === 'ALL'
    ? faqs
    : faqs.filter((faq) => faq.category === filterCategory);

  // Sort FAQs by category then display order
  const sortedFaqs = [...filteredFaqs].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Open dialog for create/edit
  const handleOpenDialog = (faq = null) => {
    if (faq) {
      setSelectedFaq(faq);
      setFormData({
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        displayOrder: faq.displayOrder || 0,
        active: faq.active,
      });
    } else {
      setSelectedFaq(null);
      setFormData(initialFormState);
    }
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFaq(null);
    setFormData(initialFormState);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      showError('Question and answer are required');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedFaq) {
        await faqService.updateFaq(selectedFaq.id, formData);
        showSuccess('FAQ updated successfully');
      } else {
        await faqService.createFaq(formData);
        showSuccess('FAQ created successfully');
      }
      handleCloseDialog();
      loadFaqs();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation
  const handleOpenDelete = (faq) => {
    setSelectedFaq(faq);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!selectedFaq) return;

    setSubmitting(true);
    try {
      await faqService.deleteFaq(selectedFaq.id);
      showSuccess('FAQ deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedFaq(null);
      loadFaqs();
    } catch (error) {
      showError('Failed to delete FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  // Seed default FAQs
  const handleSeedFaqs = async () => {
    try {
      await faqService.seedFaqs();
      showSuccess('Default FAQs seeded successfully');
      loadFaqs();
    } catch (error) {
      showError('Failed to seed FAQs');
    }
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const cat = FAQ_CATEGORIES.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  if (loading) {
    return <LoadingSpinner text="Loading FAQs..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          FAQ Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadFaqs}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add FAQ
          </Button>
        </Box>
      </Box>

      {/* Filter and Seed */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={filterCategory}
            label="Filter by Category"
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <MenuItem value="ALL">All Categories</MenuItem>
            {FAQ_CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {faqs.length === 0 && (
          <Button variant="outlined" onClick={handleSeedFaqs}>
            Seed Default FAQs
          </Button>
        )}
      </Box>

      {/* FAQ Table */}
      {sortedFaqs.length === 0 ? (
        <Alert severity="info">
          No FAQs found. Click "Add FAQ" to create one or "Seed Default FAQs" to populate with defaults.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Question</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedFaqs.map((faq) => (
                <TableRow key={faq.id} hover>
                  <TableCell>
                    <Chip
                      label={getCategoryLabel(faq.category)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 400 }} noWrap>
                      {faq.question}
                    </Typography>
                  </TableCell>
                  <TableCell>{faq.displayOrder}</TableCell>
                  <TableCell>
                    <Chip
                      label={faq.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={faq.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(faq)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(faq)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFaq ? 'Edit FAQ' : 'Add New FAQ'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleFormChange}
              >
                {FAQ_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Question"
              name="question"
              value={formData.question}
              onChange={handleFormChange}
              required
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label="Answer"
              name="answer"
              value={formData.answer}
              onChange={handleFormChange}
              required
              multiline
              rows={5}
            />

            <TextField
              fullWidth
              label="Display Order"
              name="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={handleFormChange}
              helperText="Lower numbers appear first"
            />

            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={formData.active}
                  onChange={handleFormChange}
                />
              }
              label="Active (visible on FAQ page)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            loading={submitting}
          >
            {selectedFaq ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete FAQ?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this FAQ?
          </Typography>
          {selectedFaq && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              "{selectedFaq.question}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            loading={submitting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FaqManager;
