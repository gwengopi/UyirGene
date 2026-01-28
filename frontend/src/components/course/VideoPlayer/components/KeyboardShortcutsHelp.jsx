import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Keyboard shortcuts data
const shortcuts = [
  { keys: ['Space', 'K'], description: 'Play / Pause' },
  { keys: ['\u2190'], description: 'Rewind 10 seconds' },
  { keys: ['\u2192'], description: 'Forward 10 seconds' },
  { keys: ['\u2191'], description: 'Increase volume' },
  { keys: ['\u2193'], description: 'Decrease volume' },
  { keys: ['M'], description: 'Toggle mute' },
  { keys: ['F'], description: 'Toggle fullscreen' },
  { keys: ['P'], description: 'Picture-in-Picture' },
  { keys: ['<'], description: 'Decrease speed' },
  { keys: ['>'], description: 'Increase speed' },
  { keys: ['0-9'], description: 'Seek to 0%-90%' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close / Exit' },
];

/**
 * Keyboard shortcuts help modal
 */
function KeyboardShortcutsHelp({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="shortcuts-dialog-title"
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
          },
        },
      }}
    >
      <DialogTitle
        id="shortcuts-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span">
          Keyboard Shortcuts
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="Close"
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {shortcuts.map((shortcut, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {shortcut.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      {keyIndex > 0 && (
                        <Typography
                          variant="caption"
                          sx={{ alignSelf: 'center', color: 'text.secondary' }}
                        >
                          /
                        </Typography>
                      )}
                      <Box
                        component="kbd"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 28,
                          height: 28,
                          px: 1,
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      >
                        {key}
                      </Box>
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2, textAlign: 'center' }}
        >
          Press ? anytime to show this help
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

export default KeyboardShortcutsHelp;
