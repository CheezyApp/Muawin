import React, { useState, useEffect, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MainContentWrapper from './MainContentWrapper';
import SearchBar from './SearchBar';
import AddFileButton from './AddFileButton';
import FileTable from './FileTable';
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
import Compressor from 'compressorjs';
import LinearProgress from '@mui/material/LinearProgress';

const CanttPasses = ({ open, user }) => {
  const theme = useTheme();
  const headingColor = theme.palette.mode === 'dark' ? '#f15a22' : '#000000';
  const [files, setFiles] = useState([]); // State for files
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); // State for delete confirmation dialog
  const [fileToDelete, setFileToDelete] = useState(null); // Store file to delete
  const [loading, setLoading] = useState(false); // State for managing table refresh
  const [zones, setZones] = useState([]); // State for zones
  const [branches, setBranches] = useState([]); // State for branches
  const [selectedZone, setSelectedZone] = useState(user?.role === 'Admin' ? '' : user?.zone); // State for selected zone
  const [selectedBranch, setSelectedBranch] = useState(user?.role === 'Admin' ? '' : user?.branch); // State for selected branch
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(''); // State for snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // State for snackbar severity
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Define maximum file sizes in bytes
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20 MB

  // Helper function to check if file is an image
  const isImageFile = (file) => {
    return file.type.startsWith('image/');
  };

  // Fetch zones from the server
  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found for fetching zones.');
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
      console.error('Error fetching zones:', error);
    }
  };

  // Fetch branches for the selected zone
  const fetchBranches = async (zoneName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found for fetching branches.');
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
      console.error('Error fetching branches:', error);
    }
  };

  // Fetch the files for the specified zone and branch
  const fetchFiles = useCallback(async () => {
    if (!selectedZone || !selectedBranch) return;
  
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found for fetching files.');
        setSnackbarMessage('Authentication required to fetch files.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setFiles([]);
        setLoading(false);
        return;
      }
  
      const encodedZone = encodeURIComponent(selectedZone.trim());
      const encodedBranch = encodeURIComponent(selectedBranch.trim());
  
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/files/vehicles-routepermits-canttpasses/${encodedZone}/${encodedBranch}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        const filesData = await response.json();
        setFiles(filesData);
      } else if (response.status === 404) {
        console.error('No files found for this zone and branch.');
        setFiles([]);
      } else {
        console.error('Error fetching files:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
    setLoading(false);
  }, [selectedZone, selectedBranch]);

  useEffect(() => {
    fetchZones(); // Fetch zones when component mounts
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchBranches(selectedZone); // Fetch branches when a zone is selected
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedZone && selectedBranch) {
      fetchFiles(); // Fetch files when component mounts or when zone/branch changes
    }
  }, [selectedZone, selectedBranch,fetchFiles]);

  // Handle file upload
  const handleFileSelect = async (file) => {
    if (file) {
      // Check file size before proceeding
      const isImage = isImageFile(file);
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
      const fileTypeLabel = isImage ? 'image' : 'document/other file type';

      if (file.size > maxSize) {
        setSnackbarMessage(`File size exceeds the maximum limit of ${maxSize / (1024 * 1024)} MB for ${fileTypeLabel}.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      // Normalize filename to avoid spaces
      const normalizedFileName = file.name.replace(/\s+/g, '_');

      console.log('Original file details:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Authentication token not found for file upload.');
          setSnackbarMessage('Authentication required to upload files.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setIsUploading(false);
          return;
        }

        // Check if file is an image for client-side compression
        if (isImage) {
          console.log('Starting image compression...');
          new Compressor(file, {
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
            success(result) {
              console.log('Image compression successful:', {
                originalSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                compressedSize: `${(result.size / (1024 * 1024)).toFixed(2)} MB`,
                compressionRatio: `${((1 - (result.size / file.size)) * 100).toFixed(2)}%`
              });
              uploadCompressedFile(result, normalizedFileName, token);
            },
            error(err) {
              console.error('Image compression error:', err);
              setSnackbarMessage('Error compressing image. Uploading original file instead.');
              setSnackbarSeverity('warning');
              setSnackbarOpen(true);
              uploadCompressedFile(file, normalizedFileName, token);
            }
          });
        } else {
          console.log('Non-image file detected, proceeding with direct upload without client-side compression');
          uploadCompressedFile(file, normalizedFileName, token);
        }
      } catch (error) {
        console.error('Error in file handling:', error);
        setSnackbarMessage('Failed to process file.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsUploading(false);
      }
    }
  };

  // Helper function to handle the actual upload
  const uploadCompressedFile = async (file, normalizedFileName, token) => {
    const formData = new FormData();
    formData.append('file', new File([file], normalizedFileName, { type: file.type }));

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          fetchFiles(); // Re-fetch files after upload
          setSnackbarMessage(`File "${normalizedFileName}" has been added successfully.`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setIsUploading(false);
          setUploadProgress(0);
        } else {
          console.error('Upload failed:', xhr.statusText);
          setSnackbarMessage('Failed to upload file.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setIsUploading(false);
          setUploadProgress(0);
        }
      };

      xhr.onerror = () => {
        console.error('Upload error:', xhr.statusText);
        setSnackbarMessage('Failed to upload file.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsUploading(false);
        setUploadProgress(0);
      };

      xhr.open('POST', `${process.env.REACT_APP_API_BASE_URL}/files/vehicles-routepermits-canttpasses/${encodeURIComponent(selectedZone)}/${encodeURIComponent(selectedBranch)}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbarMessage('Failed to upload file.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Open confirmation dialog before deletion
  const openDeleteDialog = (filename) => {
    setFileToDelete(filename);
    setConfirmDeleteOpen(true); // Open the delete confirmation dialog
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setConfirmDeleteOpen(false); // Close the confirmation dialog immediately
  
    const trimmedFilename = fileToDelete.trim();
    const encodedFilename = encodeURIComponent(trimmedFilename);
    const deleteUrl = `${process.env.REACT_APP_API_BASE_URL}/files/vehicles-routepermits-canttpasses/${encodeURIComponent(selectedZone)}/${encodeURIComponent(selectedBranch)}/${encodedFilename}`;
  
    // Show snackbar right away with success message
    setSnackbarMessage(`File "${trimmedFilename}" is being deleted, Please Click Refresh Icon`);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  
    try {
      console.log('DELETE URL:', deleteUrl);  // Debugging log
  
      const response = await fetch(deleteUrl, { method: 'DELETE' });
  
      if (response.ok) {
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file.filename !== trimmedFilename)
        );
  
        // Update snackbar to success after delete
        setSnackbarMessage(`File "${trimmedFilename}" has been deleted successfully.`);
        setSnackbarSeverity('success');
      } else {
        const errorMessage = await response.text();
        console.error('Failed to delete file:', response.statusText, errorMessage);
  
        // Update snackbar to error in case of failure
        setSnackbarMessage('Failed to delete file.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setSnackbarMessage('Error occurred while deleting the file.');
      setSnackbarSeverity('error');
    }
  
    setSnackbarOpen(true); // Ensure snackbar opens in all cases
    setFileToDelete(null); // Clear the file to delete after the operation
  };

  // Handle canceling the deletion
  const handleDeleteCancel = () => {
    setConfirmDeleteOpen(false); // Close the confirmation dialog
    setFileToDelete(null); // Reset the file to delete
  };

  // Handle Snackbar Close
  const handleSnackbarClose = (event, reason) => {
    console.log('Snackbar closed with reason:', reason); // Debugging log
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };
  // Filter files based on search query (filename or fileNumber)
  const filteredFiles = files.filter(file =>
    file?.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file?.fileNumber?.toLowerCase().includes(searchQuery.toLowerCase())  // Added fileNumber to search filter
  );

  // Handle viewing a file
  const handleViewFile = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found for viewing file.');
        setSnackbarMessage('Authentication required to view files.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const encodedFilename = encodeURIComponent(filename.trim());
      const fileUrl = `${process.env.REACT_APP_API_BASE_URL}/files/download/${encodedFilename}`;

      // Fetch the file with authentication header
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Handle viewing logic here
      } else {
        console.error('Error viewing file:', response.statusText);
        setSnackbarMessage('Failed to view file.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      setSnackbarMessage('Failed to view file.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <MainContentWrapper open={open}>
  {/* Heading Section */}
  <Typography
    variant="h4"
    sx={{
      color: headingColor,
      mb: 4,
      textAlign: 'center',
      fontSize: '30px',
      fontFamily: 'TanseekModernW20',
      borderBottom: '2px solid #ccc',
      paddingBottom: '10px',
      transition: 'color 0.3s, border-bottom 0.3s', // Smooth transition for color and border
    }}
  >
    VEHICLES/ROUTE PERMITS/CANTT PASSES
  </Typography>
  <Typography
    variant="subtitle1"
    sx={{
      textAlign: 'center',
      color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
      mb: 2,
      transition: 'color 0.3s', // Smooth transition for text color
    }}
  >
    Your Branch: {user?.branch}
  </Typography>

  {/* Box to contain the search bar, Refresh button, Zone and Branch Select, and Add File button */}
  <Box
    sx={{
      width: '100%',
      backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
      padding: '20px',
      borderRadius: '8px',
      transition: 'background-color 0.3s', // Smooth transition for background color
    }}
  >
    <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
      {user?.role === 'Admin' && (
        <>
          {/* Zone Select */}
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

          {/* Branch Select */}
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

          {/* Search Bar */}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                placeholder="Search files..."
                style={{ width: '100%' }} // Full width on mobile
              />
            </FormControl>
          </Grid>

          {/* Button Section */}
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
            <AddFileButton onFileSelect={handleFileSelect} />
            <IconButton onClick={fetchFiles} sx={{ color: '#f15a22' }}>
              <RefreshIcon />
            </IconButton>
            <HoverPopoverButton />
          </Grid>
        </>
      )}

      {/* Non-Admin User View */}
      {user?.role !== 'Admin' && (
        <>
          {/* Search Bar for non-admin */}
          <Grid item xs={12} sm={9}>
            <FormControl fullWidth>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                placeholder="Search files..."
                style={{ width: '100%' }} // Full width on mobile
              />
            </FormControl>
          </Grid>

          {/* Refresh Button */}
          <Grid
            item
            xs={12} sm={3}
            sx={{
              padding: 0,
              textAlign: 'right',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px',
            }}
          >
            <IconButton onClick={fetchFiles} sx={{ color: '#f15a22' }}>
              <RefreshIcon />
            </IconButton>
          </Grid>
        </>
      )}
    </Grid>

    {isUploading && (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress variant="determinate" value={uploadProgress} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          Uploading: {uploadProgress}%
        </Typography>
      </Box>
    )}

    {/* File Table */}
    <Box
      sx={{
        width: '100%',
        maxHeight: '500px',  // Limit the max height for scrollability
        overflowY: files.length > 5 ? 'scroll' : 'unset',  // Enable scrolling if there are more than 5 files
        backgroundColor: theme.palette.mode === 'dark' ? '#222' : '#fafafa',
        color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
        padding: '20px',
        borderRadius: '8px',
        transition: 'background-color 0.3s, color 0.3s',  // Smooth transition for theme change
      }}
    >
      {loading ? (
        <Typography>Loading...</Typography>
      ) : files.length === 0 ? (
        <Typography>No Files Stored</Typography>
      ) : (
        <FileTable files={filteredFiles} onDelete={openDeleteDialog} onView={handleViewFile} user={user} />
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
        transition: 'background-color 0.3s, color 0.3s', // Smooth transition for dialog theme switch
      },
    }}
  >
    <DialogTitle>Delete Confirmation</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete the file "{fileToDelete}"?
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

  {/* Snackbar for file operations */}
  <Snackbar
    open={snackbarOpen}
    autoHideDuration={6000}
    onClose={handleSnackbarClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  >
    <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
      {snackbarMessage}
    </MuiAlert>
  </Snackbar>
</MainContentWrapper>

  );
};

export default CanttPasses;