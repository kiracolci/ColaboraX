import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function CompanyVerification() {
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showChangeCompany, setShowChangeCompany] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const companies = useQuery(api.companies.getAll);
  const employee = useQuery(api.employees.getMyProfile);
  const company = useQuery(api.companies.getMyCompany);
  const requestVerification = useMutation(api.employees.requestVerification);
  const changeVerificationCompany = useMutation(api.employees.changeVerificationCompany);
  const removeMyVerification = useMutation(api.employees.removeMyVerification);

  const filteredCompanies = companies?.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.country.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRequestVerification = async () => {
    if (!selectedCompanyId) {
      toast.error("Please select a company");
      return;
    }

    try {
      await requestVerification({ companyId: selectedCompanyId as any });
      toast.success("Verification request sent!");
      setSelectedCompanyId("");
      setSearchTerm("");
      setShowChangeCompany(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification request");
      console.error(error);
    }
  };

  const handleChangeCompany = async () => {
    if (!selectedCompanyId) {
      toast.error("Please select a company");
      return;
    }

    try {
      await changeVerificationCompany({ companyId: selectedCompanyId as any });
      toast.success("Company change request sent!");
      setSelectedCompanyId("");
      setSearchTerm("");
      setShowChangeCompany(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to change company");
      console.error(error);
    }
  };

  const handleRemoveVerification = async () => {
    if (!confirm("Are you sure you want to remove your company verification? This will deactivate all your job postings and remove you from the company's employee list.")) {
      return;
    }

    try {
      await removeMyVerification();
      toast.success("Verification removed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove verification");
      console.error(error);
    }
  };

  const handleCompanySelect = (company: any) => {
    setSelectedCompanyId(company._id);
    setSearchTerm(`${company.name} - ${company.headquarters}, ${company.country}`);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (employee?.isVerified) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✓ Verified Employee
          </h3>
          <p className="text-green-700 mb-3">
            You are verified at {company?.name}. You can now apply for job exchanges!
          </p>
          <button
            onClick={handleRemoveVerification}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Remove Verification
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Need to change companies?</strong> You can remove your current verification above and then request verification with a new company.
          </p>
        </div>
      </div>
    );
  }

  if (employee?.companyId && !employee?.isVerified) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            ⏳ Waiting for Approval
          </h3>
          <p className="text-yellow-700 mb-3">
            Your verification request has been sent to {company?.name}. Please wait for them to approve your request.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChangeCompany(!showChangeCompany)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Change Company
            </button>
            <button
              onClick={handleRemoveVerification}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Cancel Request
            </button>
          </div>
        </div>

        {showChangeCompany && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Change Company</h3>
            <p className="text-gray-600 mb-4">
              Select a different company to request verification from.
            </p>

            <div className="space-y-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium mb-2">Search and Select New Company</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                    if (!e.target.value) setSelectedCompanyId("");
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Type to search companies..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                {isDropdownOpen && filteredCompanies.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCompanies.slice(0, 10).map((company: any) => (
                      <div
                        key={company._id}
                        onClick={() => handleCompanySelect(company)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-gray-600">{company.headquarters}, {company.country}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleChangeCompany}
                  disabled={!selectedCompanyId}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send New Request
                </button>
                <button
                  onClick={() => {
                    setShowChangeCompany(false);
                    setSelectedCompanyId("");
                    setSearchTerm("");
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Company Verification</h2>
      <p className="text-gray-600 mb-4">
        To participate in job exchanges, you need to be verified by your company.
        Select your company below and request verification.
      </p>

      <div className="space-y-4">
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium mb-2">Search and Select Your Company</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
              if (!e.target.value) setSelectedCompanyId("");
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Type to search companies..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          {isDropdownOpen && filteredCompanies.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredCompanies.slice(0, 10).map((company: any) => (
                <div
                  key={company._id}
                  onClick={() => handleCompanySelect(company)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-gray-600">{company.headquarters}, {company.country}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleRequestVerification}
          disabled={!selectedCompanyId}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Request Verification
        </button>
      </div>
    </div>
  );
}

export function IncomingApplications() {
  const incomingApplications = useQuery(api.exchanges.getIncomingApplications);
  const respondToSwapRequest = useMutation(api.exchanges.respondToSwapRequest);

  const handleResponse = async (exchangeId: string, response: "accept" | "decline") => {
    try {
      await respondToSwapRequest({ 
        exchangeId: exchangeId as any,
        response
      });
      toast.success(response === "accept" ? "Swap request accepted!" : "Swap request declined.");
    } catch (error: any) {
      toast.error(error.message || "Failed to respond to swap request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">📥 Incoming Swap Requests</h2>
        <p className="text-blue-700 text-sm">
          These are requests from other employees who want to swap positions with you. 
          When you accept a request, both companies will need to approve the exchange.
        </p>
      </div>
      
      {!incomingApplications?.length ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No incoming swap requests yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            When someone applies for a position you're in, you'll see their request here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {incomingApplications.map(application => (
            <div key={application._id} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">
                🔄 Swap Request from {application.fromEmployee?.firstName} {application.fromEmployee?.lastName}
              </h3>
              
              <div className="space-y-6 mb-4">
                {/* Employee A's Job Posting Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">📋 Their Job Position (What you'd be doing at their company):</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-800 mb-1">
                        <strong>Company:</strong> {application.fromCompany?.name}
                      </p>
                      <p className="text-blue-800 mb-1">
                        <strong>Position:</strong> {application.fromSwap?.title}
                      </p>
                      <p className="text-blue-800 mb-1">
                        <strong>Location:</strong> {application.fromSwap?.location}, {application.fromSwap?.country}
                      </p>
                      <p className="text-blue-800 mb-1">
                        <strong>Duration:</strong> {application.fromSwap?.duration}
                      </p>
                    </div>
                    <div>
                      {application.fromSwap?.requirements && application.fromSwap.requirements.length > 0 && (
                        <>
                          <p className="text-blue-800 font-medium mb-1">Requirements:</p>
                          <ul className="text-blue-700 text-sm">
                            {application.fromSwap.requirements.map((req, index) => (
                              <li key={index}>• {req}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                  {application.fromSwap?.description && (
                    <div className="mt-3">
                      <p className="text-blue-800 font-medium mb-1">Job Description:</p>
                      <p className="text-blue-700 text-sm">{application.fromSwap.description}</p>
                    </div>
                  )}
                  {application.fromSwap?.benefits && application.fromSwap.benefits.length > 0 && (
                    <div className="mt-3">
                      <p className="text-blue-800 font-medium mb-1">Benefits:</p>
                      <ul className="text-blue-700 text-sm">
                        {application.fromSwap.benefits.map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Employee A's Personal Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">👤 About {application.fromEmployee?.firstName}:</h4>
                    <p className="text-gray-600 mb-1">
                      <strong>Experience:</strong> {application.fromEmployee?.experience}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Current Role:</strong> {application.fromEmployee?.jobTitle}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🛠️ Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {application.fromEmployee?.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {application.fromEmployee?.bio && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">💬 About {application.fromEmployee?.firstName}:</h4>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">{application.fromEmployee.bio}</p>
                  </div>
                )}
              </div>

              {application.message && (
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm text-gray-600"><strong>Their message:</strong></p>
                  <p className="text-gray-700">{application.message}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleResponse(application._id, "accept")}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Accept Swap Request
                </button>
                <button
                  onClick={() => handleResponse(application._id, "decline")}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Decline
                </button>
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  💡 If you accept, both companies will need to approve the exchange before it's finalized.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
