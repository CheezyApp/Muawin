import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AddCylinderExpiry = ({ onAdd, user }) => {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [cylinderExpiryData, setCylinderExpiryData] = useState([{
    location: '',
    categories: []
  }]);
  const [snackbarMessage, setSnackbarMessage] = useState('Cylinder expiry data added successfully!');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const theme = useTheme();

  const resetForm = () => {
    setCylinderExpiryData([{
      location: '',
      categories: []
    }]);
  };

  useEffect(() => {
    const fetchLocationsAndCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Authentication token not found');
          return;
        }
        const [locationsRes, categoriesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/locations`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/categories`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);
        setAvailableLocations(locationsRes.data);
        setAvailableCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchLocationsAndCategories();
  }, []);

  const handleAddCategory = (locationIndex) => {
    setCylinderExpiryData(prev => prev.map((item, index) => 
      index === locationIndex 
        ? { ...item, categories: [...item.categories, { category: '', weight: '', date: '' }] }
        : item
    ));
  };

  const handleRemoveCategory = (locationIndex, categoryIndex) => {
    setCylinderExpiryData(prev => prev.map((item, index) => 
      index === locationIndex 
        ? { ...item, categories: item.categories.filter((_, i) => i !== categoryIndex) }
        : item
    ));
  };

  const handleLocationChange = (locationIndex, event) => {
    setCylinderExpiryData(prev => prev.map((item, index) => 
      index === locationIndex 
        ? { 
            ...item, 
            location: event.target.value, 
            categories: [{ category: '', weight: '', date: '' }]
          }
        : item
    ));
  };

  const handleCategoryChange = (locationIndex, categoryIndex, event) => {
    const selectedCategory = availableCategories.find(cat => cat.name === event.target.value);
    const weight = selectedCategory?.weight ? selectedCategory.weight : '';

    setCylinderExpiryData(prev => prev.map((item, index) =>
      index === locationIndex
        ? {
            ...item,
            categories: item.categories.map((cat, i) =>
              i === categoryIndex
                ? { ...cat, category: event.target.value, weight: weight }
                : cat
            )
          }
        : item
    ));
  };

  const handleDateChange = (locationIndex, categoryIndex, event) => {
    setCylinderExpiryData(prev => prev.map((item, index) => 
      index === locationIndex 
        ? {
            ...item,
            categories: item.categories.map((cat, i) => 
              i === categoryIndex 
                ? { ...cat, date: event.target.value }
                : cat
            )
          }
        : item
    ));
  };

  const handleAddLocation = () => {
    setCylinderExpiryData(prev => [...prev, { location: '', categories: [] }]);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found');
        return;
      }
      const responses = await Promise.all(
        cylinderExpiryData.map(data => 
          axios.post(`${process.env.REACT_APP_API_BASE_URL}/cylinder-expiry`, {
            ...data,
            zone: user?.zone, 
            branch: user?.branch
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
      if (typeof onAdd === 'function') {
        onAdd(responses.map(res => res.data));
      }
      handleClose();
      setSnackbarOpen(true);
      setSnackbarMessage('Cylinder expiry data added successfully!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error submitting data:', error);
      setSnackbarOpen(true);
      setSnackbarMessage('Error submitting data. Please try again.');
      setSnackbarSeverity('error');
    }
  };

  const handleCylinderExpirySubmission = async (cylinderExpiryData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found');
        return;
      }
      const responses = await Promise.all(
        cylinderExpiryData.map(data => 
          axios.post(`${process.env.REACT_APP_API_BASE_URL}/cylinder-expiry`, {
            ...data,
            zone: user?.zone,
            branch: user?.branch,
            categories: data.categories.map(cat => ({
              ...cat,
              weight: parseFloat(cat.weight.replace(/[^\d.-]/g, ''))
            }))
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
      // Handle the response if needed
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const buttonStyle = {
    borderRadius: '15px',
    backgroundColor: '#f15a22',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#d14e1d',
    },
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          ...buttonStyle,
          mb: 2
        }}
      >
        Add Cylinder Expiry
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-cylinder-expiry-title"
        aria-describedby="add-cylinder-expiry-description"
        closeAfterTransition
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            px: 2,
          }}
        >
          <Paper
            elevation={5}
            sx={{
              width: '1000px',
              padding: 4,
              borderRadius: '12px',
              backgroundColor:
                theme.palette.mode === 'dark' ? '#333' : '#fff',
              color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
              overflowY: 'auto',
              maxHeight: '80vh',
            }}
          >
            <Typography
              id="add-cylinder-expiry-title"
              variant="h6"
              component="h2"
              sx={{ textAlign: 'center', mb: 4 }}
            >
              Add Cylinder Expiry
            </Typography>

            {cylinderExpiryData.map((locationData, locationIndex) => (
              <Box key={locationIndex} sx={{ mb: 4 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={locationData.location}
                    onChange={(e) => handleLocationChange(locationIndex, e)}
                    label="Location"
                    sx={{ borderRadius: '8px' }}
                  >
                    {availableLocations.map((location) => (
                      <MenuItem key={location._id} value={location.name}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Center the categories */}
                <Box sx={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2
                }}>
                  {locationData.categories.map((cat, categoryIndex) => (
                    <Box
                      key={categoryIndex}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        '& .MuiFormControl-root': {
                          minWidth: 'auto'
                        }
                      }}
                    >
                      <FormControl sx={{ width: '250px' }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={cat.category}
                          onChange={(e) => handleCategoryChange(locationIndex, categoryIndex, e)}
                          label="Category"
                          sx={{ borderRadius: '8px' }}
                        >
                          {availableCategories.map((category) => (
                            <MenuItem key={category._id} value={category.name}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        label="Weight"
                        value={cat.weight}
                        disabled
                        sx={{ width: '150px' }}
                      />

                      <TextField
                        label="Date"
                        type="date"
                        value={cat.date}
                        onChange={(e) => handleDateChange(locationIndex, categoryIndex, e)}
                        sx={{ width: '150px' }}
                        InputLabelProps={{ shrink: true }}
                      />

                      <Button
                        onClick={() => handleRemoveCategory(locationIndex, categoryIndex)}
                        sx={{ color: '#f15a22' }}
                      >
                        <RemoveCircleIcon />
                      </Button>
                    </Box>
                  ))}

                  {/* Center the Add Category button */}
                  <Button
                    onClick={() => handleAddCategory(locationIndex)}
                    startIcon={<AddCircleIcon />}
                    sx={{ ...buttonStyle, backgroundColor: '#f15a22' }}
                    variant="contained"
                  >
                    Add Category
                  </Button>
                </Box>
              </Box>
            ))}

            {/* Full-width Add Location button */}
            <Button
              onClick={handleAddLocation}
              sx={{ 
                ...buttonStyle, 
                mb: 3, 
                backgroundColor: '#f15a22',
                width: '100%',
              }}
              variant="contained"
            >
              Add Location
            </Button>

            {/* Bottom buttons: Cancel on left, Submit on right */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleClose}
                sx={{ ...buttonStyle }}
                variant="contained"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ ...buttonStyle }}
              >
                Submit
              </Button>
            </Box>
          </Paper>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddCylinderExpiry;
