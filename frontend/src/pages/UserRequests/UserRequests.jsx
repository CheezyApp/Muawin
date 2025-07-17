import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MainContentWrapper from './MainContentWrapper';
import SearchBar from './SearchBar';
import CreateTicketButton from './CreateTicketButton';
import TicketTable from './TicketTable';  
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';

const UserRequests = ({ open }) => {
  const theme = useTheme();
  const headingColor = theme.palette.mode === 'dark' ? '#f15a22' : '#000000';
  const [tickets, setTickets] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ticketID, setTicketID] = useState(null);
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [natureOfJob, setNatureOfJob] = useState('');
  const [subject, setSubject] = useState(''); // New Subject field
  const [module, setModule] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [timeline, setTimeline] = useState('');
  const [actionRequired, setActionRequired] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null); // For viewing ticket details

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tickets');
        const ticketData = await response.json();
        setTickets(ticketData);
      } catch (error) {
        // console.error('Error fetching tickets:', error);

      }
    };

    fetchTickets(); 
  }, []);

  const handleCreateTicket = () => {
    const newTicketID = Math.floor(10000 + Math.random() * 90000).toString(); 
    setTicketID(newTicketID);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = () => {
    const newTicket = {
      ticketId: ticketID,
      subject: subject,  // Set subject as filled in the form
      createdAt: new Date().toLocaleString(),
      status: 'Open',
      department,
      designation,
      natureOfJob,
      module,
      jobDescription,
      timeline,
      actionRequired,
    };

    setTickets([newTicket, ...tickets]);

    setDepartment('');
    setDesignation('');
    setNatureOfJob('');
    setSubject('');  // Clear the subject field
    setModule('');
    setJobDescription('');
    setTimeline('');
    setActionRequired('');

    setIsDialogOpen(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  // Handle Ticket ID Click for Viewing Ticket Details
  const handleTicketClick = (ticketId) => {
    const selected = tickets.find(ticket => ticket.ticketId === ticketId);
    setSelectedTicket(selected); // Set the selected ticket
  };

  // Handle closing the ticket detail dialog
  const handleDetailDialogClose = () => {
    setSelectedTicket(null); // Close the ticket detail dialog
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainContentWrapper open={open}>
      <Typography
        variant="h4"
        sx={{
          color: headingColor,
          mb: 4,
          textAlign: 'center',
          fontSize: '30px',
          fontFamily: 'TanseekModernW20',
          borderBottom: '2px solid #ccc',
          paddingBottom: '10px',
          transition: 'color 0.3s ease',
        }}
      >
        USER REQUESTS
      </Typography>

      <Box
        sx={{
          width: '100%',
          transition: 'background-color 0.3s ease',
          backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <Grid container spacing={0} sx={{ mb: 3 }}>
          <Grid item xs={9} sx={{ padding: 0 }}>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              style={{ width: '400px', height: '40px' }}
            />
          </Grid>

          <Grid item xs={3} sx={{ padding: 0, textAlign: 'right' }}>
            <CreateTicketButton onClick={handleCreateTicket} />
          </Grid>
        </Grid>

        <Box
          sx={{
            width: '100%',
            transition: 'background-color 0.15s ease, color 0.15s ease',
            backgroundColor: theme.palette.mode === 'dark' ? '#222' : '#fafafa',
            color: theme.palette.mode === 'dark' ? '#f5f5f5' : '#333',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          {tickets.length === 0 ? (
            <Typography>No Pending Tickets</Typography>
          ) : (
            <TicketTable tickets={filteredTickets} onTicketClick={handleTicketClick} />
          )}
        </Box>
      </Box>

      {/* Dialog for ticket creation */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>User Request Ticket ID: {ticketID}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Select Department</InputLabel>
            <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <MenuItem value="DELIVERY DEPARTMENT">DELIVERY DEPARTMENT</MenuItem>
              <MenuItem value="EXECUTIVE OFFICE">EXECUTIVE OFFICE</MenuItem>
              <MenuItem value="FINANCE DEPARTMENT">FINANCE DEPARTMENT</MenuItem>
              <MenuItem value="HUMAN RESOURCE">HUMAN RESOURCE</MenuItem>
              <MenuItem value="INFORMATION TECHNOLOGY">INFORMATION TECHNOLOGY</MenuItem>
              <MenuItem value="MAINTAINENCE DEPARTMENT">MAINTAINENCE DEPARTMENT</MenuItem>
              <MenuItem value="MEETHI KHUSHIYAN (BAKERY)">MEETHI KHUSHIYAN</MenuItem>
              <MenuItem value="OPERATIONS">OPERATIONS</MenuItem>
              <MenuItem value="PLANING AND PROCUREMENT">PLANING AND PROCUREMENT</MenuItem>
              <MenuItem value="PROJECT DEPARTMENT">PROJECT DEPARTMENT</MenuItem>
              <MenuItem value="QUALITY DEPARTMENT">QUALITY DEPARTMENT</MenuItem>
              <MenuItem value="RESEARCH AND DEVELOPMENT">RESEARCH AND DEVELOPMENT</MenuItem>
              <MenuItem value="SOURCING">SOURCING</MenuItem>
              <MenuItem value="TRAINING AND DEVELOPMENT">TRAINING AND DEVELOPMENT</MenuItem>
              <MenuItem value="WAREHOUSE -HUMIK">WAREHOUSE -HUMIK</MenuItem>
              <MenuItem value="WAREHOUSE -CONSTRUCTION">WAREHOUSE -CONSTRUCTION</MenuItem>            
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Nature of Job"
            value={natureOfJob}
            onChange={(e) => setNatureOfJob(e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Select Module</InputLabel>
            <Select value={module} onChange={(e) => setModule(e.target.value)}>
              <MenuItem value="Licenses/Trade Licenses">Licenses/Trade Licenses</MenuItem>
              <MenuItem value="Licenses/Staff Medical">Licenses/Staff Medical</MenuItem>
              <MenuItem value="Licenses/Tourism">Licenses/Tourism</MenuItem>
              <MenuItem value="Licenses/Labour Licenses">Licenses/Labour Licenses</MenuItem>
              <MenuItem value="Approvals/Outer Spaces">Approvals/Outer Spaces</MenuItem>
              <MenuItem value="Vehicle/Maintainence">Vehicle/Maintainence</MenuItem>
              <MenuItem value="Vehicle/Token Taxes">Vehicle/Token Taxes</MenuItem>
              <MenuItem value="Vehicle/Route Permits">Vehicle/Route Permits</MenuItem>
              <MenuItem value="HSE/Monthly Inspection">HSE/Monthly Inspection</MenuItem>
              <MenuItem value="HSE/Quarterly Audit">HSE/Quarterly Audit</MenuItem>
              <MenuItem value="HSE/Expiry of Cylinders">HSE/Expiry of Cylinders</MenuItem>
              <MenuItem value="HSE/Training">HSE/Training</MenuItem>
              <MenuItem value="HSE/Incidents">HSE/Incidents</MenuItem>
              <MenuItem value="Taxation/Marketing and Billboards Taxes">Taxation/Marketing and Billboards Taxes</MenuItem>
              <MenuItem value="Taxation/Professional Taxes">Taxation/Professional Taxes</MenuItem>
              <MenuItem value="Certificates/Electric Fitness Test">Certificates/Electric Fitness Test</MenuItem>
              <MenuItem value="Security/Guard Training">Security/Guard Training</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Job Description"
            multiline
            rows={5}
            inputProps={{ maxLength: 1000 }}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Action Required by the Administration"
            multiline
            rows={3}
            inputProps={{ maxLength: 100 }}
            value={actionRequired}
            onChange={(e) => setActionRequired(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleFormSubmit} variant="contained" sx={{ backgroundColor: '#f15a22', color: '#fff' }}>
            Submit Request
          </Button>
          <Button onClick={handleDialogClose} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for viewing ticket details */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onClose={handleDetailDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>Ticket ID: {selectedTicket.ticketId}</DialogTitle>
          <DialogContent>
            <Typography variant="body1"><strong>Subject:</strong> {selectedTicket.subject}</Typography>
            <Typography variant="body1"><strong>Department:</strong> {selectedTicket.department}</Typography>
            <Typography variant="body1"><strong>Designation:</strong> {selectedTicket.designation}</Typography>
            <Typography variant="body1"><strong>Nature of Job:</strong> {selectedTicket.natureOfJob}</Typography>
            <Typography variant="body1"><strong>Module:</strong> {selectedTicket.module}</Typography>
            <Typography variant="body1"><strong>Job Description:</strong> {selectedTicket.jobDescription}</Typography>
            <Typography variant="body1"><strong>Timeline:</strong> {selectedTicket.timeline}</Typography>
            <Typography variant="body1"><strong>Action Required:</strong> {selectedTicket.actionRequired}</Typography>
            <Typography variant="body1"><strong>Status:</strong> <Chip label={selectedTicket.status} color={selectedTicket.status === 'Open' ? 'success' : 'error'} /></Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDetailDialogClose} variant="outlined">Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </MainContentWrapper>
  );
};

export default UserRequests;
