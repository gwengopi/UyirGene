import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, IconButton, Chip, Avatar, CircularProgress, Alert,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import StarIcon from '@mui/icons-material/Star';
import { AdminLayout } from '../../components/admin';
import FlagshipProgramForm from '../../components/admin/FlagshipProgramForm';
import { flagshipService } from '../../services/flagshipService';
import { useToast } from '../../store';

function FlagshipPrograms() {
  const { showSuccess, showError } = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editProgram, setEditProgram] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const load = async () => {
    try {
      const data = await flagshipService.getAllPrograms();
      setPrograms(data);
    } catch {
      setError('Failed to load flagship programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = () => { setEditProgram(null); setFormOpen(true); };
  const handleEdit = (p) => { setEditProgram(p); setFormOpen(true); };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setDeletingId(p.id);
    try {
      await flagshipService.deleteProgram(p.id);
      setPrograms((prev) => prev.filter((x) => x.id !== p.id));
      showSuccess('Program deleted.');
    } catch {
      showError('Failed to delete program.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (p) => {
    setTogglingId(p.id);
    try {
      const updated = await flagshipService.toggleActive(p.id);
      setPrograms((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      showSuccess(`Program ${updated.active ? 'activated' : 'deactivated'}.`);
    } catch {
      showError('Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaved = (saved) => {
    setPrograms((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setFormOpen(false);
  };

  return (
    <AdminLayout title="Flagship Programs">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon sx={{ color: '#7B2D8B' }} />
          <Typography variant="h5" fontWeight={700}>Flagship Programs</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
          sx={{ bgcolor: '#7B2D8B', '&:hover': { bgcolor: '#6A1B7A' } }}>
          Add Program
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell>Program</TableCell>
                <TableCell>Tagline</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No flagship programs yet. Click "Add Program" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                programs.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {p.hasBackgroundImage ? (
                          <Avatar
                            src={p.backgroundImageUrl}
                            variant="rounded"
                            sx={{ width: 48, height: 36, borderRadius: 1 }}
                          />
                        ) : (
                          <Avatar variant="rounded" sx={{ width: 48, height: 36, borderRadius: 1, bgcolor: '#7B2D8B' }}>
                            <StarIcon fontSize="small" />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{p.title}</Typography>
                          <Typography variant="caption" color="text.secondary">/{p.slug}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{p.tagline || '—'}</Typography>
                    </TableCell>
                    <TableCell>{p.displayOrder}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.active ? 'Active' : 'Inactive'}
                        size="small"
                        color={p.active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={p.active ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggle(p)}
                          disabled={togglingId === p.id}
                          color={p.active ? 'success' : 'default'}
                        >
                          {togglingId === p.id
                            ? <CircularProgress size={18} />
                            : p.active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(p)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FlagshipProgramForm
        open={formOpen}
        program={editProgram}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}

export default FlagshipPrograms;
