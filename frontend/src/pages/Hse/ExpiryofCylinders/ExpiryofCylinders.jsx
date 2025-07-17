import React, { useState, useEffect, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MainContentWrapper from './MainContentWrapper';
import SearchBar from './SearchBar';
import CylinderTable from './CylinderTable';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import HoverPopoverButton from './HoverPopoverButton';
import AddCylinderExpiry from './AddCylinderExpiry';
import DownloadPDFButton from './DownloadPDFButton';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import EditLocationCategoryDrawer from './EditLocationCategoryDrawer';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ExpiryofCylinders = ({ open, user }) => {
  const theme = useTheme();
  const headingColor = theme.palette.mode === 'dark' ? '#f15a22' : '#000000';

  const [cylinders, setCylinders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [cylinderToDelete, setCylinderToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedZone, setSelectedZone] = useState(user?.role === 'Admin' ? '' : user?.zone);
  const [selectedBranch, setSelectedBranch] = useState(user?.role === 'Admin' ? '' : user?.branch);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // States for Add Location and Add Category dialogs
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryWeight, setNewCategoryWeight] = useState('');

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found for fetching zones.');


        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const zonesData = await response.json();
      setZones(zonesData);
    } catch (error) {
      // console.error('Error fetching zones:', error);

    }
  };

  const fetchBranches = async (zoneName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found for fetching branches.');


        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/${zoneName}/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const branchesData = await response.json();
      setBranches(branchesData);
    } catch (error) {
      // console.error('Error fetching branches:', error);

    }
  };

  const fetchCylinders = useCallback(async () => {
    if (!selectedZone || !selectedBranch) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found for fetching cylinders.');


        setSnackbarMessage('Authentication required to fetch cylinders.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setCylinders([]);
        setLoading(false);
        return;
      }

      const encodedZone = encodeURIComponent(selectedZone.trim());
      const encodedBranch = encodeURIComponent(selectedBranch.trim());
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cylinder-expiry/${encodedZone}/${encodedBranch}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const cylinderData = await response.json();
        setCylinders(cylinderData);
      } else if (response.status === 404) {
        // console.error('No cylinders found for this zone and branch.');


        setCylinders([]);
      } else {
        // console.error('Error fetching cylinders:', response.statusText);

      }
    } catch (error) {
      // console.error('Error fetching cylinders:', error);

    }
    setLoading(false);
  }, [selectedZone, selectedBranch]);

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchBranches(selectedZone);
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedZone && selectedBranch) {
      fetchCylinders();
    }
  }, [selectedZone, selectedBranch, fetchCylinders]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // console.error('Authentication token not found for fetching locations/categories.');


          setSnackbarMessage('Authentication required to fetch locations/categories.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
        const locRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/locations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const locData = await locRes.json();
        setAvailableLocations(locData);

        const catRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const catData = await catRes.json();
        setAvailableCategories(catData);
      } catch (error) {
        // console.error('Error fetching locations/categories:', error);

      }
    };

    fetchData();
  }, []);

  const openDeleteDialog = (cylinderId) => {
    setCylinderToDelete(cylinderId);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    // console.log("Deleting ID:", cylinderToDelete);


    setConfirmDeleteOpen(false);
    if (!cylinderToDelete) {
      // console.log("No cylinderToDelete set.");


      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found for cylinder deletion.');


        setSnackbarMessage('Authentication required to delete cylinder record.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cylinder-expiry/${cylinderToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // console.log("Delete successful");


        setCylinders((prev) => prev.filter((cyl) => cyl._id !== cylinderToDelete));
        setSnackbarMessage('Cylinder record deleted successfully.');
        setSnackbarSeverity('success');
      } else {
        const errorText = await response.text();

        // console.error('Failed to delete cylinder:', response.statusText, errorText);


        setSnackbarMessage('Failed to delete cylinder record.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      // console.error('Error deleting cylinder:', error);


      setSnackbarMessage('Error occurred while deleting cylinder record.');
      setSnackbarSeverity('error');
    }

    setSnackbarOpen(true);
    setCylinderToDelete(null);
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteOpen(false);
    setCylinderToDelete(null);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const filteredCylinders = cylinders.filter(cyl =>
    cyl.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cyl.categories.some(cat => cat.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add Location Functions
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
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found for adding location.');


        setSnackbarMessage('Authentication required to add location.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/locations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newLocationName.trim() })
      });
      if (response.ok) {
        setSnackbarMessage('Location added successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleCloseAddLocation();
      } else {
        const errorMsg = await response.text();

        // console.error('Error adding location:', errorMsg);


        setSnackbarMessage('Failed to add location.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      // console.error('Error adding location:', error);


      setSnackbarMessage('Error occurred while adding location.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Add Category Functions
  const handleOpenAddCategory = () => {
    setNewCategoryName('');
    setNewCategoryWeight('');
    setAddCategoryOpen(true);
  };
  const handleCloseAddCategory = () => {
    setAddCategoryOpen(false);
  };
  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryWeight.trim()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found for adding category.');


        setSnackbarMessage('Authentication required to add category.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName.trim(), weight: newCategoryWeight.trim() })
      });
      if (response.ok) {
        setSnackbarMessage('Category added successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleCloseAddCategory();
      } else {
        const errorMsg = await response.text();

        // console.error('Error adding category:', errorMsg);


        setSnackbarMessage('Failed to add category.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      // console.error('Error adding category:', error);


      setSnackbarMessage('Error occurred while adding category.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleLocationUpdated = () => {
    setSnackbarMessage('Location updated successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    // Re-fetch locations if needed
  };
  const handleCategoryUpdated = () => {
    setSnackbarMessage('Category updated successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    // Re-fetch categories if needed
  };

  return (
    <MainContentWrapper open={open}>
  {/* Page layout with fixed height to prevent page scroll */}
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden', // no page-level scroll
    }}
  >
    <Typography
      variant="h4"
      sx={{
        color: headingColor,
        mb: 4,
        textAlign: 'center',
        fontSize: { xs: '24px', sm: '30px' }, // Adjust for smaller screens
        fontFamily: 'TanseekModernW20',
        borderBottom: '2px solid #ccc',
        paddingBottom: '10px',
      }}
    >
      HSE/EXPIRY OF CYLINDERS
    </Typography>

    <Typography
      variant="subtitle1"
      sx={{
        textAlign: 'center',
        color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
        mb: 2,
      }}
    >
      Your Branch: {user?.branch}
    </Typography>

    {/* Buttons for adding location and category */}
    {user?.role === 'Admin' && (
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 2, mb: 2 }}>
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
          onClick={handleOpenAddCategory}
        >
          Add Category
        </Button>
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
          onClick={() => setEditDrawerOpen(true)}
        >
          Edit Location/Category
        </Button>
      </Box>
    )}

    <EditLocationCategoryDrawer
      open={editDrawerOpen}
      onClose={() => setEditDrawerOpen(false)}
      availableLocations={availableLocations}
      availableCategories={availableCategories}
      onLocationUpdated={handleLocationUpdated}
      onCategoryUpdated={handleCategoryUpdated}
    />

    {user?.role === 'Restaurant Manager' && (
      <Box
        marginBottom={2}
        display="flex"
        justifyContent="flex-end"
      >
        <AddCylinderExpiry
          user={user}
          zone={selectedZone}
          branch={selectedBranch}
          onAdd={() => fetchCylinders()}
          sx={{
            borderRadius: '20px',
            backgroundColor: '#f15a22',
          }}
        />
      </Box>
    )}

    {/* Filters and controls */}
    <Box
      sx={{
        width: '100%',
        backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
        padding: '20px',
        borderRadius: '8px',
      }}
    >
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        {user?.role === 'Admin' && (
          <>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <Select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Zone
                  </MenuItem>
                  {zones.map((zone) => (
                    <MenuItem key={zone.zoneName} value={zone.zoneName}>
                      {zone.zoneName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <Select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  displayEmpty
                  disabled={!selectedZone}
                >
                  <MenuItem value="" disabled>
                    Branch
                  </MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch} value={branch}>
                      {branch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  placeholder="Search cylinders..."
                  style={{ width: '100%' }}
                />
              </FormControl>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              sx={{
                padding: 0,
                textAlign: 'right',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '15px',
              }}
            >
              <IconButton onClick={fetchCylinders} sx={{ color: '#f15a22' }}>
                <RefreshIcon />
              </IconButton>
              <DownloadPDFButton cylinders={filteredCylinders} branchName={selectedBranch} />
              <HoverPopoverButton />
            </Grid>
          </>
        )}

        {user?.role !== 'Admin' && (
          <>
            <Grid item xs={9}>
              <FormControl fullWidth>
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  placeholder="Search cylinders..."
                  style={{ width: '100%' }}
                />
              </FormControl>
            </Grid>

            <Grid
              item
              xs={3}
              sx={{
                padding: 0,
                textAlign: 'right',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '15px',
              }}
            >
              <IconButton onClick={fetchCylinders} sx={{ color: '#f15a22' }}>
                <RefreshIcon />
              </IconButton>
            </Grid>
          </>
        )}
      </Grid>

      {/* This container will scroll internally while the page does not scroll */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto', // scroll inside this box only
          backgroundColor: theme.palette.mode === 'dark' ? '#222' : '#fafafa',
          color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
          padding: '20px',
          borderRadius: '8px',
          maxHeight: 'calc(100vh - 300px)',
        }}
      >
        {loading ? (
          <Typography>Loading...</Typography>
        ) : cylinders.length === 0 ? (
          <Typography>No Cylinder Expiry Records Found</Typography>
        ) : (
          <CylinderTable
            cylinders={filteredCylinders}
            onDelete={(user?.role === 'Admin' || user?.role === 'Restaurant Manager') ? openDeleteDialog : null}
            user={user}
          />
        )}
      </Box>
    </Box>

    {/* Confirmation Dialog for Deletion */}
    <Dialog
      open={confirmDeleteOpen}
      onClose={handleDeleteCancel}
      PaperProps={{
        style: {
          backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
          color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
        },
      }}
    >
      <DialogTitle>Delete Confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this cylinder record?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleDeleteCancel}
          sx={{
            backgroundColor: '#d14e1d',
            color: '#fff',
            '&:hover': { backgroundColor: '#c43d17' },
          }}
        >
          No
        </Button>
        <Button
          onClick={handleDeleteConfirm}
          sx={{
            backgroundColor: '#f15a22',
            color: '#fff',
            '&:hover': { backgroundColor: '#d14e1d' },
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>

    {/* Add Location Dialog */}
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
        <Button onClick={handleAddLocation} variant="contained" sx={{ backgroundColor: '#f15a22', color: '#fff' }}>Save</Button>
      </DialogActions>
    </Dialog>

    {/* Add Category Dialog */}
    <Dialog
      open={addCategoryOpen}
      onClose={handleCloseAddCategory}
      PaperProps={{
        style: {
          borderRadius: '12px',
          padding: '20px',
        },
      }}
    >
      <DialogTitle>Add New Category</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Category Name"
          fullWidth
          variant="outlined"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Weight"
          fullWidth
          variant="outlined"
          value={newCategoryWeight}
          onChange={(e) => setNewCategoryWeight(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseAddCategory}>Cancel</Button>
        <Button onClick={handleAddCategory} variant="contained" sx={{ backgroundColor: '#f15a22', color: '#fff' }}>Save</Button>
      </DialogActions>
    </Dialog>

    {/* Snackbar for operations */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </Box>
</MainContentWrapper>

  );
};

export default ExpiryofCylinders;
