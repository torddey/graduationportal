import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { registrationService } from "../../services/registrationService";
import { emailService } from "../../services/emailService";
import { RegistrationForm as RegistrationFormType } from "../../types/RegistrationForm";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import TextArea from "../ui/TextArea";
import Checkbox from "../ui/Checkbox";
import Select from "../ui/Select";

const initialState: RegistrationFormType = {
  studentId: "",
  name: "",
  email: "",
  program: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  country: "",
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
  },
  guestCount: 2,
  dignitaries: "no",
  dignitariesDetails: "",
  specialRequirements: "none",
  attendanceConfirmed: false,
  agreeToTerms: false,
};

const RegistrationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegistrationFormType>({
    ...initialState,
    studentId: user?.studentId || "",
    name: user?.name || "",
    email: user?.email || "",
    program: user?.program || "",
    phone: user?.phone || "",
    address: user?.address || "",
    postalCode: user?.postalCode || "",
    city: user?.city || "",
    country: user?.country || "",
    dignitaries: user?.dignitaries || "no",
    dignitariesDetails: user?.dignitariesDetails || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        ...(name === "dignitaries" && value === "no"
          ? { dignitariesDetails: "" }
          : {}),
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || !form.studentId) {
      toast.error("User data is not loaded, or student ID is missing.");
      return;
    }

    if (form.dignitaries === "yes" && !form.dignitariesDetails.trim()) {
      toast.error("Please specify the type of dignitaries you are inviting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const registrationData: RegistrationFormType = {
        studentId: form.studentId,
        name: form.name,
        email: form.email,
        program: form.program,
        phone: form.phone,
        address: form.address,
        postalCode: form.postalCode,
        city: form.city,
        country: form.country,
        emergencyContact: form.emergencyContact,
        guestCount: form.guestCount,
        dignitaries: form.dignitaries,
        dignitariesDetails: form.dignitaries === "yes" ? form.dignitariesDetails : undefined,
        specialRequirements: form.specialRequirements,
        attendanceConfirmed: form.attendanceConfirmed,
        agreeToTerms: form.agreeToTerms,
      };

      console.log("Submitting registration with data:", registrationData);
      const result =
        await registrationService.submitRegistration(registrationData);
      console.log("Registration successful:", result);

      console.log("Result success is true. Proceeding with UI update.");
      toast.success("Registration submitted successfully!");
      console.log("Success toast shown.");
      navigate("/confirmation", {
        state: { confirmationId: result.confirmationId },
      });
      console.log("Navigation triggered.");
    } catch (error) {
      console.error("Error during registration:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during registration";
      toast.error(errorMessage);
      console.log("Catch block error toast shown.");
    } finally {
      setIsSubmitting(false);
      console.log("setIsSubmitting(false) called.");
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      return !!(
        form.name &&
        form.email &&
        form.phone &&
        form.address &&
        form.postalCode &&
        form.city &&
        form.country
      );
    }
    if (step === 2) {
      return !!(
        form.emergencyContact.name &&
        form.emergencyContact.relationship &&
        form.emergencyContact.phone
      );
    }
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > index + 1
                    ? "bg-green-500 text-white"
                    : step === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > index + 1 ? "✓" : index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`h-1 w-12 ${
                    step > index + 1 ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">
          {step === 1 && "Personal Information"}
          {step === 2 && "Emergency Contact & Guests"}
          {step === 3 && "Graduation Details & Confirmation"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <TextInput
              id="name"
              name="name"
              label="Full Name (as it will appear on your certificate)"
              value={form.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            <TextInput
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            <TextInput
              id="phone"
              name="phone"
              label="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            <TextInput
              id="address"
              name="address"
              label="Address"
              value={form.address}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="postalCode"
                name="postalCode"
                label="Postal/Zip Code"
                value={form.postalCode}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />

              <TextInput
                id="city"
                name="city"
                label="City"
                value={form.city}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <TextInput
              id="country"
              name="country"
              label="Country"
              value={form.country}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                Emergency Contact Information
              </h3>
              <p className="text-sm text-blue-700">
                Please provide details of someone we can contact in case of
                emergency during the graduation ceremony.
              </p>
            </div>

            <TextInput
              id="emergencyContact.name"
              name="emergencyContact.name"
              label="Emergency Contact Name"
              value={form.emergencyContact.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            <TextInput
              id="emergencyContact.relationship"
              name="emergencyContact.relationship"
              label="Relationship to You"
              value={form.emergencyContact.relationship}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            <TextInput
              id="emergencyContact.phone"
              name="emergencyContact.phone"
              label="Emergency Contact Phone"
              value={form.emergencyContact.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Guest Information
              </h3>

              <Select
                id="guestCount"
                name="guestCount"
                label="Number of Guests (Maximum: 4)"
                value={form.guestCount.toString()}
                onChange={handleChange}
                options={[
                  { value: "0", label: "0 - No guests" },
                  { value: "1", label: "1 guest" },
                  { value: "2", label: "2 guests" },
                  { value: "3", label: "3 guests" },
                  { value: "4", label: "4 guests" },
                ]}
                disabled={isSubmitting}
              />

              <Select
                id="dignitaries"
                name="dignitaries"
                label="Would you be inviting any dignitaries e.g Chiefs, Member of Parliaments etc.?"
                value={form.dignitaries}
                onChange={handleChange}
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
                disabled={isSubmitting}
              />

              {form.dignitaries === "yes" && (
                <TextInput
                  id="dignitariesDetails"
                  name="dignitariesDetails"
                  label="Please specify the type of dignitaries you are inviting"
                  value={form.dignitariesDetails}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  maxLength={100}
                  placeholder="e.g. Chief, Member of Parliament, Minister, etc."
                  className="mt-2"
                />
              )}

              <p className="text-sm text-gray-500 mt-2">
                Each graduate is allowed to bring up to 4 guests to the
                ceremony. Additional tickets may be available after the
                registration deadline.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">
                Program Information
              </h3>
              <p className="text-gray-700">
                School:{" "}
                <span className="font-medium">{user?.school || "N/A"}</span>
              </p>
              <p className="text-gray-700">
                Program:{" "}
                <span className="font-medium">{user?.program || "N/A"}</span>
              </p>
              <p className="text-gray-700">
                Course:{" "}
                <span className="font-medium">{user?.course || "N/A"}</span>
              </p>
              <p className="text-gray-700">
                Student ID:{" "}
                <span className="font-medium">{form.studentId}</span>
              </p>
            </div>

            <Select
              id="specialRequirements"
              name="specialRequirements"
              label="Special Requirements or Accessibility Needs"
              value={form.specialRequirements}
              onChange={handleChange}
              options={[
                { value: "none", label: "None" },
                {
                  value: "physical_disability",
                  label: "Physical disability (eg wheel chair)",
                },
                {
                  value: "visual_impairment",
                  label: "Visual impairment assistance",
                },
              ]}
              disabled={isSubmitting}
            />

            <Checkbox
              id="attendanceConfirmed"
              name="attendanceConfirmed"
              label="I confirm I will attend the graduation ceremony"
              checked={form.attendanceConfirmed}
              onChange={(e) =>
                setForm({ ...form, attendanceConfirmed: e.target.checked })
              }
              disabled={isSubmitting}
            />

            <Checkbox
              id="agreeToTerms"
              name="agreeToTerms"
              label={
                <span>
                  I agree to the{" "}
                  <Link
                    to="/notice"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    terms and conditions
                  </Link>{" "}
                  of the graduation ceremony
                </span>
              }
              checked={form.agreeToTerms}
              onChange={(e) =>
                setForm({ ...form, agreeToTerms: e.target.checked })
              }
              disabled={isSubmitting}
              required
            />

            <div className="text-sm text-gray-500 mt-2">
              By submitting this form, you consent to the use of your
              information for graduation-related purposes and agree to abide by
              the university's code of conduct during the ceremony.
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button
              type="button"
              onClick={prevStep}
              variant="outline"
              disabled={isSubmitting}
            >
              Previous
            </Button>
          ) : (
            <div></div>
          )}

          {step < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting || !validateStep()}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={
                isSubmitting ||
                !user ||
                !form.studentId ||
                !form.agreeToTerms ||
                step !== totalSteps
              }
            >
              Submit Registration
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
