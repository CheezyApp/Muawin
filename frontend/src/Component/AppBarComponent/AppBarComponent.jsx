import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import {
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Tooltip,
  Box,
  useMediaQuery,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';

import SearchBar from '../SearchBar/SearchBar';
import ProfileMenu from './ProfileMenu';
import NotificationMenu from './NotificationMenu';
import './AppBarComponent.css';
import { notificationService } from '../../services/notificationService';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: '#f15a22',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.5)',
}));

function AppBarComponent({
  // Dark mode
  darkMode,
  handleDarkModeToggle,

  // Search
  searchQuery,
  onSearch,
  searchResults,

  // User info
  user,

  // Drawer states
  mobileOpen,
  setMobileOpen,
  desktopOpen,
  setDesktopOpen,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Animations, etc.
  const [jumping, setJumping] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [highlightedIcon, setHighlightedIcon] = useState(null);

  // Profile menu anchor
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  // Notification menu anchor
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const isNotificationMenuOpen = Boolean(notificationAnchorEl);

  // Mobile search bar
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unread);
    } catch (error) {
      // console.error('Error fetching notifications:', error);


      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notifications as read
  const handleMarkAsRead = async (notificationIds) => {
    try {
      await notificationService.markAsRead(notificationIds);
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notificationIds.includes(notification._id)
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      // console.error('Error marking notifications as read:', error);

    }
  };

  // Fetch notifications on component mount and every minute
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  // Toggle the Drawer
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  // Dark mode icon animation
  const triggerAnimation = (setter, icon) => {
    setHighlightedIcon(icon);
    setter(true);
    setTimeout(() => setter(false), 500);
  };

  const handleDarkModeClick = () => {
    triggerAnimation(setRotating, 'darkMode');
    if (handleDarkModeToggle) {
      handleDarkModeToggle();
    }
  };

  // Handle notification click
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    triggerAnimation(setJumping, 'notifications');
    
    // Mark unread notifications as read when opening the menu
    const unreadIds = notifications
      .filter(n => !n.read)
      .map(n => n._id);
    if (unreadIds.length > 0) {
      handleMarkAsRead(unreadIds);
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  // Profile menu open/close
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
    setHighlightedIcon('account');
  };
  const handleMenuClose = () => {
    setProfileAnchorEl(null);
    setHighlightedIcon(null);
  };

  // Mobile search
  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    setHighlightedIcon('search');
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {/* Menu Icon (hamburger or close) */}
          <Tooltip
            title={mobileOpen ? 'Close Menu' : 'Open Menu'}
            placement="bottom"
            arrow
            enterDelay={900}
          >
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{
                marginRight: 1,
                padding: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {/* If mobile AND drawer is open, show close icon */}
              {isMobile && mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Tooltip>

          {/* LOGO */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: isMobile ? 1 : 0, display: 'flex', alignItems: 'center' }}
          >
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img
                src="/images/muawin_logo_white.svg"
                alt="Logo"
                style={{
                  width: isMobile ? 100 : 135,
                  height: 'auto',
                  cursor: 'pointer',
                }}
              />
            </Link>
          </Typography>

          {/* DESKTOP SEARCH BAR */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, mx: 2 }}>
              <SearchBar
                searchQuery={searchQuery}
                onSearch={onSearch}
                searchResults={searchResults}
              />
            </Box>
          )}

          {/* MOBILE SEARCH ICON */}
          {isMobile && (
            <Tooltip title="Search" placement="bottom" arrow enterDelay={900}>
              <IconButton
                onClick={toggleMobileSearch}
                color="inherit"
                sx={{
                  padding: '12px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                {mobileSearchOpen ? <CloseIcon /> : <SearchIcon />}
              </IconButton>
            </Tooltip>
          )}

          {/* DARK MODE ICON */}
          <Tooltip title="Toggle Dark Mode" placement="bottom" arrow enterDelay={900}>
            <IconButton
              onClick={handleDarkModeClick}
              color="inherit"
              sx={{
                padding: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* NOTIFICATIONS */}
          <Tooltip title="Notifications" placement="bottom" arrow enterDelay={900}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotificationClick}
              sx={{
                padding: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* ACCOUNT */}
          <Tooltip title="Account" placement="bottom" arrow enterDelay={900}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{
                padding: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* MOBILE SEARCH BAR BELOW THE MAIN TOOLBAR */}
        {isMobile && mobileSearchOpen && (
          <Toolbar
            sx={{
              backgroundColor: '#f15a22',
              paddingLeft: '16px',
              paddingRight: '16px',
            }}
          >
            <SearchBar
              searchQuery={searchQuery}
              onSearch={onSearch}
              searchResults={searchResults}
              fullWidth
            />
          </Toolbar>
        )}
      </AppBar>

      {/* Notification Menu */}
      <NotificationMenu
        anchorEl={notificationAnchorEl}
        open={isNotificationMenuOpen}
        onClose={handleNotificationClose}
        notifications={notifications}
        loading={loading}
        error={error}
      />

      {/* Profile Menu */}
      <ProfileMenu
        anchorEl={profileAnchorEl}
        isOpen={isProfileMenuOpen}
        onClose={handleMenuClose}
        user={user}
        darkMode={darkMode}
      />
    </>
  );
}

export default AppBarComponent;
