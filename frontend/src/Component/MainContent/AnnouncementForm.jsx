// src/Component/MainContent/AnnouncementForm.jsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Fade,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AnnouncementForm = ({ onClose, user, onAnnouncementAdded }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile devices

  const [announcement, setAnnouncement] = useState(''); // Controlled input for announcement

  const handleAddAnnouncement = () => {
    if (!announcement.trim()) {
      alert('Announcement cannot be empty.');
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ announcement, createdBy: user.name }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to add announcement');
      })
      .then((data) => {
      // console.log('Announcement added:', data);


      if (onAnnouncementAdded) {
        onAnnouncementAdded(data);
      }
      onClose();
    })
      .catch((error) => {
      // console.error('Error saving announcement:', error);


      alert('There was an error saving the announcement.');
    });
  };

  return (
    <Box
      id="announcement-backdrop"
      onClick={(event) => event.target.id === 'announcement-backdrop' && onClose()}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh', // Full screen height
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center', // Vertically center
        justifyContent: 'center', // Horizontally center
        zIndex: 1200,
        padding: isMobile ? '16px' : '0', // Add padding on mobile to prevent overflow
      }}
    >
      <Fade in timeout={300}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: isMobile ? '100%' : '500px', // Full width on mobile
            maxWidth: '90%', // Prevents excessive width on larger screens
            borderRadius: '12px',
            boxSizing: 'border-box',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row', // Stack elements on mobile
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
            }}
          >
            <Typography variant="h6" sx={{ mb: isMobile ? 2 : 0 }}>
              Add Announcement
            </Typography>
            <IconButton onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            label="Announcement"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            sx={{
              mt: 1.5,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#f15a22',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#f15a22',
              },
            }}
          />
          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: '#f15a22',
              width: '100%', // Full width on mobile
              '&:hover': { backgroundColor: '#d14e1f' },
            }}
            onClick={handleAddAnnouncement}
          >
            Add Announcement
          </Button>
        </Paper>
      </Fade>
    </Box>
  );
};

export default AnnouncementForm;
