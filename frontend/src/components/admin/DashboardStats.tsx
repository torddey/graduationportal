import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { GraduationCap, Users, CheckCircle, Clock } from 'lucide-react';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalEligible: 0,
    registered: 0,
    pending: 0,
    lastUpload: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const calculatePercentage = () => {
    if (stats.totalEligible === 0) return 0;
    return Math.round((stats.registered / stats.totalEligible) * 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
            <GraduationCap size={24} />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-700">Total Eligible</h3>
        </div>
        <p className="text-3xl font-bold text-gray-800">{stats.totalEligible}</p>
        <p className="text-sm text-gray-500 mt-2">Total eligible students</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-green-100 text-green-600">
            <CheckCircle size={24} />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-700">Registered</h3>
        </div>
        <p className="text-3xl font-bold text-gray-800">{stats.registered}</p>
        <p className="text-sm text-gray-500 mt-2">
          {calculatePercentage()}% of eligible students
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
            <Clock size={24} />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-700">Pending</h3>
        </div>
        <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
        <p className="text-sm text-gray-500 mt-2">
          Awaiting registration
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-purple-100 text-purple-600">
            <Users size={24} />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-700">Last Upload</h3>
        </div>
        <p className="text-md font-semibold text-gray-800">{formatDate(stats.lastUpload)}</p>
        <p className="text-sm text-gray-500 mt-2">
          Last student data import
        </p>
      </div>
    </div>
  );
};

export default DashboardStats;