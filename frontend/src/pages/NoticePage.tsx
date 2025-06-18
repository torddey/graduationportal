import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface NoticeDates {
  registrationDeadline: string;
  gownReturnDeadline: string;
}

const NoticePage = () => {
  const [dates, setDates] = useState<NoticeDates>({
    registrationDeadline: 'Friday, July 4, 2025',
    gownReturnDeadline: 'Friday, August 8, 2025'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/public-settings');
        if (response.ok) {
          const data = await response.json();
          setDates({
            registrationDeadline: new Date(data.registrationDeadline).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            gownReturnDeadline: new Date(data.gownReturnDeadline).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">IMPORTANT NOTICES</h1>
          <div className="w-20 h-1 bg-blue-600"></div>
        </div>

        {/* Notice Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 text-gray-700">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="font-semibold text-yellow-800">
                  PLEASE COMPLETE THE FORM IN UPPER CASE (CAPITAL LETTERS).
                </p>
              </div>

              <p>
                Abbreviations, initials, and/or brackets are not acceptable when completing the application form.
              </p>

              <p>
                Application from students who have not paid all their fees including the graduation fee will not be accepted and processed.
              </p>

              <p>
                It is the responsibility of every student to ensure that all requirements are met and that his/her details (spelling of names, arrangement of names, full name) are accurate in the ITS. Any student who does not meet the graduation requirement (Section 8 of both Postgraduate and Undergraduate Student Handbooks as well as having no outstanding debt; paying graduation fee) will have to re-apply to graduate during the next scheduled graduation. A student will not be automatically graduated at next scheduled graduation.
              </p>

              <p>
                Only student's name on entry-certificates/results (as captured upon admission) will appear on certificates and transcripts. Please report all errors in writing to your School's Secretariat prior to the date of graduation. The Institute does not take responsibility for errors in names and academic records reported after a student graduates.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="font-semibold text-blue-800">
                  Kindly COMPLETE and SUBMIT this form on/before {dates.registrationDeadline}.
                </p>
              </div>

              <p>
                Please note that graduation gowns must be returned by {dates.gownReturnDeadline}. Any gown submitted beyond the {dates.gownReturnDeadline} deadline will attract penalty. Any student who's gown/regalia gets damaged will be surcharged.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
              >
                Go Back
              </Button>
              <Link to="/registration">
                <Button>
                  Proceed to Registration
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticePage; 