import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Accessible Modal component with focus trap and keyboard support
 */
function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const previousFocusRef = useRef(null);
  const titleId = title ? `modal-title-${Math.random().toString(36).substr(2, 9)}` : undefined;

  // Save the previously focused element and restore it on close
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [open]);

  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
      return;
    }
    onClose?.(event, reason);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby={titleId}
      aria-describedby={ariaDescribedBy}
      aria-modal="true"
      role="dialog"
      {...props}
    >
      {(title || showCloseButton) && (
        <DialogTitle
          id={titleId}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: showCloseButton ? 1 : 3,
          }}
        >
          {title && (
            <Typography variant="h6" component="span">
              {title}
            </Typography>
          )}
          {showCloseButton && (
            <IconButton
              aria-label="Close dialog"
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                ml: 'auto',
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers={!!title}>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}

export default Modal;
