import React from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

const FileItem = ({ file, onDelete }) => {
  const theme = useTheme(); // Access the current theme

  return (
    <Grid
  container
  sx={{
    padding: { xs: '8px 0', sm: '10px 0' }, // Adjust padding for mobile
    borderBottom: '1px solid #ddd',
    alignItems: 'center',
    flexWrap: 'wrap', // Allow wrapping on small screens
  }}
>
  {/* File Name */}
  <Grid item xs={4} sx={{ padding: { xs: '4px', sm: '10px' } }}>
    <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
      {file.filename}
    </Typography>
  </Grid>

  {/* File Type */}
  <Grid item xs={2} sx={{ padding: { xs: '4px', sm: '10px' } }}>
    <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
      {file.filetype}
    </Typography>
  </Grid>

  {/* Last Modified Date */}
  <Grid item xs={3} sx={{ padding: { xs: '4px', sm: '10px' } }}>
    <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
      {new Date(file.lastModified).toLocaleString()}
    </Typography>
  </Grid>

  {/* Icons (View/Delete) */}
  <Grid
    item
    xs={3}
    sx={{
      textAlign: 'right',
      padding: { xs: '4px', sm: '10px' },
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px', // Space out the icons
    }}
  >
    {/* Visibility Icon */}
    <IconButton
      aria-label="view file"
      sx={{
        color: '#f15a22',
        fontSize: { xs: '18px', sm: '20px' }, // Adjust icon size for mobile
      }}
    >
      <VisibilityIcon />
    </IconButton>

    {/* Delete Icon */}
    <IconButton
      aria-label="delete file"
      onClick={() => onDelete(file.filename)}
      sx={{
        color: '#f15a22',
        fontSize: { xs: '18px', sm: '20px' }, // Adjust icon size for mobile
      }}
    >
      <DeleteIcon />
    </IconButton>
  </Grid>
</Grid>

  );
};

export default FileItem;
