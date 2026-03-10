import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Button, LoadingSpinner, EmptyState } from '../common';
import { masterDataService, DATA_TYPES } from '../../services';
import { useToast } from '../../store';

const PREDEFINED_TYPES = [
  { value: 'COURSE_CATEGORY', label: 'Course Categories' },
  { value: 'SKILL_LEVEL', label: 'Skill Levels' },
  { value: 'DURATION_TYPE', label: 'Duration Types' },
];

function MasterDataManager() {
  const { showSuccess, showError } = useToast();
  const [allData, setAllData] = useState([]);
  const [dataTypes, setDataTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('COURSE_CATEGORY');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    dataType: 'COURSE_CATEGORY',
    code: '',
    label: '',
    description: '',
    iconUrl: '',
    displayOrder: 0,
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, types] = await Promise.all([
        masterDataService.getAllMasterData(),
        masterDataService.getAllTypes(),
      ]);
      setAllData(data);
      setDataTypes(types.length > 0 ? types : PREDEFINED_TYPES.map(t => t.value));
    } catch (error) {
      showError('Failed to load master data');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = allData
    .filter((item) => item.dataType === selectedType)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const handleTypeChange = (event, newValue) => {
    setSelectedType(newValue);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        dataType: item.dataType,
        code: item.code,
        label: item.label,
        description: item.description || '',
        iconUrl: item.iconUrl || '',
        displayOrder: item.displayOrder || 0,
        active: item.active !== false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        dataType: selectedType,
        code: '',
        label: '',
        description: '',
        iconUrl: '',
        displayOrder: filteredData.length + 1,
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await masterDataService.updateMasterData(editingItem.id, formData);
        showSuccess('Master data updated');
      } else {
        await masterDataService.createMasterData(formData);
        showSuccess('Master data created');
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save master data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await masterDataService.deleteMasterData(id);
      showSuccess('Master data deleted');
      loadData();
    } catch (error) {
      showError('Failed to delete master data');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading master data..." />;
  }

  const uniqueTypes = [...new Set([...PREDEFINED_TYPES.map(t => t.value), ...dataTypes])];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Master Data Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Item
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedType}
          onChange={handleTypeChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {uniqueTypes.map((type) => {
            const predefined = PREDEFINED_TYPES.find(t => t.value === type);
            return (
              <Tab
                key={type}
                value={type}
                label={predefined ? predefined.label : type.replace(/_/g, ' ')}
              />
            );
          })}
        </Tabs>
      </Paper>

      {filteredData.length === 0 ? (
        <EmptyState
          title={`No ${selectedType.toLowerCase().replace(/_/g, ' ')} items`}
          description="Add items to populate dropdowns and lists"
          actionLabel="Add Item"
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Chip label={item.displayOrder || 0} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                      {item.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={item.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') handleCloseDialog(); }} disableEscapeKeyDown maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Master Data' : 'Add Master Data'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="dataType"
              label="Data Type"
              value={formData.dataType}
              onChange={handleChange}
              select
              fullWidth
              required
              disabled={!!editingItem}
            >
              {uniqueTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {PREDEFINED_TYPES.find(t => t.value === type)?.label || type.replace(/_/g, ' ')}
                </MenuItem>
              ))}
              <MenuItem value="CUSTOM">+ Add Custom Type</MenuItem>
            </TextField>
            {formData.dataType === 'CUSTOM' && (
              <TextField
                name="dataType"
                label="Custom Type Name"
                value=""
                onChange={(e) => setFormData(prev => ({ ...prev, dataType: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                fullWidth
                required
                helperText="Use UPPERCASE_SNAKE_CASE"
              />
            )}
            <TextField
              name="code"
              label="Code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
              required
              disabled={!!editingItem}
              helperText="Internal code (e.g., PROGRAMMING, BEGINNER)"
            />
            <TextField
              name="label"
              label="Display Label"
              value={formData.label}
              onChange={handleChange}
              fullWidth
              required
              helperText="Label shown to users"
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              name="displayOrder"
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              name="iconUrl"
              label="Icon URL (optional)"
              value={formData.iconUrl}
              onChange={handleChange}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MasterDataManager;
