// src/App.js

import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Component Imports
import SignInPage from './Component/Signin/Signin';
import AppBarComponent from './Component/AppBarComponent/AppBarComponent';
import DrawerComponent from './Component/DrawerComponent/DrawerComponent';
import MainContent from './Component/MainContent/MainContent';
import SessionTimeout from './SessionTimeout';

// Licenses Imports
import Licensepage from './pages/Licenses/Licensepage';
import Cantonment from './pages/Licenses/Cantonment/Cantonment';
import CapitalFoodAuthority from './pages/Licenses/CapitalFoodAuthority/CapitalFoodAuthority';
import HiringTests from './pages/Licenses/HiringTests/HiringTests';
import IslamabadFoodAuthority from './pages/Licenses/IslamabadFoodAuthority/IslamabadFoodAuthority';
import LabourLicenses from './pages/Licenses/LabourLicenses/LabourLicenses';
import Medical from './pages/Licenses/Medical/Medical';
import PunjabFoodAuthority from './pages/Licenses/PunjabFoodAuthority/PunjabFoodAuthority';
import RecurringMedicalTests from './pages/Licenses/RecurringMedicalTests/RecurringMedicalTests';
import TourismLicenses from './pages/Licenses/TourismLicenses/TourismLicenses';
import VaccineRecord from './pages/Licenses/VaccineRecord/VaccineRecord';

// HSE Imports
import Hse from './pages/Hse/Hse';
import ExpiryofCylinders from './pages/Hse/ExpiryofCylinders/ExpiryofCylinders';
import Fatal from './pages/Hse/Fatal/Fatal';
import LostTimeInjury from './pages/Hse/LostTimeInjury/LostTimeInjury';
import MonthlyInspection from './pages/Hse/MonthlyInspection/MonthlyInspection';
import QuarterlyAudit from './pages/Hse/QuarterlyAudit/QuarterlyAudit';
import RestrictedWorkInjury from './pages/Hse/RestrictedWorkInjury/RestrictedWorkInjury';
import FireSafety from './pages/Hse/FireSafety/FireSafety';
import FireAid from './pages/Hse/FireAid/FireAid';
import Emergency from './pages/Hse/Emergency/Emergency';

// Taxation Imports
import Taxationpage from './pages/Taxation/Taxationpage';
import MarketingBillBoardsTaxes from './pages/Taxation/MarketingBillBoardsTaxes/MarketingBillBoardsTaxes';
import ProfessionTax from './pages/Taxation/ProfessionTax/ProfessionTax';

// Certificates Imports
import ElectricFitnessTest from './pages/Certificate/ElectricFitnessTest/ElectricFitnessTest';
import Certificatepage from './pages/Certificate/Certificatepage';

// Security Imports
import GuardTraining from './pages/Security/GuardTraining/GuardTraining';

// Rental Agreements Imports
import RentalAgreements from './pages/RentalAgreements/RentalAgreements';

// User Requests Imports
import UserRequests from './pages/UserRequests/UserRequests';

// Admin Policies and SOP's Imports
import AdminPolicies from './pages/AdminPolicies/AdminPolicies';

// Approval Page Imports
import Approvalpage from './pages/Approval/Approvalpage';
import DineIn from './pages/Approval/DineIn/DineIn';
import Generators from './pages/Approval/Generators/Generators';
import Facilities from './pages/Approval/Facilities/Facilities';
import ModulesGrid from './pages/Approval/Modulesgrid/Modulesgrid'; // if needed

// Vehicles Page Imports
import Vehiclepage from './pages/Vehicles/Vehiclepage';
import RoutineMaintainence from './pages/Vehicles/RoutineMaintainence/RoutineMaintainence';
import MajorParts from './pages/Vehicles/MajorParts/MajorParts';
import MajorRepairs from './pages/Vehicles/MajorRepairs/MajorRepairs';
import AnnualTokenTax from './pages/Vehicles/AnnualTokenTax/AnnualTokenTax';
import MTag from './pages/Vehicles/MTag/MTag';
import CanttPasses from './pages/Vehicles/CanttPasses/CanttPasses';
import Islamabad from './pages/Vehicles/Islamabad/Islamabad';
import Peshawar from './pages/Vehicles/Peshawar/Peshawar';
import Rawalpindi from './pages/Vehicles/Rawalpindi/Rawalpindi';
import Wah from './pages/Vehicles/Wah/Wah';

// User Management Imports
import ActiveUsers from './pages/UserManagement/ActiveUsers';

