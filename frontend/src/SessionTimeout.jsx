import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogActions, Button, Typography, styled } from '@mui/material';
import { useAuth } from './contexts/AuthContext';

// Styled components for custom styling
const StyledDialog = styled(Dialog)({
    '& .MuiPaper-root': {
        borderRadius: '16px', // Rounded corners for the dialog
        padding: '12px',
        maxWidth: '350px', // Smaller width for the dialog
    },
});

const StyledButton = styled(Button)({
    backgroundColor: '#f15a22', // Custom color for the button
    color: '#fff',
    borderRadius: '8px', // Rounded corners for the button
    '&:hover': {
        backgroundColor: '#d14a1c', // Slightly darker shade on hover
    },
});

const SessionTimeout = ({ timeout = 15 * 60 * 1000 }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [open, setOpen] = useState(false);
    let inactivityTimeout;

    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(() => {
            setOpen(true); // Open dialog instead of alert
        }, timeout);
    };

    const handleClose = () => {
        setOpen(false);
        logout();
        navigate("/login");
    };

    useEffect(() => {
        resetInactivityTimer();
        window.addEventListener("mousemove", resetInactivityTimer);
        window.addEventListener("keypress", resetInactivityTimer);

        return () => {
            clearTimeout(inactivityTimeout);
            window.removeEventListener("mousemove", resetInactivityTimer);
            window.removeEventListener("keypress", resetInactivityTimer);
        };
    }, []);

    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            aria-labelledby="session-expired-dialog"
            BackdropProps={{
                style: {
                    backdropFilter: 'blur(8px)', // Blur effect for background
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slight dark overlay for better visibility
                },
            }}
            maxWidth="xs"
        >
            <DialogTitle id="session-expired-dialog" style={{ textAlign: 'center' }}>
                <Typography variant="h6" component="div">
                    Your Session has Expired 😔
                </Typography>
            </DialogTitle>
            <DialogActions style={{ justifyContent: 'flex-end', paddingBottom: '16px', paddingRight: '16px' }}>
                <StyledButton onClick={handleClose}>
                    Login
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

export default SessionTimeout;
