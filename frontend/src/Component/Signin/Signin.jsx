import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { useAuth } from "../../contexts/AuthContext";

// Styled components
const BackgroundWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  minHeight: "100vh", // Ensure it takes full viewport height
  width: "100%",
  overflow: "auto", // Enable scrolling
  backgroundColor: "#f5f5f5", // Fallback background color
}));

const BackgroundImage = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: "100%",
  backgroundImage: `url(${process.env.PUBLIC_URL}/images/background.jpg)`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  zIndex: 1,
  backgroundAttachment: "fixed",
  [theme.breakpoints.down("sm")]: {
    backgroundAttachment: "scroll", // Change attachment for better performance on mobile
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
  minHeight: "100vh",
  height: "auto",
  overflowY: "auto",
}));

const CustomPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  width: "100%",
  maxWidth: "600px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: theme.shadows[5],
  backgroundColor: "#ffffff",
  overflow: "hidden",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row", // Side-by-side on medium and larger screens
    maxWidth: "900px",
  },
}));

const LeftContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const RightContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 0),
  },
}));

const ResponsiveImage = styled("img")(({ theme }) => ({
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  objectFit: "cover",
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(1),
  },
}));

const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: "30px",
  width: "100%",
  padding: theme.spacing(1.5),
  backgroundColor: "#f15a22",
  color: "#ffffff",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#d14e1d",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: "100%",
  "& label.Mui-focused": {
    color: "#f15a22",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#f15a22",
    },
    "&:hover fieldset": {
      borderColor: "#f15a22",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#f15a22",
    },
    height: "50px",
  },
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(2),
  },
}));

const Rectangle = styled(Box)(({ theme }) => ({
  width: "80px",
  height: "8px",
  backgroundColor: "#f15a22",
  borderRadius: "5px",
  margin: theme.spacing(1.25, 0, 2.5),
  [theme.breakpoints.down("sm")]: {
    width: "60px",
    height: "6px",
    margin: theme.spacing(1, 0, 2),
  },
}));

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("");
        login(data); // Use the login function from AuthContext
        navigate("/", { replace: true }); // Navigate to home page
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDownPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && email && password) {
      handleLogin(e);
    }
  };

  return (
    <BackgroundWrapper>
      <BackgroundImage />
      <ContentContainer>
        <CustomPaper elevation={3}>
          <RightContainer>
            <ResponsiveImage
              src={`${process.env.PUBLIC_URL}/images/muawin_signin.jpg`}
              alt="Cheezious"
            />
          </RightContainer>
          <LeftContainer>
            <Box
              component="img"
              src={`${process.env.PUBLIC_URL}/images/muawin_logo_orange.png`}
              alt="Logo"
              sx={{
                width: { xs: "200px", sm: "250px", md: "300px" },
                marginBottom: theme => theme.spacing(1),
                maxWidth: "100%",
              }}
            />
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              sx={{
                fontFamily: "Cocon",
                textAlign: "center",
                fontWeight: 100,
                color: "#f15a22",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              SIGN IN
            </Typography>
            <Rectangle />
            {error && (
              <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
            <StyledTextField
              label="Email"
              variant="outlined"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <StyledTextField
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleMouseDownPassword} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <CustomButton
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                  Logging in...
                </>
              ) : (
                "LOGIN"
              )}
            </CustomButton>
          </LeftContainer>
        </CustomPaper>
      </ContentContainer>
    </BackgroundWrapper>
  );
}

export default SignInPage;
