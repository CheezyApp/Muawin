import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, IconButton, Fade, MenuItem, Select, FormControl, InputLabel, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TaskForm = ({ onClose, userBranch }) => {
  const [tasks, setTasks] = useState([""]); // Array to store task input fields
  const [zones, setZones] = useState([]); // Array to store fetched zones
  const [selectedZone, setSelectedZone] = useState(""); // Initially set to user's zone if available
  const [branches, setBranches] = useState([]); // Array to store branches based on selected zone
  const [selectedBranch, setSelectedBranch] = useState(userBranch || ""); // Initially set to user's branch if available
  const theme = useTheme(); // Get the current theme

  // Fetch zones from the backend on component load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // console.error('No authentication token found');


      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/zones`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setZones(data))
      .catch(error => console.error('Error fetching zones:', error));
  }, []);

  // Fetch branches for selected zone whenever selectedZone changes
  useEffect(() => {
    if (selectedZone) {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');


        return;
      }

      fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/${selectedZone}/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => setBranches(data))
        .catch(error => console.error('Error fetching branches:', error));
    }
  }, [selectedZone]);

  // Handle zone selection change
  const handleZoneChange = (event) => {
    const zoneName = event.target.value;
    setSelectedZone(zoneName);
    setSelectedBranch(""); // Reset branch selection when zone changes
  };

  // Handle branch selection change
  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
  };

  // Handle task input changes
  const handleTaskChange = (index, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = value;
    setTasks(updatedTasks);
  };

  // Add a new empty task field
  const handleAddTaskPoint = () => {
    if (tasks.length < 5) setTasks([...tasks, ""]);
  };

  // Save tasks to the backend
  const handleSaveTasks = () => {
    if (!selectedBranch) {
      // console.error('Branch is required to save tasks.');


      return;
    }

    const formattedTasks = tasks.map((task) => ({
      taskName: task,
      date: new Date().toISOString(), // Optional date format
      deadline: new Date(new Date().setDate(new Date().getDate() + 7)), // Example deadline: 7 days from now
      zone: selectedZone,
      branch: selectedBranch,
    }));

    // Post each task to the backend
    formattedTasks.forEach(async (task) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // console.error('No authentication token found');


          // You might want to show a Snackbar here as well
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/assigned-tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add token to headers
          },
          body: JSON.stringify(task),
        });

        if (response.ok) {
          // console.log('Task added successfully');

        } else {
          // console.error('Error adding task');

        }
      } catch (error) {
        // console.error('Error in save tasks:', error);

      }
    });

    onClose(); // Close the form after saving tasks
  };

  return (
    <Box
      id="task-backdrop"
      onClick={(event) => event.target.id === 'task-backdrop' && onClose()}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
      }}
    >
      <Fade in timeout={300}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '500px',
            borderRadius: '12px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add Task</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Zone</InputLabel>
            <Select value={selectedZone} onChange={handleZoneChange} label="Select Zone">
              {zones.map((zone) => (
                <MenuItem key={zone._id} value={zone.zoneName}>
                  {zone.zoneName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Branch</InputLabel>
            <Select
              value={selectedBranch}
              onChange={handleBranchChange}
              label="Select Branch"
              disabled={!selectedZone}
            >
              {branches.map((branch, index) => (
                <MenuItem key={index} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              maxHeight: '250px',
              overflowY: 'auto',
              mt: 2,
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
            {tasks.map((task, index) => (
              <TextField
                key={index}
                label={`Task ${index + 1}`}
                variant="outlined"
                fullWidth
                multiline
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: index === tasks.length - 1 ? 2 : 1.5,
                  '& .MuiOutlinedInput-root': {
                    paddingTop: '16px',
                    paddingBottom: '16px',
                  },
                  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#f15a22',
                  },
                  '& .MuiInputLabel-root': {
                    top: '6px',
                    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                    padding: '0 4px',
                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#f15a22',
                  },
                }}
              />
            ))}
          </Box>

          <Button
            variant="text"
            onClick={handleAddTaskPoint}
            disabled={tasks.length >= 5}
            sx={{
              mt: 1,
              color: tasks.length >= 5 ? 'grey' : '#f15a22',
              '&:hover': { backgroundColor: tasks.length >= 5 ? 'none' : 'rgba(241, 90, 34, 0.1)' },
            }}
          >
            + Add Another Task
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveTasks}
            sx={{
              mt: 2,
              ml:17,
              backgroundColor: '#f15a22',
              '&:hover': { backgroundColor: '#d14e1f' },
            }}
          >
            Save Tasks
          </Button>
        </Paper>
      </Fade>
    </Box>
  );
};

export default TaskForm;
