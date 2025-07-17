import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Drawer,
  Typography,
  Divider,
  Box,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const EditBranchNameDrawer = ({ open, onClose, onBranchUpdated }) => {
  const [zones, setZones] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [action, setAction] = useState('edit');
  const [newBranchName, setNewBranchName] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Determine light or dark mode based on system preferences
  const theme = useTheme();
  const prefersDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const dynamicTheme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: '#f15a22',
      },
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f15a22',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f15a22',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f15a22',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '&:focus .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f15a22',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f15a22',
            },
            '& .MuiOutlinedInput-input': {
              color: prefersDarkMode ? '#ffffff' : '#000000',
            },
          },
          icon: {
            color: '#f15a22',
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: '#f15a22',
          },
        },
      },
    },
  });

  // Fetch zones on load
  useEffect(() => {
    if (open) {
      fetchZones();
    }
  }, [open]);

  // Reset form fields and optionally trigger Snackbar when drawer closes
  useEffect(() => {
    if (!open) {
      resetFormFields();
      if (showSnackbar) {
        setTimeout(() => setShowSnackbar(false), 3000); // Auto-hide Snackbar
      }
    }
  }, [open, showSnackbar]);

  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found');


        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/zones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setZones(response.data);
    } catch (error) {
      // console.error('Error fetching zones:', error);

    }
  };

  const handleZoneChange = (event) => {
    const selectedZoneName = event.target.value;
    setSelectedZone(selectedZoneName);

    const zone = zones.find((z) => z.zoneName === selectedZoneName);
    if (zone) {
      // Fetch branches for the selected zone
      fetchBranches(selectedZoneName);
    }
  };

  const fetchBranches = async (zoneName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found');


        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/zones/${zoneName}/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBranches(response.data);
    } catch (error) {
      // console.error('Error fetching branches:', error);

    }
  };

  const resetFormFields = () => {
    setSelectedZone('');
    setBranches([]);
    setSelectedBranch('');
    setAction('edit');
    setNewBranchName('');
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found');


        return;
      }

      if (action === 'edit' && newBranchName) {
        const formattedBranchName = `Cheezious ${newBranchName}`;
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/zones/${selectedZone}/branches`,
          {
            oldBranchName: selectedBranch,
            newBranchName: formattedBranchName,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (typeof onBranchUpdated === 'function') {
          onBranchUpdated();
        }
        setSnackbarMessage('Branch name updated successfully!');
        setShowSnackbar(true);
        onClose();
      } else if (action === 'remove') {
        await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/zones/${selectedZone}/branches`,
          {
            data: { branchName: selectedBranch },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (typeof onBranchUpdated === 'function') {
          onBranchUpdated();
        }
        setSnackbarMessage('Branch removed successfully!');
        setShowSnackbar(true);
        onClose();
      }
    } catch (error) {
      // console.error('Error:', error.response?.data || error.message);


      setSnackbarMessage(error.response?.data?.message || 'An error occurred');
      setShowSnackbar(true);
    }
  };

  const handleNotificationClose = () => {
    setShowSnackbar(false);
  };

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            backgroundColor: prefersDarkMode ? '#121212' : '#ffffff',
            color: prefersDarkMode ? '#ffffff' : '#000000',
            width: isMobile ? '100%' : 500,
            maxWidth: '100vw',
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
            borderBottomLeftRadius: isMobile ? 0 : 8,
            borderBottomRightRadius: isMobile ? 0 : 8,
          },
        }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: 500,
          padding: isMobile ? 2 : 4,
          pt: isMobile ? 2 : 8,
          pb: isMobile ? 2 : 4,
          mx: 'auto',
        }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', mb: 1, color: '#f15a22', textAlign: 'center', fontSize: isMobile ? '1.1rem' : undefined }}>
            Edit or Remove Branch Name
          </Typography>
          <Divider sx={{ mb: 3, borderColor: '#f15a22' }} />

          <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
            <FormLabel sx={{ color: '#f15a22' }} component="legend">Select Action</FormLabel>
            <RadioGroup row={!isMobile} value={action} onChange={(e) => setAction(e.target.value)} sx={{ justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <FormControlLabel value="edit" control={<Radio sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }} />} label="Edit" />
              <FormControlLabel value="remove" control={<Radio sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }} />} label="Remove" />
            </RadioGroup>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#f15a22' }}>Select Zone</FormLabel>
            <Select
              value={selectedZone}
              onChange={handleZoneChange}
              displayEmpty
              sx={{
                '& .MuiInputLabel-root': { color: '#f15a22' },
                '& .MuiSelect-root': { color: prefersDarkMode ? '#ffffff' : '#000000' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#f15a22',
                },
                '&:focus .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#f15a22',
                },
                '& .MuiOutlinedInput-input': {
                  color: prefersDarkMode ? '#ffffff' : '#000000',
                },
                fontSize: isMobile ? '0.98rem' : undefined,
              }}
            >
              <MenuItem value="" disabled>
                Select a Zone
              </MenuItem>
              {zones.map((zone) => (
                <MenuItem key={zone._id} value={zone.zoneName} sx={{ fontSize: isMobile ? '0.98rem' : undefined }}>
                  {zone.zoneName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel sx={{ color: '#f15a22' }}>Select Branch</FormLabel>
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              displayEmpty
              disabled={!selectedZone}
              sx={{
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#f15a22',
                },
                '&:focus .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#f15a22',
                },
                '& .MuiOutlinedInput-input': {
                  color: prefersDarkMode ? '#ffffff' : '#000000',
                },
                fontSize: isMobile ? '0.98rem' : undefined,
              }}
            >
              <MenuItem value="" disabled>
                Select a Branch
              </MenuItem>
              {branches.map((branch, index) => (
                <MenuItem key={index} value={branch} sx={{ fontSize: isMobile ? '0.98rem' : undefined }}>
                  {branch || 'Unnamed Branch'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {action === 'edit' && (
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', mb: 2, gap: isMobile ? 1.5 : 1 }}>
              <TextField 
                label="Prefix (Locked)" 
                value="Cheezious" 
                InputProps={{ readOnly: true }} 
                sx={{ mr: isMobile ? 0 : 1, flex: 1, mb: isMobile ? 1 : 0 }}
                InputLabelProps={{
                  style: { color: '#f15a22' },
                  shrink: true,
                }}
              />
              <TextField 
                label="New Branch Name" 
                value={newBranchName} 
                onChange={(e) => setNewBranchName(e.target.value)} 
                fullWidth 
                sx={{ flex: 2 }}
                InputLabelProps={{
                  style: { color: '#f15a22' },
                  shrink: true,
                }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#f15a22',
              color: 'white',
              '&:hover': {
                backgroundColor: '#d9531e'
              },
              fontWeight: 600,
              fontSize: isMobile ? '1rem' : '1.05rem',
              minHeight: 44,
              mt: 1.5,
              mb: 1,
              borderRadius: 2,
              boxShadow: 2
            }}
            onClick={handleSave}
            disabled={!selectedZone || !selectedBranch || (action === 'edit' && !newBranchName)}
            fullWidth
          >
            {action === 'edit' ? 'Save Changes' : 'Remove Branch'}
          </Button>
        </Box>
      </Drawer>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleNotificationClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default EditBranchNameDrawer;