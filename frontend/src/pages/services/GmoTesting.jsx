import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BiotechIcon from '@mui/icons-material/Biotech';
import { Button, Breadcrumb, SEO } from '../../components/common';
import { useScrollAnimation } from '../../hooks';
import { useConfig, useUI } from '../../store';
import { ROUTES, IMAGES } from '../../utils/constants';

const testingServices = [
  'PCR tests for seed samples',
  'PCR tests for food samples',
  'Ongoing research and development on detection procedures',
  'Consultation services for GMO testing needs',
];

function GmoTesting() {
  const navigate = useNavigate();
  const { getImage } = useConfig();
  const { isDarkMode } = useUI();
  const contentAnim = useScrollAnimation({ threshold: 0.1 });
  const servicesAnim = useScrollAnimation({ threshold: 0.1 });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="GMO Testing Lab"
        description="Professional GMO testing services using PCR technology to detect genetically modified organisms in food and feed samples. Ensure regulatory compliance with Uyirgene's expert testing lab."
        path="/services/gmo-testing"
      />
      <Breadcrumb
        items={[
          { label: 'Services', path: ROUTES.SERVICES },
          { label: 'GMO Testing', path: ROUTES.SERVICES_GMO_TESTING },
        ]}
      />

      {/* Hero */}
      <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 6 }}>
        <CardMedia
          component="img"
          image={getImage('SERVICE_GMO_TESTING', IMAGES.SERVICE_GMO_TESTING)}
          alt="GMO Testing Lab"
          sx={{ objectFit: 'cover', filter: 'brightness(0.3)', height: { xs: 180, sm: 220, md: 260 } }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '90%',
          }}
        >
          <ScienceIcon sx={{ fontSize: 56, color: '#fff', mb: 1, opacity: 0.9 }} />
          <Typography variant="h3" component="h1" fontWeight={700} sx={{ color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
            GMO Testing Lab
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, maxWidth: 700, mx: 'auto' }}>
            Your Partner for Quality Assurance
          </Typography>
        </Box>
      </Box>

      {/* What is GMO Testing */}
      <Paper
        ref={contentAnim.ref}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          opacity: contentAnim.isVisible ? 1 : 0,
          transform: contentAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
          At Uyir Tech Testing Lab, we understand the importance of quality assurance in today&apos;s competitive market. We offer a wide range of testing services, including blood culture testing, food product microbiology, and GMO analysis. Our experienced scientists and technicians use advanced equipment and methods to deliver accurate and reliable results.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <BiotechIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={600}>
            What is GMO Testing?
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          GMO testing uses PCR (Polymerase Chain Reaction) to detect genetically modified organisms in food and feed samples, providing independent verification and instilling confidence in your trading endeavors. Our cutting-edge screening techniques offer a cost-effective approach to identify both authorized and unauthorized GMOs.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <WarningAmberIcon sx={{ fontSize: 32, color: 'warning.main' }} />
          <Typography variant="h5" fontWeight={600}>
            Why GMO Testing Matters
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          The complexity of food production and the constant evolution of genetically modified organisms make detection increasingly challenging. Inadvertent mixing of GM and non-GM products requires detection throughout the entire supply chain to prevent cross-contamination.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          NGOs routinely conduct testing, and businesses must stay informed on regulatory changes. Our testing services ensure your products comply with both national and international GMO regulations.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <VerifiedUserIcon sx={{ fontSize: 32, color: 'success.main' }} />
          <Typography variant="h5" fontWeight={600}>
            GMO Certificate
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          A GMO certificate is issued upon completion of GMO certification, which includes sampling, inspections, audits, and document reviews to ensure full compliance with applicable regulations and standards.
        </Typography>
      </Paper>

      {/* Testing Services */}
      <Paper
        ref={servicesAnim.ref}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          opacity: servicesAnim.isVisible ? 1 : 0,
          transform: servicesAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Our GMO Testing Services
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Uyirgene Research Pvt Ltd is a leading GMO testing company. Our team of seasoned experts is dedicated to assisting you in earning the trust of your customers by ensuring the utmost quality of your products.
        </Typography>
        <List>
          {testingServices.map((service, i) => (
            <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText
                primary={service}
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Company Highlights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Advanced PCR Technology', desc: 'State-of-the-art polymerase chain reaction equipment for precise GMO detection at molecular level.' },
          { title: 'Regulatory Expertise', desc: 'Deep knowledge of national and international GMO regulations to ensure your products meet all compliance requirements.' },
          { title: 'Cost-Effective Solutions', desc: 'Cutting-edge screening techniques that offer an affordable approach to comprehensive GMO identification.' },
          { title: 'Reliable Results', desc: 'Our experienced scientists and technicians deliver accurate and dependable testing outcomes you can trust.' },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* CTA */}
      <Paper
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(79,102,114,0.2) 0%, rgba(22,22,22,0.4) 100%)'
            : 'linear-gradient(135deg, rgba(69,90,100,0.08) 0%, rgba(255,255,255,0.95) 100%)',
          borderRadius: 3,
        }}
      >
        <ScienceIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Request a Quote
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 550, mx: 'auto' }}>
          Contact us today for your GMO testing needs. Our staff will provide a customized solution with competitive pricing and flexible scheduling.
        </Typography>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/contact')}
          sx={{ px: 4, py: 1.5 }}
        >
          Enquire Now
        </Button>
      </Paper>
    </Container>
  );
}

export default GmoTesting;
