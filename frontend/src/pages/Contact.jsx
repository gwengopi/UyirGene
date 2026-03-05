import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, TextField, Alert, Divider, useTheme, alpha } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendIcon from '@mui/icons-material/Send';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Breadcrumb, Button, SEO } from '../components/common';
import { useToast } from '../store';
import { configService } from '../services';

// Default contact info (fallback if config not loaded)
const DEFAULT_CONTACT = {
  phoneManager: '+91-99 437 123 83',
  phoneOffice: '04562 359 331',
  whatsapp: '919943712383',
  email: 'uyirgene@gmail.com',
  emailOutlook: 'uyirgene@outlook.com',
  website: 'www.uyirgene.com',
  address: 'Uyir-Tech International Testing Laboratory, Research and Training Institute, Bharathi Nagar, NGO Colony, Sattur, Tamil Nadu, India',
  locations: 'Chennai, Bengaluru, Coimbatore & Sattur',
};

function Contact() {
  const { showSuccess, showError } = useToast();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contactConfig, setContactConfig] = useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);

  // Load contact configuration
  useEffect(() => {
    const loadContactConfig = async () => {
      try {
        const configs = await configService.getByCategory('CONTACT');
        const configMap = {};
        configs.forEach((config) => {
          configMap[config.key] = config.value;
        });

        setContactConfig({
          phoneManager: configMap.CONTACT_PHONE_MANAGER || DEFAULT_CONTACT.phoneManager,
          phoneOffice: configMap.CONTACT_PHONE_OFFICE || DEFAULT_CONTACT.phoneOffice,
          whatsapp: configMap.CONTACT_WHATSAPP || DEFAULT_CONTACT.whatsapp,
          email: configMap.CONTACT_EMAIL || DEFAULT_CONTACT.email,
          emailOutlook: configMap.CONTACT_EMAIL_OUTLOOK || DEFAULT_CONTACT.emailOutlook,
          website: configMap.CONTACT_WEBSITE || DEFAULT_CONTACT.website,
          address: configMap.CONTACT_ADDRESS || DEFAULT_CONTACT.address,
          locations: configMap.CONTACT_LOCATIONS || DEFAULT_CONTACT.locations,
        });
      } catch (error) {
        console.error('Failed to load contact config:', error);
        // Keep default values
      } finally {
        setLoading(false);
      }
    };

    loadContactConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email address';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    else if (formData.message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);

    // Simulate form submission (replace with real API call when backend is ready)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitting(false);
    setSubmitted(true);
    showSuccess('Message sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setFormErrors({});
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hello! I would like to inquire about your services and courses.');
    window.open(`https://wa.me/${contactConfig.whatsapp}?text=${message}`, '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${contactConfig.email}?subject=Inquiry from Website`;
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Manager',
      content: contactConfig.phoneManager,
      link: `tel:${contactConfig.phoneManager.replace(/[\s-]/g, '')}`,
    },
    {
      icon: PhoneIcon,
      title: 'Office',
      content: contactConfig.phoneOffice,
      link: `tel:${contactConfig.phoneOffice.replace(/[\s-]/g, '')}`,
    },
    {
      icon: EmailIcon,
      title: 'Email',
      content: contactConfig.email,
      link: `mailto:${contactConfig.email}`,
    },
    {
      icon: EmailIcon,
      title: 'Email',
      content: contactConfig.emailOutlook,
      link: `mailto:${contactConfig.emailOutlook}`,
    },
    {
      icon: LanguageIcon,
      title: 'Website',
      content: contactConfig.website,
      link: `https://${contactConfig.website}`,
    },
    {
      icon: LocationOnIcon,
      title: 'Head Office',
      content: contactConfig.address,
      link: null,
    },
    {
      icon: BusinessIcon,
      title: 'Our Offices',
      content: contactConfig.locations,
      link: null,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="Contact Us"
        description="Get in touch with Uyirgene International. Reach us at our offices in Chennai, Bengaluru, Coimbatore & Sattur for training, testing, and certification inquiries."
        path="/contact"
      />
      <Breadcrumb items={[{ label: 'Contact Us', path: '/contact' }]} />

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Contact Us
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Better yet, see us in person!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          We love meeting our customers. Feel free to visit during normal business hours.
        </Typography>
      </Box>

      {/* Quick Contact Buttons */}
      <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Get in Touch Instantly
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose your preferred way to connect with us
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsAppClick}
            sx={{
              backgroundColor: '#25D366',
              '&:hover': { backgroundColor: '#128C7E' },
              px: 4,
            }}
          >
            Chat on WhatsApp
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<EmailIcon />}
            onClick={handleEmailClick}
            sx={{ px: 4 }}
          >
            Send us an Email
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Drop us a line!
            </Typography>

            {submitted && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Thank you for your message! We'll get back to you soon.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    error={!!formErrors.subject}
                    helperText={formErrors.subject}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    error={!!formErrors.message}
                    helperText={formErrors.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    loading={submitting}
                    fullWidth
                    endIcon={<SendIcon />}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Info */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Contact Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Feel free to reach out to us through any of the following channels.
            </Typography>

            {contactInfo.map((info, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 3,
                }}
              >
                <info.icon sx={{ color: 'primary.main', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {info.title}
                  </Typography>
                  {info.link ? (
                    <Typography
                      component="a"
                      href={info.link}
                      target={info.link.startsWith('http') ? '_blank' : undefined}
                      rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                    >
                      {info.content}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {info.content}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Uyirgene International
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Professional Training Institute | ISO 9001 Certified | Training Partner of Skill India Digital Hub (Govt of India)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Contact;