function App() {
  // ------------ Authentication ------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // user data

  // ------------ Drawer States ------------
  // mobileOpen => for small screens (temporary drawer)
  const [mobileOpen, setMobileOpen] = useState(false);
  // desktopOpen => for large screens (mini vs. full permanent drawer)
  const [desktopOpen, setDesktopOpen] = useState(false);

  // ------------ Dark Mode ------------
  const [darkMode, setDarkMode] = useState(false);

  // ------------ Search ------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // This array is for search logic (you can adapt as needed)
  const items = [
    { name: 'Licenses', path: '/Licenses/Licensepage', category: 'Modules > Licenses' },
    // sub-modules
    { name: 'Trade Licenses', path: '/Licenses/Licensepage', category: 'Modules > Licenses > Trade Licenses' },
    { name: 'Staff Medicals', path: '/UserManagement', category: 'Modules > Licenses > Staff Medicals' },
    { name: 'Toursim Licenses', path: '/UserManagement', category: 'Modules > Licenses > Tourism Licenses' },
    { name: 'Labour Licenses', path: '/UserManagement', category: 'Modules > Licenses > Labour Licenses' },

    { name: 'Approvals', path: '/Approval/Approvalpage', category: 'Modules > Approvals' },
    // sub-modules
    { name: 'Outer Spaces', path: '/Approval/Approvalpage', category: 'Modules > Approvals > Outer Spaces' },

    { name: 'Vehicles', path: '/Vehicles/Vehiclepage', category: 'Modules > Vehicles' },
    // sub-modules
    { name: 'Maintenance', path: '/Vehicles/Vehiclepage', category: 'Modules > Vehicles > Maintenance' },
    { name: 'Route Permits', path: '/Vehicles/Vehiclepage', category: 'Modules > Vehicles > Route Permits' },
    { name: 'Token Taxes', path: '/Vehicles/Vehiclepage', category: 'Modules > Vehicles > Token Taxes' },

    { name: 'User Requests', path: '/UserRequests', category: 'Modules > User Requests' },

    { name: 'Health Safety Environment', path: '/Hse/Hse', category: 'Modules > Health Safety Environment' },
    // sub-modules
    { name: 'Monthly Inspection', path: '/Hse/Hse', category: 'Modules > Health Safety Environment > Monthly Inspection' },
    { name: 'Quarterly Audit', path: '/Hse/Hse', category: 'Modules > Health Safety Environment > Quarterly Audit' },
    { name: 'Training Status', path: '/Hse/Hse', category: 'Modules > Health Safety Environment > Training Status' },
    { name: 'Incidents', path: '/Hse/Hse', category: 'Modules > Health Safety Environment > Incidents' },

    { name: 'Taxation', path: '/Taxation/Taxationpage', category: 'Modules > Taxation' },
    // sub-modules
    { name: 'Marketing / BillBoards Taxes', path: '/Taxation/Taxationpage', category: 'Modules > Taxation > Marketing / BillBoards Taxes' },
    { name: 'Profession Taxes', path: '/Taxation/Taxationpage', category: 'Modules > Taxation > Profession Taxes' },

    { name: 'Certificates', path: '/Certificate/Certificatepage', category: 'Modules > Certificates' },
    // sub-modules
    { name: 'Electric Fitness Test', path: '/Certificate/Certificatepage', category: 'Modules > Certificates > Electric Fitness Test' },

    { name: 'Security', path: '/Security/GuardTraining', category: 'Modules > Security' },

    { name: 'Admin Policies and SOPs', path: '/AdminPolicies', category: 'Modules > Admin Policies' },

    { name: 'Rental Agreements', path: '/RentalAgreements', category: 'Modules > Rental Agreements' },

    { name: 'User Management', path: '/UserManagement/', category: 'Modules > User Management' },
  ];

  // ------------ Handlers ------------
  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUser(data.user); // Set the user state with the user object from backend data
    localStorage.setItem('token', data.token); // Store the actual token
    localStorage.setItem('user', JSON.stringify(data.user)); // Ensure user data is also in localStorage
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optionally redirect to login
    window.location.href = '/login';
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query && user?.registeredModules) {
      const lowerQuery = query.toLowerCase();
      const results = items.filter((item) => {
        // Add a check to ensure user.registeredModules is an array
        const userModules = user.registeredModules;
        const hasAccess = Array.isArray(userModules) && userModules.some((module) =>
          module.includes(item.name)
        );
        return hasAccess && item.name.toLowerCase().includes(lowerQuery);
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // ------------ Theme ------------
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#FFFFFF',
      },
    },
  });

  // -------------------------------- RENDER --------------------------------
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Session Timeout if user is authenticated */}
        {isAuthenticated && (
          <SessionTimeout timeout={15 * 60 * 1000} onLogout={handleLogout} />
        )}

        {/* Show AppBar if logged in */}
        {isAuthenticated && (
          <AppBarComponent
            darkMode={darkMode}
            handleDarkModeToggle={handleDarkModeToggle}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            searchResults={searchResults}
            user={user}
            // Drawer states to allow toggling from the AppBar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            desktopOpen={desktopOpen}
            setDesktopOpen={setDesktopOpen}
          />
        )}

        {/* Single Drawer for the entire app, shown if logged in */}
        {isAuthenticated && (
          <DrawerComponent
            user={user}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            desktopOpen={desktopOpen}
            setDesktopOpen={setDesktopOpen}
          />
        )}

        <Routes>
          {/* ------------ Public Route (Login) ------------ */}
          <Route path="/login" element={<SignInPage onLogin={handleLogin} />} />

          {/* ------------ Main Content or Redirect ------------ */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <MainContent user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ User Management ------------ */}
          <Route
            path="/UserManagement/"
            element={
              isAuthenticated ? (
                <ActiveUsers />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ Rental Agreements ------------ */}
          <Route
            path="/RentalAgreements/"
            element={
              isAuthenticated ? (
                <RentalAgreements user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ Admin Policies ------------ */}
          <Route
            path="/AdminPolicies/"
            element={
              isAuthenticated ? (
                <AdminPolicies user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ User Requests ------------ */}
          <Route
            path="/UserRequests/"
            element={
              isAuthenticated ? (
                <UserRequests user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ Licenses Routes ------------ */}
          <Route
            path="/Licenses/Licensepage"
            element={
              isAuthenticated ? (
                <Licensepage user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/Cantonment"
            element={
              isAuthenticated ? (
                <Cantonment user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/CapitalFoodAuthority"
            element={
              isAuthenticated ? (
                <CapitalFoodAuthority user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/IslamabadFoodAuthority"
            element={
              isAuthenticated ? (
                <IslamabadFoodAuthority user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/LabourLicenses"
            element={
              isAuthenticated ? (
                <LabourLicenses user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/Medical"
            element={
              isAuthenticated ? (
                <Medical user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/PunjabFoodAuthority"
            element={
              isAuthenticated ? (
                <PunjabFoodAuthority user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/RecurringMedicalTests"
            element={
              isAuthenticated ? (
                <RecurringMedicalTests user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/TourismLicenses"
            element={
              isAuthenticated ? (
                <TourismLicenses user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/VaccineRecord"
            element={
              isAuthenticated ? (
                <VaccineRecord user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Licenses/HiringTests"
            element={
              isAuthenticated ? (
                <HiringTests user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ Approvals Routes ------------ */}
          <Route
            path="/Approval/Approvalpage"
            element={
              isAuthenticated ? (
                <Approvalpage user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Approval/DineIn"
            element={
              isAuthenticated ? (
                <DineIn user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Approval/Generators"
            element={
              isAuthenticated ? (
                <Generators user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Approval/Facilities"
            element={
              isAuthenticated ? (
                <Facilities user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/ModulesGrid"
            element={
              isAuthenticated ? (
                <ModulesGrid />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ Vehicles Routes ------------ */}
          <Route
            path="/Vehicles/Vehiclepage"
            element={
              isAuthenticated ? (
                <Vehiclepage user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/RoutineMaintainence"
            element={
              isAuthenticated ? (
                <RoutineMaintainence user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/MajorParts"
            element={
              isAuthenticated ? (
                <MajorParts user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/MajorRepairs"
            element={
              isAuthenticated ? (
                <MajorRepairs user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/AnnualTokenTax"
            element={
              isAuthenticated ? (
                <AnnualTokenTax user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/MTag"
            element={
              isAuthenticated ? (
                <MTag user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/CanttPasses"
            element={
              isAuthenticated ? (
                <CanttPasses user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/Islamabad"
            element={
              isAuthenticated ? (
                <Islamabad user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/Peshawar"
            element={
              isAuthenticated ? (
                <Peshawar user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/Rawalpindi"
            element={
              isAuthenticated ? (
                <Rawalpindi user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Vehicles/Wah"
            element={
              isAuthenticated ? (
                <Wah user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ HSE Routes ------------ */}
          <Route
            path="/Hse/Hse"
            element={
              isAuthenticated ? (
                <Hse user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Hse/MonthlyInspection"
            element={
              isAuthenticated ? (
                <MonthlyInspection user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Hse/QuarterlyAudit"
            element={
              isAuthenticated ? (
                <QuarterlyAudit user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Hse/ExpiryofCylinders"
            element={
              isAuthenticated ? (
                <ExpiryofCylinders user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Hse/Fatal"
            element={
              isAuthenticated ? (
                <Fatal user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Hse/LostTimeInjury"
            element={
              isAuthenticated ? (
                <LostTimeInjury user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Hse/RestrictedWorkInjury"
            element={
              isAuthenticated ? (
                <RestrictedWorkInjury user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Hse/FireSafety"
            element={
              isAuthenticated ? (
                <FireSafety user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Hse/FireAid"
            element={
              isAuthenticated ? (
                <FireAid user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Hse/Emergency"
            element={
              isAuthenticated ? (
                <Emergency user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ Taxation Routes ------------ */}
          <Route
            path="/Taxation/Taxationpage"
            element={
              isAuthenticated ? (
                <Taxationpage user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Taxation/MarketingBillBoardsTaxes"
            element={
              isAuthenticated ? (
                <MarketingBillBoardsTaxes user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Taxation/ProfessionTax"
            element={
              isAuthenticated ? (
                <ProfessionTax user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ Certificates Routes ------------ */}
          <Route
            path="/Certificate/Certificatepage"
            element={
              isAuthenticated ? (
                <Certificatepage user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Certificate/ElectricFitnessTest"
            element={
              isAuthenticated ? (
                <ElectricFitnessTest user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ------------ Security Routes ------------ */}
          <Route
            path="/Security/GuardTraining"
            element={
              isAuthenticated ? (
                <GuardTraining user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* (Add any other routes not covered above) */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
