import React from 'react';
import TextField from '@mui/material/TextField';

const SearchBar = ({ searchQuery, setSearchQuery, style }) => {
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <TextField 
      label="Search files..." 
      variant="outlined" 
      fullWidth 
      value={searchQuery} 
      onChange={handleSearchChange}
      sx={style} // Apply the passed styles (like width, height) here using sx
    />
  );
};

export default SearchBar;
