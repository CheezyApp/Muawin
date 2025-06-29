import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const MainContentWrapper = styled(Box)(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(4),
  marginLeft: '0', // No left margin on mobile
  marginTop: '64px', // Adjust for AppBar height
  transition: theme.transitions.create(['margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  backgroundColor: theme.palette.mode === 'dark' ? '#000' : '#f5f5f5',
  color: theme.palette.mode === 'dark' ? '#FFF' : '#000',
  minHeight: '100vh',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    marginLeft: open ? '240px' : '60px', // Only on tablet/desktop
  },
}));

export default MainContentWrapper;
