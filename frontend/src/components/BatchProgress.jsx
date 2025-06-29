import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const BatchProgress = ({ 
  batchProgress, 
  isBatchProcessing, 
  getOverallProgress, 
  getStatusSummary 
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const overallProgress = getOverallProgress();
  const statusSummary = getStatusSummary();

  if (!isBatchProcessing && Object.keys(batchProgress).length === 0) {
    return null;
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'failed':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'uploading':
        return <UploadIcon color="primary" fontSize="small" />;
      case 'deleting':
        return <DeleteIcon color="warning" fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'uploading':
        return 'primary';
      case 'deleting':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        maxHeight: 400,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        border: '1px solid',
        borderColor: 'divider',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Batch Operations
          </Typography>
          <Chip
            label={`${statusSummary.completed}/${statusSummary.total}`}
            size="small"
            color="primary"
          />
        </Box>
        <IconButton size="small" onClick={handleExpandClick}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Overall Progress */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Overall Progress
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {overallProgress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={overallProgress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Status Summary */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {statusSummary.completed > 0 && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`${statusSummary.completed} Completed`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {statusSummary.failed > 0 && (
            <Chip
              icon={<ErrorIcon />}
              label={`${statusSummary.failed} Failed`}
              size="small"
              color="error"
              variant="outlined"
            />
          )}
          {statusSummary.uploading > 0 && (
            <Chip
              icon={<UploadIcon />}
              label={`${statusSummary.uploading} Uploading`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {statusSummary.deleting > 0 && (
            <Chip
              icon={<DeleteIcon />}
              label={`${statusSummary.deleting} Deleting`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Detailed Progress */}
      <Collapse in={expanded}>
        <Box
          sx={{
            maxHeight: 200,
            overflowY: 'auto',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {Object.entries(batchProgress).map(([fileId, progress]) => (
            <Box
              key={fileId}
              sx={{
                p: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {getStatusIcon(progress.status)}
                <Typography variant="body2" sx={{ flex: 1, fontSize: '0.875rem' }}>
                  {progress.file}
                </Typography>
                <Chip
                  label={progress.status}
                  size="small"
                  color={getStatusColor(progress.status)}
                  variant="outlined"
                />
              </Box>
              {progress.status === 'uploading' || progress.status === 'deleting' ? (
                <LinearProgress
                  variant="determinate"
                  value={progress.progress}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              ) : progress.status === 'failed' ? (
                <Typography variant="caption" color="error">
                  {progress.error}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default React.memo(BatchProgress); 