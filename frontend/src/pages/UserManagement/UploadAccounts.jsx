import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
  Alert,
  CircularProgress
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import ErrorBoundary from '../../components/ErrorBoundary';
import ErrorNotification from '../../components/ErrorNotification';
import useErrorHandler from '../../hooks/useErrorHandler';
import * as XLSX from 'xlsx';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadAccounts = ({ open, onClose, onUsersAdded }) => {
  const theme = useTheme();
  const { error, handleError, clearError } = useErrorHandler();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        handleError(new Error('Authentication token not found'));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUploadSuccess(true);
      setUploadResult(response.data);
      onUsersAdded();
    } catch (error) {
      handleError(new Error('Failed to upload accounts. Please check the file format and try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadSuccess(false);
    setUploadResult(null);
    onClose();
  };

  // Download demo Excel template
  const handleDownloadDemo = () => {
    const demoData = [
      {
        firstName: 'Omer',
        lastName: 'Shahzad',
        displayName: 'Omer Shahzad',
        username: 'omershahz',
        password: 'Password123!',
        role: 'Admin',
        zone: 'Zone A',
        branch: 'Cheezious Headquarters',
        modules: 'Licenses_Trade Licenses, Vehicles_Maintenance'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(demoData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'user_upload_template.xlsx');
  };

  useEffect(() => {
    if (uploadSuccess && uploadResult) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000); // 3.0 seconds
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess, uploadResult]);

  return (
    <ErrorBoundary>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fff',
            color: theme.palette.mode === 'dark' ? '#fff' : '#000',
            borderRadius: 3,
            boxShadow: 6,
            p: { xs: 2, sm: 4 },
          },
        }}
      >
        <DialogTitle sx={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: { xs: '1.3rem', sm: '1.7rem' },
          pb: 0.5
        }}>
          Upload User Accounts
        </DialogTitle>
        <Typography variant="subtitle2" sx={{
          textAlign: 'center',
          color: theme.palette.text.secondary,
          mb: 2,
          fontWeight: 400,
          fontSize: { xs: '0.95rem', sm: '1.05rem' }
        }}>
          Upload an Excel file to create multiple user accounts at once.
        </Typography>
        <DialogContent sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 0.5, sm: 2 },
          pt: 0,
        }}>
          <Button
            onClick={handleDownloadDemo}
            color="secondary"
            variant="outlined"
            startIcon={<DownloadForOfflineIcon />}
            sx={{
              mb: 3,
              color: '#f15a22',
              borderColor: '#f15a22',
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              alignSelf: 'center',
              fontSize: { xs: '1rem', sm: '1.05rem' },
              '&:hover': {
                backgroundColor: 'rgba(241,90,34,0.08)',
                borderColor: '#f15a22',
                color: '#f15a22',
              },
            }}
          >
            Download Demo File
          </Button>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? '#f15a22' : theme.palette.mode === 'dark' ? '#fff' : '#000',
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: theme.palette.mode === 'dark' ? '#232323' : '#fafbfc',
              boxShadow: 2,
              width: '100%',
              maxWidth: 480,
              minHeight: 110,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2.5,
              transition: 'background 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#282828' : '#f3f3f3',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 38, color: '#f15a22', mb: 1 }} />
            {file ? (
              <Typography sx={{ fontWeight: 500 }}>{file.name}</Typography>
            ) : (
              <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 400 }}>
                {isDragActive
                  ? 'Drop the Excel file here'
                  : 'Drag and drop an Excel file here, or click to select'}
              </Typography>
            )}
          </Box>
          {uploadSuccess && uploadResult && (
            <Box sx={{ mt: 2, width: '100%', maxWidth: 480 }}>
              <Alert severity="success" sx={{ mb: 2, fontWeight: 500 }}>
                Accounts uploaded!<br />
                <strong>Created:</strong> {uploadResult.created} &nbsp;|&nbsp; <strong>Failed:</strong> {uploadResult.failed}
              </Alert>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#d32f2f', fontWeight: 500 }}>Errors:</Typography>
                  <table style={{ width: '100%', fontSize: '0.95em', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ textAlign: 'left', padding: 4 }}>Row</th>
                        <th style={{ textAlign: 'left', padding: 4 }}>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResult.errors.map((err, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: 4 }}>{err.row}</td>
                          <td style={{ padding: 4 }}>{err.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
              {uploadResult.createdUsers && uploadResult.createdUsers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#388e3c', fontWeight: 500 }}>Created Users:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {uploadResult.createdUsers.map((u, idx) => (
                      <li key={idx}>{u.email}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          px: { xs: 1, sm: 3 },
          pb: { xs: 2, sm: 3 },
          pt: 0,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: { xs: 'center', sm: 'flex-end' },
          gap: 1.5
        }}>
          <Button onClick={handleClose} sx={{ color: '#f15a22', fontWeight: 600, minWidth: 100 }}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            variant="contained"
            sx={{
              backgroundColor: '#f15a22',
              '&:hover': { backgroundColor: '#d3541e' },
              fontWeight: 600,
              minWidth: 120,
              fontSize: { xs: '1rem', sm: '1.05rem' },
              boxShadow: 2
            }}
          >
            {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
          </Button>
        </DialogActions>
        <ErrorNotification error={error} onClose={clearError} />
      </Dialog>
    </ErrorBoundary>
  );
};

export default UploadAccounts;
