// src/components/AddLocationButton.js

import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const AddLocationButton = ({ onLocationAdded }) => {
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const handleOpenAddLocation = () => {
    setNewLocationName('');
    setAddLocationOpen(true);
  };

  const handleCloseAddLocation = () => {
    setAddLocationOpen(false);
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLocationName.trim() })
      });

      if (response.ok) {
        onLocationAdded();
        handleCloseAddLocation();
      } else {
        const errorMsg = await response.text();

        // console.error('Error adding location:', errorMsg);

      }
    } catch (error) {
      // console.error('Error adding location:', error);

    }
  };

  return (
    <>
      <Button
        variant="contained"
        sx={{
          borderRadius: '15px',
          backgroundColor: '#f15a22',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#d14e1d',
          },
        }}
        onClick={handleOpenAddLocation}
      >
        Add Location
      </Button>

      <Dialog
        open={addLocationOpen}
        onClose={handleCloseAddLocation}
        PaperProps={{
          style: {
            borderRadius: '12px',
            padding: '20px',
          },
        }}
      >
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Location Name"
            fullWidth
            variant="outlined"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddLocation}>Cancel</Button>
          <Button onClick={handleAddLocation} variant="contained" sx={{ backgroundColor: '#f15a22', color: '#fff' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddLocationButton;
