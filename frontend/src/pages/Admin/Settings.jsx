import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Container } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ImageIcon from '@mui/icons-material/Image';
import ListIcon from '@mui/icons-material/List';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import { AdminLayout, SiteConfigManager, MasterDataManager, FaqManager, FooterConfigManager } from '../../components/admin';

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
      </Container>
    </AdminLayout>
  );
}

export default Settings;
