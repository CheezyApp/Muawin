import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';

// Animation keyframes
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(241, 90, 34, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(241, 90, 34, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(241, 90, 34, 0);
  }
`;

const slideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const Tile = ({ name, image }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Set loaded state after component mounts
  React.useEffect(() => {
    setHasLoaded(true);
  }, []);

  const handleClick = () => {
    switch (name) {
      case 'Licenses':
        navigate('/Licenses/Licensepage');
        break;
      case 'Approvals':
        navigate('/Approval/Approvalpage');
        break;
      case 'Vehicles':
        navigate('/Vehicles/Vehiclepage');
        break;
      case 'User Requests':
        navigate('/UserRequests');
        break;
      case 'Health Safety Environment':
        navigate('/Hse/Hse');
        break;
      case 'Taxation':
        navigate('/Taxation/Taxationpage');
        break;
      case 'Certificates':
        navigate('/Certificate/Certificatepage');
        break;
      case 'Security':
        navigate('/Security/GuardTraining');
        break;
      case 'Admin Policies and SOPs':
        navigate('/AdminPolicies');
        break;
      case 'Rental Agreements':
        navigate('/RentalAgreements');
        break;
      case 'User Management':
        navigate('/UserManagement');
        break;
      default:
        console.log(`${name} clicked`);
    }
  };

  return (
    <Tooltip title={name} arrow enterDelay={1200} placement="top">
      {/* ORIGINAL CODE - COMMENTED OUT
      <Paper
        aria-label={`Navigate to ${name}`}
        sx={{
          padding: 1,
          cursor: 'pointer',
          transition: 'transform 0.1s ease-in-out',
          position: 'relative',
          height: { xs: '60px', sm: '70px', md: '80px' }, // Adjust height based on screen size
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
          backgroundColor: isDarkMode ? '#333' : '#FFF',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
        onClick={handleClick}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: { xs: 1, sm: 2 }, // Adjust padding dynamically
          }}
        >
          <img
            src={image}
            alt={name}
            style={{
              width: '40px', // Keep the size constant or adjust as needed
              height: '40px',
              marginRight: '15px',
            }}
          />
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '13px', sm: '15px' }, // Smaller font on mobile
              fontWeight: 'bold',
              fontFamily: 'Encode Sans',
              color: isDarkMode ? '#FFF' : '#000',
            }}
          >
            {name}
          </Typography>
        </Box>
      </Paper>
      */}

      {/* ENHANCED CODE WITH ANIMATIONS */}
      <Paper
        aria-label={`Navigate to ${name}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          padding: 1,
          cursor: 'pointer',
          position: 'relative',
          height: { xs: '70px', sm: '80px', md: '90px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderRadius: '16px',
          background: isHovered 
            ? 'linear-gradient(135deg, #ff8c42 0%, #ffb366 100%)' 
            : (isDarkMode ? '#333' : '#FFF'),
          boxShadow: isHovered 
            ? '0 8px 25px rgba(255, 140, 66, 0.4), 0 0 0 3px rgba(255, 140, 66, 0.1)' 
            : '0 4px 15px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          opacity: hasLoaded ? 1 : 0,
          transform: hasLoaded 
            ? (isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)')
            : 'translateY(20px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
          '&:active': {
            transform: 'translateY(-2px) scale(0.98)',
            transition: 'all 0.1s',
          },
          ...(isHovered && {
            animation: `${pulse} 2s infinite`,
          }),
        }}
        onClick={handleClick}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: { xs: 1, sm: 2 },
            zIndex: 1,
            position: 'relative',
          }}
        >
          <img
            src={image}
            alt={name}
            style={{
              width: '45px',
              height: '45px',
              marginRight: '15px',
              filter: isHovered ? 'brightness(1.2) contrast(1.1)' : 'none',
              transition: 'all 0.4s ease',
            }}
          />
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '14px', sm: '16px' },
              fontWeight: 'bold',
              fontFamily: 'Encode Sans',
              color: isHovered ? '#FFF' : (isDarkMode ? '#FFF' : '#000'),
              textShadow: isHovered ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
              transition: 'all 0.4s ease',
            }}
          >
            {name}
          </Typography>
        </Box>
      </Paper>
    </Tooltip>
  );
};

export default Tile;
