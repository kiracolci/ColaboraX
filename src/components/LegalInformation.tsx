import { useState } from "react";

interface LegalInformationProps {
  userType?: "company" | "employee" | "general";
}

export function LegalInformation({ userType = "general" }: LegalInformationProps) {
  const [activeTab, setActiveTab] = useState<"contracts" | "insurance" | "compliance">("contracts");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#ffa731] border-opacity-20 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1f1f1f] mb-2">Legal Framework & Protection</h2>
        <p className="text-[#333] text-sm">
          Understanding the legal aspects of international job exchanges within the EU
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("contracts")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "contracts"
              ? "border-[#ffa731] text-[#ffa731]"
              : "border-transparent text-[#333] hover:text-[#ffa731]"
          }`}
        >
          Contracts & Agreements
        </button>
        <button
          onClick={() => setActiveTab("insurance")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "insurance"
              ? "border-[#ffa731] text-[#ffa731]"
              : "border-transparent text-[#333] hover:text-[#ffa731]"
          }`}
        >
          Insurance & Coverage
        </button>
        <button
          onClick={() => setActiveTab("compliance")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "compliance"
              ? "border-[#ffa731] text-[#ffa731]"
              : "border-transparent text-[#333] hover:text-[#ffa731]"
          }`}
        >
          EU Compliance
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4 text-sm text-[#333]">
        {activeTab === "contracts" && (
          <div className="space-y-4">
            <div className="bg-[#ffa731] bg-opacity-10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#1f1f1f] mb-2">📋 Employment Contract Framework</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Temporary Assignment Agreements:</strong> All exchanges operate under temporary assignment contracts that maintain your original employment relationship</li>
                <li><strong>Dual Employment Protection:</strong> Your home position remains secured while you work temporarily abroad</li>
                <li><strong>Clear Terms & Duration:</strong> Exchange periods are clearly defined (typically 3-12 months) with specific start and end dates</li>
                <li><strong>Salary & Benefits:</strong> Compensation arrangements are pre-negotiated and documented in the exchange agreement</li>
              </ul>
            </div>

            {userType === "company" && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-[#1f1f1f] mb-2">For Companies:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Standardized exchange agreements reduce legal complexity</li>
                  <li>Clear liability frameworks protect both sending and receiving companies</li>
                  <li>Intellectual property and confidentiality clauses are built-in</li>
                  <li>Termination procedures are clearly defined for all parties</li>
                </ul>
              </div>
            )}

            {userType === "employee" && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-[#1f1f1f] mb-2">For Employees:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Your original employment contract remains active and protected</li>
                  <li>Return rights are guaranteed in writing</li>
                  <li>Working conditions and rights are clearly documented</li>
                  <li>Dispute resolution mechanisms are established</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "insurance" && (
          <div className="space-y-4">
            <div className="bg-[#ffa731] bg-opacity-10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#1f1f1f] mb-2">🛡️ Comprehensive Insurance Coverage</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Health Insurance:</strong> EU health insurance coordination ensures continuous coverage across member states</li>
                <li><strong>Professional Liability:</strong> Coverage for work-related activities and professional responsibilities</li>
                <li><strong>Travel & Accommodation:</strong> Insurance for travel, temporary housing, and personal belongings</li>
                <li><strong>Emergency Repatriation:</strong> Coverage for emergency return to home country if needed</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-[#1f1f1f] mb-2">Health & Safety:</h4>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>European Health Insurance Card (EHIC) validity</li>
                  <li>Workplace accident coverage</li>
                  <li>Mental health support services</li>
                  <li>Emergency medical evacuation</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-[#1f1f1f] mb-2">Professional Protection:</h4>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Errors & omissions coverage</li>
                  <li>Cyber liability protection</li>
                  <li>Legal defense coverage</li>
                  <li>Professional indemnity insurance</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="space-y-4">
            <div className="bg-[#ffa731] bg-opacity-10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#1f1f1f] mb-2">🇪🇺 EU Legal Compliance</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Posted Workers Directive:</strong> Full compliance with EU regulations for temporary worker assignments</li>
                <li><strong>GDPR Compliance:</strong> All personal data handling meets strict European privacy standards</li>
                <li><strong>Social Security Coordination:</strong> Seamless social security coverage across EU member states</li>
                <li><strong>Tax Obligations:</strong> Clear guidance on tax responsibilities in both home and host countries</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="border-l-4 border-[#ffa731] pl-4">
                <h4 className="font-semibold text-[#1f1f1f]">Work Authorization</h4>
                <p className="text-xs">EU citizens have the right to work in any EU member state. No additional work permits required for temporary assignments.</p>
              </div>
              <div className="border-l-4 border-[#ffa731] pl-4">
                <h4 className="font-semibold text-[#1f1f1f]">Social Security</h4>
                <p className="text-xs">A1 certificates ensure you remain covered by your home country's social security system during temporary assignments.</p>
              </div>
              <div className="border-l-4 border-[#ffa731] pl-4">
                <h4 className="font-semibold text-[#1f1f1f]">Tax Coordination</h4>
                <p className="text-xs">Double taxation agreements prevent paying taxes in both countries. Clear guidance provided for each exchange.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-[#ffa731] bg-opacity-10 p-3 rounded-lg">
          <p className="text-xs text-[#2d2d2d]">
            <strong>Need Legal Assistance?</strong> Our legal team provides support throughout your exchange. 
            Contact us at <span className="font-semibold">legal@jobswaparound.com</span> or through your dashboard for personalized guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
