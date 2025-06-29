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

// Memoized helper functions to prevent recreation on every render
const formatFilePath = (path) => {
  return path.replace(/\s+/g, '_');
};

const getCleanFileName = (filename) => {
  const nameWithoutUnderscores = filename.replace(/_/g, ' ');
  return nameWithoutUnderscores.replace(/\.[^/.]+$/, '');
};

const getFileExtension = (filename) => {
  if (!filename) return 'N/A';
  const parts = filename.split('.');
  if (parts.length > 1 && parts[parts.length - 1] !== '') {
    return parts.pop().toUpperCase();
  } else {
    return 'N/A';
  }
};

// Memoized table headers to prevent recreation
const TABLE_HEADERS = ['File Path', 'File Name', 'File Type', 'Uploaded Date', 'Manage'];

// Memoized FileRow component for better performance
const FileRow = React.memo(({ 
  file, 
  index, 
  onDelete, 
  onView, 
  user, 
  theme, 
  buttonColor,
  filePathPrefix = '',
  showFileNumber = true
}) => {
  const handleDelete = React.useCallback(() => {
    onDelete(file.filename);
  }, [onDelete, file.filename]);

  const handleView = React.useCallback(() => {
    onView(file.filename);
  }, [onView, file.filename]);

  // Generate file path
  const filePath = React.useMemo(() => {
    const cleanFileName = getCleanFileName(file.filename);
    const formattedPath = formatFilePath(cleanFileName);
    const basePath = `${filePathPrefix}/${formattedPath}`;
    return showFileNumber && file.fileNumber ? `${basePath}/${file.fileNumber}` : basePath;
  }, [file.filename, file.fileNumber, filePathPrefix, showFileNumber]);

  return (
    <TableRow
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
          {filePath}
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
        {getFileExtension(file.filename)}
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
            onClick={handleDelete}
            aria-label="delete"
            sx={{ color: buttonColor }}
          >
            <DeleteIcon />
          </IconButton>
        )}
        <IconButton
          aria-label="view"
          onClick={handleView}
          sx={{ color: buttonColor }}
        >
          <VisibilityIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

FileRow.displayName = 'FileRow';

// Main FileTable component with React.memo
const FileTable = React.memo(({ 
  files, 
  onDelete, 
  onView, 
  user,
  filePathPrefix = '',
  showFileNumber = true,
  customHeaders = null,
  sx = {}
}) => {
  const theme = useTheme();
  const buttonColor = '#f15a22';

  // Memoized callbacks to prevent unnecessary re-renders
  const handleDelete = React.useCallback((filename) => {
    onDelete(filename);
  }, [onDelete]);

  const handleView = React.useCallback((filename) => {
    onView(filename);
  }, [onView]);

  // Use custom headers if provided, otherwise use default
  const headers = customHeaders || TABLE_HEADERS;

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        overflowX: 'auto',
        backgroundColor: theme.palette.mode === 'dark' ? '#2E2E2E' : '#FFFFFF',
        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
        '@media (max-width: 600px)': { maxWidth: '100%' },
        ...sx
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
            {headers.map((header) => (
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
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {files.map((file, index) => (
            <FileRow
              key={file.fileId || file.filename}
              file={file}
              index={index}
              onDelete={handleDelete}
              onView={handleView}
              user={user}
              theme={theme}
              buttonColor={buttonColor}
              filePathPrefix={filePathPrefix}
              showFileNumber={showFileNumber}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

FileTable.displayName = 'FileTable';

export default FileTable; 