interface UserTypeSelectionProps {
  onSelectType: (type: "company" | "employee") => void;
  onSignIn: () => void;
  onBack?: () => void;
  isOnboarding?: boolean;
}

export function UserTypeSelection({ onSelectType, onSignIn, onBack, isOnboarding = false }: UserTypeSelectionProps) {
  const handleSelectType = (type: "company" | "employee") => {
    onSelectType(type);
  };

  return (
    <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1f1f1f] mb-3">
            {isOnboarding ? "Complete Your Profile" : "Choose Your Account Type"}
          </h1>
          <p className="text-lg text-[#333]">
            {isOnboarding 
              ? "Set up your profile to get started"
              : "Select the type of account you'd like to create"
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Company Option */}
          <div 
            onClick={() => handleSelectType("company")}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#ffa731] group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ffa731] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ffa731] group-hover:bg-opacity-20 transition-colors">
                <span className="text-2xl">🏢</span>
              </div>
              <h2 className="text-xl font-bold text-[#1f1f1f] mb-3">Company Account</h2>
              <p className="text-[#333] mb-4 text-sm">
                Register your company to offer job exchange opportunities and connect with other organizations.
              </p>
              <ul className="text-left space-y-1 text-[#333] mb-4 text-sm">
                <li className="flex items-center">
                  <span className="text-[#ffa731] mr-2 text-xs">✓</span>
                  Post job exchange opportunities
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffa731] mr-2 text-xs">✓</span>
                  Manage employee verifications
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffa731] mr-2 text-xs">✓</span>
                  Approve exchange requests
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffa731] mr-2 text-xs">✓</span>
                  Connect globally
                </li>
              </ul>
              <button className="w-full bg-[#ffa731] text-[#2d2d2d] py-2.5 px-4 rounded-lg hover:bg-[#ea580c] transition-colors font-semibold text-sm">
                {isOnboarding ? "Set Up Company" : "Create Company Account"}
              </button>
            </div>
          </div>

          {/* Employee Option */}
          <div 
            onClick={() => handleSelectType("employee")}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#ffa731] group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ffa731] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ffa731] group-hover:bg-opacity-20 transition-colors">
                <span className="text-2xl">👤</span>
              </div>
              <h2 className="text-xl font-bold text-[#1f1f1f] mb-3">Employee Account</h2>
              <p className="text-[#333] mb-4 text-sm">
                Create your profile to discover and apply for exciting job exchange opportunities worldwide.
              </p>
              <ul className="text-left space-y-1 text-[#333] mb-4 text-sm">
                <li className="flex items-center">
                  <span className="text-[#ffa731] mr-2 text-xs">✓</span>
                  Browse global opportunities
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffa731] mr-2 text-xs">✓</span>
                  Apply for job exchanges
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffa731] mr-2 text-xs">✓</span>
                  Get company verification
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffa731] mr-2 text-xs">✓</span>
                  Expand career horizons
                </li>
              </ul>
              <button className="w-full bg-[#ffa731] text-[#2d2d2d] py-2.5 px-4 rounded-lg hover:bg-[#ea580c] transition-colors font-semibold text-sm">
                {isOnboarding ? "Set Up Employee" : "Create Employee Account"}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          {!isOnboarding && (
            <>
              <p className="text-[#333] mb-3 text-sm">Already have an account?</p>
              <button
                onClick={onSignIn}
                className="text-[#ffa731] hover:text-[#ea580c] font-semibold mr-4 text-sm"
              >
                Sign in here
              </button>
            </>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="text-[#333] hover:text-[#1f1f1f] font-semibold text-sm"
            >
              ← Back to home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
