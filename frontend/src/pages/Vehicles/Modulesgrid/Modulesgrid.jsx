import React, { useState, useMemo } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const ModulesGrid = ({ user }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [expandedTile, setExpandedTile] = useState(null);

  // Filter modules based on user's registeredModules
  const modules = useMemo(() => {
    // console.log('User data:', user);


    const allModules = [
      {
        name: 'Vehicles_Maintenance',
        image: '/images/folder.webp',
        subheadings: [
          { title: 'Routine Maintenance', path: '/Vehicles/RoutineMaintainence' },
          { title: 'Major parts/Replacements', path: '/Vehicles/MajorParts' },
          { title: 'Major Repairs', path: '/Vehicles/MajorRepairs' },
        ],
      },
      {
        name: 'Vehicles_Token Taxes',
        image: '/images/folder.webp',
        subheadings: [
          { title: 'Annual Token Tax', path: '/Vehicles/AnnualTokenTax' },
          { title: 'M-Tag For SC Vehicles', path: '/Vehicles/MTag' },
        ],
      },
      {
        name: 'Vehicles_Route Permits',
        image: '/images/folder.webp',
        subheadings: [
          { title: 'Cantt Passes', path: '/Vehicles/CanttPasses' },
          { title: 'Islamabad Capital Territory', path: '/Vehicles/Islamabad' },
          { title: 'Rawalpindi', path: '/Vehicles/Rawalpindi' },
          { title: 'Peshawar', path: '/Vehicles/Peshawar' },
          { title: 'Wah', path: '/Vehicles/Wah' },
        ],
      },
    ];

    const filteredModules = allModules
      .map((module) => {
        // Filter subheadings based on user's registeredModules
        const filteredSubheadings = module.subheadings.filter((subheading) =>
          user?.registeredModules.some((registered) => registered === `${module.name.split('_')[0]}_${subheading.title}` || registered === module.name)
        );
        // Only return the module if it has at least one subheading that the user has access to
        if (filteredSubheadings.length > 0) {
          return { ...module, subheadings: filteredSubheadings };
        }
        return null;
      })
      .filter((module) => module !== null);

    // console.log('Filtered modules:', filteredModules);


    return filteredModules;
  }, [user]);

  const handleTileClick = (index, hasSubheadings) => {
    if (hasSubheadings) {
      setExpandedTile(index === expandedTile ? null : index);
    }
  };

  const handleSubheadingClick = (path) => {
    // console.log("Navigating to: ", path);


    navigate(path); // This navigates to the path
  };

  return (
    <Box sx={{ padding: 3, position: 'relative' }}>
      <Grid container spacing={2} justifyContent="center">
        {modules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
                alignItems: 'center',
                justifyContent: 'flex-start',
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
                borderRadius: '10px',
                backgroundColor: isDarkMode ? '#333' : '#FFF',
                margin: '0 auto',
              }}
              onClick={() => handleTileClick(index, module.subheadings && module.subheadings.length > 0)}
            >
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
                  {module.name.split('_')[1]} {/* Display only the main module name */}
                </Typography>
              </Box>

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
                    <Button
                      key={subIndex}
                      variant="text"
                      sx={{
                        color: isDarkMode ? '#FFF' : '#000',
                        textTransform: 'none',
                        marginBottom: 0.5,
                        width: '100%',
                        justifyContent: 'flex-start',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#333' : '#ddd',
                          color: isDarkMode ? '#FFF' : '#000',
                        },
                      }}
                      onClick={() => handleSubheadingClick(subheading.path)}
                    >
                      {subheading.title}
                    </Button>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ModulesGrid;