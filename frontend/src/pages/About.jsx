import React from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import BiotechIcon from '@mui/icons-material/Biotech';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import { Breadcrumb } from '../components/common';

function About() {
  const services = [
    {
      icon: SchoolIcon,
      title: 'Professional Training',
      description: 'Food safety, FSMS, QMS, and Industrial Microbiology technical programs for students, individuals, and organizations.',
    },
    {
      icon: ScienceIcon,
      title: 'Research & Testing Lab',
      description: 'Microbiology research, environmental testing, food testing, and product testing with latest technology.',
    },
    {
      icon: VerifiedIcon,
      title: 'ISO 9001 Certified',
      description: 'Quality Management System certified organization maintaining highest industry standards.',
    },
    {
      icon: BiotechIcon,
      title: 'Microbiology Research',
      description: 'Rigorous testing process including sample collection, preparation, testing, and detailed analysis reports.',
    },
  ];

  const qualityCommitments = [
    'Providing high-quality Professional Development Program courses in both Offline and Online modes',
    'Provide customers with e-learning services that meet or exceed their needs and international standards',
    'Continually review performance against customers\' expectations and regulatory requirements',
    'Establishing, maintaining, and continually improving an effective Quality Management System (QMS) meeting ISO 9001:2015 requirements',
    'Provide and maintain a working environment that encourages all employees to improve and utilize their management skills',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'About Us', path: '/about' }]} />

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          About Uyirgene International
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 900, mx: 'auto' }}>
          Professional Training Institute | ISO 9001 Certified | Training Partner of Skill India Digital Hub (Govt of India)
        </Typography>
      </Box>

      {/* Our Expertise Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusinessIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight={600}>
            Our Expertise
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Uyir Tech International is a professional training institute, independent organization (ISO 9001) and Training partner of Skill India Digital Hub (Govt of India). U-Tech International collaborated with Uyirgene Research Lab and Academic Solution, providing global professional development training (Food safety, FSMS, QMS, and Industrial Microbiology technical programs) for students, individuals, and organizations.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Uyir Tech International is a leading training provider of certifications, dedicated to ensuring the industry's highest standards of food safety and quality. With our team of experienced professionals and extensive expertise in food safety management, we strive to assist businesses in meeting regulatory requirements, implementing best practices, and safeguarding their reputation.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          At Uyir Tech International, we understand the critical importance of food safety in today's global marketplace. Our mission is to help food manufacturers, processors, distributors, and retailers establish and maintain robust food safety systems that protect consumers and meet regulatory compliance. We believe that every individual has the right to safe and wholesome food, and we are committed to making that a reality.
        </Typography>
      </Paper>

      {/* Research & Testing Lab */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScienceIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight={600}>
            Research & Testing Lab
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          At Uyirgene Research and Testing Lab, we have a team of experienced professionals who specialize in a wide range of research and testing services, including microbiology research, environmental testing, food testing, and product testing. We use the latest technology and techniques to ensure accurate and reliable results.
        </Typography>
      </Paper>

      {/* Services Grid */}
      <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
        Our Services
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
              <service.icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {service.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {service.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Our Facilities */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight={600}>
            Our Facilities
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          We have state-of-the-art facilities equipped with the latest testing equipment and technology. Our labs are designed to meet the highest industry standards and are staffed by highly trained technicians who are dedicated to providing top-quality testing services.
        </Typography>
        <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
          Our Process
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We follow a rigorous testing process that ensures accuracy and reliability. Our process includes sample collection, preparation, testing, and analysis. We also provide detailed reports that are easy to understand and provide actionable insights.
        </Typography>
      </Paper>

      {/* Quality Commitment */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VerifiedIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight={600}>
            Quality from Uyirgene International
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Uyirgene International is committed to:
        </Typography>
        <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
          {qualityCommitments.map((commitment, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              <Typography variant="body1" component="span">
                {commitment}
              </Typography>
            </li>
          ))}
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          This Quality Policy is communicated, understood, and applied within the organization and is appropriate to the purpose and context of the organization and its strategic direction. The quality objectives mentioned above are achieved with the combined efforts of all personnel employed at Uyir Tech International.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          The company's Quality Policy and Objectives are readily available to all personnel. It is required that Uyirgene International Policy is fully understood, implemented, and maintained at all levels of the organization.
        </Typography>
      </Paper>

      {/* Contact Information */}
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Contact Us
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Uyir-Tech International Testing Laboratory, Research and Training Institute
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Bharathi Nagar, NGO Colony, Sattur, Tamil Nadu, India
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Email: admin@uyirgene.com | Website: www.uyirgene.com
        </Typography>
      </Paper>
    </Container>
  );
}

export default About;
