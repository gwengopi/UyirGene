import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Button,
  Skeleton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatRole } from '../../utils/formatters';

/**
 * User Profile Card component
 */
function ProfileCard({
  user,
  stats = {},
  onEditProfile,
  loading = false,
  showStats = true,
  showEditButton = true,
}) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Skeleton variant="circular" width={80} height={80} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="80%" />
            </Box>
          </Box>
          {showStats && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Skeleton variant="rectangular" width={100} height={60} />
              <Skeleton variant="rectangular" width={100} height={60} />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <Card>
      <CardContent>
        {/* User info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
            }}
            alt={user.name}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h5" fontWeight={600}>
                {user.name}
              </Typography>
              <Chip
                label={formatRole(user.role)}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          {showEditButton && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEditProfile}
              size="small"
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {/* Stats */}
        {showStats && (
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: 1,
            }}
          >
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <SchoolIcon color="primary" />
                <Typography variant="h4" fontWeight={600}>
                  {stats.enrolledCourses || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Courses Enrolled
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="h4" fontWeight={600}>
                  {stats.completedCourses || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Courses Completed
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfileCard;
