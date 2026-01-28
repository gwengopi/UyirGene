import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Breadcrumb, Button } from '../components/common';
import { useNavigate } from 'react-router-dom';
import { faqService } from '../services';

// Category labels for display
const CATEGORY_LABELS = {
  GENERAL: 'General',
  COURSES: 'Courses',
  PAYMENTS: 'Payments & Refunds',
  CERTIFICATES: 'Certificates',
  TECHNICAL: 'Technical Support',
};

// Category order for display
const CATEGORY_ORDER = ['GENERAL', 'COURSES', 'PAYMENTS', 'CERTIFICATES', 'TECHNICAL'];

function FAQ() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [faqData, setFaqData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await faqService.getFaqs();
        setFaqData(data);
      } catch (err) {
        console.error('Failed to load FAQs:', err);
        setError('Failed to load FAQs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, []);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Get ordered categories that have FAQs
  const orderedCategories = CATEGORY_ORDER.filter(
    (category) => faqData[category] && faqData[category].length > 0
  );

  // Loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={[{ label: 'FAQ', path: '/faq' }]} />
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            Frequently Asked Questions
          </Typography>
        </Box>
        {[1, 2, 3].map((section) => (
          <Box key={section} sx={{ mb: 4 }}>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rectangular" height={56} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
          </Box>
        ))}
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={[{ label: 'FAQ', path: '/faq' }]} />
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  // Empty state
  if (orderedCategories.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={[{ label: 'FAQ', path: '/faq' }]} />
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No FAQs available yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Check back later or contact us if you have questions.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/contact')}>
            Contact Us
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'FAQ', path: '/faq' }]} />

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Frequently Asked Questions
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Find answers to common questions about Uyirgene.
        </Typography>
      </Box>

      {orderedCategories.map((category, sectionIndex) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            {CATEGORY_LABELS[category] || category}
          </Typography>
          {faqData[category].map((faq, index) => {
            const panelId = `${sectionIndex}-${index}`;
            return (
              <Accordion
                key={faq.id || index}
                expanded={expanded === panelId}
                onChange={handleChange(panelId)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      ))}

      <Box sx={{ textAlign: 'center', mt: 6, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Still have questions?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Can't find what you're looking for? Our support team is happy to help.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/contact')}>
          Contact Us
        </Button>
      </Box>
    </Container>
  );
}

export default FAQ;
