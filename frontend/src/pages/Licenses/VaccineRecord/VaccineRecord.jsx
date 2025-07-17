import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
} from '@mui/material';
import { Alert as MuiAlert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import Compressor from 'compressorjs';
import LinearProgress from '@mui/material/LinearProgress';

import MainContentWrapper from './MainContentWrapper';
import SearchBar from './SearchBar';
import HoverPopoverButton from './HoverPopoverButton';
import AddFileButton from '../../../components/AddFileButton';
import FileTable from '../../../components/FileTable';
import { useDebounce } from '../../../hooks/useDebounce';
import { useFileCache } from '../../../hooks/useFileCache';
import { useBatchOperations } from '../../../hooks/useBatchOperations';
import BatchProgress from '../../../components/BatchProgress';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const AUTO_REFRESH_DELAY = 1000; // 1 second

const VaccineRecord = ({ open, user }) => {
  const theme = useTheme();
  const headingColor = theme.palette.mode === 'dark' ? '#f15a22' : '#000000';
  
  // State management
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedZone, setSelectedZone] = useState(user?.role === 'Admin' ? '' : user?.zone);
  const [selectedBranch, setSelectedBranch] = useState(user?.role === 'Admin' ? '' : user?.branch);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Custom hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { cachedFiles, setCachedFiles, isCacheValid } = useFileCache(
    `vaccinerecord-${selectedZone}-${selectedBranch}`,
    CACHE_EXPIRY_TIME
  );
  const { batchProgress, startBatchOperation, updateBatchProgress, completeBatchOperation } = useBatchOperations();

  // Helper functions
  const isImageFile = (file) => file.type.startsWith('image/');

  // Fetch zones from the server
  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found for fetching zones.');


        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const zonesData = await response.json();
      setZones(zonesData);
    } catch (error) {
      // console.error('Error fetching zones:', error);

    }
  };

  // Fetch branches for the selected zone
  const fetchBranches = async (zoneName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('Authentication token not found for fetching branches.');


        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/${zoneName}/branches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const branchesData = await response.json();
      setBranches(branchesData);
    } catch (error) {
      // console.error('Error fetching branches:', error);

    }
  };

  // Fetch files with caching and error handling
  const fetchFiles = useCallback(async (forceRefresh = false) => {
    if (!selectedZone || !selectedBranch) return;

    // Use cached data if available and valid
    if (!forceRefresh && isCacheValid && cachedFiles) {
      setFiles(cachedFiles);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbarMessage('Authentication required to fetch files.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setFiles([]);
        setLoading(false);
        return;
      }

      const encodedZone = encodeURIComponent(selectedZone.trim());
      const encodedBranch = encodeURIComponent(selectedBranch.trim());

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/files/licenses-staffmedicals-vaccinerecords/${encodedZone}/${encodedBranch}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const filesData = await response.json();
        setFiles(filesData);
        setCachedFiles(filesData);
      } else if (response.status === 404) {
        setFiles([]);
        setCachedFiles([]);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // console.error('Error fetching files:', error);


      setSnackbarMessage('Failed to fetch files. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedZone, selectedBranch, cachedFiles, isCacheValid, setCachedFiles]);

  // Handle file upload with compression and progress tracking
  const handleFileSelect = async (file) => {
    if (!file) return;

    const isImage = isImageFile(file);
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
    const fileTypeLabel = isImage ? 'image' : 'document';

    if (file.size > maxSize) {
      setSnackbarMessage(`File size exceeds the maximum limit of ${maxSize / (1024 * 1024)} MB for ${fileTypeLabel}.`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const normalizedFileName = file.name.replace(/\s+/g, '_');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      if (isImage) {
        // Compress image files
        new Compressor(file, {
          quality: 0.8,
          success(result) {
            uploadCompressedFile(result, normalizedFileName, token);
          },
          error(err) {
            // console.error('Compression failed:', err);


            uploadCompressedFile(file, normalizedFileName, token);
          },
        });
      } else {
        await uploadCompressedFile(file, normalizedFileName, token);
      }
    } catch (error) {
      // console.error('Error uploading file:', error);


      setSnackbarMessage('Failed to upload file.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload compressed file with progress tracking
  const uploadCompressedFile = async (file, normalizedFileName, token) => {
    const formData = new FormData();
    formData.append('file', file, normalizedFileName);
    formData.append('zone', selectedZone);
    formData.append('branch', selectedBranch);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setSnackbarMessage('File uploaded successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setIsUploading(false);
          setUploadProgress(0);
          
          // Auto-refresh after successful upload
          setTimeout(() => {
            fetchFiles(true);
          }, AUTO_REFRESH_DELAY);
        } else {
          throw new Error(`Upload failed: ${xhr.statusText}`);
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('POST', `${process.env.REACT_APP_API_BASE_URL}/files/licenses-staffmedicals-vaccinerecords`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      // console.error('Error uploading file:', error);


      setSnackbarMessage('Failed to upload file.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle batch file upload
  const handleBatchUpload = async (files) => {
    if (!files || files.length === 0) return;

    const validFiles = files.filter(file => {
      const isImage = isImageFile(file);
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
      return file.size <= maxSize;
    });

    if (validFiles.length === 0) {
      setSnackbarMessage('No valid files to upload.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    startBatchOperation(validFiles.length);
    setIsUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const normalizedFileName = file.name.replace(/\s+/g, '_');
        const isImage = isImageFile(file);

        if (isImage) {
          await new Promise((resolve, reject) => {
            new Compressor(file, {
              quality: 0.8,
              success(result) {
                uploadCompressedFile(result, normalizedFileName, token)
                  .then(resolve)
                  .catch(reject);
              },
              error(err) {
                uploadCompressedFile(file, normalizedFileName, token)
                  .then(resolve)
                  .catch(reject);
              },
            });
          });
        } else {
          await uploadCompressedFile(file, normalizedFileName, token);
        }

        updateBatchProgress(i + 1);
      }

      completeBatchOperation();
      setSnackbarMessage(`Successfully uploaded ${validFiles.length} files!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Auto-refresh after batch upload
      setTimeout(() => {
        fetchFiles(true);
      }, AUTO_REFRESH_DELAY);
    } catch (error) {
      // console.error('Batch upload failed:', error);


      setSnackbarMessage('Some files failed to upload.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file with confirmation
  const openDeleteDialog = (filename) => {
    setFileToDelete(filename);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmDeleteOpen(false);
    
    if (!fileToDelete) return;

    const trimmedFilename = fileToDelete.trim();
    const encodedFilename = encodeURIComponent(trimmedFilename);
    const deleteUrl = `${process.env.REACT_APP_API_BASE_URL}/files/licenses-staffmedicals-vaccinerecords/${encodeURIComponent(selectedZone)}/${encodeURIComponent(selectedBranch)}/${encodedFilename}`;

    // Optimistic UI update
    const originalFiles = [...files];
    setFiles(prev => prev.filter(file => file.filename !== trimmedFilename));

    setSnackbarMessage(`File "${trimmedFilename}" is being deleted...`);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSnackbarMessage(`File "${trimmedFilename}" deleted successfully!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Auto-refresh after successful deletion
        setTimeout(() => {
          fetchFiles(true);
        }, AUTO_REFRESH_DELAY);
      } else {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
    } catch (error) {
      // console.error('Error deleting file:', error);


      // Revert optimistic update
      setFiles(originalFiles);
      setSnackbarMessage('Failed to delete file. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteOpen(false);
    setFileToDelete(null);
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    fetchFiles(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Filtered files with debounced search
  const filteredFiles = useMemo(() => {
    return files.filter(file =>
      file?.filename?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      file?.fileNumber?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [files, debouncedSearchQuery]);

  // Effects
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
      fetchFiles();
    }
  }, [selectedZone, selectedBranch, fetchFiles]);

  // Auto-refresh timer
  useEffect(() => {
    if (!selectedZone || !selectedBranch) return;

    const interval = setInterval(() => {
      fetchFiles();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedZone, selectedBranch, fetchFiles]);

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
          transition: 'color 0.3s, border-bottom 0.3s',
        }}
      >
        LICENSES/STAFF MEDICALS/VACCINE RECORDS
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          textAlign: 'center',
          color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
          mb: 2,
          transition: 'color 0.3s',
        }}
      >
        Your Branch: {user?.branch}
      </Typography>

      {/* Control Panel */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
          padding: '20px',
          borderRadius: '8px',
          transition: 'background-color 0.3s',
          mb: 3,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Bar */}
          <Grid item xs={12} md={4}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search files..."
            />
          </Grid>

          {/* Refresh Button */}
          <Grid item xs={12} md={1}>
            <IconButton
              onClick={handleManualRefresh}
              disabled={loading}
              sx={{
                color: theme.palette.mode === 'dark' ? '#f15a22' : '#000000',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#444' : '#f5f5f5',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Grid>

          {/* Zone Selection */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <Select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                displayEmpty
                sx={{
                  color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
                  },
                }}
              >
                <MenuItem value="">Select Zone</MenuItem>
                {zones.map((zone) => (
                  <MenuItem key={zone} value={zone}>
                    {zone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Branch Selection */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <Select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                displayEmpty
                disabled={!selectedZone}
                sx={{
                  color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
                  },
                }}
              >
                <MenuItem value="">Select Branch</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch} value={branch}>
                    {branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Add File Button */}
          <Grid item xs={12} md={1}>
            <AddFileButton
              onFileSelect={handleFileSelect}
              onBatchUpload={handleBatchUpload}
              disabled={!selectedZone || !selectedBranch || isUploading}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              multiple={true}
            />
          </Grid>
        </Grid>

        {/* Upload Progress */}
        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#f15a22',
                },
              }}
            />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}

        {/* Batch Progress */}
        {batchProgress.isActive && (
          <BatchProgress
            current={batchProgress.current}
            total={batchProgress.total}
            onComplete={() => {
              // Batch progress completion is handled in the upload function
            }}
          />
        )}
      </Box>

      {/* File Table */}
      <FileTable
        files={filteredFiles}
        loading={loading}
        onDelete={openDeleteDialog}
        filePathPrefix="LIC/SM/VCR"
        theme={theme}
      />

      {/* Hover Popover Button */}
      <HoverPopoverButton />

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{fileToDelete}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </MainContentWrapper>
  );
};

export default VaccineRecord;