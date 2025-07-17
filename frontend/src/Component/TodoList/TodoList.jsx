import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Checkbox, Divider, useTheme, Snackbar, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const TodoList = ({ userZone, userBranch }) => {
  const [tasks, setTasks] = useState([]);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  useEffect(() => {
    if (!userZone || !userBranch) {
      // console.error('Required parameters are missing:', { userZone, userBranch });


      setSnackbarMessage('Failed to load tasks: Missing zone or branch information.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      // console.error('Authentication token not found.');


      setSnackbarMessage('Failed to load tasks: Authentication token not found.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/assigned-tasks`, {
        params: { zone: userZone, branch: userBranch },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then((response) => {
        setTasks(response.data);
        if (Array.isArray(response.data) && response.data.length === 0) {
          setSnackbarMessage('No tasks assigned');
          setSnackbarSeverity('info');
          setSnackbarOpen(true);
        } else {
          setSnackbarOpen(false);
        }
      })
      .catch((error) => {
      // console.error('Error fetching tasks:', error);


      setSnackbarMessage('Failed to load tasks. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });
  }, [userZone, userBranch]);

  const handleMarkAll = async () => {
    if (tasks.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found.');


        setSnackbarMessage('Failed to mark tasks: Authentication token not found.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      await Promise.all(
        tasks.map((task) =>
          axios.put(`${process.env.REACT_APP_API_BASE_URL}/assigned-tasks/${task._id}/complete`, { branch: userBranch }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
      setTasks(tasks.map(task => ({ ...task, completed: true })));
      setSnackbarMessage('All tasks marked as completed!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      // console.error('Error marking all tasks as completed:', error);


      setSnackbarMessage('Failed to mark all tasks as completed.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleToggle = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const updatedStatus = !task.completed;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found.');


        setSnackbarMessage('Failed to update task: Authentication token not found.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/assigned-tasks/${taskId}/complete`, { branch: userBranch }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTasks(tasks.map(t =>
        t._id === taskId ? { ...t, completed: updatedStatus } : t
      ));
      setSnackbarMessage('Task status updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      // console.error('Error toggling task completion:', error);


      setSnackbarMessage('Failed to update task status.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const allCompleted = tasks.length > 0 && tasks.every(task => task.completed);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode ? '#333' : '#F9F9F9',
        padding: 1.5,
        borderRadius: 2,
        maxWidth: 400,
        width: '100%',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
        overflowY: 'auto',
        '@media (max-width: 600px)': {
          maxWidth: '100%',
          padding: 1,
        },
        '::-webkit-scrollbar': {
          width: '6px',
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
          borderRadius: '10px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#555',
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: isDarkMode ? '#333' : '#F9F9F9',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, ml: 0.5 }}>
        <Checkbox
          checked={allCompleted}
          onChange={handleMarkAll}
          icon={<RadioButtonUncheckedIcon />}
          checkedIcon={<CheckCircleIcon />}
          sx={{
            color: '#f15a22',
            '&.Mui-checked': {
              color: '#f15a22',
            },
            padding: 0,
            marginRight: 1.5
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            fontFamily: 'Encode Sans',
            color: isDarkMode ? '#FFF' : 'inherit',
          }}
        >
          Mark All
        </Typography>
      </Box>

      <Divider sx={{ my: 1, bgcolor: isDarkMode ? '#555' : 'divider' }} />

      <Box
        sx={{
          maxHeight: { xs: 300, md: 400 },
          overflowY: 'auto',
          '::-webkit-scrollbar': {
            width: '6px',
          },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '10px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#555',
          },
          '::-webkit-scrollbar-track': {
            backgroundColor: isDarkMode ? '#333' : '#F9F9F9',
          },
        }}
      >
        <List disablePadding>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <ListItem
                key={task._id}
                sx={{
                  paddingLeft: 2,
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                  alignItems: 'flex-start',
                }}
              >
                <ListItemIcon sx={{ minWidth: '25px', marginBottom: { xs: 0.5, md: 0 } }}>
                  <Checkbox
                    icon={<RadioButtonUncheckedIcon />}
                    checkedIcon={<CheckCircleIcon />}
                    edge="start"
                    checked={task.completed}
                    onChange={() => handleToggle(task._id)}
                    sx={{
                      color: task.completed ? (isDarkMode ? '#F5B300' : '#F5B300') : 'inherit',
                      '&.Mui-checked': {
                        color: '#f15a22',
                      },
                      padding: 0,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed
                          ? isDarkMode
                            ? '#888'
                            : 'text.disabled'
                          : isDarkMode
                          ? '#FFF'
                          : 'text.primary',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                      }}
                    >
                      {task.taskName}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          ) : (
            snackbarOpen === false && (
               <Box sx={{ textAlign: 'center', mt: 2 }}>
                 <Typography variant="body1" color="textSecondary">
                   No tasks assigned.
                 </Typography>
               </Box>
            )
          )}
        </List>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TodoList;
