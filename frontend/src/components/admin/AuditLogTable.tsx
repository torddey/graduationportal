import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import Button from "../ui/Button";

const AuditLogTable = () => {
  const [logs, setLogs] = useState<
    Array<{
      id: string;
      action: string;
      user: string;
      timestamp: string | null;
      details: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 10;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/auditlogs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched audit logs:", data); // Debug the fetched logs
      setLogs(data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await adminService.getAuditLogs(page, logsPerPage);

        const cleanedLogs = data.logs.map((log: any) => {
          // Explicitly check for null or undefined before attempting Date conversion
          const rawTimestamp = log.timestamp;
          const isValidDate =
            typeof rawTimestamp === "string" &&
            rawTimestamp !== "" &&
            !isNaN(new Date(rawTimestamp).getTime());

          if (!isValidDate) {
            console.warn(
              "Invalid or missing timestamp detected:",
              rawTimestamp,
              log,
            );
          }

          return {
            ...log,
            // Use a default value like null if the timestamp is invalid or missing
            timestamp: isValidDate ? rawTimestamp : null,
          };
        });

        setLogs(cleanedLogs);
        setTotalLogs(data.total);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return "No Timestamp"; // Fallback for missing dates
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date"; // Fallback for invalid dates
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "UPLOAD":
        return "bg-blue-100 text-blue-800";
      case "LOGIN":
        return "bg-green-100 text-green-800";
      case "REGISTER":
        return "bg-purple-100 text-purple-800";
      case "EXPORT":
        return "bg-yellow-100 text-yellow-800";
      case "UPDATE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  if (loading && logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Audit Logs</h2>
        <p className="text-sm text-gray-500">
          System activity record for tracking and compliance
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Action
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Timestamp
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr
                key={`${log.log_type}-${log.id}`}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.user}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(log.timestamp)}{" "}
                  {/* Use the updated formatDate function */}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {Math.min((page - 1) * logsPerPage + 1, totalLogs)} to{" "}
          {Math.min(page * logsPerPage, totalLogs)} of {totalLogs} entries
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogTable;
