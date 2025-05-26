import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import DashboardStats from '../../components/admin/DashboardStats';
import AuditLogTable from '../../components/admin/AuditLogTable';
import RegisteredStudentsTable from '../../components/admin/RegisteredStudentsTable';
import { Clock, Download, Mail, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';


interface UploadedData {
  student_id: string;
  name: string;
  email: string;
  program: string;
}


const AdminDashboard = () => {
  const [students, setStudents] = useState<UploadedData[]>([]);
  // Fetch students data from the API   
  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch('/api/students');
      const data = await res.json();
      console.log('Fetched students:', data);
      setStudents(data);
    };

    fetchStudents();
  }, []);

  // Listen for new student data via WebSocket
  useSocket((data: { success: boolean; data: UploadedData[] }) => {
    console.log('Received data:', data);
    if (data.success) {
      setStudents((prevStudents) => [...prevStudents, ...data.data]);
    }
  });

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
          
          <Button
            variant="outline"
            icon={<Download size={18} />}
          >
            Export Data
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="mb-8">
        <DashboardStats />
      </div>
      
      {/* Upcoming Deadlines */}
      <div className="mb-8">
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
      </div>
      
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

      <div>
        <h1>Admin Dashboard</h1>
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Program</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.student_id}>
                <td>{student.student_id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.program}</td>
              </tr>
            ))}
          </tbody>
        </table>
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