import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
} from '@mui/material';

const EditLocationCategoryDrawer = ({
  open,
  onClose,
  availableLocations,
  availableCategories,
  onLocationUpdated,
  onCategoryUpdated
}) => {
  const [mode, setMode] = useState('location'); // 'location', 'category', or 'delete'
  const [deleteTarget, setDeleteTarget] = useState('location');

  const [selectedLocation, setSelectedLocation] = useState('');
  const [newLocationName, setNewLocationName] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryWeight, setNewCategoryWeight] = useState('');

  const [deleteSelectedLocation, setDeleteSelectedLocation] = useState('');
  const [deleteSelectedCategory, setDeleteSelectedCategory] = useState('');

  useEffect(() => {
    if (!open) {
      // Reset fields when the drawer closes
      setMode('location');
      setDeleteTarget('location');
      setSelectedLocation('');
      setNewLocationName('');
      setSelectedCategory('');
      setNewCategoryName('');
      setNewCategoryWeight('');
      setDeleteSelectedLocation('');
      setDeleteSelectedCategory('');
    }
  }, [open]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found');


        return;
      }

      if (mode === 'location') {
        if (!selectedLocation || !newLocationName.trim()) return;
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/locations/${selectedLocation}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: newLocationName.trim() }),
        });
        if (response.ok) onLocationUpdated();
      } else if (mode === 'category') {
        if (!selectedCategory || !newCategoryName.trim() || !newCategoryWeight.trim()) return;
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/categories/${selectedCategory}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newCategoryName.trim(),
            weight: newCategoryWeight.trim(),
          }),
        });
        if (response.ok) onCategoryUpdated();
      } else if (mode === 'delete') {
        const endpoint =
          deleteTarget === 'location'
            ? `${process.env.REACT_APP_API_BASE_URL}/locations/${deleteSelectedLocation}`
            : `${process.env.REACT_APP_API_BASE_URL}/categories/${deleteSelectedCategory}`;

        const response = await fetch(endpoint, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) deleteTarget === 'location' ? onLocationUpdated() : onCategoryUpdated();
      }
    } catch (error) {
      // console.error('Error performing operation:', error);

    }
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: '600px' } } }} // Make drawer width responsive
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mt: 8, mb: 2, color: '#f15a22' }}>
          Manage Location / Category
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Mode Selection */}
        <RadioGroup
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          row
          sx={{
            justifyContent: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' }, // Stack modes on small screens
          }}
        >
          <FormControlLabel
            value="location"
            control={<Radio sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }} />}
            label={<Typography fontWeight="bold">Edit Location</Typography>}
          />
          <FormControlLabel
            value="category"
            control={<Radio sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }} />}
            label={<Typography fontWeight="bold">Edit Category</Typography>}
          />
          <FormControlLabel
            value="delete"
            control={<Radio sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }} />}
            label={<Typography fontWeight="bold">Delete</Typography>}
          />
        </RadioGroup>

        {/* Edit Location */}
        {mode === 'location' && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Select a Location to Edit:
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a Location
                </MenuItem>
                {availableLocations.map((loc) => (
                  <MenuItem key={loc._id} value={loc._id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="New Location Name"
              fullWidth
              variant="outlined"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              sx={{ mb: 2 }}
            />
          </>
        )}

        {/* Edit Category */}
        {mode === 'category' && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Select a Category to Edit:
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a Category
                </MenuItem>
                {availableCategories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name} ({cat.weight})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="New Category Name"
              fullWidth
              variant="outlined"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="New Weight"
              fullWidth
              variant="outlined"
              value={newCategoryWeight}
              onChange={(e) => setNewCategoryWeight(e.target.value)}
            />
          </>
        )}

        {/* Delete Mode */}
        {mode === 'delete' && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Choose what to delete:
            </Typography>
            <RadioGroup
              value={deleteTarget}
              onChange={(e) => setDeleteTarget(e.target.value)}
              row
              sx={{
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' }, // Stack options on small screens
              }}
            >
              <FormControlLabel value="location" control={<Radio sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }} />} label="Location" />
              <FormControlLabel value="category" control={<Radio sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }} />} label="Category" />
            </RadioGroup>

            {deleteTarget === 'location' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={deleteSelectedLocation}
                  onChange={(e) => setDeleteSelectedLocation(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Location to Delete
                  </MenuItem>
                  {availableLocations.map((loc) => (
                    <MenuItem key={loc._id} value={loc._id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {deleteTarget === 'category' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={deleteSelectedCategory}
                  onChange={(e) => setDeleteSelectedCategory(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Category to Delete
                  </MenuItem>
                  {availableCategories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name} ({cat.weight})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button variant="text" onClick={onClose} sx={{
            backgroundColor: '#f15a22',
            color: '#fff',
            '&:hover': { backgroundColor: '#f15a24' },
          }} >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#f15a22',
              color: '#fff',
              '&:hover': { backgroundColor: '#f15a24' },
            }}
            onClick={handleSave}
          >
            {mode === 'delete' ? 'Delete' : 'Save'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default EditLocationCategoryDrawer;
