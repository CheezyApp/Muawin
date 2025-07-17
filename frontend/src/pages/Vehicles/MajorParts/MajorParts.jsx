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

const MajorParts = ({ open, user }) => {
  const theme = useTheme();
  const headingColor = theme.palette.mode === 'dark' ? '#f5f5f5' : '#333';
  const [zones, setZones] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedZone, setSelectedZone] = useState(user?.role === 'Admin' ? '' : user?.zone);
  const [selectedBranch, setSelectedBranch] = useState(user?.role === 'Admin' ? '' : user?.branch);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [autoRefreshTimer, setAutoRefreshTimer] = useState(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { getCachedFiles, setCachedFiles, clearCache } = useFileCache();
  const {
    batchUpload,
    batchDelete,
    batchProgress,
    isBatchProcessing,
    getOverallProgress,
    getStatusSummary,
  } = useBatchOperations();

  const filteredFiles = useMemo(() => {
    return files.filter(file =>
      file?.filename?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      file?.fileNumber?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [files, debouncedSearchQuery]);

  const triggerAutoRefresh = useCallback(() => {
    if (autoRefreshTimer) clearTimeout(autoRefreshTimer);
    const timer = setTimeout(() => {
      if (selectedZone && selectedBranch) fetchFiles(true);
    }, AUTO_REFRESH_DELAY);
    setAutoRefreshTimer(timer);
  }, [selectedZone, selectedBranch, autoRefreshTimer]);

  useEffect(() => () => { if (autoRefreshTimer) clearTimeout(autoRefreshTimer); }, [autoRefreshTimer]);

  const fetchZones = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setZones(await response.json());
    } catch (error) {
      // console.error('Error fetching zones:', error);

    }
  }, []);

  const fetchBranches = useCallback(async (zoneName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/${zoneName}/branches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBranches(await response.json());
    } catch (error) {
      // console.error('Error fetching branches:', error);

    }
  }, []);

  const fetchFiles = useCallback(async (forceRefresh = false) => {
    if (!selectedZone || !selectedBranch) { setLoading(false); return; }
    if (!forceRefresh) {
      const cachedData = getCachedFiles(selectedZone, selectedBranch);
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_EXPIRY_TIME) {
        setFiles(cachedData.files); setLoading(false); return;
      }
    }
    setLoading(true);
    const timeoutId = setTimeout(() => {
      setSnackbarMessage('Request timed out. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }, 30000);
    try {
      const token = localStorage.getItem('token');
      if (!token) { setSnackbarMessage('Authentication required to fetch files.'); setSnackbarSeverity('error'); setSnackbarOpen(true); setFiles([]); setLoading(false); clearTimeout(timeoutId); return; }
      const encodedZone = encodeURIComponent(selectedZone.trim());
      const encodedBranch = encodeURIComponent(selectedBranch.trim());
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/files/vehicles-majorparts/${encodedZone}/${encodedBranch}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const filesData = await response.json();
        setFiles(filesData);
        setCachedFiles(selectedZone, selectedBranch, filesData);
      } else if (response.status === 404) {
        setFiles([]); setCachedFiles(selectedZone, selectedBranch, []);
      } else {
        setSnackbarMessage(`Failed to fetch files: ${response.statusText}`);
        setSnackbarSeverity('error'); setSnackbarOpen(true);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setSnackbarMessage(`Error fetching files: ${error.message}`);
      setSnackbarSeverity('error'); setSnackbarOpen(true); setFiles([]);
    } finally { setLoading(false); }
  }, [selectedZone, selectedBranch, getCachedFiles, setCachedFiles]);

  const isImageFile = useCallback((file) => file.type.startsWith('image/'), []);

  const handleFileSelect = useCallback(async (selectedFiles) => {
    const filesArray = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
    if (filesArray.length === 0) return;
    const validFiles = [], invalidFiles = [];
    filesArray.forEach(file => {
      const isImage = isImageFile(file);
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
      if (file.size > maxSize) invalidFiles.push({ file: file.name, error: `File size exceeds the maximum limit of ${maxSize / (1024 * 1024)} MB.` });
      else validFiles.push(file);
    });
    if (invalidFiles.length > 0) {
      setSnackbarMessage(`Some files were invalid:\n${invalidFiles.map(f => `${f.file}: ${f.error}`).join('\n')}`);
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    }
    if (validFiles.length === 0) return;
    const optimisticFiles = validFiles.map(file => ({ filename: file.name.replace(/\s+/g, '_'), filetype: file.type, lastModified: new Date().toISOString(), fileId: `temp-${Date.now()}-${Math.random()}`, fileNumber: '00000', isOptimistic: true }));
    setFiles(prev => [...prev, ...optimisticFiles]);
    await batchUpload(
      validFiles,
      async (file, progressCallback) => uploadSingleFile(file, progressCallback),
      undefined,
      (results, errors) => {
        setFiles(prev => {
          const withoutOptimistic = prev.filter(f => !f.isOptimistic);
          const realFiles = results.map(result => result.result);
          return [...withoutOptimistic, ...realFiles];
        });
        if (results.length > 0) { setSnackbarMessage(`Successfully uploaded ${results.length} file(s). Auto-refreshing table...`); setSnackbarSeverity('success'); triggerAutoRefresh(); }
        if (errors.length > 0) { setSnackbarMessage(`Failed to upload ${errors.length} file(s).`); setSnackbarSeverity('error'); }
        setSnackbarOpen(true);
      }
    );
  }, [isImageFile, batchUpload, triggerAutoRefresh]);

  const uploadSingleFile = useCallback(async (file, progressCallback) => {
    const normalizedFileName = file.name.replace(/\s+/g, '_');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required to upload files.');
      let fileToUpload = file;
      if (isImageFile(file)) {
        fileToUpload = await new Promise((resolve, reject) => {
          new Compressor(file, { quality: 0.8, maxWidth: 1920, maxHeight: 1080, success: resolve, error: reject });
        });
      }
      const formData = new FormData();
      formData.append('file', new File([fileToUpload], normalizedFileName, { type: fileToUpload.type }));
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            progressCallback?.(progress);
          }
        });
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else { reject(new Error(`Upload failed: ${xhr.statusText}`)); }
        };
        xhr.onerror = () => { reject(new Error('Upload failed')); };
        xhr.open('POST', `${process.env.REACT_APP_API_BASE_URL}/files/vehicles-majorparts/${encodeURIComponent(selectedZone)}/${encodeURIComponent(selectedBranch)}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) { throw error; }
  }, [selectedZone, selectedBranch, isImageFile]);

  const openDeleteDialog = useCallback((filename) => { setFileToDelete(filename); setConfirmDeleteOpen(true); }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setConfirmDeleteOpen(false);
    const trimmedFilename = fileToDelete.trim();
    setFiles(prev => prev.filter(file => file.filename !== trimmedFilename));
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required to delete files.');
      const encodedFilename = encodeURIComponent(trimmedFilename);
      const deleteUrl = `${process.env.REACT_APP_API_BASE_URL}/files/vehicles-majorparts/${encodeURIComponent(selectedZone)}/${encodeURIComponent(selectedBranch)}/${encodedFilename}`;
      const response = await fetch(deleteUrl, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        setSnackbarMessage(`File "${trimmedFilename}" has been deleted successfully. Auto-refreshing table...`);
        setSnackbarSeverity('success');
        clearCache(selectedZone, selectedBranch);
        triggerAutoRefresh();
      } else {
        fetchFiles(true);
        throw new Error('Failed to delete file.');
      }
    } catch (error) {
      setSnackbarMessage('Error occurred while deleting the file.');
      setSnackbarSeverity('error');
      fetchFiles(true);
    }
    setSnackbarOpen(true);
    setFileToDelete(null);
  }, [fileToDelete, selectedZone, selectedBranch, clearCache, fetchFiles, triggerAutoRefresh]);

  const handleDeleteCancel = useCallback(() => { setConfirmDeleteOpen(false); setFileToDelete(null); }, []);

  const handleSnackbarClose = useCallback((event, reason) => { if (reason === 'clickaway') return; setSnackbarOpen(false); }, []);

  const handleViewFile = useCallback(async (filename) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setSnackbarMessage('Please log in to view files.'); setSnackbarSeverity('error'); setSnackbarOpen(true); return; }
      const encodedFilename = encodeURIComponent(filename.trim());
      const fileUrl = `${process.env.REACT_APP_API_BASE_URL}/files/download/${encodedFilename}`;
      const response = await fetch(fileUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setSnackbarMessage('Failed to view file.'); setSnackbarSeverity('error'); setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('Error occurred while viewing the file.'); setSnackbarSeverity('error'); setSnackbarOpen(true);
    }
  }, []);

  const handleManualRefresh = useCallback(async () => {
    if (loading) return;
    if (!selectedZone || !selectedBranch) {
      setSnackbarMessage('Please select a zone and branch first.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    setSnackbarMessage('Refreshing files...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
    try {
      await fetchFiles(true);
      setSnackbarMessage('Files refreshed successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Failed to refresh files. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [loading, selectedZone, selectedBranch, fetchFiles]);

  useEffect(() => { fetchZones(); }, [fetchZones]);
  useEffect(() => { if (selectedZone) fetchBranches(selectedZone); }, [selectedZone, fetchBranches]);
  useEffect(() => { if (selectedZone && selectedBranch) fetchFiles(); }, [selectedZone, selectedBranch, fetchFiles]);

  return (
    <MainContentWrapper open={open}>
      <Typography
        variant="h4"
        sx={{ color: headingColor, mb: 4, textAlign: 'center', fontSize: '30px', fontFamily: 'TanseekModernW20', borderBottom: '2px solid #ccc', paddingBottom: '10px', transition: 'color 0.3s, border-bottom 0.3s' }}
      >
        VEHICLES/MAJOR PARTS
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ textAlign: 'center', color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333', mb: 2, transition: 'color 0.3s' }}
      >
        Your Branch: {user?.branch}
      </Typography>
      <Box sx={{ width: '100%', backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff', padding: '20px', borderRadius: '8px', transition: 'background-color 0.3s' }}>
        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
          {user?.role === 'Admin' && (
            <>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <Select value={selectedZone} onChange={e => setSelectedZone(e.target.value)} displayEmpty>
                    <MenuItem value="" disabled>Zone</MenuItem>
                    {Array.isArray(zones) && zones.length > 0 && zones.map(zone => (
                      <MenuItem key={zone.zoneName} value={zone.zoneName}>{zone.zoneName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <Select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} displayEmpty disabled={!selectedZone}>
                    <MenuItem value="" disabled>Branch</MenuItem>
                    {branches.map(branch => (
                      <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search files..." style={{ width: '100%' }} />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} sx={{ padding: 0, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <AddFileButton onFileSelect={handleFileSelect} multiple={true} disabled={isBatchProcessing} />
                <IconButton onClick={handleManualRefresh} sx={{ color: '#f15a22' }} disabled={loading}>
                  {loading ? <CircularProgress size={20} sx={{ color: '#f15a22' }} /> : <RefreshIcon />}
                </IconButton>
                <HoverPopoverButton />
              </Grid>
            </>
          )}
          {user?.role !== 'Admin' && (
            <>
              <Grid item xs={9}>
                <FormControl fullWidth>
                  <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search files..." style={{ width: '100%' }} />
                </FormControl>
              </Grid>
              <Grid item xs={3} sx={{ padding: 0, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <IconButton onClick={handleManualRefresh} sx={{ color: '#f15a22' }} disabled={loading}>
                  {loading ? <CircularProgress size={20} sx={{ color: '#f15a22' }} /> : <RefreshIcon />}
                </IconButton>
              </Grid>
            </>
          )}
        </Grid>
        <Box sx={{ width: '100%', maxHeight: '500px', overflowY: files.length > 5 ? 'scroll' : 'unset', backgroundColor: theme.palette.mode === 'dark' ? '#222' : '#fafafa', color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333', padding: '20px', borderRadius: '8px', transition: 'background-color 0.3s, color 0.3s' }}>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : files.length === 0 ? (
            <Typography>No Files Stored</Typography>
          ) : (
            <FileTable files={filteredFiles} onDelete={openDeleteDialog} onView={handleViewFile} user={user} filePathPrefix="VEHICLES/MAJORPARTS" showFileNumber={true} />
          )}
        </Box>
      </Box>
      <Dialog open={confirmDeleteOpen} onClose={handleDeleteCancel} PaperProps={{ style: { backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff', color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333', transition: 'background-color 0.3s, color 0.3s' } }}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete the file "{fileToDelete}"?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ backgroundColor: '#d14e1d', color: '#fff', '&:hover': { backgroundColor: '#c43d17' } }}>No</Button>
          <Button onClick={handleDeleteConfirm} sx={{ backgroundColor: '#f15a22', color: '#fff', '&:hover': { backgroundColor: '#d14e1d' } }}>Yes</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={isBatchProcessing ? null : 6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} sx={{ '& .MuiSnackbar-root': { bottom: '24px !important', right: '24px !important' } }}>
        <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', minWidth: '300px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', '& .MuiAlert-message': { width: '100%' } }}>{snackbarMessage}</MuiAlert>
      </Snackbar>
      <BatchProgress batchProgress={batchProgress} isBatchProcessing={isBatchProcessing} getOverallProgress={getOverallProgress} getStatusSummary={getStatusSummary} />
    </MainContentWrapper>
  );
};

export default React.memo(MajorParts);