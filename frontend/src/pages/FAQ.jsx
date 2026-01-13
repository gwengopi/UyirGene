import React, { useState } from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Breadcrumb, Button } from '../components/common';
import { useNavigate } from 'react-router-dom';

function FAQ() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is Uyirgene?',
          a: 'Uyirgene is an online learning platform that offers a wide range of courses taught by industry experts. Our mission is to make quality education accessible to everyone.',
        },
        {
          q: 'How do I create an account?',
          a: 'Click on the "Sign Up" button in the top right corner of the page. Fill in your details including name, email, and password, then click "Register" to create your account.',
        },
        {
          q: 'Is Uyirgene free to use?',
          a: 'Creating an account is free. We offer both free and paid courses. Free courses provide full access to content, while paid courses may include additional features like certificates and premium content.',
        },
      ],
    },
    {
      category: 'Courses',
      questions: [
        {
          q: 'How do I enroll in a course?',
          a: 'Browse our course catalog, select a course you are interested in, and click "Enroll Now". For paid courses, you will be directed to complete the payment process.',
        },
        {
          q: 'Can I access courses on mobile devices?',
          a: 'Yes! Our platform is fully responsive and works on all devices including smartphones, tablets, and desktop computers.',
        },
        {
          q: 'How long do I have access to a course?',
          a: 'Once enrolled, you have lifetime access to the course content. You can learn at your own pace and revisit the material anytime.',
        },
        {
          q: 'Can I download course videos?',
          a: 'Currently, videos are available for streaming only. This helps us protect the content and ensure the best quality experience.',
        },
      ],
    },
    {
      category: 'Payments',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit/debit cards, UPI, net banking, and popular digital wallets through our secure payment gateway (Razorpay).',
        },
        {
          q: 'Is my payment information secure?',
          a: 'Absolutely. We use industry-standard encryption and never store your complete payment details. All transactions are processed through secure payment gateways.',
        },
        {
          q: 'Can I get a refund?',
          a: 'Yes, we offer a 7-day refund policy. If you are not satisfied with a course, you can request a refund within 7 days of purchase, provided you have not completed more than 30% of the course.',
        },
      ],
    },
    {
      category: 'Certificates',
      questions: [
        {
          q: 'How do I get a certificate?',
          a: 'Certificates are awarded upon successful completion of a course. You need to complete all required lessons and any assessments to receive your certificate.',
        },
        {
          q: 'Are the certificates recognized?',
          a: 'Our certificates are issued by Uyirgene and can be shared on professional networks like LinkedIn. While they demonstrate your learning achievement, recognition may vary by employer.',
        },
        {
          q: 'Can I verify a certificate?',
          a: 'Yes, each certificate has a unique ID that can be verified on our platform. Simply enter the certificate ID on our verification page.',
        },
      ],
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'What browsers are supported?',
          a: 'We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome.',
        },
        {
          q: 'Videos are not playing. What should I do?',
          a: 'Try refreshing the page, clearing your browser cache, or using a different browser. If the issue persists, please contact our support team.',
        },
        {
          q: 'How do I reset my password?',
          a: 'Click on "Forgot Password" on the login page, enter your email address, and we will send you a password reset link.',
        },
      ],
    },
  ];

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

      {faqs.map((section, sectionIndex) => (
        <Box key={sectionIndex} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            {section.category}
          </Typography>
          {section.questions.map((faq, index) => {
            const panelId = `${sectionIndex}-${index}`;
            return (
              <Accordion
                key={index}
                expanded={expanded === panelId}
                onChange={handleChange(panelId)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{faq.a}</Typography>
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
