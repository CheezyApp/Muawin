import React from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const FileItem = ({ file, onDelete }) => {
  const handleDelete = () => {
    if (file && file.filename) {
      onDelete(file.filename);
    }
  };

  // Authenticated file download
  const handleDownload = async () => {
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
  };

  return (
    <Grid container spacing={2} alignItems="center" sx={{ padding: '10px 0', borderBottom: '1px solid #ddd' }}>
      <Grid item xs={4}>
        <Typography variant="body2">{file.filename.replace(/\.[^/.]+$/, "")}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="body2">{file.filetype}</Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography variant="body2">{new Date(file.lastModified).toLocaleDateString()}</Typography>
      </Grid>
      <Grid item xs={3} sx={{ textAlign: 'right' }}>
        <IconButton
          aria-label="view"
          onClick={handleDownload}
          sx={{ color: '#f15a22' }}
        >
          <VisibilityIcon />
        </IconButton>

        <IconButton
          aria-label="delete"
          onClick={handleDelete}
          sx={{ color: '#f15a22' }}
        >
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default FileItem;
