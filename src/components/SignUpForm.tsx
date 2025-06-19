import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

interface SignUpFormProps {
  userType: "company" | "employee";
  onBack: () => void;
}

export function SignUpForm({ userType, onBack }: SignUpFormProps) {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [step, setStep] = useState<"credentials" | "terms">("credentials");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleCredentialsNext = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    setStep("terms");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy to continue");
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem('pendingUserType', userType);
      
      await signIn("password", {
        email: formData.email,
        password: formData.password,
        flow: "signUp",
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account");
      localStorage.removeItem('pendingUserType');
    } finally {
      setIsLoading(false);
    }
  };

  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1f1f1f]">Terms of Service</h2>
            <button
              onClick={() => setShowTermsModal(false)}
              className="text-[#333] hover:text-[#1f1f1f]"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 text-sm text-[#333]">
            <h3 className="font-semibold text-[#1f1f1f]">1. Acceptance of Terms</h3>
            <p>By accessing JobSwap Around, you accept these terms.</p>

            <h3 className="font-semibold text-[#1f1f1f]">2. Service Description</h3>
            <p>JobSwap facilitates temporary job exchanges between verified employees and companies.</p>

            <h3 className="font-semibold text-[#1f1f1f]">3. User Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate information</li>
              <li>Maintain account security</li>
              <li>Use platform legally</li>
              <li>Respect other users</li>
            </ul>

            <h3 className="font-semibold text-[#1f1f1f]">4. Company Verification</h3>
            <p>Companies must verify employees before exchanges. We reserve the right to verify and remove unverified accounts.</p>

            <h3 className="font-semibold text-[#1f1f1f]">5. Exchange Agreements</h3>
            <p>All exchanges require company approval. JobSwap facilitates connections but isn't responsible for individual exchange terms.</p>

            <h3 className="font-semibold text-[#1f1f1f]">6. Limitation of Liability</h3>
            <p>JobSwap isn't liable for damages from platform use or exchange participation. Users participate at their own risk.</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowTermsModal(false)}
              className="bg-[#ffa731] text-[#2d2d2d] px-4 py-2 rounded hover:bg-[#ea580c] text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PrivacyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1f1f1f]">Privacy Policy</h2>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="text-[#333] hover:text-[#1f1f1f]"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 text-sm text-[#333]">
            <h3 className="font-semibold text-[#1f1f1f]">Data Collection</h3>
            <p>We collect account information, professional details, and usage data to improve our service.</p>

            <h3 className="font-semibold text-[#1f1f1f]">Data Protection with Convex</h3>
            <p>Your data is securely stored by Convex with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Encryption:</strong> TLS 1.3 in transit, AES-256 at rest</li>
              <li><strong>Access Control:</strong> Strict authentication limits</li>
              <li><strong>Infrastructure:</strong> Secure cloud with regular audits</li>
              <li><strong>Compliance:</strong> SOC 2 Type II and GDPR guidelines</li>
            </ul>

            <h3 className="font-semibold text-[#1f1f1f]">How We Use Your Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Facilitate job exchange matching</li>
              <li>Verify employment relationships</li>
              <li>Enable participant communication</li>
              <li>Send relevant notifications</li>
              <li>Improve service through analytics</li>
            </ul>

            <h3 className="font-semibold text-[#1f1f1f]">Your Rights</h3>
            <p>You can access, correct, delete, or port your data. Contact privacy@jobswaparound.com for requests.</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="bg-[#ffa731] text-[#2d2d2d] px-4 py-2 rounded hover:bg-[#ea580c] text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 border border-[#ffa731] border-opacity-20">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "credentials" ? "bg-[#ffa731] text-[#2d2d2d]" : "bg-green-500 text-white"
            }`}>
              {step === "credentials" ? "1" : "✓"}
            </div>
            <div className={`w-12 h-1 ${step === "terms" ? "bg-[#ffa731]" : "bg-gray-200"}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "terms" ? "bg-[#ffa731] text-[#2d2d2d]" : "bg-gray-200 text-gray-500"
            }`}>
              2
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1f1f1f] mb-2">
            {step === "credentials" ? "Create Account" : "Accept Terms"}
          </h1>
          <p className="text-[#333] text-sm">
            {step === "credentials" 
              ? `Set up your ${userType === "company" ? "company" : "employee"} account`
              : "Review and accept our terms to continue"
            }
          </p>
        </div>

        {step === "credentials" ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1f1f1f] mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1f1f1f] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] text-sm"
                placeholder="Minimum 8 characters"
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1f1f1f] mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] text-sm"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="button"
              onClick={handleCredentialsNext}
              className="w-full bg-[#ffa731] text-[#2d2d2d] py-2 px-4 rounded-md hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:ring-offset-2 transition-colors text-sm font-semibold"
            >
              Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-[#ffa731] focus:ring-[#ffa731] border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="text-sm text-[#333]">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-[#ffa731] hover:underline font-medium"
                  >
                    Terms of Service
                  </button>
                  {" "}and{" "}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-[#ffa731] hover:underline font-medium"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              
              <div className="bg-[#ffa731] bg-opacity-10 border border-[#ffa731] border-opacity-30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="text-[#ffa731] mt-0.5">🔒</div>
                  <div className="text-xs text-[#2d2d2d]">
                    <strong>Your data is protected:</strong> Enterprise-grade security with end-to-end encryption and SOC 2 compliance.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="flex-1 bg-[#2d2d2d] text-white py-2 px-4 rounded-md hover:bg-[#1f1f1f] transition-colors text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !acceptTerms}
                className="flex-1 bg-[#ffa731] text-[#2d2d2d] py-2 px-4 rounded-md hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
              >
                {isLoading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        <button
          type="button"
          onClick={onBack}
          className="w-full mt-4 px-4 py-2 text-[#333] hover:text-[#1f1f1f] transition-colors text-sm"
        >
          ← Back to user type selection
        </button>
      </div>

      {showTermsModal && <TermsModal />}
      {showPrivacyModal && <PrivacyModal />}
    </div>
  );
}
