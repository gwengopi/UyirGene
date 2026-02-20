import React from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Breadcrumb, SEO } from '../components/common';

function Cookies() {
  const lastUpdated = 'January 1, 2024';

  const cookieTypes = [
    {
      type: 'Essential',
      purpose: 'Required for the website to function properly',
      duration: 'Session / 1 year',
      examples: 'Authentication, security, preferences',
    },
    {
      type: 'Analytics',
      purpose: 'Help us understand how visitors interact with our website',
      duration: '2 years',
      examples: 'Google Analytics, page views, user behavior',
    },
    {
      type: 'Functional',
      purpose: 'Enable enhanced functionality and personalization',
      duration: '1 year',
      examples: 'Video player preferences, language settings',
    },
    {
      type: 'Marketing',
      purpose: 'Track visitors across websites for advertising purposes',
      duration: '90 days',
      examples: 'Ad targeting, remarketing',
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <SEO title="Cookie Policy" description="Cookie Policy for Uyirgene International's website and learning platform." path="/cookies" noindex />
      <Breadcrumb items={[{ label: 'Cookie Policy', path: '/cookies' }]} />

      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Cookie Policy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Last updated: {lastUpdated}
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& p': { mb: 2, color: 'text.secondary' } }}>
          <Typography variant="h5" component="h2" fontWeight={600}>
            What Are Cookies?
          </Typography>
          <Typography variant="body1">
            Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            How We Use Cookies
          </Typography>
          <Typography variant="body1">
            Uyirgene uses cookies to improve your browsing experience, analyze site traffic, personalize content, and serve targeted advertisements. By using our Platform, you consent to our use of cookies as described in this policy.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Types of Cookies We Use
          </Typography>
          <TableContainer sx={{ my: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Purpose</strong></TableCell>
                  <TableCell><strong>Duration</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cookieTypes.map((cookie, index) => (
                  <TableRow key={index}>
                    <TableCell>{cookie.type}</TableCell>
                    <TableCell>{cookie.purpose}</TableCell>
                    <TableCell>{cookie.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Essential Cookies
          </Typography>
          <Typography variant="body1">
            These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions you take, such as logging in, filling in forms, or setting privacy preferences.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Analytics Cookies
          </Typography>
          <Typography variant="body1">
            These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our Platform and user experience.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Managing Cookies
          </Typography>
          <Typography variant="body1">
            You can control and manage cookies in various ways. Most browsers allow you to:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>View what cookies are stored and delete them individually</li>
            <li>Block third-party cookies</li>
            <li>Block cookies from specific sites</li>
            <li>Block all cookies</li>
            <li>Delete all cookies when you close your browser</li>
          </Box>
          <Typography variant="body1">
            Please note that blocking certain cookies may impact your experience on our Platform and limit the services we can provide.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Third-Party Cookies
          </Typography>
          <Typography variant="body1">
            Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. Third parties include analytics providers (like Google Analytics) and payment processors.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Updates to This Policy
          </Typography>
          <Typography variant="body1">
            We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. Any changes will be posted on this page with an updated revision date.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Contact Us
          </Typography>
          <Typography variant="body1">
            If you have any questions about our use of cookies, please contact us at privacy@uyirgene.com.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Cookies;
