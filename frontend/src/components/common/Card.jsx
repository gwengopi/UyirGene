import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardMedia,
  CardActions,
  CardActionArea,
  Typography,
  Skeleton,
} from '@mui/material';

/**
 * Reusable Card component with image, title, description, and actions
 */
function Card({
  title,
  description,
  image,
  imageAlt,
  imageHeight = 180,
  actions,
  onClick,
  children,
  loading = false,
  elevation = 1,
  sx = {},
  ...props
}) {
  if (loading) {
    return (
      <MuiCard elevation={elevation} sx={sx} {...props}>
        <Skeleton variant="rectangular" height={imageHeight} animation="wave" />
        <CardContent>
          <Skeleton variant="text" width="80%" height={32} animation="wave" />
          <Skeleton variant="text" width="100%" animation="wave" />
          <Skeleton variant="text" width="60%" animation="wave" />
        </CardContent>
      </MuiCard>
    );
  }

  const cardContent = (
    <>
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={imageAlt || title || ''}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        {title && (
          <Typography
            gutterBottom
            variant="h6"
            component="h3"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Typography>
        )}
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </Typography>
        )}
        {children}
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </>
  );

  if (onClick) {
    return (
      <MuiCard elevation={elevation} sx={sx} {...props}>
        <CardActionArea
          onClick={onClick}
          aria-label={title}
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >
          {cardContent}
        </CardActionArea>
      </MuiCard>
    );
  }

  return (
    <MuiCard elevation={elevation} sx={sx} {...props}>
      {cardContent}
    </MuiCard>
  );
}

export default Card;
