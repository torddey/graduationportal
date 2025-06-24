import { useState, useRef, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { useSocket } from "../../contexts/SocketContext";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import ConnectionStatus from "../ui/ConnectionStatus";

type CsvUploadCompleteEvent = {
  success: boolean;
  count: number;
  errors: string[];
  timestamp: string;
  [key: string]: any;
};

const CsvUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<
    "select" | "preview" | "uploading" | "success"
  >("select");
  const [uploadStats, setUploadStats] = useState<CsvUploadCompleteEvent>({
    success: false,
    count: 0,
    errors: [],
    timestamp: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleUploadComplete = (data: CsvUploadCompleteEvent) => {
      console.log("[CsvUploader] Received upload complete event:", data);
      setUploadStats(data);
      if (data.success) {
        console.log(
          "[CsvUploader] Upload successful, transitioning to success state",
        );
        setUploadStep("success");
        toast.success(`Successfully uploaded ${data.count} eligible students`);
      } else {
        console.log("[CsvUploader] Upload failed, returning to preview state");
        setUploadStep("preview");
        const errorMessage = data.errors?.[0] || "Unknown error";
        toast.error(`Upload failed: ${errorMessage}`);
      }
      setIsUploading(false);
    };
    socket.on("csv-upload-complete", handleUploadComplete);
    return () => {
      socket.off("csv-upload-complete", handleUploadComplete);
    };
  }, [socket]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if file is CSV
    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);

    // Read and preview the file
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const parsedData = lines
        .filter((line) => line.trim() !== "")
        .map((line) => line.split(",").map((cell) => cell.trim()));

      // Show first 10 rows for preview
      setPreview(parsedData.slice(0, 10));
      setUploadStep("preview");
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStep("uploading");

    try {
      const result = await adminService.uploadEligibleStudents(file);
      console.log("Upload API response:", result);
      // Note: We don't set success state here as it's handled by the socket event
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during upload";
      toast.error(errorMessage);
      setUploadStep("preview");
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview([]);
    setUploadStep("select");
    setUploadStats({ success: false, count: 0, errors: [], timestamp: "" });
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Upload Eligible Students
        </h2>
        <ConnectionStatus />
      </div>

      {uploadStep === "select" && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            Upload a CSV file containing eligible student records
          </p>
          <div className="flex justify-center">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition"
            >
              Select CSV File
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            The CSV file should include student ID, name, email, and program at
            minimum
          </p>
        </div>
      )}

      {uploadStep === "preview" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-gray-800">Preview: {file?.name}</h3>
            <Button variant="outline" size="sm" onClick={resetUpload}>
              Change File
            </Button>
          </div>

          <div className="overflow-x-auto border rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {preview[0]?.map((header, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.slice(1).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetUpload}>
              Cancel
            </Button>
            <Button onClick={handleUpload} loading={isUploading}>
              Confirm & Upload
            </Button>
          </div>
        </div>
      )}

      {uploadStep === "uploading" && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">
            Uploading and processing student data...
          </p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
          {!isConnected && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 font-medium">
                Connection Issue
              </p>
              <p className="text-sm text-red-500 mt-1">
                Socket connection issue detected
              </p>
            </div>
          )}
        </div>
      )}

      {uploadStep === "success" && (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Upload Complete!
          </h3>
          <p className="text-gray-600 mb-6">
            Successfully processed {uploadStats.count} eligible student records.
            {uploadStats.timestamp && (
              <span className="block text-sm text-gray-500 mt-1">
                Completed at {new Date(uploadStats.timestamp).toLocaleString()}
              </span>
            )}
          </p>
          {uploadStats.errors && uploadStats.errors.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {uploadStats.errors.length} records could not be processed.
                  </p>
                  <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside">
                    {uploadStats.errors.slice(0, 3).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {uploadStats.errors.length > 3 && (
                      <li>And {uploadStats.errors.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <Button onClick={resetUpload}>Upload Another File</Button>
        </div>
      )}
    </div>
  );
};

export default CsvUploader;
