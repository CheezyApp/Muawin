// src/Component/MainContent/MainContent.jsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  keyframes,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Banner from '../BannerComponent/BannerComponent';
import TilesGrid from '../TileGrid/TileGrid';
import TabsComponent from '../TabComponent/TabComponent'; // Ensure correct path
import AnnouncementForm from './AnnouncementForm';
import TaskForm from './TaskForm';

// Animation keyframes
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

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const MainContent = ({ user }) => {
  // Move all hooks to the top
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const headingColor = theme.palette.mode === 'dark' ? '#f15a22' : '#000000';
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hoveredButton, setHoveredButton] = useState(null);

  const tiles = useMemo(() => {
    if (!user || !user.registeredModules || !Array.isArray(user.registeredModules)) {
      return [];
    }
    const allTiles = [
      { name: 'Licenses', image: '/images/licenses.webp' },
      { name: 'Approvals', image: '/images/approved.webp' },
      { name: 'Vehicles', image: '/images/vehicle.webp' },
      { name: 'User Tickets', image: '/images/user_icon.webp' },
      { name: 'Health Safety Environment', image: '/images/hse.webp' },
      { name: 'Taxation', image: '/images/taxation.webp' },
      { name: 'Certificates', image: '/images/certificate.webp' },
      { name: 'Security', image: '/images/security.webp' },
      { name: 'Admin Policies and SOPs', image: '/images/admin_icon.webp' },
      { name: 'Rental Agreements', image: '/images/rental_agreements.webp' },
      { name: 'HR Portal', image: '/images/hr_icon.webp' },
      { name: 'User Management', image: '/images/user_management.webp' },
    ];
    return allTiles.filter((tile) =>
      user.registeredModules.some((module) => module.includes(tile.name))
    );
  }, [user]);

  const fetchLatestAnnouncement = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');


        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/announcements/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLatestAnnouncement(data);
    } catch (error) {
      // console.error('Error fetching the latest announcement:', error);

    }
  };

  useEffect(() => {
    fetchLatestAnnouncement();
  }, []);

  useEffect(() => {
    // console.log('User data in MainContent:', user);

  }, [user]);

  // Don't render if user is null (after all hooks)
  if (!user) {
    return (
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 2 : 4,
          marginLeft: isMobile ? 0 : 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h6">Loading user data...</Typography>
      </Box>
    );
  }

  const handleTileClick = (tileName) => {
    const paths = {
      Licenses: '/Licenses/Licensepage',
      Approvals: '/Approval/Approvalpage',
      Vehicles: '/Vehicles/Vehiclepage',
      UserRequests: '/UserRequests/UserRequests',
      'Health Safety Environment': '/Hse/Hse',
      Taxation: '/Taxation/Taxationpage',
      Certificates: '/Certificate/Certificatepage',
      Security: '/Security/GuardTraining',
      'Admin Policies and SOPs': '/AdminPolicies/AdminPolicies',
      'Rental Agreements': '/RentalAgreements/RentalAgreements',
      'User Management': '/UserManagement/UserManagement',
    };
    navigate(paths[tileName], { state: { tileName } });
  };

  const handleAnnouncementAdded = (newAnnouncement) => {
    setLatestAnnouncement(newAnnouncement);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: isMobile ? 2 : 4, // Reduced padding on mobile
        marginLeft: isMobile ? 0 : 1,
        transition: 'margin-left 0.1s',
        overflowY: 'auto',
        height: '100vh',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#555',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
        },
      }}
    >
      <Banner />
      <Typography
        variant="h4"
        sx={{
          color: headingColor,
          mb: 1,
          textAlign: 'left',
          ml: isMobile ? 2 : 6,
          fontSize: isMobile ? '24px' : '30px',
          fontFamily: 'TanseekModernW20',
        }}
      >
        MODULES
      </Typography>

      <Grid container spacing={isMobile ? 2 : 0} alignItems="flex-start">
        <Grid item xs={12} md={8}>
          <Box sx={{ ml: isMobile ? 0 : 6 }}>
            <TilesGrid tiles={tiles} onTileClick={handleTileClick} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          {user.role === 'Admin' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                mb: 3,
                ml: isMobile ? 0 : 10,
                maxWidth: '100%',
                gap: isMobile ? 2 : 3,
                animation: `${slideIn} 0.6s ease-out`,
              }}
            >
              {/* Add Announcement Button */}
              <Button
                variant="contained"
                onMouseEnter={() => setHoveredButton('announcement')}
                onMouseLeave={() => setHoveredButton(null)}
                sx={{
                  width: isMobile ? '100%' : '48%',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f15a22 0%, #ff6b35 100%)',
                  boxShadow: hoveredButton === 'announcement' 
                    ? '0 8px 25px rgba(241, 90, 34, 0.4), 0 0 0 3px rgba(241, 90, 34, 0.1)' 
                    : '0 4px 15px rgba(241, 90, 34, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredButton === 'announcement' ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d14e1f 0%, #e55a2b 100%)',
                    transform: 'translateY(-6px) scale(1.05)',
                    boxShadow: '0 12px 35px rgba(241, 90, 34, 0.5), 0 0 0 4px rgba(241, 90, 34, 0.15)',
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(0.98)',
                    transition: 'all 0.1s',
                  },
                  animation: hoveredButton === 'announcement' ? `${pulse} 2s infinite` : 'none',
                }}
                onClick={() => setShowAnnouncementForm(true)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CampaignIcon 
                    sx={{ 
                      fontSize: '24px',
                      animation: hoveredButton === 'announcement' ? `${bounce} 1s infinite` : 'none',
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '14px' : '16px',
                      textTransform: 'none',
                    }}
                  >
                    Add Announcement
                  </Typography>
                </Box>
              </Button>

              {/* Add Task Button */}
              <Button
                variant="contained"
                onMouseEnter={() => setHoveredButton('task')}
                onMouseLeave={() => setHoveredButton(null)}
                sx={{
                  width: isMobile ? '100%' : '48%',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f15a22 0%, #ff6b35 100%)',
                  boxShadow: hoveredButton === 'task' 
                    ? '0 8px 25px rgba(241, 90, 34, 0.4), 0 0 0 3px rgba(241, 90, 34, 0.1)' 
                    : '0 4px 15px rgba(241, 90, 34, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredButton === 'task' ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d14e1f 0%, #e55a2b 100%)',
                    transform: 'translateY(-6px) scale(1.05)',
                    boxShadow: '0 12px 35px rgba(241, 90, 34, 0.5), 0 0 0 4px rgba(241, 90, 34, 0.15)',
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(0.98)',
                    transition: 'all 0.1s',
                  },
                  animation: hoveredButton === 'task' ? `${pulse} 2s infinite` : 'none',
                }}
                onClick={() => setShowTaskForm(true)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon 
                    sx={{ 
                      fontSize: '24px',
                      animation: hoveredButton === 'task' ? `${bounce} 1s infinite` : 'none',
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '14px' : '16px',
                      textTransform: 'none',
                    }}
                  >
                    Add Task
                  </Typography>
                </Box>
              </Button>
            </Box>
          )}

          <Box
            sx={{
              ml: isMobile ? 0 : 10,
              overflowY: 'auto',
              maxHeight: isMobile ? '60vh' : 'calc(100vh - 200px)',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
            }}
          >
            <TabsComponent
              latestAnnouncement={latestAnnouncement}
              userId={user?._id?.toString()}
              userZone={user?.zone}
              userBranch={user?.branch}
              userEmail={user?.email}
              refreshTrigger={refreshTrigger}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Modals */}
      {showAnnouncementForm && (
        <AnnouncementForm 
          onClose={() => setShowAnnouncementForm(false)} 
          user={user} 
          onAnnouncementAdded={handleAnnouncementAdded}
        />
      )}

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          userId={user?._id}
          userZone={user?.zone}
          userBranch={user?.branch}
          onTaskAdded={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </Box>
  );
};

export default MainContent;
