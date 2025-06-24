import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import DashboardStats from '../../components/admin/DashboardStats';
import AuditLogTable from '../../components/admin/AuditLogTable';
import RegisteredStudentsTable from '../../components/admin/RegisteredStudentsTable';
import ExportDropdown from '../../components/admin/ExportDropdown';
import { Clock, Mail, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

interface UploadedData {
  student_id: string;
  name: string;
  email: string;
  program: string;
  phone: string;
}

const AdminDashboard = () => {
  const [students, setStudents] = useState<UploadedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const studentsPerPage = 10;
  
  // API URL -  calls backend 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const { socket } = useSocket();

  // Fetch students data from the API   
  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fixed: Call backend API with pagination parameters
      const res = await fetch(`${API_URL}/students?page=${page}&limit=${studentsPerPage}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log('Fetched students:', data);
      setStudents(data.students);
      setTotalStudents(data.total);
    } catch (error) {
      console.error('Error fetching students:', error);
      // Set empty array on error to prevent crashes
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [API_URL, page]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: CsvUploadCompleteEvent) => {
      console.log('Received CSV upload complete event:', data);
      if (data.success) {
        console.log('CSV upload successful, refetching students...');
        fetchStudents();
      }
    };
    socket.on('csv-upload-complete', handler);
    return () => socket.off('csv-upload-complete', handler);
  }, [socket]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage graduation registrations and student data</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Link to="/admin/upload">
            <Button
              variant="primary"
              icon={<Upload size={18} />}
            >
              Upload Students
            </Button>
          </Link>
          
          <ExportDropdown variant="outline" />
        </div>
      </div>
      
      {/* Stats */}
      {/* Removed DashboardStats component */}
      {/* <div className="mb-8">
        <DashboardStats />
      </div> */}
      
      {/* Upcoming Deadlines */}
      {/* Removed Upcoming Deadlines section */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Deadlines</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center text-blue-800 mb-2">
                <Clock size={18} className="mr-2" />
                <span className="font-semibold">Registration Deadline</span>
              </div>
              <p className="text-gray-700">April 15, 2025</p>
              <p className="text-sm text-gray-500">14 days remaining</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <div className="flex items-center text-yellow-800 mb-2">
                <Mail size={18} className="mr-2" />
                <span className="font-semibold">Final Notifications</span>
              </div>
              <p className="text-gray-700">April 20, 2025</p>
              <p className="text-sm text-gray-500">19 days remaining</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center text-green-800 mb-2">
                <GraduationCap size={18} className="mr-2" />
                <span className="font-semibold">Ceremony Date</span>
              </div>
              <p className="text-gray-700">May 15, 2025</p>
              <p className="text-sm text-gray-500">44 days remaining</p>
            </div>
          </div>
        </div>
      </div> */}
      
      {/* Registration Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Registrations</h2>
          <RegisteredStudentsTable />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">System Activity</h2>
          <AuditLogTable />
        </div>
      </div>

      {/* Eligible Students Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">All Eligible Students</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading && students.length === 0 ? (
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Program
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.student_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a href={`mailto:${student.email}`} className="text-blue-600 hover:text-blue-800">
                            {student.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.program}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Eligible
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {Math.min((page - 1) * studentsPerPage + 1, totalStudents)} to {Math.min(page * studentsPerPage, totalStudents)} of {totalStudents} eligible students
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.min(Math.ceil(totalStudents / studentsPerPage), p + 1))}
                    disabled={page >= Math.ceil(totalStudents / studentsPerPage) || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// This component is missing in the provided imports
const GraduationCap = ({ className, size }: { className?: string, size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);