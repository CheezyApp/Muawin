import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableRow,
  useTheme,
  Snackbar, // Import Snackbar for notifications
  Alert, // Import Alert for styled messages
  useMediaQuery,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios'; // Import axios for API calls
import ErrorBoundary from '../../components/ErrorBoundary';
import ErrorNotification from '../../components/ErrorNotification';
import useErrorHandler from '../../hooks/useErrorHandler';


const steps = ['Basics', 'Manage Roles', 'Manage Modules', 'Finish'];


const headquarterRoles = [
  'IT', 'Admin', 'HR', 'Operations', 'Training and Development',
  'Maintainance', 'Warehouse - Humik',
  'Warehouse - Construction', 'Purchase', 'Surveillance', 'Finance'
];
const branchRoles = ['Restaurant Manager'];
//Modules List for Users
const modules = [
  { main: 'Licenses', subModules: ['Trade Licenses', 'Staff Medicals', 'Tourism Licenses', 'Labour Licenses'] },
  { main: 'Approvals', subModules: ['Outer Spaces'] },
  { main: 'Vehicles', subModules: ['Maintenance', 'Token Taxes', 'Route Permits'] },
  { main: 'User Requests', subModules: [] },
  { main: 'Health Safety Environment', subModules: ['Monthly Inspection', 'Quarterly Audit', 'Expiry of Cylinders', 'Incidents', 'Training Status'] },
  { main: 'Taxation', subModules: ['Marketing / Bill Boards Taxes', 'Profession Tax'] },
  { main: 'Certificates', subModules: ['Electric Fitness Test'] },
  { main: 'Security', subModules: ['Guard Training'] },
  { main: 'HR Portal', subModules: ['Hiring Applications'] },
  { main: 'Admin Policies and SOPs', subModules: [] },
  { main: 'Rental Agreements', subModules: [] },
  { main: 'User Management', subModules: [] },
];

// Predefined modules for Restaurant Manager
const preSelectedModulesForRestaurantManager = {
  'Health Safety Environment_Monthly Inspection': true,
  'Health Safety Environment_Quarterly Audit': true,
  'Health Safety Environment_Expiry of Cylinders': true,
  'Health Safety Environment_Incidents': true,
  'Health Safety Environment_Training Status': true,
  'User Requests_': true,
  'Licenses_Trade Licenses': true,
  'Licenses_Staff Medicals': true,
  'Licenses_Tourism Licenses': true,
  'Licenses_Labour Licenses': true,
  'Approvals_Outer Spaces': true,
  'Vehicles_Maintenance': true,
  'Vehicles_Token Taxes': true,
  'Vehicles_Route Permits': true,
  'Taxation_Marketing / Bill Boards Taxes': true,
  'Taxation_Profession Tax': true,
  'Rental Agreements_': true,
  'Admin Policies and SOPs_': true,
  'Security_Guard Training': true,
  'Certificates_Electric Fitness Test': true
};

