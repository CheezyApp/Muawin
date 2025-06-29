import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import axios from 'axios';
import ErrorBoundary from '../../components/ErrorBoundary';
import ErrorNotification from '../../components/ErrorNotification';
import useErrorHandler from '../../hooks/useErrorHandler';

const EditAssignedModulesDrawer = ({ open, onClose, user, onModulesUpdated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { error, handleError, clearError } = useErrorHandler();
  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Group modules by category
  const groupedModules = React.useMemo(() => {
    const groups = {};
    modules.forEach((mod) => {
      // Split on first underscore or first space-underscore
      let [category, ...rest] = mod.name.split('_');
      let sub = rest.join('_');
      if (!sub) {
        // fallback: if no underscore, treat whole as category
        category = mod.name;
        sub = '';
      }
      if (!groups[category]) groups[category] = [];
      groups[category].push({ ...mod, sub });
    });
    return groups;
  }, [modules]);

  const fetchModules = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleError(new Error('Authentication token not found'));
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/modules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setModules(response.data);
    } catch (error) {
      handleError(new Error('Failed to fetch modules. Please try again.'));
    }
  }, [handleError]);

  useEffect(() => {
    if (open && user) {
      fetchModules();
      setSelectedModules(user.assignedModules || user.registeredModules || []);
    }
  }, [open, user, fetchModules]);

  const handleModuleChange = (moduleId) => {
    setSelectedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleError(new Error('Authentication token not found'));
        return;
      }

      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/users/${user._id}/modules`,
        { modules: selectedModules },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setNotificationOpen(true);
      onModulesUpdated();
      onClose();
    } catch (error) {
      handleError(new Error('Failed to update assigned modules. Please try again.'));
    }
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  return (
    <ErrorBoundary>
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 600,
            maxWidth: '100vw',
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
            borderBottomLeftRadius: isMobile ? 0 : 8,
            borderBottomRightRadius: isMobile ? 0 : 8,
            backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
          },
        }}
      >
        <Box sx={{ padding: isMobile ? 2 : 4, pt: isMobile ? 2 : 8, pb: isMobile ? 2 : 4 }}>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            gutterBottom
            sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: isMobile ? '1.1rem' : undefined, mt: isMobile ? 1.5 : 2 }}
          >
            Edit Assigned Modules
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ maxHeight: isMobile ? '60vh' : '65vh', overflowY: 'auto', pr: 1 }}>
            {Object.entries(groupedModules).map(([category, mods]) => (
              <Box key={category} sx={{ mb: 2, pb: 1, borderRadius: 2, background: isMobile ? '#fafbfc' : '#f7f7f7' }}>
                <Typography sx={{ fontWeight: 700, fontSize: isMobile ? '1.05rem' : '1.13rem', color: '#f15a22', pl: 1, pt: 1 }}>
                  {category.replace(/_/g, ' ')}
                </Typography>
                <Box sx={{ pl: 2, pt: 0.5 }}>
                  {mods.map((mod) => (
                    <FormControlLabel
                      key={mod._id}
                      control={
                        <Checkbox
                          checked={selectedModules.includes(mod.name)}
                          onChange={() => handleModuleChange(mod.name)}
                          sx={{
                            color: theme.palette.mode === 'dark' ? '#f15a22' : '#f15a22',
                            '&.Mui-checked': {
                              color: theme.palette.mode === 'dark' ? '#f15a22' : '#f15a22',
                            },
                          }}
                        />
                      }
                      label={mod.sub ? mod.sub.replace(/_/g, ' ') : category.replace(/_/g, ' ')}
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                        fontSize: isMobile ? '0.98rem' : undefined,
                        ml: 1,
                        mb: 0.5,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'center' : 'flex-end',
              alignItems: 'center',
              gap: isMobile ? 2 : 0,
              mt: 4,
            }}
          >
            <Button
              onClick={onClose}
              sx={{ color: '#f15a22', fontWeight: 600, minWidth: 100, width: isMobile ? '100%' : 'auto', mb: isMobile ? 0 : undefined }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveChanges}
              sx={{
                backgroundColor: '#f15a22',
                '&:hover': { backgroundColor: '#d3541e' },
                fontWeight: 600,
                minWidth: 120,
                width: isMobile ? '100%' : 'auto',
                fontSize: isMobile ? '1rem' : '1.05rem',
                boxShadow: 2,
                mt: isMobile ? 0 : undefined,
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
        <ErrorNotification error={error} onClose={clearError} />
      </Drawer>
    </ErrorBoundary>
  );
};

export default EditAssignedModulesDrawer;
