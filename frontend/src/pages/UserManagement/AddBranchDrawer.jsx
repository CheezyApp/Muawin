import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock'; // Import Lock Icon
import { useTheme } from '@mui/material/styles'; // Import to use theme settings
import axios from 'axios';
import useMediaQuery from '@mui/material/useMediaQuery';

const AddBranchDrawer = ({ open, onClose }) => {
  const theme = useTheme(); // Access current theme (light/dark)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [brandName] = useState('Cheezious'); // Static brand name
  const [branchName, setBranchName] = useState('');
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  // Fetch zones from the server
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage

        // console.log('Fetching zones in AddBranchDrawer. Token:', token);


        if (!token) {
          // console.error('Authentication token not found for fetching zones in AddBranchDrawer.');


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

    // Only fetch zones if the drawer is open
    if (open) {
      fetchZones();
    }
  }, [open]); // Added 'open' to dependency array

  const handleZoneChange = (e) => {
    setSelectedZone(e.target.value);
  };

  const handleBranchNameChange = (e) => {
    setBranchName(e.target.value); // Ensure branch name is in uppercase
  };

  const handleAddBranch = () => {
    if (!selectedZone || !branchName) {
      alert('Please select a zone and enter a branch name');
      return;
    }
    setConfirmationDialogOpen(true);
  };

  const handleConfirmAddBranch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found');


        return;
      }

      // Concatenate brand name with branch name
      const fullBranchName = `${brandName} ${branchName}`;

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/zones/${selectedZone}/branches`,
        { branchName: fullBranchName },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setConfirmationDialogOpen(false);
      onClose(); // Close drawer after adding the branch
    } catch (error) {
      // console.error('Error adding branch:', error);

    }
  };

  const handleCancelAddBranch = () => {
    setConfirmationDialogOpen(false);
  };

  return (
    <>
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : '30%',
            maxWidth: '100vw',
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
            borderBottomLeftRadius: isMobile ? 0 : 8,
            borderBottomRightRadius: isMobile ? 0 : 8,
          },
        }}
      >
        <Box sx={{ padding: isMobile ? 2 : 4, pt: isMobile ? 2 : 8, pb: isMobile ? 2 : 4 }}>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            gutterBottom
            sx={{ color: '#f15a22', fontWeight: 'bold', mt: isMobile ? 1 : 8, mb: 1, textAlign: 'center', fontSize: isMobile ? '1.1rem' : undefined }}
          >
            Add a Branch
          </Typography>
          <Divider sx={{ mb: 3, borderColor: '#f15a22' }} />

          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel
                  shrink
                  sx={{
                    color: '#f15a22',
                    '&.Mui-focused': { color: '#f15a22' }, // Ensure label color remains f15a22 when focused
                  }}
                >
                  Zone
                </InputLabel>
                <Select
                  label="Zone"
                  value={selectedZone}
                  onChange={handleZoneChange}
                  displayEmpty
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#f15a22' }, // Default border color
                      '&:hover fieldset': { borderColor: '#f15a22' }, // Hover border color
                      '&.Mui-focused fieldset': { borderColor: '#f15a22' }, // Focused border color
                    },
                    '& .MuiSelect-icon': { color: '#f15a22' }, // Dropdown arrow color
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f15a22', // Fix border color when focused
                    },
                    fontSize: isMobile ? '0.98rem' : undefined,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Zone
                  </MenuItem>
                  {zones.map((zone) => (
                    <MenuItem key={zone._id} value={zone.zoneName} sx={{ fontSize: isMobile ? '0.98rem' : undefined }}>
                      {zone.zoneName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Brand Name"
                value={brandName}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  readOnly: true, // Make field read-only
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        sx={{
                          color: theme.palette.mode === 'dark' ? '#9e9e9e' : '#616161', // Adjust color for dark/light mode
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#f15a22', // Set label color
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#f15a22' },
                    backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f0f0f0', // Grey out the input field dynamically
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000', // Set input text color dynamically
                    },
                    '&:hover fieldset': { borderColor: '#f15a22' },
                    '&.Mui-focused fieldset': { borderColor: '#f15a22' },
                  },
                  fontSize: isMobile ? '0.98rem' : undefined,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Branch Name"
                fullWidth
                variant="outlined"
                value={branchName}
                onChange={handleBranchNameChange}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#f15a22', // Set label color
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#f15a22' }, // Set border color
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000', // Set input text color dynamically
                    },
                    '&:hover fieldset': { borderColor: '#f15a22' },
                    '&.Mui-focused fieldset': { borderColor: '#f15a22' },
                  },
                  fontSize: isMobile ? '0.98rem' : undefined,
                }}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'center' : 'space-between',
              alignItems: 'center',
              gap: isMobile ? 2 : 0,
              mt: 4,
            }}
          >
            <Button
              onClick={onClose}
              sx={{ color: '#f15a22', fontWeight: 600, minWidth: 100, width: isMobile ? '100%' : 'auto' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddBranch}
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
              Add Branch
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={handleCancelAddBranch}
        aria-labelledby="confirm-add-branch-dialog"
      >
        <DialogTitle id="confirm-add-branch-dialog">Confirm Add Branch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are adding <strong>{`${brandName} ${branchName}`}</strong> in <strong>{selectedZone}</strong>. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: isMobile ? 'center' : 'flex-end',
            px: isMobile ? 2 : 3,
            pb: isMobile ? 2 : 3,
          }}
        >
          <Button
            onClick={handleCancelAddBranch}
            sx={{ color: '#f15a22', fontWeight: 600, minWidth: 100, width: isMobile ? '100%' : 'auto' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAddBranch}
            sx={{
              backgroundColor: '#f15a22',
              '&:hover': { backgroundColor: '#d3541e' },
              fontWeight: 600,
              minWidth: 120,
              width: isMobile ? '100%' : 'auto',
              fontSize: isMobile ? '1rem' : '1.05rem',
              boxShadow: 2,
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddBranchDrawer;
