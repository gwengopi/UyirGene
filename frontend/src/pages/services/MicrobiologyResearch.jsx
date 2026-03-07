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
import BiotechIcon from '@mui/icons-material/Biotech';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ParkIcon from '@mui/icons-material/Park';
import FactoryIcon from '@mui/icons-material/Factory';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import DnaIcon from '@mui/icons-material/Biotech';
import ShieldIcon from '@mui/icons-material/Shield';
import DescriptionIcon from '@mui/icons-material/Description';
import { Button, Breadcrumb, SEO } from '../../components/common';
import { useScrollAnimation } from '../../hooks';
import { useConfig, useUI } from '../../store';
import { ROUTES, IMAGES } from '../../utils/constants';

const researchAreas = [
  {
    icon: <MedicalServicesIcon sx={{ fontSize: 36 }} />,
    title: 'Medical Microbiology',
    description:
      'Study of microorganisms that cause human diseases, including bacteria, viruses, fungi, and parasites. Research includes understanding pathogenesis mechanisms, developing diagnostic tools, and discovering new antimicrobial agents.',
  },
  {
    icon: <ParkIcon sx={{ fontSize: 36 }} />,
    title: 'Environmental Microbiology',
    description:
      'Investigation of microorganism roles and activities in natural environments such as soil, water, air, and extreme habitats. Covers microbial ecology, biogeochemical cycling, bioremediation, and climate impact.',
  },
  {
    icon: <FactoryIcon sx={{ fontSize: 36 }} />,
    title: 'Industrial Microbiology',
    description:
      'Application of microorganisms in industrial processes including food production, fermentation, biotechnology, and biofuel production. Aims to optimize microbial processes and enhance productivity.',
  },
  {
    icon: <BubbleChartIcon sx={{ fontSize: 36 }} />,
    title: 'Microbial Ecology',
    description:
      'Examination of interactions between microorganisms and their environments. Investigates community structure, dynamics, biodiversity, and ecosystem functioning.',
  },
  {
    icon: <DnaIcon sx={{ fontSize: 36 }} />,
    title: 'Microbial Genomics',
    description:
      'Study of microbial genomes including sequencing, annotation, comparative genomics, and functional genomics. Provides insights into evolution, adaptation, and gene regulation.',
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 36 }} />,
    title: 'Antimicrobial Resistance',
    description:
      'Addressing the growing threat of resistance to antibiotics among pathogenic microorganisms. Includes studying resistance mechanisms, identifying novel targets, and developing new therapeutic strategies.',
  },
];

const validationSteps = [
  {
    title: 'Protocol Development',
    description: 'Establishing a detailed plan outlining the validation objectives, methods, acceptance criteria, and responsibilities.',
  },
  {
    title: 'Method Verification',
    description: 'Ensuring that the microbiological testing methods used are suitable for their intended purpose and can reliably detect and quantify microorganisms of interest.',
  },
  {
    title: 'Instrumentation Validation',
    description: 'Validating any equipment or instruments used in microbiological testing to ensure they are calibrated, accurate, and precise.',
  },
  {
    title: 'Process Validation',
    description: 'Verifying that the manufacturing processes, environmental controls, and hygiene practices effectively prevent contamination and maintain product sterility.',
  },
  {
    title: 'Analytical Validation',
    description: 'Assessing the performance characteristics of microbiological assays, including accuracy, precision, specificity, and sensitivity.',
  },
  {
    title: 'Documentation',
    description: 'Generating comprehensive documentation of all validation activity, including protocols, test results, deviations, and corrective actions taken.',
  },
];

const importancePoints = [
  {
    title: 'Product Safety',
    description: 'Microbial contamination can pose serious health risks to consumers, particularly in pharmaceuticals, food, and cosmetics. Validating processes ensures products are free from harmful microorganisms.',
  },
  {
    title: 'Regulatory Compliance',
    description: 'Regulatory agencies such as FDA, EMA, and FSSAI require companies to validate their microbiological processes to ensure compliance with stringent safety and quality standards.',
  },
  {
    title: 'Quality Assurance',
    description: 'Ensures the consistency and reliability of microbiological testing methods, environmental controls, and manufacturing processes for consistent product quality.',
  },
  {
    title: 'Risk Mitigation',
    description: 'Helps identify and mitigate potential risks of microbial contamination throughout the production process with effective control measures.',
  },
  {
    title: 'Consumer Confidence',
    description: 'Demonstrates commitment to product safety and quality, enhancing consumer confidence in the products they purchase.',
  },
  {
    title: 'Cost Savings',
    description: 'Reduces the need for rework, product recalls, and quality-related issues. Improves operational efficiency and minimizes costly disruptions.',
  },
];

