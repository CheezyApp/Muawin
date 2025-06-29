import React, { useRef, useCallback } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Styled Button component to apply custom styles
const CustomButton = styled(Button)({
  backgroundColor: '#f15a22',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#d14e1d',
  },
  '&:disabled': {
    backgroundColor: '#ccc',
    color: '#666',
  },
});

const AddFileButton = ({ 
  onFileSelect, 
  multiple = false, 
  disabled = false,
  buttonText = null,
  accept = ".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp",
  sx = {}
}) => {
  // Create a ref to the hidden file input element
  const fileInputRef = useRef(null);

  // Handle button click to trigger file input
  const handleAddFileClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current.click();
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

  // Determine button text
  const displayText = buttonText || (multiple ? 'Add Files' : 'Add File');

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={accept}
      />

      <CustomButton
        variant="contained"
        onClick={handleAddFileClick}
        disabled={disabled}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          padding: { xs: '10px 0', sm: '10px 20px' },
          fontSize: { xs: '14px', sm: '16px' },
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...sx
        }}
      >
        {displayText}
      </CustomButton>
    </>
  );
};

export default React.memo(AddFileButton); 