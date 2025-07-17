import { useAuth } from '../contexts/AuthContext';

export const useFileDownload = () => {
  const { isAuthenticated } = useAuth();

  const downloadFile = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');


        alert('Please log in to download files.');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/files/download/${encodeURIComponent(filename)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          alert('Authentication required. Please log in again.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // console.error('Error downloading file:', error);


      alert('Failed to download file. Please try again.');
    }
  };

  return { downloadFile, isAuthenticated };
}; 