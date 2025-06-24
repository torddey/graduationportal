import LoginForm from "../components/auth/LoginForm";
import { GraduationCap, Info } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#1a365d] text-white p-8 rounded-lg shadow-md hidden md:block">
            <div className="flex items-center mb-6">
              <GraduationCap size={32} className="text-[#ffc425] mr-2" />
              <h2 className="text-2xl font-bold">Student Login</h2>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">How to Login</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-200">
                <li>Enter your Student ID</li>
                <li>
                  We'll send a one-time password (OTP) to your student email
                </li>
                <li>Enter the OTP to verify your identity</li>
                <li>Begin your graduation registration process</li>
              </ol>
            </div>

            <div className="bg-blue-800 rounded-lg p-4 flex items-start">
              <Info
                size={20}
                className="text-[#ffc425] mt-1 mr-3 flex-shrink-0"
              />
              <div>
                <h4 className="font-semibold mb-1">Need Help?</h4>
                <p className="text-sm text-gray-200">
                  If you're having trouble logging in or haven't received your
                  OTP, please contact the academic office at{" "}
                  <a
                    href="mailto:info@gimpa.edu.gh"
                    className="text-[#ffc425] hover:underline"
                  >
                    info@gimpa.edu.gh
                  </a>{" "}
                  or call +233-(0) 332095432.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8 md:hidden">
              Student Login
            </h1>

            <LoginForm />

            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 md:hidden">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info size={20} className="text-blue-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Need Help?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      If you're having trouble logging in or haven't received
                      your OTP, please contact the academic office.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
