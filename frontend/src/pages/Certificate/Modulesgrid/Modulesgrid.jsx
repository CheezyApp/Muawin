import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
// import Tooltip from '@mui/material/Tooltip';

const modules = [
  {
    name: 'Electric Fitness Test',
    image: '/images/folder.webp',
    path: '/Certificate/ElectricFitnessTest',
    subheadings: [],
  },
 
];

const ModulesGrid = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [expandedTile, setExpandedTile] = useState(null);

  const handleTileClick = (index, hasSubheadings) => {
    if (hasSubheadings) {
      setExpandedTile(index === expandedTile ? null : index);
    } else {
      handleSubheadingClick(modules[index].path);
    }
  };

  const handleSubheadingClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ padding: 3, position: 'relative' }}>
      <Grid container spacing={2} justifyContent="flex-start">
        {modules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            {/* <Tooltip title={module.name} arrow enterDelay={900} placement="top"> */}
              <Paper
                sx={{
                  padding: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out', 
                  transform: expandedTile === index && module.subheadings.length > 0 ? 'scale(1.05)' : 'scale(1)',
                  maxHeight: expandedTile === index && module.subheadings.length > 0 ? '300px' : '120px', 
                  overflow: 'hidden', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start', 
                  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  backgroundColor: isDarkMode ? '#333' : '#FFF',
                  margin: '0 auto',
                }}
                onClick={() => handleTileClick(index, module.subheadings && module.subheadings.length > 0)}
              >
                {/* Top section with image and title */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    textAlign: 'center',
                    marginBottom: expandedTile === index ? 1 : 0, 
                  }}
                >
                  <img
                    src={module.image}
                    alt={module.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      marginBottom: '10px',
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '15px',
                      fontWeight: 'bold',
                      fontFamily: 'Encode Sans',
                      color: isDarkMode ? '#FFF' : '#000',
                    }}
                  >
                    {module.name}
                  </Typography>
                </Box>

                {/* Subheadings section */}
                {expandedTile === index && module.subheadings && module.subheadings.length > 0 && (
                  <Box
                    sx={{
                      marginTop: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '100%',
                      ...(module.subheadings.length > 4 && { maxHeight: '150px', overflowY: 'auto' }),
                    }}
                  >
                    {module.subheadings.map((subheading, subIndex) => (
                      // <Tooltip key={subIndex} title={subheading} arrow placement="top">  */}
                        (<Button
                          variant="text"
                          sx={{
                            color: isDarkMode ? '#FFF' : '#000',
                            textTransform: 'none',
                            marginBottom: 0.5, 
                            width: '100%', 
                            justifyContent: 'flex-start', 
                            '&:hover': {
                              backgroundColor: isDarkMode ? '#333' : '#ddd', // Darker hover background color
                              color: isDarkMode ? '#FFF' : '#000', // Text color on hover remains the same
                            },
                          }}
                          onClick={() => handleSubheadingClick(module.path)}
                        >
                          {subheading}
                        </Button>)
                      // </Tooltip>
                    ))}
                  </Box>
                )}
              </Paper>
            {/* </Tooltip> */}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ModulesGrid;
