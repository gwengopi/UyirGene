import React, { useState, useEffect, useCallback } from 'react';
import { Fab, Tooltip, Zoom, Box, Typography } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { configService } from '../../services';

const DEFAULT_WHATSAPP = '919943712383';
const DEFAULT_MESSAGE = 'Hi! I would like to know more about your courses and training programs.';

function TalkToExpert() {
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configs = await configService.getByCategory('CONTACT');
        const configMap = {};
        if (Array.isArray(configs)) {
          configs.forEach((c) => { configMap[c.key] = c.value; });
        } else if (configs && typeof configs === 'object') {
          Object.assign(configMap, configs);
        }
        if (configMap.CONTACT_WHATSAPP) {
          setWhatsappNumber(configMap.CONTACT_WHATSAPP);
        }
      } catch {
        // Silently fall back to default
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setIsVisible(true);
    };
    const timer = setTimeout(() => setIsVisible(true), 3000);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const showTimer = setTimeout(() => setShowTooltip(true), 2000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 7000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible]);

  const handleClick = useCallback(() => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [whatsappNumber]);

  return (
    <Zoom in={isVisible}>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        {showTooltip && (
          <Box
            sx={{
              backgroundColor: 'background.paper',
              color: 'text.primary',
              px: 2,
              py: 1,
              borderRadius: 2,
              boxShadow: 3,
              maxWidth: 200,
              animation: 'talkToExpertFadeIn 0.3s ease-out',
              '@keyframes talkToExpertFadeIn': {
                from: { opacity: 0, transform: 'translateY(8px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Talk to an Expert
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chat with us on WhatsApp
            </Typography>
          </Box>
        )}
        <Tooltip title="Talk to an Expert on WhatsApp" placement="left">
          <Fab
            onClick={handleClick}
            aria-label="Talk to an expert on WhatsApp"
            sx={{
              width: 56,
              height: 56,
              backgroundColor: '#25D366',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#128C7E',
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
              '@keyframes talkToExpertPulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.4)' },
                '70%': { boxShadow: '0 0 0 12px rgba(37, 211, 102, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0)' },
              },
              animation: 'talkToExpertPulse 2s infinite',
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Tooltip>
      </Box>
    </Zoom>
  );
}

export default TalkToExpert;
