import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // console.error('Error caught by boundary:', error, errorInfo);


    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ margin: 2 }}>
          <Alert severity="error">
            Something went wrong. Please try refreshing the page.
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ marginTop: 1, fontSize: '0.8em' }}>
                Error: {this.state.error?.toString()}
              </Box>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 