import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function JobOpportunities() {
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const opportunities = useQuery(api.jobSwaps.getAvailableOpportunities);
  const employee = useQuery(api.employees.getMyProfile);
  const applyForSwap = useMutation(api.exchanges.create);

  const handleApply = async (jobSwapId: string, companyName: string, currentEmployeeName: string) => {
    try {
      await applyForSwap({
        toSwapId: jobSwapId as any,
        message: `I'm interested in swapping positions with ${currentEmployeeName} at ${companyName}. I believe my skills and experience would be a great fit for this role.`
      });
      
      // Update button state
      setAppliedJobs(prev => new Set(prev).add(jobSwapId));
      
      toast.success("Application sent! You can track its status in 'My Applications'.");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply");
    }
  };

  if (!employee?.isVerified) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You need to be verified by your company to view job opportunities.</p>
        <p className="text-sm text-gray-500 mt-2">
          Go to "Company Verification" tab to request verification from your company.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Available Job Swap Opportunities</h2>
      
      {!opportunities?.length ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No job opportunities available at the moment.</p>
          <p className="text-sm text-gray-500 mt-2">
            Check back later for new international exchange opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opportunity) => {
            const hasApplied = appliedJobs.has(opportunity._id);
            const isLanguageCompatible = opportunity.isLanguageCompatible;
            
            return (
              <div key={opportunity._id} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                      {!isLanguageCompatible && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Language Requirements Not Met
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{opportunity.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Position Details:</h4>
                        <p className="text-gray-600">
                          <strong>Company:</strong> {opportunity.company?.name}
                        </p>
                        <p className="text-gray-600">
                          <strong>Location:</strong> {opportunity.location}, {opportunity.country}
                        </p>
                        <p className="text-gray-600">
                          <strong>Duration:</strong> {opportunity.duration}
                        </p>
                        <p className="text-gray-600">
                          <strong>Current Employee:</strong> {opportunity.currentEmployee ? `${opportunity.currentEmployee.firstName} ${opportunity.currentEmployee.lastName}` : "No employee assigned"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                        <ul className="text-gray-600 text-sm">
                          {opportunity.requirements.map((req, index) => (
                            <li key={index}>• {req}</li>
                          ))}
                        </ul>
                        
                        {opportunity.requiredLanguages && opportunity.requiredLanguages.length > 0 && (
                          <>
                            <h4 className="font-medium text-gray-900 mb-2 mt-3">Required Languages:</h4>
                            <ul className="text-gray-600 text-sm">
                              {opportunity.requiredLanguages.map((lang, index) => (
                                <li key={index}>• {lang.language} ({lang.proficiency})</li>
                              ))}
                            </ul>
                          </>
                        )}
                        
                        {opportunity.benefits.length > 0 && (
                          <>
                            <h4 className="font-medium text-gray-900 mb-2 mt-3">Benefits:</h4>
                            <ul className="text-gray-600 text-sm">
                              {opportunity.benefits.map((benefit, index) => (
                                <li key={index}>• {benefit}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>

                    {opportunity.startDate && (
                      <div className="text-sm text-gray-600 mb-4">
                        <strong>Available from:</strong> {new Date(opportunity.startDate).toLocaleDateString()}
                        {opportunity.endDate && (
                          <span> to {new Date(opportunity.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleApply(
                      opportunity._id,
                      opportunity.company?.name || "Unknown Company",
                      opportunity.currentEmployee ? `${opportunity.currentEmployee.firstName} ${opportunity.currentEmployee.lastName}` : "the team"
                    )}
                    disabled={hasApplied || !isLanguageCompatible}
                    className={`px-4 py-2 rounded-md ml-4 transition-colors ${
                      hasApplied 
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : !isLanguageCompatible
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary-hover"
                    }`}
                  >
                    {hasApplied ? "Applied" : "Apply for Exchange"}
                  </button>
                </div>

                <div className={`p-3 rounded ${isLanguageCompatible ? "bg-blue-50" : "bg-yellow-50"}`}>
                  <p className={`text-sm ${isLanguageCompatible ? "text-blue-800" : "text-yellow-800"}`}>
                    {isLanguageCompatible ? (
                      <>💡 When you apply, {opportunity.currentEmployee ? `${opportunity.currentEmployee.firstName} ${opportunity.currentEmployee.lastName}` : "the company"} will be notified about your interest in this position. You must have an active job posting to apply for exchanges.</>
                    ) : (
                      <>⚠️ You don't meet the language requirements for this position. Your language skills need to match the required proficiency levels to apply.</>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
