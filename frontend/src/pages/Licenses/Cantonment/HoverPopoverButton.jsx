import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

const HoverModalButton = () => {
  const [open, setOpen] = useState(false);
  const [zones, setZones] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle modal open
  const handleOpen = () => {
    fetchZones();
    setOpen(true);
  };

  // Handle modal close
  const handleClose = () => {
    setOpen(false);
  };

  // Fetch zones and branches
  const fetchZones = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch all zones
      const zonesResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/zones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch branches for each zone in parallel
      const zonesWithBranches = await Promise.all(
        zonesResponse.data.map(async (zone) => {
          try {
            const branchesResponse = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/zones/${encodeURIComponent(zone.zoneName)}/branches`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            return {
              zoneName: zone.zoneName,
              branches: branchesResponse.data
            };
          } catch (error) {
            // console.error(`Error fetching branches for zone ${zone.zoneName}:`, error);


            return {
              zoneName: zone.zoneName,
              branches: ['Error loading branches']
            };
          }
        })
      );

      setZones(zonesWithBranches);
    } catch (error) {
      // console.error('Error fetching zones:', error);


      setError(error.response?.data?.message || 'Failed to fetch zones and branches');
    } finally {
      setLoading(false);
    }
  };

  // Modal styling
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '95%' : '50%',
    maxHeight: isMobile ? '85vh' : '90vh',
    overflowY: 'auto',
    bgcolor: theme.palette.background.paper,
    boxShadow: 24,
    p: isMobile ? 2 : 3,
    borderRadius: 3,
  };

  // Mobile zone card component
  const MobileZoneCard = ({ zone, index }) => (
    <Card sx={{ mb: 2, backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
          {zone.zoneName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          <strong>Branches:</strong>
        </Typography>
        <Box sx={{ mt: 1 }}>
          {Array.isArray(zone.branches) ? (
            zone.branches.map((branch, i) => (
              <Typography key={i} variant="body2" sx={{ ml: 1, mb: 0.5 }}>
                • {branch}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" sx={{ ml: 1 }}>
              No branches available
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Tooltip title="Zone Information" arrow>
        <IconButton 
          onClick={handleOpen} 
          sx={{ 
            color: theme.palette.primary.main,
            size: isMobile ? "small" : "medium"
          }}
        >
          <InfoIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Tooltip>
      <Modal open={open} closeAfterTransition onClose={handleClose}>
        <Fade in={open}>
          <Box sx={{ ...modalStyle, position: 'relative' }}>
            <IconButton
              onClick={handleClose}
              sx={{ 
                position: 'absolute', 
                top: isMobile ? 4 : 8, 
                right: isMobile ? 4 : 8, 
                color: theme.palette.grey[500], 
                zIndex: 1301,
                size: isMobile ? "small" : "medium"
              }}
            >
              <CloseIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
            
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                mb: 2, 
                textAlign: 'center',
                fontWeight: 'bold',
                color: theme.palette.text.primary
              }}
            >
              Zone Information
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress sx={{ color: '#f15a22' }} />
              </Box>
            ) : (
              <>
                {isMobile ? (
                  // Mobile layout with cards
                  (<Box sx={{ 
                    maxHeight: '60vh', 
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: theme.palette.background.default,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#f15a22',
                      borderRadius: '10px',
                    },
                  }}>
                    {zones.length > 0 ? (
                      zones.map((zone, index) => (
                        <MobileZoneCard key={index} zone={zone} index={index} />
                      ))
                    ) : (
                      <Typography sx={{ textAlign: 'center', padding: '20px' }}>
                        {error || 'No data available'}
                      </Typography>
                    )}
                  </Box>)
                ) : (
                  // Desktop layout with table
                  (<TableContainer
                    component={Paper}
                    sx={{
                      maxHeight: '70vh',
                      overflowY: 'auto',
                      marginTop: '24px',
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: theme.palette.background.default,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#f15a22',
                        borderRadius: '10px',
                      },
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '1.1em',
                              background: theme.palette.mode === 'dark' ? '#424242' : '#f5f5f5',
                              color: theme.palette.text.primary,
                              padding: '10px',
                              textAlign: 'center',
                            }}
                          >
                            Zone
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '1.1em',
                              background: theme.palette.mode === 'dark' ? '#424242' : '#f5f5f5',
                              color: theme.palette.text.primary,
                              padding: '10px',
                              textAlign: 'left',
                            }}
                          >
                            Branches
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {zones.length > 0 ? (
                          zones.map((zone, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit',
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: 'bold',
                                  verticalAlign: 'top',
                                  padding: '10px',
                                  fontSize: '1em',
                                  color: theme.palette.text.primary,
                                  textAlign: 'center',
                                }}
                              >
                                {zone.zoneName}
                              </TableCell>
                              <TableCell
                                sx={{
                                  padding: '10px',
                                  fontSize: '1em',
                                  color: theme.palette.text.primary,
                                }}
                              >
                                {Array.isArray(zone.branches) ? (
                                  zone.branches.map((branch, i) => (
                                    <div key={i}>{branch}</div>
                                  ))
                                ) : (
                                  <div>No branches available</div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} sx={{ textAlign: 'center', padding: '10px' }}>
                              {error || 'No data available'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>)
                )}
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default HoverModalButton;
