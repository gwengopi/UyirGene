import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Container } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ImageIcon from '@mui/icons-material/Image';
import ListIcon from '@mui/icons-material/List';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import RateReviewIcon from '@mui/icons-material/RateReview';
import VerifiedIcon from '@mui/icons-material/Verified';
import ScienceIcon from '@mui/icons-material/Science';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WorkIcon from '@mui/icons-material/Work';
import { AdminLayout, SiteConfigManager, MasterDataManager, FaqManager, FooterConfigManager, GoogleReviewManager, ServiceCertificationManager, ServiceTestingManager, ServiceDiagnosticsManager, CareerManager } from '../../components/admin';

function TabPanel({ children, value, index, ...props }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...props}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function Settings() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SettingsIcon color="primary" />
            <Typography variant="h4" fontWeight={700}>
              Settings
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage site configurations, images, and dropdown options
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab
              icon={<ImageIcon />}
              iconPosition="start"
              label="Site Images & Config"
              id="settings-tab-0"
              aria-controls="settings-tabpanel-0"
            />
            <Tab
              icon={<ListIcon />}
              iconPosition="start"
              label="Master Data (Dropdowns)"
              id="settings-tab-1"
              aria-controls="settings-tabpanel-1"
            />
            <Tab
              icon={<QuestionAnswerIcon />}
              iconPosition="start"
              label="FAQ Management"
              id="settings-tab-2"
              aria-controls="settings-tabpanel-2"
            />
            <Tab
              icon={<WebAssetIcon />}
              iconPosition="start"
              label="Footer Configuration"
              id="settings-tab-3"
              aria-controls="settings-tabpanel-3"
            />
            <Tab
              icon={<RateReviewIcon />}
              iconPosition="start"
              label="Google Reviews"
              id="settings-tab-4"
              aria-controls="settings-tabpanel-4"
            />
            <Tab
              icon={<VerifiedIcon />}
              iconPosition="start"
              label="Service Certifications"
              id="settings-tab-5"
              aria-controls="settings-tabpanel-5"
            />
            <Tab
              icon={<ScienceIcon />}
              iconPosition="start"
              label="Service Testings"
              id="settings-tab-6"
              aria-controls="settings-tabpanel-6"
            />
            <Tab
              icon={<LocalHospitalIcon />}
              iconPosition="start"
              label="Clinical Research"
              id="settings-tab-7"
              aria-controls="settings-tabpanel-7"
            />
            <Tab
              icon={<WorkIcon />}
              iconPosition="start"
              label="Careers"
              id="settings-tab-8"
              aria-controls="settings-tabpanel-8"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <SiteConfigManager />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <MasterDataManager />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <FaqManager />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <FooterConfigManager />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <GoogleReviewManager />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <ServiceCertificationManager />
        </TabPanel>

        <TabPanel value={activeTab} index={6}>
          <ServiceTestingManager />
        </TabPanel>

        <TabPanel value={activeTab} index={7}>
          <ServiceDiagnosticsManager />
        </TabPanel>

        <TabPanel value={activeTab} index={8}>
          <CareerManager />
        </TabPanel>
      </Container>
    </AdminLayout>
  );
}

export default Settings;
