import React, { useRef } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Styled Button component to apply custom styles
const CustomButton = styled(Button)({
  backgroundColor: '#f15a22',    // Custom color for the button
  color: '#fff',                 // White text for better contrast
  padding: '10px 20px',          // Padding inside the button
  borderRadius: '8px',           // Rounded corners
  '&:hover': {
    backgroundColor: '#d14e1d',  // Slightly darker color on hover
  },
});

const AddFileButton = ({ onFileSelect }) => {
  // Create a ref to the hidden file input element
  const fileInputRef = useRef(null);

  // Handle button click to trigger file input
  const handleAddFileClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file); // Pass the selected file to the parent component
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }} // Hidden file input
        onChange={handleFileChange} // When a file is selected, trigger the onChange handler
      />

      <CustomButton
        variant="contained"
        onClick={handleAddFileClick} // Open file picker on button click
        sx={{
          width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto width on larger screens
          padding: { xs: '10px 0', sm: '10px 20px' }, // Adjust padding for small screens
          fontSize: { xs: '14px', sm: '16px' }, // Adjust font size for small screens
        }}
      >
        Add File
      </CustomButton>
    </>
  );
};

export default AddFileButton;
