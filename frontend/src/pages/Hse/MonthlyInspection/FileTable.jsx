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

  // Determine file path color based on theme mode
  const filePathColor = theme.palette.mode === 'dark' ? '#80b3ff' : 'blue'; // Lighter blue for dark mode, regular blue for light mode

  return (
    <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'hidden' }}>
      <Table sx={{ tableLayout: 'fixed', width: '100%' }} aria-label="file table">
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                transition: 'color 0.3s ease-in-out', // Added transition
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">File Path</Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                transition: 'color 0.3s ease-in-out', // Added transition
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">File Name</Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                transition: 'color 0.3s ease-in-out', // Added transition
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">File Type</Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                transition: 'color 0.3s ease-in-out', // Added transition
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">Uploaded Date</Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                transition: 'color 0.3s ease-in-out', // Added transition
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">Manage</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file.fileId}
              sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f9f9f9',
                  transition: 'background-color 0.3s ease-in-out', // Smooth background color transition
                },
                '&:nth-of-type(even)': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#444' : '#fff',
                  transition: 'background-color 0.3s ease-in-out', // Smooth background color transition
                },
              }}
              >
              {/* FILE PATH */}
              <TableCell align="jusitfy" sx={{ maxWidth: '250px', overflowWrap: 'break-word' }}>
                <Typography
                  variant="body2"
                  sx={{ color: filePathColor, textDecoration: 'underline', transition: 'color 0.3s ease-in-out' }} // Added transition
                >{`HSE/MIP/${formatFilePath(getCleanFileName(file.filename))}/${file.fileNumber}`}</Typography>
              </TableCell>

              {/* -------------- */}

               {/* FILE NAME */}
              <TableCell
                component="th"
                scope="row"
                align="center"
                sx={{
                  maxWidth: '200px',
                  overflowWrap: 'break-word',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  transition: 'color 0.3s ease-in-out', // Added transition
                }}
              >
                <Typography variant="body2">{getCleanFileName(file.filename)}</Typography> {/* Cleaned file name */}
              </TableCell>

              {/* -------------- */}

               {/* FILE TYPE */}
              <TableCell
                align="center"
                sx={{
                  maxWidth: '100px',
                  overflowWrap: 'break-word',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  transition: 'color 0.3s ease-in-out', // Added transition
                }}
              >
                <Typography variant="body2">{file.filetype}</Typography> {/* Only the file extension is displayed */}
              </TableCell>

              {/* -------------- */}

               {/* UPLOAD DATE */}
              <TableCell
                align="center"
                sx={{
                  maxWidth: '100px',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  transition: 'color 0.3s ease-in-out', // Added transition
                }}
              >
                <Typography variant="body2">{new Date(file.lastModified).toLocaleString()}</Typography>
              </TableCell>

              {/* -------------- */}

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
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    try {
                      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/files/download/${encodeURIComponent(file.filename)}`, {
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      if (!response.ok) throw new Error('Download failed');
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = file.filename;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      alert('File download failed.');
                    }
                  }}
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
