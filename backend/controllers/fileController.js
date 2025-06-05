const File = require('../models/File');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/png', //png
      'image/jpeg', //jpeg
      'image/webp', //webp
      'application/pdf', //pdf
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv', // .csv
      'application/txt' //txt
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type! Only PNG, JPEG, WebP, PDF, DOCX, XLS, XLSX, and CSV files are allowed.'));
    }
  },
});

// Utility function to get the next file number in sequence for a specific category
const getNextFileNumber = async (category, zone, branch) => {
  const fileCount = await File.countDocuments({ category, zone, branch }); // Count only files within the same category, zone, and branch
  const nextNumber = (fileCount + 1).toString().padStart(5, '0'); // Start from '00001'
  return nextNumber;
};

// Function to apply server-side compression based on file type
const applyServerCompression = async (file) => {
  console.log(`Attempting server-side compression for file type: ${file.mimetype}`);
  
  let compressedBuffer = file.buffer; // Default to original buffer
  let compressionApplied = false;

  try {
    // Example: Compression for PDF files (requires a PDF compression library)
    if (file.mimetype === 'application/pdf') {
      console.log('Starting PDF compression...');
      // --- REPLACE THIS SECTION WITH ACTUAL PDF COMPRESSION LIBRARY CODE ---
      // You will need to install a PDF compression library (e.g., using npm) 
      // and use its API to compress the file.buffer.
      // Example using a hypothetical library 'pdf-optimizer':
      // const PDFOptimizer = require('pdf-optimizer'); // You need to import this
      // compressedBuffer = await PDFOptimizer.optimize(file.buffer, { quality: 'low' }); // Adjust options as per library docs
      // compressionApplied = true;
      // console.log('PDF compression attempted.');
      console.log('PDF compression not fully implemented. Uploading original.'); // Keep this log until implemented
      // ---------------------------------------------------------------------
    }

    // Example: Compression for DOCX files (more complex, likely needs external tools or specific libraries)
    else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('DOCX compression is complex and typically requires specific libraries or external tools.');
      console.log('DOCX compression not implemented. Uploading original.');
    }
    
    // Add more else if blocks for other document types you want to compress

    if (!compressionApplied) {
      console.log(`No specific server-side compression logic applied for ${file.mimetype}. Uploading original.`);
    }
    
  } catch (error) {
    console.error(`Error during server-side compression for ${file.mimetype}:`, error);
    console.log(`Compression failed for ${file.mimetype}. Uploading original file.`);
    compressedBuffer = file.buffer; // Fallback to original buffer on error
    compressionApplied = false;
  }

  return { buffer: compressedBuffer, compressionApplied };
};

// 1. Get all files for a specific category (READ)
const getFilesByCategory = async (req, res) => {
  try {
    const { category, zone, branch } = req.params;
    const files = await File.find({ category, zone, branch });

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No files found for this category, zone, and branch.' });
    }

    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Upload a new file to GridFS under a specific category (CREATE)
const uploadFile = async (req, res) => {
  try {
    const { category, zone, branch } = req.params;
    const originalFilename = req.file.originalname.trim();

    console.log('Original Filename:', originalFilename);

    // Apply server-side compression based on file type
    const { buffer: processedBuffer, compressionApplied } = await applyServerCompression(req.file);

    // Create readable stream from the processed buffer
    const readableStream = new Readable({
      read() {
        this.push(processedBuffer);
        this.push(null);
      }
    });

    // Get file number more efficiently
    const fileNumber = await getNextFileNumber(category, zone, branch);

    // Upload the file to GridFS
    const uploadStream = gridfsBucket.openUploadStream(originalFilename, {
      contentType: req.file.mimetype, // Keep original mimetype or update if compression changes it
      metadata: { category, zone, branch, fileNumber, compressionApplied }, // Store if compression was applied
    });

    // Use Promise-based pipeline
    await new Promise((resolve, reject) => {
      readableStream.pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    console.log(`File uploaded to GridFS: ${originalFilename}, ID: ${uploadStream.id}`);
    if (compressionApplied) {
        console.log(`Server-side compression was applied.`);
    }

    // Metadata save without blocking response
    const file = new File({
      filename: originalFilename,
      filetype: req.file.mimetype,
      lastModified: new Date().toISOString(),
      fileId: uploadStream.id,
      category,
      zone,
      branch,
      fileNumber,
      compressionApplied: compressionApplied // Save compression status in metadata
    });

    file.save().catch(error => console.error('Error saving file metadata:', error));

    res.status(201).json({ message: 'File uploaded successfully', fileId: uploadStream.id });

  } catch (error) {
    console.error('Error during file upload (including potential compression error):', error);
    res.status(500).json({ message: 'Server error during file processing' });
  }
};

// 3. Download a file from GridFS
const downloadFile = async (req, res) => {
  try {
    const decodedFilename = decodeURIComponent(req.params.filename); // Decode the filename
    const file = await File.findOne({ filename: decodedFilename });

    if (!file) {
      console.error(`File not found: ${decodedFilename}`);
      return res.status(404).json({ message: 'File not found' });
    }

    const downloadStream = gridfsBucket.openDownloadStreamByName(file.filename);

    res.set('Content-Type', file.filetype);
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.set('Cache-Control', 'no-store'); // Prevent browser caching issues

    downloadStream.pipe(res)
      .on('error', (err) => {
        console.error('Error streaming file:', err);
        res.status(500).json({ message: 'Error retrieving file' });
      });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. Delete a file and remove its metadata
const deleteFile = async (req, res) => {
  try {
    const { category, zone, branch, filename } = req.params;
    const trimmedFilename = decodeURIComponent(filename.trim());

    console.log('DELETE Request Params:', { category, zone, branch, filename: trimmedFilename });

    // Find the file metadata in MongoDB (`files` collection)
    const fileDoc = await File.findOne({ filename: trimmedFilename, category, zone, branch });

    if (!fileDoc) {
      console.error('File not found in metadata:', trimmedFilename);
      return res.status(404).json({ message: 'File not found' });
    }

    console.log('File found in metadata:', fileDoc);

    // Remove the file metadata from MongoDB (`files` collection) first
    const metadataDeleteResult = await File.deleteOne({ _id: fileDoc._id });
    if (metadataDeleteResult.deletedCount === 0) {
      console.error('Failed to delete file metadata:', fileDoc._id);
      return res.status(500).json({ message: 'Failed to delete file metadata' });
    }

    console.log('File metadata deleted from MongoDB (`files` collection):', fileDoc._id);

    // Now delete the file from GridFS (`uploads.files` and `uploads.chunks`)
    gridfsBucket.delete(fileDoc.fileId, (err) => {
      if (err) {
        console.error('Error deleting from GridFS:', err);
        return res.status(500).json({ message: 'Failed to delete from GridFS' });
      }

      console.log('File deleted from GridFS:', fileDoc.fileId);
      res.json({ message: 'File deleted successfully' });
    });
  } catch (error) {
    console.error('Error during file deletion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  upload,
  getFilesByCategory,
  uploadFile,
  downloadFile,
  deleteFile,
}; 