function MicrobiologyResearch() {
  const navigate = useNavigate();
  const { getImage } = useConfig();
  const { isDarkMode } = useUI();
  const sectionAnim = useScrollAnimation({ threshold: 0.1 });
  const areasAnim = useScrollAnimation({ threshold: 0.1 });
  const validationAnim = useScrollAnimation({ threshold: 0.1 });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="Microbiology Research Services"
        description="Advanced microbiology research services including food microbiology, environmental microbiology, industrial microbiology and antimicrobial testing."
        path="/services/microbiology-research"
      />
      <Breadcrumb
        items={[
          { label: 'Services', path: ROUTES.SERVICES },
          { label: 'Microbiology Research', path: ROUTES.SERVICES_MICROBIOLOGY },
        ]}
      />

      {/* Hero */}
      <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 6 }}>
        <CardMedia
          component="img"
          image={getImage('SERVICE_MICROBIOLOGY', IMAGES.SERVICE_MICROBIOLOGY)}
          alt="Microbiology Research Lab"
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
          <BiotechIcon sx={{ fontSize: 56, color: '#fff', mb: 1, opacity: 0.9 }} />
          <Typography variant="h3" component="h1" fontWeight={700} sx={{ color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
            Microbiology Research Solution
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, maxWidth: 700, mx: 'auto' }}>
            Welcome to Uyir Tech Research Lab
          </Typography>
        </Box>
      </Box>

      {/* Overview */}
      <Paper ref={sectionAnim.ref} sx={{ p: { xs: 3, md: 5 }, mb: 4, opacity: sectionAnim.isVisible ? 1 : 0, transform: sectionAnim.isVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
          Uyirgene Research provides a microbiology research solution that encompasses a broad range of scientific investigations focused on microorganisms, including bacteria, viruses, fungi, protozoa, and archaea. Our research aims to advance understanding of these diverse microorganisms, their interactions with humans, animals, plants, and the environment, as well as their roles in various processes and ecosystems.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight={600} gutterBottom>
          Identifying Unknown Microorganisms
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Identifying unknown microorganisms is a fundamental aspect of microbiology research and is essential in healthcare, food safety, environmental monitoring, and biotechnology.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
              Phenotypic Methods
            </Typography>
            <List dense>
              {[
                { title: 'Microscopy', desc: 'Examination of cellular morphology, size, and arrangement for initial identification clues.' },
                { title: 'Biochemical Tests', desc: 'Testing for metabolic properties such as enzyme activity, sugar fermentation, and gas production (e.g., API test system).' },
                { title: 'Cultural Characteristics', desc: 'Observing growth patterns, colony morphology on agar plates for microbial identification.' },
              ].map((item, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.5, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.desc}
                    primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
              Genotypic Methods
            </Typography>
            <List dense>
              {[
                { title: '16S rRNA Sequencing', desc: 'Amplifying and sequencing the 16S ribosomal RNA gene for bacterial species identification and phylogenetic classification.' },
                { title: 'Whole Genome Sequencing (WGS)', desc: 'Analyzing the entire genome for precise identification and characterization of unknown microorganisms.' },
                { title: 'PCR-Based Techniques', desc: 'Polymerase chain reaction to amplify specific DNA regions, including multiplex PCR and real-time PCR for rapid detection.' },
              ].map((item, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.5, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.desc}
                    primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Research Areas */}
      <Box ref={areasAnim.ref} sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
          Research Disciplines
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, maxWidth: 650, mx: 'auto' }}>
          Our research spans multiple core disciplines of microbiology.
        </Typography>
        <Grid container spacing={3}>
          {researchAreas.map((area, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  opacity: areasAnim.isVisible ? 1 : 0,
                  transform: areasAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
                  },
                  transition: areasAnim.isVisible
                    ? `opacity 0.6s ease ${index * 0.1}s, transform 0.3s ease, box-shadow 0.3s ease`
                    : `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1.5 }}>{area.icon}</Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {area.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {area.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Microbiology Validation */}
      <Paper
        ref={validationAnim.ref}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          opacity: validationAnim.isVisible ? 1 : 0,
          transform: validationAnim.isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <DescriptionIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={600}>
            Microbiology Process Validation
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Microbiology validation refers to the process of verifying and documenting that microbiological procedures, methods, and systems are capable of consistently producing results that meet predetermined specifications. This validation process is essential in pharmaceuticals, food and beverage, cosmetics, and healthcare.
        </Typography>

        <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
          Validation Process
        </Typography>
        <Grid container spacing={2}>
          {validationSteps.map((step, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', gap: 1.5, p: 2, borderRadius: 2, bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, minWidth: 36, opacity: 0.5 }}>
                  {index + 1}
                </Typography>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
          Why Is Process Validation Important?
        </Typography>
        <Grid container spacing={2}>
          {importancePoints.map((point, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary.main">
                  {point.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {point.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

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
          Contact us today for your research needs. Our knowledgeable staff will work with you to provide a customized solution with competitive pricing and flexible scheduling.
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

export default MicrobiologyResearch;
