import { useEffect, useState, useCallback, useRef } from "react";
import { adminService } from "../../services/adminService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import Button from "../../components/ui/Button";
import { useSocket } from "../../contexts/SocketContext";
import { useReactToPrint } from "react-to-print";

// Custom label for bars to display full name
const BarNameLabel = (props: any) => {
  const { x, y, width, height, index, data, nameKey } = props;
  const labelX = width > 40 ? x + 8 : x + width + 8;
  const labelY = y + height / 2 + 4;
  const label = data && data[index] && nameKey ? data[index][nameKey] : '';
  return (
    <text x={labelX} y={labelY} fill="#333" fontSize={12} fontFamily="inherit" alignmentBaseline="middle">
      {label}
    </text>
  );
};

const AdminAnalytics = () => {
  const [bySchool, setBySchool] = useState<any[]>([]);
  const [byProgram, setByProgram] = useState<any[]>([]);
  const [byCourse, setByCourse] = useState<any[]>([]);
  const [overTime, setOverTime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();
  const analyticsRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => analyticsRef.current,
    documentTitle: "Analytics Dashboard",
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      const [school, program, course, time] = await Promise.all([
        adminService.getAnalyticsBySchool(),
        adminService.getAnalyticsByProgram(),
        adminService.getAnalyticsByCourse(),
        adminService.getRegistrationsOverTime(),
      ]);
      setBySchool(school);
      setByProgram(program);
      setByCourse(course);
      setOverTime(time);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics().finally(() => setLoading(false));
  }, [fetchAnalytics]);

  useEffect(() => {
    if (socket) {
      const handleNewRegistration = () => {
        console.log("New registration detected, refreshing analytics...");
        fetchAnalytics();
      };
      socket.on("new_registration", handleNewRegistration);

      return () => {
        socket.off("new_registration", handleNewRegistration);
      };
    }
  }, [socket, fetchAnalytics]);

  const handleExport = async () => {
    try {
      await adminService.exportAnalyticsCsv();
    } catch (err: any) {
      setError(err.message || "Failed to export analytics");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Visualize registration trends and breakdowns
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4 md:mt-0">
          <Button variant="primary" onClick={handleExport}>
            Export Analytics as CSV
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            Print Analytics
          </Button>
        </div>
      </div>
      <div className="print-header hidden">Analytics Dashboard</div>
      <div ref={analyticsRef} className="analytics-print-area space-y-12">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Loading analytics...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
          <div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Registrations Over Time
              </h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={overTime}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      name="Registrations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  By School
                </h2>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={bySchool}
                      layout="horizontal"
                      margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="school" type="category" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#10b981"
                        name="Registered"
                        label={(props) => <BarNameLabel {...props} data={bySchool} nameKey="school" />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  By Program
                </h2>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={byProgram}
                      layout="horizontal"
                      margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="program" type="category" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#6366f1"
                        name="Registered"
                        label={(props) => <BarNameLabel {...props} data={byProgram} nameKey="program" />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                By Course
              </h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={byCourse}
                    layout="horizontal"
                    margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="course" type="category" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#f59e42"
                      name="Registered"
                      label={(props) => <BarNameLabel {...props} data={byCourse} nameKey="course" />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
