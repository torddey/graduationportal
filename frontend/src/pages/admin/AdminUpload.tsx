import { Link } from 'react-router-dom';
import CsvUploader from '../../components/admin/CsvUploader';
import { ArrowLeft } from 'lucide-react';

const AdminUpload = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={18} className="mr-1" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Upload Eligible Students</h1>
        <p className="text-gray-600">Import eligible graduating students from CSV file</p>
      </div>
      
      <div className="max-w-4xl">
        <CsvUploader />
        
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">CSV Format Instructions</h2>
          <p className="text-gray-600 mb-4">
            The CSV file should contain the following columns:
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Example</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Student_id</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Unique student identifier</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Yes</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ST12345</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Name</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Student's full name</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Yes</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jane Smith</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Email</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Student's email address</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Yes</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">jane.smith@university.edu</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Program</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Program</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Yes</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Computer Science</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">School</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">School or college</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Yes</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Engineering</td>
                </tr>
                {/* <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">gpa</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Grade point average</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">No</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3.8</td>
                </tr> */}
              </tbody>
            </table>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-bold">Tip:</span> Make sure your CSV file is properly formatted with headers in the first row. The system will validate all records before importing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;