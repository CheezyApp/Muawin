import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Typography, 
  useTheme, 
  useMediaQuery,
  keyframes,
  Fade
} from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TodoList from '../TodoList/TodoList';

// Animation keyframes
const slideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(241, 90, 34, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(241, 90, 34, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(241, 90, 34, 0);
  }
`;

const TabsComponent = ({ latestAnnouncement, userId, userZone, userBranch, userEmail, refreshTrigger }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [majorAnnouncements, setMajorAnnouncements] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchMajorAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Authentication token not found.');
          return;
        }

        const response = await axios.get(`${apiBaseUrl}/announcements/latest`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data) {
          setMajorAnnouncements([response.data]);
        } else {
          setMajorAnnouncements([]);
        }
      } catch (error) {
        console.error('Error fetching major announcements:', error);
        setMajorAnnouncements([]);
      }
    };

    const fetchAssignedTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Authentication token not found.');
          return;
        }

        const response = await axios.get(`${apiBaseUrl}/assigned-tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            userId,
            zone: userZone,
            branch: userBranch
          }
        });
        setAssignedTasks(response.data);
      } catch (error) {
        console.error('Error fetching assigned tasks:', error);
        setAssignedTasks([]);
      }
    };

    fetchMajorAnnouncements();
    fetchAssignedTasks();
  }, [apiBaseUrl, userId, userZone, userBranch, refreshTrigger]);

  useEffect(() => {
    console.log("TabsComponent parameters:", { userId, userZone, userBranch, userEmail });
  }, [userId, userZone, userBranch, userEmail]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Paper
      square
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        borderRadius: '20px',
        boxShadow: isHovered 
          ? '0 12px 40px rgba(241, 90, 34, 0.15), 0 0 0 2px rgba(241, 90, 34, 0.1)' 
          : '0 8px 25px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        width: isMobile ? '100%' : 400,
        maxWidth: '100%',
        margin: 'auto',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        animation: `${slideIn} 0.6s ease-out`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(241, 90, 34, 0.05), transparent)',
          transition: 'left 0.6s',
          zIndex: 0,
        },
        '&:hover::before': {
          left: '100%',
        },
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="inherit"
        variant="fullWidth"
        TabIndicatorProps={{
          style: {
            backgroundColor: '#f15a22',
            height: '3px',
            borderRadius: '2px',
          },
        }}
        sx={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
          borderBottom: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
          '& .MuiTab-root': {
            minHeight: '60px',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.3s ease',
            position: 'relative',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(241, 90, 34, 0.1)' : 'rgba(241, 90, 34, 0.05)',
              transform: 'translateY(-1px)',
            },
            '&.Mui-selected': {
              color: '#f15a22',
              fontWeight: 700,
            },
          },
        }}
      >
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AnnouncementIcon sx={{ fontSize: '20px' }} />
              <span>Announcements</span>
            </Box>
          } 
          sx={{ color: activeTab === 0 ? '#f15a22' : 'inherit' }} 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon sx={{ fontSize: '20px' }} />
              <span>Tasks</span>
            </Box>
          } 
          sx={{ color: activeTab === 1 ? '#f15a22' : 'inherit' }} 
        />
      </Tabs>

      <Box
        sx={{
          p: 3,
          pt: 2,
          height: '280px',
          overflowY: 'auto',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          position: 'relative',
          zIndex: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#f15a22',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: '#d14e1f',
            },
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: isDarkMode ? '#333' : '#f1f1f1',
            borderRadius: '10px',
          },
        }}
      >
        {activeTab === 0 && (
          <Box
            sx={{
              p: 3,
              textAlign: 'left',
              backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
              borderRadius: '16px',
              height: '100%',
              width: '100%',
              position: 'relative',
              border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {majorAnnouncements && majorAnnouncements.length > 0 && majorAnnouncements[0] ? (
              <>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#f15a22',
                    mb: 2,
                    fontSize: isMobile ? '18px' : '20px',
                  }}
                >
                  📢 {majorAnnouncements[0].announcement}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mt: 1,
                    lineHeight: 1.6,
                    color: isDarkMode ? '#e0e0e0' : '#333',
                    fontSize: isMobile ? '14px' : '16px',
                  }}
                >
                  {majorAnnouncements[0].announcementDetails}
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    width: '100%',
                    padding: '0 16px',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ 
                      color: '#666',
                      fontSize: '12px',
                      mb: 0.5,
                    }}
                  >
                    📅 {new Date(majorAnnouncements[0].createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ 
                      color: '#666',
                      fontSize: '12px',
                    }}
                  >
                    👤 Posted by Admin
                  </Typography>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#666',
                }}
              >
                <AnnouncementIcon sx={{ fontSize: '48px', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  No Announcements
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Check back later for updates
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <TodoList
            userId={userId}
            userZone={userZone}
            userBranch={userBranch}
            userEmail={userEmail}
          />
        )}
      </Box>
    </Paper>
  );
};

export default TabsComponent;