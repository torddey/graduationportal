import { useState } from 'react';
import { Download } from 'lucide-react';
import { registrationService } from '../../services/registrationService';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface DownloadButtonProps {
  studentId: string;
  variant?: 'primary' | 'outline';
}

const DownloadButton = ({ studentId, variant = 'primary' }: DownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const toastId = toast.loading('Preparing PDF download...');
    
    try {
      await registrationService.exportConfirmationPDF(studentId);
      toast.success('Download Successful!', { id: toastId });
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Download failed. Please try again.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      icon={<Download size={18} />}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? 'Downloading PDF...' : 'Download Confirmation'}
    </Button>
  );
};

export default DownloadButton; 