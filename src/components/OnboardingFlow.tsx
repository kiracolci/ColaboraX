import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserTypeSelection } from "./UserTypeSelection";
import { CompanyRegistration } from "./CompanyRegistration";
import { EmployeeRegistration } from "./EmployeeRegistration";
import { toast } from "sonner";

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<"userType" | "registration">("userType");
  const [selectedUserType, setSelectedUserType] = useState<"company" | "employee" | null>(null);
  
  // Get the stored user preference
  const userPreference = useQuery(api.userPreferences.getMyPreference);
  const createUserPreference = useMutation(api.userPreferences.create);
  const deleteUserPreference = useMutation(api.userPreferences.deletePreference);

  // Check for pending user type from signup
  useEffect(() => {
    const pendingUserType = localStorage.getItem('pendingUserType') as "company" | "employee" | null;
    if (pendingUserType && !userPreference) {
      // Auto-select user type and proceed to registration
      setSelectedUserType(pendingUserType);
      setCurrentStep("registration");
      
      // Create user preference silently
      createUserPreference({ userType: pendingUserType })
        .then(() => {
          localStorage.removeItem('pendingUserType');
        })
        .catch((error) => {
          console.error("Error creating user preference:", error);
          // Fall back to user type selection if preference creation fails
          setCurrentStep("userType");
          setSelectedUserType(null);
        });
    }
  }, [userPreference, createUserPreference]);

  const handleSelectUserType = async (type: "company" | "employee") => {
    try {
      await createUserPreference({ userType: type });
      setSelectedUserType(type);
      setCurrentStep("registration");
    } catch (error: any) {
      toast.error(error.message || "Failed to save user type");
      console.error("Error creating user preference:", error);
    }
  };

  const handleBackToSelection = async () => {
    try {
      // Delete the user preference to allow re-selection
      await deleteUserPreference();
      setCurrentStep("userType");
      setSelectedUserType(null);
    } catch (error: any) {
      console.error("Error deleting user preference:", error);
      // Still allow going back even if deletion fails
      setCurrentStep("userType");
      setSelectedUserType(null);
    }
  };

  const handleComplete = () => {
    // Show success message and refresh
    toast.success("Welcome to JobSwap Around! Your profile is now complete.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Show loading while checking for user preference
  if (userPreference === undefined) {
    return (
      <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa731] mx-auto mb-4"></div>
          <p className="text-[#333]">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // If user preference exists, show registration directly
  if (userPreference?.userType) {
    return (
      <div className="min-h-screen bg-[#fefdfb] p-4">
        {userPreference.userType === "company" ? (
          <CompanyRegistration onBack={handleBackToSelection} onComplete={handleComplete} />
        ) : (
          <EmployeeRegistration onBack={handleBackToSelection} onComplete={handleComplete} />
        )}
      </div>
    );
  }

  // Show current step
  if (currentStep === "registration" && selectedUserType) {
    return (
      <div className="min-h-screen bg-[#fefdfb] p-4">
        {selectedUserType === "company" ? (
          <CompanyRegistration onBack={handleBackToSelection} onComplete={handleComplete} />
        ) : (
          <EmployeeRegistration onBack={handleBackToSelection} onComplete={handleComplete} />
        )}
      </div>
    );
  }

  // Show user type selection
  return (
    <div className="min-h-screen bg-[#fefdfb]">
      <UserTypeSelection 
        onSelectType={handleSelectUserType} 
        onSignIn={() => {}} // Not needed in onboarding flow
        isOnboarding={true}
      />
    </div>
  );
}
