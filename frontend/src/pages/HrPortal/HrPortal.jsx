import React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import ModulesGrid from './Modulesgrid/Modulesgrid';
import { useTheme } from '@mui/material/styles';
import Banner from '../../Component/BannerComponent/BannerComponent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(4),
  backgroundColor: theme.palette.mode === 'dark' ? '#000' : '#f5f5f5',
  color: theme.palette.mode === 'dark' ? '#FFF' : '#000',
  minHeight: '100vh', // Ensure it fills the viewport height
  height: '100%',      // Ensure it takes full height
  overflowY: 'auto',   // Allow vertical scrolling
}));

const HrPortal = ({user}) => {
  const theme = useTheme();
  const headingColor = theme.palette.mode === 'dark' ? '#f15a22' : '#000000';

  return (
    <MainContent>
    {/* Banner Section */}
    <Box
      sx={{
        mt: { xs: 6, sm: 2 },  // Top margin: larger on mobile
        ml: { xs: -1, sm: 1 },  // Left margin: none on mobile, small on desktop
        mr: { xs: -1, sm: 0 },  // Right margin: none on both
        mb: { xs: 1, sm: 4 },  // Bottom margin: small on mobile, larger on desktop
      }}
    >
      <Banner />
    </Box>

    {/* Heading */}
    <Typography
      variant="h4"
      sx={{
        color: headingColor,
        mb: 4,
        textAlign: 'left',
        ml: { xs: -2, sm: 6 },          // Responsive left margin
        fontSize: { xs: '28px', sm: '32px' }, // Responsive font size
        fontFamily: 'TanseekModernW20',
      }}
    >
      HR PORTAL
    </Typography>

    {/* Modules Section */}
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box
          sx={{
            mt: { xs: -2, sm: -6 }, // Negative top margin: smaller on mobile
            ml: { xs: 2, sm: 6 },   // Left margin: smaller on mobile
          }}
        >
          <ModulesGrid user={user} />
        </Box>
      </Grid>
    </Grid>
  </MainContent>
  );
};

export default HrPortal;


