const express = require('express');
const router = express.Router();

// Example: Static list of modules
const modules = [
  { _id: '1', name: 'Licenses_Trade Licenses' },
  { _id: '2', name: 'Licenses_Staff Medicals' },
  { _id: '3', name: 'Licenses_Tourism Licenses' },
  { _id: '4', name: 'Licenses_Labour Licenses' },
  { _id: '5', name: 'Approvals_Outer Spaces' },
  { _id: '6', name: 'Vehicles_Maintenance' },
  { _id: '7', name: 'Vehicles_Token Taxes' },
  { _id: '8', name: 'Vehicles_Route Permits' },
  { _id: '9', name: 'Health Safety Environment_Monthly Inspection' },
  { _id: '10', name: 'Health Safety Environment_Quarterly Audit' },
  { _id: '11', name: 'Health Safety Environment_Expiry of Cylinders' },
  { _id: '12', name: 'Health Safety Environment_Incidents' },
  { _id: '13', name: 'Health Safety Environment_Training Status' },
  { _id: '14', name: 'Taxation_Profession Tax' },
  { _id: '15', name: 'Taxation_Marketing / Bill Boards Taxes' },
  { _id: '16', name: 'Certificates_Electric Fitness Test' },
  { _id: '17', name: 'Security_Guard Training' },
  { _id: '18', name: 'User Requests' },
  { _id: '19', name: 'Rental Agreements' },
  { _id: '20', name: 'Admin Policies and SOPs' },
  { _id: '21', name: 'User Management_' }
];

router.get('/', (req, res) => {
  res.json(modules);
});

module.exports = router; 