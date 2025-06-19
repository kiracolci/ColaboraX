import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function CompanyEmployees() {
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const employees = useQuery(api.employees.getMyEmployees);
  const verificationRequests = useQuery(api.employees.getVerificationRequests);
  const verifyEmployee = useMutation(api.employees.verifyEmployee);
  const rejectEmployee = useMutation(api.employees.rejectEmployee);

  const handleVerificationResponse = async (employeeId: string, status: "approved" | "rejected") => {
    try {
      if (status === "approved") {
        await verifyEmployee({ employeeId: employeeId as any });
      } else {
        await rejectEmployee({ employeeId: employeeId as any });
      }
      toast.success(`Verification ${status} successfully`);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} verification`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Requests */}
      {verificationRequests && verificationRequests.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Pending Verification Requests</h2>
          <div className="space-y-4">
            {verificationRequests.map((request) => (
              <div key={request._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {request.firstName} {request.lastName}
                    </h3>
                    <p className="text-gray-600">{request.jobTitle}</p>
                    <p className="text-gray-600">{request.experience}</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Skills:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {request.skills?.map((skill: string, index: number) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {request.bio && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Bio:</p>
                        <p className="text-sm text-gray-600">{request.bio}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs text-center">
                      Waiting Approval
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerificationResponse(request._id, "approved")}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerificationResponse(request._id, "rejected")}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Employees */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Verified Employees</h2>
        
        {!employees?.length ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No verified employees yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Employees will appear here after you approve their verification requests.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee._id}
                employee={employee}
                onClick={() => setSelectedEmployee(employee)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}

function EmployeeCard({ 
  employee, 
  onClick 
}: {
  employee: any;
  onClick: () => void;
}) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow aspect-square flex flex-col justify-between"
      onClick={onClick}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
            ✓ Verified
          </span>
        </div>
        
        <h3 className="font-semibold text-sm mb-1 truncate">
          {employee.firstName} {employee.lastName}
        </h3>
        <p className="text-gray-600 text-xs mb-2 truncate">{employee.jobTitle}</p>
        <p className="text-gray-500 text-xs truncate">{employee.experience}</p>
      </div>

      
      <div className="mt-2">
        <div className="flex flex-wrap gap-1">
          {employee.skills.slice(0, 2).map((skill: string, index: number) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs truncate"
            >
              {skill}
            </span>
          ))}
          {employee.skills.length > 2 && (
            <span className="text-xs text-gray-500">
              +{employee.skills.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmployeeModal({ employee, onClose }: { employee: any; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">{employee.firstName} {employee.lastName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-3">
          <p><strong>Job Title:</strong> {employee.jobTitle}</p>
          <p><strong>Experience:</strong> {employee.experience}</p>
          <p><strong>Bio:</strong> {employee.bio}</p>
        </div>
      </div>
    </div>
  );
}
