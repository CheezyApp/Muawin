import React, { useState } from 'react';
import { 
  Menu, 
  Avatar, 
  Typography, 
  Box, 
  Divider, 
  Button, 
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProfileMenu = ({ anchorEl, isOpen, onClose, user, darkMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      onClose();
      logout(); // Use the logout function from AuthContext
      navigate('/login', { replace: true }); // Navigate to login page
    }, 1000); // Simulate a short delay for loading animation
  };

  // Don't render if user is null
  if (!user) {
    return null;
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        style: {
          width: isMobile ? '90vw' : 320,
          padding: isMobile ? '20px' : '32px 28px 24px 28px',
          borderRadius: isMobile ? '12px' : '18px',
          backgroundColor: isMobile
            ? (darkMode ? '#1f1f1f' : '#fefefe')
            : (darkMode ? '#232323' : '#fff'),
          color: darkMode ? '#e0e0e0' : '#333',
          boxShadow: isMobile
            ? '0 12px 24px rgba(0, 0, 0, 0.15)'
            : '0 8px 32px rgba(0,0,0,0.18)',
          textAlign: 'center',
          maxHeight: isMobile ? '80vh' : 'auto',
          overflowY: 'auto',
          border: isMobile ? undefined : (darkMode ? '1px solid #333' : '1px solid #e0e0e0'),
        },
      }}
      anchorOrigin={{
        vertical: isMobile ? 'bottom' : 'bottom',
        horizontal: isMobile ? 'center' : 'center',
      }}
      transformOrigin={{
        vertical: isMobile ? 'top' : 'top',
        horizontal: isMobile ? 'center' : 'center',
      }}
      sx={{
        '& .MuiPaper-root': {
          margin: isMobile ? '8px' : '0',
        }
      }}
    >
      {/* Profile Avatar with Gradient */}
      <Box display="flex" justifyContent="center" mb={isMobile ? 1.5 : 2}>
        <Avatar
          sx={{
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            width: isMobile ? 56 : 68,
            height: isMobile ? 56 : 68,
            fontSize: isMobile ? '1.25rem' : '1.7rem',
            color: '#fff',
            boxShadow: isMobile ? undefined : '0 2px 12px 0 rgba(106,17,203,0.15)',
            border: isMobile ? undefined : '3px solid #fff',
          }}
        >
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </Avatar>
      </Box>

      {/* User Name and Email */}
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        sx={{ 
          fontWeight: 'bold', 
          color: darkMode ? '#ffffff' : '#222', 
          mb: isMobile ? 0.5 : 0.5,
          fontSize: isMobile ? '1rem' : '1.15rem',
          letterSpacing: isMobile ? 0 : 0.2,
        }}
      >
        {user.name || 'User Name'}
      </Typography>
      <Typography
        variant="body2"
        sx={{ 
          color: darkMode ? '#bdbdbd' : '#888', 
          mb: isMobile ? 1.5 : 2,
          fontSize: isMobile ? '0.875rem' : '1rem',
          fontWeight: 400,
        }}
      >
        {user.email || 'email@example.com'}
      </Typography>

      {/* Divider for better section separation */}
      <Divider sx={{ 
        my: isMobile ? 1.5 : 2, 
        backgroundColor: isMobile ? (darkMode ? '#333' : '#e0e0e0') : (darkMode ? '#444' : '#e0e0e0'),
        opacity: isMobile ? 1 : 0.7,
      }} />

      {/* Role and Branch Details with Prominent Text and Icons */}
      <Box display="flex" flexDirection="column" alignItems={isMobile ? 'center' : 'flex-start'} mb={isMobile ? 0 : 2} width="100%">
        <Box sx={{ 
          padding: 0, 
          display: 'flex', 
          alignItems: 'center', 
          mb: isMobile ? 0.75 : 0.5,
          flexDirection: 'row',
          textAlign: 'left',
          gap: 1.2,
          whiteSpace: 'nowrap',
          minWidth: 0,
          overflow: 'hidden',
          width: '100%',
        }}>
          <WorkIcon
            fontSize={isMobile ? "small" : "small"}
            sx={{ 
              mr: 1, 
              color: '#f15a22',
              verticalAlign: 'middle',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            sx={{ 
              fontWeight: 600, 
              color: darkMode ? '#fff' : '#222',
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              letterSpacing: 0.1,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            Role: <span style={{ fontWeight: 600 }}>{user.role || 'N/A'}</span>
          </Typography>
        </Box>
        <Box sx={{ 
          padding: 0, 
          display: 'flex', 
          alignItems: 'center',
          flexDirection: 'row',
          textAlign: 'left',
          gap: 1.2,
          whiteSpace: 'nowrap',
          minWidth: 0,
          overflow: 'hidden',
          width: '100%',
        }}>
          <LocationOnIcon
            fontSize={isMobile ? "small" : "small"}
            sx={{ 
              mr: 1, 
              color: '#f15a22',
              verticalAlign: 'middle',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            sx={{ 
              fontWeight: 600, 
              color: darkMode ? '#fff' : '#222',
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              letterSpacing: 0.1,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            Branch: <span style={{ fontWeight: 600 }}>{user.branch || 'N/A'}</span>
          </Typography>
        </Box>
      </Box>

      {/* Divider and Centered Logout Button */}
      <Divider sx={{ 
        my: isMobile ? 1.5 : 2, 
        backgroundColor: isMobile ? (darkMode ? '#333' : '#e0e0e0') : (darkMode ? '#444' : '#e0e0e0'),
        opacity: isMobile ? 1 : 0.7,
      }} />
      <Box display="flex" justifyContent="center" mt={isMobile ? 1.5 : 2}>
        <Button
          onClick={handleLogout}
          variant="contained"
          color="error"
          startIcon={
            isLoading ? (
              <CircularProgress size={isMobile ? 16 : 20} sx={{ color: '#fff' }} />
            ) : (
              <LogoutIcon fontSize={isMobile ? "small" : "medium"} />
            )
          }
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            padding: isMobile ? '6px 12px' : '10px 0',
            boxShadow: isMobile ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(244,67,54,0.10)',
            borderRadius: isMobile ? '8px' : '12px',
            backgroundColor: darkMode ? '#e53935' : '#f44336',
            fontSize: isMobile ? '0.875rem' : '1.05rem',
            minWidth: isMobile ? '120px' : '160px',
            letterSpacing: 0.2,
            transition: 'background 0.2s, box-shadow 0.2s',
            '&:hover': {
              backgroundColor: darkMode ? '#d32f2f' : '#d32f2f',
              boxShadow: isMobile ? '0 6px 16px rgba(244,67,54,0.15)' : '0 4px 16px rgba(244,67,54,0.13)',
            },
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Logging out..' : 'Logout'}
        </Button>
      </Box>
    </Menu>
  );
};

export default ProfileMenu;
