import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardMedia, Typography, Button, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function FlagshipProgramCard({ program }) {
  const navigate = useNavigate();

  let highlights = [];
  try {
    if (program.cardHighlights) {
      highlights = JSON.parse(program.cardHighlights);
    }
  } catch {
    // ignore
  }

  const imageUrl = program.backgroundImageUrl || null;

  return (
    <Card
      sx={{
        position: 'relative',
        height: 360,
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: 4,
        '&:hover .flagship-overlay': {
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.85) 100%)',
        },
        '&:hover .flagship-btn': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      }}
      onClick={() => navigate(`/flagship/${program.id}`)}
    >
      {/* Background image */}
      {imageUrl ? (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={program.title}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #7B2D8B 0%, #2C3E50 100%)',
          }}
        />
      )}

      {/* Dark gradient overlay */}
      <Box
        className="flagship-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)',
          transition: 'background 0.3s ease',
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 3,
        }}
      >
        {program.tagline && (
          <Chip
            label={program.tagline}
            size="small"
            sx={{
              alignSelf: 'flex-start',
              mb: 1.5,
              bgcolor: '#7B2D8B',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: 0.5,
            }}
          />
        )}

        <Typography
          variant="h5"
          component="h2"
          sx={{
            color: '#fff',
            fontWeight: 700,
            mb: 1,
            lineHeight: 1.25,
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}
        >
          {program.title}
        </Typography>

        {/* Highlights */}
        {highlights.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            {highlights.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <CheckCircleOutlineIcon sx={{ color: '#4CAF50', fontSize: 16 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem' }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {program.cardDescription && (
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.75)',
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.82rem',
            }}
          >
            {program.cardDescription}
          </Typography>
        )}

        <Button
          className="flagship-btn"
          variant="outlined"
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/flagship/${program.id}`);
          }}
          sx={{
            alignSelf: 'flex-start',
            color: '#fff',
            borderColor: 'rgba(255,255,255,0.6)',
            opacity: 0.85,
            transform: 'translateY(4px)',
            transition: 'all 0.25s ease',
            '&:hover': {
              borderColor: '#fff',
              bgcolor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          Enroll & Get Certified
        </Button>
      </Box>
    </Card>
  );
}

export default FlagshipProgramCard;