const AddUserDrawer = ({ open, onClose, onUserCreated }) => {
  const { error, handleError, clearError } = useErrorHandler();
  const [activeStep, setActiveStep] = useState(0);
  const [roleType, setRoleType] = useState('Headquarter Roles');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [checkedModules, setCheckedModules] = useState({});
  const [zones, setZones] = useState([]); // State for zones
  const [branches, setBranches] = useState([]); // State for branches
  const [selectedZone, setSelectedZone] = useState(''); // State for selected zone
  const [selectedBranch, setSelectedBranch] = useState(''); // State for selected branch
  const [notificationOpen, setNotificationOpen] = useState(false); // State for Snackbar

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Form state
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    username: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Password generation state
  const [generatePassword, setGeneratePassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Fetch zones from the server
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          handleError(new Error('Authentication token not found'));
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/zones`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setZones(response.data);
      } catch (error) {
        handleError(new Error('Failed to fetch zones. Please try again.'));
        setZones([]);
      }
    };

    if (open) {
      fetchZones();
    }
  }, [open, handleError]);

  // Fetch branches based on selected zone
  useEffect(() => {
    if (selectedZone) {
      const fetchBranches = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            handleError(new Error('Authentication token not found'));
            return;
          }
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/zones/${selectedZone}/branches`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setBranches(response.data);
        } catch (error) {
          handleError(new Error('Failed to fetch branches. Please try again.'));
          setBranches([]);
        }
      };

      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [selectedZone, handleError]);

  // Reset function to clear drawer state when closed
  const resetDrawer = () => {
    setActiveStep(0);
    setRoleType('Headquarter Roles');
    setRole('');
    setCustomRole('');
    setCheckedModules({});
    setSelectedZone('');
    setSelectedBranch('');
    setFormValues({
      firstName: '',
      lastName: '',
      displayName: '',
      username: '',
    });
    setFormErrors({});
    setGeneratePassword(false);
    setGeneratedPassword('');
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedValues = {
      ...formValues,
      [name]: value,
    };

    // Update the displayName automatically based on firstName and lastName
    if (name === 'firstName' || name === 'lastName') {
      updatedValues.displayName = `${updatedValues.firstName} ${updatedValues.lastName}`.trim();
    }

    setFormValues(updatedValues);

    if (value.trim()) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  // Handle role type change
  const handleRoleTypeChange = (e) => {
    setRoleType(e.target.value);
    setRole(''); // Clear selected role or input
    setCheckedModules({}); // Clear pre-selected modules
    if (e.target.value !== 'Custom Role') {
      setCustomRole(''); // Reset custom role if not selected
    }
  };

  // Handle role selection or custom role input
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    // If the selected role is Restaurant Manager, pre-select the modules
    if (selectedRole === 'Restaurant Manager') {
      setCheckedModules(preSelectedModulesForRestaurantManager);
    } else {
      setCheckedModules({}); // Clear modules for other roles
    }
  };

  // Handle custom role input
  const handleCustomRoleChange = (e) => {
    setCustomRole(e.target.value);
    setRole(e.target.value); // Set the custom role as the role value
  };

  // Password generation function
  const generateRandomPassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 5; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Handle password generation checkbox change
  const handlePasswordGenerationChange = (e) => {
    setGeneratePassword(e.target.checked);
    if (e.target.checked) {
      const newPassword = generateRandomPassword();
      setGeneratedPassword(newPassword);
    } else {
      setGeneratedPassword(''); // Clear password if unchecked
    }
  };

  // Validation before going to the next step
  const validateForm = () => {
    let errors = {};

    if (!formValues.firstName.trim()) {
      errors.firstName = 'First Name is required';
    }
    if (!formValues.lastName.trim()) {
      errors.lastName = 'Last Name is required';
    }
    if (!formValues.displayName.trim()) {
      errors.displayName = 'Display Name is required';
    }
    if (!formValues.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!generatePassword) {
      errors.generatePassword = 'You must generate a password';
    }
    // Role, Zone, Branch checks (for step 2)
    if (activeStep === 1) {
      if (!role || (roleType === 'Custom Role' && !customRole.trim())) {
        errors.role = 'Role is required';
      }
      if (!selectedZone) {
        errors.zone = 'Zone is required';
      }
      if (!selectedBranch) {
        errors.branch = 'Branch is required';
      }
    }

    setFormErrors(errors);

    // If there are no errors, return true
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if ((activeStep === 0 && validateForm()) ||
        (activeStep === 1 && validateForm()) ||
        (activeStep > 1)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle module selection for Manage Modules step
  const handleModuleChange = (main, sub) => (event) => {
    const key = `${main}_${sub}`;
    setCheckedModules({
      ...checkedModules,
      [key]: event.target.checked,
    });
  };

  // Helper function to format the selected modules as an array of strings
  const formatModules = () => {
    let formattedModules = [];
    for (const moduleKey in checkedModules) {
      if (checkedModules[moduleKey]) {
        formattedModules.push(moduleKey);
      }
    }
    return formattedModules;
  };

  // Render formatted modules in the Review Details step
  const renderModules = () => {
    const formattedModules = formatModules();

    return formattedModules.map((module) => (
      <Box key={module} sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 'bold' }}>{module.split('_')[0]}</Typography>
        {module.split('_')[1] && (
          <ul>
            <li>{module.split('_')[1]}</li>
          </ul>
        )}
      </Box>
    ));
  };

  // Handle selecting/deselecting all submodules
  const handleSelectAllSubmodules = (main, checked) => {
    const updatedCheckedModules = { ...checkedModules };

    modules.forEach((module) => {
      if (module.main === main) {
        module.subModules.forEach((sub) => {
          updatedCheckedModules[`${main}_${sub}`] = checked;
        });
      }
    });

    setCheckedModules(updatedCheckedModules);
  };

  // Render module selection for Manage Modules step
  const renderModuleSelection = () => {
    const modulesWithSubModules = modules.filter((module) => module.subModules.length > 0);
    const modulesWithoutSubModules = modules.filter((module) => module.subModules.length === 0);
  
    return (
      <Box
        sx={{
          height: '400px',
          overflowY: 'auto',
          paddingRight: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#f15a22',
            borderRadius: '15px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
          },
        }}
      >
        {/* Modules with Submodules */}
        {modulesWithSubModules.map((module) => (
          <Accordion key={module.main} sx={{ marginBottom: 0 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: isDarkMode ? '#fff' : '#000' }} />}
              sx={{
                minHeight: '32px', // Decrease the height further
                '&.Mui-expanded': {
                  minHeight: '32px', // Maintain the compact height when expanded
                },
                '.MuiAccordionSummary-content': {
                  margin: '4px 0', // Reduce inner content spacing
                },
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={module.subModules.every((sub) => !!checkedModules[`${module.main}_${sub}`])}
                    indeterminate={
                      module.subModules.some((sub) => !!checkedModules[`${module.main}_${sub}`]) &&
                      !module.subModules.every((sub) => !!checkedModules[`${module.main}_${sub}`])
                    }
                    onChange={(e) => {
                      e.stopPropagation(); // Prevent accordion from toggling
                      handleSelectAllSubmodules(module.main, e.target.checked);
                    }}
                    sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }}
                  />
                }
                label={
                  <Typography sx={{ color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }}>
                    {module.main}
                  </Typography>
                }
                sx={{ marginRight: 1 }}
                onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling when clicking on the label
              />
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {module.subModules.map((subModule) => (
                  <FormControlLabel
                    key={subModule}
                    control={
                      <Checkbox
                        checked={!!checkedModules[`${module.main}_${subModule}`]}
                        onChange={handleModuleChange(module.main, subModule)}
                        sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }}
                      />
                    }
                    label={subModule}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        ))}
  
        {/* Modules without Submodules */}
        {modulesWithoutSubModules.map((module) => (
          <Accordion key={module.main} sx={{ marginBottom: 0 }}>
            <AccordionSummary
              sx={{
                minHeight: '32px', // Decrease the height further
                '&.Mui-expanded': {
                  minHeight: '32px', // Maintain the compact height when expanded
                },
                '.MuiAccordionSummary-content': {
                  margin: '4px 0', // Reduce inner content spacing
                },
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!checkedModules[`${module.main}_`]}
                    onChange={(e) => {
                      e.stopPropagation(); // Prevent accordion from toggling
                      handleModuleChange(module.main, '')(e);
                    }}
                    sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }}
                  />
                }
                label={
                  <Typography sx={{ color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }}>
                    {module.main}
                  </Typography>
                }
                sx={{ marginRight: 1 }}
                onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling when clicking on the label
              />
            </AccordionSummary>
          </Accordion>
        ))}
      </Box>
    );
  };
  
  

  // Handle finish and submit user
  const handleFinish = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleError(new Error('Authentication token not found'));
        return;
      }

      const userData = {
        ...formValues,
        role: roleType === 'Custom Role' ? customRole : role,
        roleType,
        registeredModules: formatModules(), // <-- Use the new format here
        zone: selectedZone,
        branch: selectedBranch,
        password: generatePassword ? generatedPassword : undefined
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/create`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        onUserCreated(response.data);
        resetDrawer();
        onClose();
      }
    } catch (error) {
      handleError(new Error('Failed to create user. Please try again.'));
    }
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false); // Close the notification
  };

  return (
    <ErrorBoundary>
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={open}
        onClose={() => {
          resetDrawer();
          onClose();
        }}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : { xs: '100%', sm: '600px' },
            height: isMobile ? '90vh' : '100%',
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
          },
        }}
      >
        <Box sx={{
          display: 'flex',
          height: '100%',
          paddingTop: isMobile ? '0px' : '64px',
          overflowY: 'hidden',
          flexDirection: isMobile ? 'column' : 'row',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#f15a22',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
          }
        }}>
          {!isMobile && (
            <Box
              sx={{
                width: '20%',
                backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                paddingTop: 3,
                paddingLeft: 2,
              }}
            >
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        style: { color: activeStep >= index ? '#f15a22' : isDarkMode ? '#555' : '#d1d1d1' },
                      }}
                    >
                      <Typography sx={{ color: isDarkMode ? '#fff' : '#000' }}>{label}</Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
          
          {isMobile && (
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: isDarkMode ? '#333' : '#f5f5f5'
            }}>
              <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                Add New User - Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>
          )}
          
          <Box
            sx={{
              width: isMobile ? '100%' : '80%',
              padding: isMobile ? 2 : 4,
              height: '100%',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#f15a22',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
              }
            }}
          >
            {activeStep === 0 ? (
              <>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                  Set up the basics
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={isMobile ? 2 : 3}>
                  <Grid item xs={isMobile ? 12 : 6}>
                    <TextField
                      label="First Name"
                      fullWidth
                      name="firstName"
                      variant="outlined"
                      value={formValues.firstName}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#d1d1d1',
                          },
                          '&:hover fieldset': {
                            borderColor: '#f15a22',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#f15a22',
                          },
                        },
                        '& label.Mui-focused': {
                          color: '#f15a22',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={isMobile ? 12 : 6}>
                    <TextField
                      label="Last Name"
                      fullWidth
                      name="lastName"
                      variant="outlined"
                      value={formValues.lastName}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#d1d1d1',
                          },
                          '&:hover fieldset': {
                            borderColor: '#f15a22',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#f15a22',
                          },
                        },
                        '& label.Mui-focused': {
                          color: '#f15a22',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Display Name"
                      fullWidth
                      name="displayName"
                      variant="outlined"
                      value={formValues.displayName}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      error={!!formErrors.displayName}
                      helperText={formErrors.displayName}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#d1d1d1',
                          },
                          '&:hover fieldset': {
                            borderColor: '#f15a22',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#f15a22',
                          },
                        },
                        '& label.Mui-focused': {
                          color: '#f15a22',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        label="Username"
                        fullWidth
                        name="username"
                        variant="outlined"
                        value={formValues.username}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        error={!!formErrors.username}
                        helperText={formErrors.username}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#d1d1d1',
                            },
                            '&:hover fieldset': {
                              borderColor: '#f15a22',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#f15a22',
                            },
                          },
                          '& label.Mui-focused': {
                            color: '#f15a22',
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={generatePassword}
                          onChange={handlePasswordGenerationChange}
                          sx={{ color: '#f15a22', '&.Mui-checked': { color: '#f15a22' } }}
                        />
                      }
                      label="Generate New Password"
                    />
                    {formErrors.generatePassword && (
                      <Typography sx={{ color: '#f44336', mt: 1, fontSize: '0.85rem' }}>
                        {formErrors.generatePassword}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </>
            ) : activeStep === 1 ? (
              <>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                  Manage Roles
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                  <FormLabel component="legend">Role Type</FormLabel>
                  <RadioGroup value={roleType} onChange={handleRoleTypeChange}>
                    <FormControlLabel value="Headquarter Roles" control={<Radio />} label="Headquarter Roles" />
                    <FormControlLabel value="Branch Roles" control={<Radio />} label="Branch Roles" />
                    <FormControlLabel value="Custom Role" control={<Radio />} label="Custom Role" />
                  </RadioGroup>
                </FormControl>

                {roleType === 'Headquarter Roles' && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Select
                      value={role}
                      onChange={handleRoleChange}
                      displayEmpty
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f15a22',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f15a22',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f15a22',
                        },
                        '& .MuiSelect-icon': {
                          color: '#f15a22',
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select Headquarters Role
                      </MenuItem>
                      {headquarterRoles.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.role && (
                      <Typography sx={{ color: '#f44336', mt: 1, fontSize: '0.85rem' }}>
                        {formErrors.role}
                      </Typography>
                    )}
                  </FormControl>
                )}

                {roleType === 'Branch Roles' && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Select
                      value={role}
                      onChange={handleRoleChange}
                      displayEmpty
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f15a22',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f15a22',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f15a22',
                        },
                        '& .MuiSelect-icon': {
                          color: '#f15a22',
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select Branch Role
                      </MenuItem>
                      {branchRoles.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.role && (
                      <Typography sx={{ color: '#f44336', mt: 1, fontSize: '0.85rem' }}>
                        {formErrors.role}
                      </Typography>
                    )}
                  </FormControl>
                )}

                {roleType === 'Custom Role' && (
                  <>
                    <TextField
                      label="Custom Role"
                      fullWidth
                      value={customRole}
                      onChange={handleCustomRoleChange}
                      size={isMobile ? "small" : "medium"}
                      sx={{ mb: 3 }}
                    />
                    {formErrors.role && (
                      <Typography sx={{ color: '#f44336', mt: 1, fontSize: '0.85rem' }}>
                        {formErrors.role}
                      </Typography>
                    )}
                  </>
                )}

                {/* New Dropdowns for Zone and Branch */}
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <Select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    displayEmpty
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f15a22',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f15a22',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f15a22',
                      },
                      '& .MuiSelect-icon': {
                        color: '#f15a22',
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select Zone
                    </MenuItem>
                    {zones.map((zone) => (
                      <MenuItem key={zone._id} value={zone.zoneName}>
                        {zone.zoneName}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.zone && (
                    <Typography sx={{ color: '#f44336', mt: 1, fontSize: '0.85rem' }}>
                      {formErrors.zone}
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth sx={{ mt: 3 }}>
                  <Select
                    value={selectedBranch || ""}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    displayEmpty
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f15a22',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f15a22',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f15a22',
                      },
                      '& .MuiSelect-icon': {
                        color: '#f15a22',
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      {branches.length === 0 ? "No Zone Selected" : "Select Branch"}
                    </MenuItem>
                    {branches.length > 0 &&
                      branches.map((branch, index) => (
                        <MenuItem key={index} value={branch}>
                          {branch}
                        </MenuItem>
                      ))}
                  </Select>
                  {formErrors.branch && (
                    <Typography sx={{ color: '#f44336', mt: 1, fontSize: '0.85rem' }}>
                      {formErrors.branch}
                    </Typography>
                  )}
                </FormControl>
              </>
            ) : activeStep === 2 ? (
              <>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                  Manage Modules
                </Typography>
                <Divider sx={{ mb: 3 }} />
                {renderModuleSelection()}
              </>
            ) : activeStep === 3 ? (
              <>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                  Review Details
                </Typography>
                <Divider sx={{ mb: 3 }} />
                {isMobile ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2"><strong>Name:</strong></Typography>
                      <Typography variant="body2">{formValues.firstName} {formValues.lastName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2"><strong>Display Name:</strong></Typography>
                      <Typography variant="body2">{formValues.displayName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2"><strong>Username:</strong></Typography>
                      <Typography variant="body2">{formValues.username}@cheezious.com</Typography>
                    </Box>
                    {generatePassword && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2"><strong>Generated Password:</strong></Typography>
                        <Typography variant="body2">{generatedPassword}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2"><strong>Role:</strong></Typography>
                      <Typography variant="body2">{role}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2"><strong>Zone:</strong></Typography>
                      <Typography variant="body2">{selectedZone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2"><strong>Branch:</strong></Typography>
                      <Typography variant="body2">{selectedBranch}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2"><strong>Selected Modules:</strong></Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>{renderModules()}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell variant="head"><strong>Name:</strong></TableCell>
                        <TableCell>{formValues.firstName} {formValues.lastName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head"><strong>Display Name:</strong></TableCell>
                        <TableCell>{formValues.displayName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head"><strong>Username:</strong></TableCell>
                        <TableCell>{formValues.username}@cheezious.com</TableCell>
                      </TableRow>
                      {generatePassword && (
                        <TableRow>
                          <TableCell variant="head"><strong>Generated Password:</strong></TableCell>
                          <TableCell>{generatedPassword}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell variant="head"><strong>Role:</strong></TableCell>
                        <TableCell>{role}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head"><strong>Zone:</strong></TableCell>
                        <TableCell>{selectedZone}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head"><strong>Branch:</strong></TableCell>
                        <TableCell>{selectedBranch}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head"><strong>Selected Modules:</strong></TableCell>
                        <TableCell>{renderModules()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </>
            ) : null}

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 4,
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 2 : 0
            }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ 
                  mr: isMobile ? 0 : 1, 
                  color: '#f15a22',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleFinish}
                  sx={{ 
                    backgroundColor: '#f15a22', 
                    '&:hover': { backgroundColor: '#d3541e' },
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Finish
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ 
                    backgroundColor: '#f15a22', 
                    '&:hover': { backgroundColor: '#d3541e' },
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Next
                </Button>
              )}
            </Box>

            {/* Add the Snackbar component */}
            <Snackbar
              open={notificationOpen}
              autoHideDuration={3000}
              onClose={handleNotificationClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert onClose={handleNotificationClose} severity="success" sx={{ width: '100%' }}>
                User Has Been Created Successfully!
              </Alert>
            </Snackbar>
          </Box>
        </Box>
        <ErrorNotification error={error} onClose={clearError} />
      </Drawer>
    </ErrorBoundary>
  );
};

export default AddUserDrawer;