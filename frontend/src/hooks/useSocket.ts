import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your backend URL

export const useSocket = (onCsvUploadComplete: (data: any) => void) => {
  useEffect(() => {
    socket.on('csv-upload-complete', (data) => {
      console.log('CSV upload complete:', data);
      if (onCsvUploadComplete) {
        onCsvUploadComplete(data);
      }
    });

    return () => {
      socket.off('csv-upload-complete');
    };
  }, [onCsvUploadComplete]);
};