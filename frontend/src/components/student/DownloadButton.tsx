import { useState } from "react";
import { Download } from "lucide-react";
import { registrationService } from "../../services/registrationService";
import Button from "../ui/Button";
import toast from "react-hot-toast";

interface DownloadButtonProps {
  studentId: string;
  variant?: "primary" | "outline";
}

const DownloadButton = ({
  studentId,
  variant = "primary",
}: DownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!studentId) {
      toast.error("Student ID is required to download confirmation");
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading("Preparing PDF download...");

    try {
      await registrationService.exportConfirmationPDF(studentId);
      toast.success("Download Successful!", { id: toastId });
    } catch (error) {
      console.error("Download failed:", error);
      let errorMessage = "Download failed. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Student not found")) {
          errorMessage = "Student not found. Please check your student ID.";
        } else if (error.message.includes("has not registered")) {
          errorMessage =
            "You must complete your graduation registration first.";
        } else if (error.message.includes("Invalid response format")) {
          errorMessage = "Unable to generate PDF. Please contact support.";
        } else {
          errorMessage = error.message;
        }
      }

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
      disabled={isDownloading || !studentId}
    >
      {isDownloading ? "Downloading PDF..." : "Download Confirmation"}
    </Button>
  );
};

export default DownloadButton;
