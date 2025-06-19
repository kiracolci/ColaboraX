import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { UserTypeSelection } from "./components/UserTypeSelection";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./components/SignUpForm";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { CompanyDashboard } from "./components/CompanyDashboard";
import { EmployeeDashboard } from "./components/EmployeeDashboard";
import { SignOutButton } from "./SignOutButton";
import { NotificationBell } from "./components/NotificationBell";

type AuthFlow = "landing" | "signin" | "usertype" | "signup";

function App() {
  const [authFlow, setAuthFlow] = useState<AuthFlow>("landing");
  const [selectedUserType, setSelectedUserType] = useState<"company" | "employee" | null>(null);

  const handleSignIn = () => setAuthFlow("signin");
  const handleSignUp = () => setAuthFlow("usertype");
  const handleSelectUserType = (type: "company" | "employee") => {
    setSelectedUserType(type);
    setAuthFlow("signup");
  };
  const handleBackToLanding = () => {
    setAuthFlow("landing");
    setSelectedUserType(null);
  };
  const handleBackToUserType = () => {
    setAuthFlow("usertype");
    setSelectedUserType(null);
  };

  return (
    <main className="min-h-screen bg-[#fefdfb]">
      <Unauthenticated>
        {authFlow === "landing" && (
          <LandingPage onSignIn={handleSignIn} onSignUp={handleSignUp} />
        )}
        {authFlow === "signin" && (
          <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-[#ffa731] border-opacity-20">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#1f1f1f] mb-2">Welcome Back</h1>
                <p className="text-[#333]">Sign in to your JobSwap Around account</p>
              </div>
              <SignInForm />
              <button
                type="button"
                onClick={handleBackToLanding}
                className="w-full mt-4 px-4 py-2 text-[#333] hover:text-[#1f1f1f] transition-colors"
              >
                ← Back to home
              </button>
            </div>
          </div>
        )}
        {authFlow === "usertype" && (
          <UserTypeSelection 
            onSelectType={handleSelectUserType} 
            onSignIn={handleSignIn}
            onBack={handleBackToLanding}
          />
        )}
        {authFlow === "signup" && selectedUserType && (
          <SignUpForm userType={selectedUserType} onBack={handleBackToUserType} />
        )}
      </Unauthenticated>
      
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
    </main>
  );
}

function AuthenticatedApp() {
  const user = useQuery(api.auth.loggedInUser);
  const company = useQuery(api.companies.getMyCompany);
  const employee = useQuery(api.employees.getMyProfile);

  // Show loading while any query is still loading
  if (user === undefined || company === undefined || employee === undefined) {
    return (
      <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa731] mx-auto mb-4"></div>
          <p className="text-[#333]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If both company and employee are null, show onboarding
  if (!company && !employee) {
    return <OnboardingFlow />;
  }

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#ffa731] border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-[#ffa731]">JobSwap Around</h1>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="flex items-center gap-2">
                <span className="text-[#1f1f1f]">
                  {user?.name || user?.email || "User"}
                </span>
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {company && <CompanyDashboard />}
        {employee && <EmployeeDashboard />}
      </div>
    </div>
  );
}

export default App;
