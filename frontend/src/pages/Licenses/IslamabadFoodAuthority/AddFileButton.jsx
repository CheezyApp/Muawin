import React, { useRef, useCallback } from 'react';
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

const AddFileButton = ({ onFileSelect, multiple = false, disabled = false }) => {
  // Create a ref to the hidden file input element
  const fileInputRef = useRef(null);

  // Handle button click to trigger file input
  const handleAddFileClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current.click(); // Trigger the hidden file input
    }
  }, [disabled]);

  // Handle file selection with support for multiple files
  const handleFileChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length > 0 && onFileSelect) {
      if (multiple) {
        // Pass array of files for multiple selection
        onFileSelect(selectedFiles);
      } else {
        // Pass single file for backward compatibility
        onFileSelect(selectedFiles[0]);
      }
    }
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  }, [onFileSelect, multiple]);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        multiple={multiple}
        style={{ display: 'none' }} // Hidden file input
        onChange={handleFileChange} // When files are selected, trigger the onChange handler
        accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp" // Accept common file types
      />

      <CustomButton
        variant="contained"
        onClick={handleAddFileClick} // Open file picker on button click
        disabled={disabled}
        sx={{
          width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto width on larger screens
          padding: { xs: '10px 0', sm: '10px 20px' }, // Adjust padding for small screens
          fontSize: { xs: '14px', sm: '16px' }, // Adjust font size for small screens
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {multiple ? 'Add Files' : 'Add File'}
      </CustomButton>
    </>
  );
};

export default React.memo(AddFileButton);
