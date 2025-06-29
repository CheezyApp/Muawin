import React from 'react';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const FileTable = ({ files, onDelete, user  }) => {
  const theme = useTheme();
  const buttonColor = '#f15a22';

  // Helper function to format the file path by replacing spaces with underscores
  const formatFilePath = (path) => {
    return path.replace(/\s+/g, '_'); // Replace spaces with underscores
  };

  // Helper function to clean file names for display
  const getCleanFileName = (filename) => {
    const nameWithoutUnderscores = filename.replace(/_/g, ' '); // Replace underscores with spaces
    return nameWithoutUnderscores.replace(/\.[^/.]+$/, ''); // Remove the file extension for display
  };

  // Function to extract file extension from MIME type
  const getFileExtensionFromMime = (mimeType) => {
    const mimeMap = {
      'image/jpeg': 'JPG',
      'image/png': 'PNG',
      'application/pdf': 'PDF',
      'text/plain': 'TXT',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'application/vnd.ms-powerpoint': 'PPT',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
      // Add more mappings as needed
    };
    return mimeMap[mimeType.toLowerCase()] || mimeType.toUpperCase();
  };

  // Determine file path color based on theme mode
  const filePathColor = theme.palette.mode === 'dark' ? '#80b3ff' : 'blue'; // Lighter blue for dark mode, regular blue for light mode

  // Authenticated file download
  const handleDownload = async (filename) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/files/download/${encodeURIComponent(filename)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('File download failed.');
    }
  };

  return (
    <TableContainer
    component={Paper}
    sx={{
      width: '100%',
      overflowX: 'auto',
      backgroundColor: theme.palette.mode === 'dark' ? '#2E2E2E' : '#FFFFFF',
      color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
      '@media (max-width: 600px)': { maxWidth: '100%' },
    }}
  >
    <Table
      sx={{
        tableLayout: 'fixed',
        width: '100%',
        minWidth: '600px',
        borderCollapse: 'collapse',
        '& th, & td': {
          borderBottom: `1px solid ${
            theme.palette.mode === 'dark' ? '#555' : '#ddd'
          }`,
        },
      }}
      aria-label="file table"
    >
      <TableHead>
        <TableRow>
          {['File Path', 'File Name', 'File Type', 'Uploaded Date', 'Manage'].map(
            (header) => (
              <TableCell
                key={header}
                align="center"
                sx={{
                  fontSize: { xs: '12px', sm: '14px' },
                  padding: { xs: '6px', sm: '12px' },
                  fontWeight: 'bold',
                  backgroundColor:
                    theme.palette.mode === 'dark' ? '#424242' : '#F5F5F5',
                  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                }}
              >
                {header}
              </TableCell>
            )
          )}
        </TableRow>
      </TableHead>
  
      <TableBody>
        {files.map((file, index) => (
          <TableRow
            key={file.fileId}
            sx={{
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? index % 2 === 0
                    ? '#333333'
                    : '#2E2E2E'
                  : index % 2 === 0
                  ? '#F9F9F9'
                  : '#FFFFFF',
            }}
          >
            {/* File Path */}
            <TableCell
              align="center"
              sx={{
                padding: { xs: '6px', sm: '12px' },
                color: theme.palette.text.primary,
              }}
            >
              <Typography
                variant="body2"
                sx={{ textDecoration: 'underline', wordBreak: 'break-word' }}
              >
                {`LIC/SM/HT/${formatFilePath(getCleanFileName(file.filename))}/${file.fileNumber}`}
              </Typography>
            </TableCell>
  
            {/* File Name */}
            <TableCell
              align="center"
              sx={{
                padding: { xs: '6px', sm: '12px' },
                color: theme.palette.text.primary,
              }}
            >
              {getCleanFileName(file.filename)}
            </TableCell>
  
            {/* File Type */}
            <TableCell
              align="center"
              sx={{
                padding: { xs: '6px', sm: '12px' },
                color: theme.palette.text.primary,
              }}
            >
              {getFileExtensionFromMime(file.filetype)}
            </TableCell>
  
            {/* Uploaded Date */}
            <TableCell
              align="center"
              sx={{
                padding: { xs: '6px', sm: '12px' },
                color: theme.palette.text.primary,
              }}
            >
              {new Date(file.lastModified).toLocaleString()}
            </TableCell>
  
            {/* Manage */}
            <TableCell align="center" sx={{ padding: { xs: '6px', sm: '12px' } }}>
              {user?.role === 'Admin' && (
                <IconButton
                  onClick={() => onDelete(file.filename)}
                  aria-label="delete"
                  sx={{
                    color: buttonColor,
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
              <IconButton
                aria-label="view"
                onClick={() => handleDownload(file.filename)}
                sx={{
                  color: buttonColor,
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  
  
  );
};

export default FileTable;
