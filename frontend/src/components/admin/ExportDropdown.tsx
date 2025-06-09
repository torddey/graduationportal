import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Users, Database } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface ExportDropdownProps {
  variant?: 'primary' | 'outline';
}

const ExportDropdown = ({ variant = 'outline' }: ExportDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = async (exportType: 'students' | 'registrations' | 'all') => {
    setIsExporting(true);
    const toastId = toast.loading('Preparing export...');
    
    try {
      switch (exportType) {
        case 'students':
          await adminService.exportStudents();
          toast.success('Students data exported successfully!', { id: toastId });
          break;
        case 'registrations':
          await adminService.exportRegistrations();
          toast.success('Registrations data exported successfully!', { id: toastId });
          break;
        case 'all':
          await adminService.exportAllData();
          toast.success('All data exported successfully!', { id: toastId });
          break;
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Export failed. Please try again.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      type: 'students' as const,
      label: 'Export Students',
      description: 'All eligible students data',
      icon: <Users size={16} />,
    },
    {
      type: 'registrations' as const,
      label: 'Export Registrations',
      description: 'All graduation registrations',
      icon: <FileText size={16} />,
    },
    {
      type: 'all' as const,
      label: 'Export All Data',
      description: 'Complete dataset with status',
      icon: <Database size={16} />,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant={variant}
        icon={<Download size={18} />}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center space-x-2"
      >
        <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Choose Export Type</h3>
            <div className="space-y-2">
              {exportOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleExport(option.type)}
                  disabled={isExporting}
                  className="w-full flex items-start space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex-shrink-0 text-gray-500 mt-0.5">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown; 