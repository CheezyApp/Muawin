import { useState, useCallback } from 'react';

export const useBatchOperations = () => {
  const [batchProgress, setBatchProgress] = useState({});
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Batch upload files
  const batchUpload = useCallback(async (files, uploadFunction, onProgress, onComplete) => {
    if (!files || files.length === 0) return;

    setIsBatchProcessing(true);
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${file.name}-${Date.now()}-${i}`;
      
      try {
        // Update progress
        setBatchProgress(prev => ({
          ...prev,
          [fileId]: { status: 'uploading', progress: 0, file: file.name }
        }));

        // Upload file with progress tracking
        const result = await uploadFunction(file, (progress) => {
          setBatchProgress(prev => ({
            ...prev,
            [fileId]: { status: 'uploading', progress, file: file.name }
          }));
          if (onProgress) {
            onProgress(fileId, progress, file.name);
          }
        });

        // Mark as completed
        setBatchProgress(prev => ({
          ...prev,
          [fileId]: { status: 'completed', progress: 100, file: file.name }
        }));

        results.push({ file: file.name, result, success: true });
      } catch (error) {
        // Mark as failed
        setBatchProgress(prev => ({
          ...prev,
          [fileId]: { status: 'failed', progress: 0, file: file.name, error: error.message }
        }));

        errors.push({ file: file.name, error: error.message, success: false });
      }
    }

    setIsBatchProcessing(false);
    if (onComplete) {
      onComplete(results, errors);
    }
    
    // Clear progress after a delay
    setTimeout(() => {
      setBatchProgress({});
    }, 3000);

    return { results, errors };
  }, []);

  // Batch delete files
  const batchDelete = useCallback(async (filenames, deleteFunction, onProgress, onComplete) => {
    if (!filenames || filenames.length === 0) return;

    setIsBatchProcessing(true);
    const results = [];
    const errors = [];

    for (let i = 0; i < filenames.length; i++) {
      const filename = filenames[i];
      const fileId = `${filename}-${Date.now()}-${i}`;
      
      try {
        // Update progress
        setBatchProgress(prev => ({
          ...prev,
          [fileId]: { status: 'deleting', progress: 0, file: filename }
        }));

        // Delete file
        await deleteFunction(filename);

        // Mark as completed
        setBatchProgress(prev => ({
          ...prev,
          [fileId]: { status: 'completed', progress: 100, file: filename }
        }));

        results.push({ file: filename, success: true });
      } catch (error) {
        // Mark as failed
        setBatchProgress(prev => ({
          ...prev,
          [fileId]: { status: 'failed', progress: 0, file: filename, error: error.message }
        }));

        errors.push({ file: filename, error: error.message, success: false });
      }
    }

    setIsBatchProcessing(false);
    if (onComplete) {
      onComplete(results, errors);
    }
    
    // Clear progress after a delay
    setTimeout(() => {
      setBatchProgress({});
    }, 3000);

    return { results, errors };
  }, []);

  // Get overall progress
  const getOverallProgress = useCallback(() => {
    const entries = Object.values(batchProgress);
    if (entries.length === 0) return 0;

    const completed = entries.filter(entry => entry.status === 'completed').length;
    const total = entries.length;
    
    return Math.round((completed / total) * 100);
  }, [batchProgress]);

  // Get status summary
  const getStatusSummary = useCallback(() => {
    const entries = Object.values(batchProgress);
    const completed = entries.filter(entry => entry.status === 'completed').length;
    const failed = entries.filter(entry => entry.status === 'failed').length;
    const uploading = entries.filter(entry => entry.status === 'uploading').length;
    const deleting = entries.filter(entry => entry.status === 'deleting').length;

    return { completed, failed, uploading, deleting, total: entries.length };
  }, [batchProgress]);

  return {
    batchUpload,
    batchDelete,
    batchProgress,
    isBatchProcessing,
    getOverallProgress,
    getStatusSummary,
  };
}; 