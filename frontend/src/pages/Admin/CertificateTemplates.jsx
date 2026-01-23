import React from 'react';
import { Container, Typography } from '@mui/material';
import { AdminLayout, CertificateTemplateManager } from '../../components/admin';

function CertificateTemplates() {
  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Certificate Template Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Create and manage certificate templates for courses. You can customize
          backgrounds, header text, and set default templates for each certificate type.
        </Typography>
        <CertificateTemplateManager />
      </Container>
    </AdminLayout>
  );
}

export default CertificateTemplates;
