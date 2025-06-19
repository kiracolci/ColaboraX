import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function VerificationRequests() {
  const requests = useQuery(api.employees.getVerificationRequests);
  const verifyEmployee = useMutation(api.employees.verifyEmployee);
  const rejectEmployee = useMutation(api.employees.rejectEmployee);

  const handleResponse = async (employeeId: string, status: "approved" | "rejected") => {
    try {
      if (status === "approved") {
        await verifyEmployee({ employeeId: employeeId as any });
      } else {
        await rejectEmployee({ employeeId: employeeId as any });
      }
      toast.success(`Request ${status} successfully!`);
    } catch (error) {
      toast.error("Failed to respond to request");
      console.error(error);
    }
  };

  if (!requests?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No verification requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Employee Verification Requests</h2>
      
      {requests.map((request: any) => (
        <div key={request._id} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {request.employee?.firstName} {request.employee?.lastName}
              </h3>
              <p className="text-gray-600 mb-1">
                <strong>Job Title:</strong> {request.employee?.jobTitle}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Experience:</strong> {request.employee?.experience}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Skills:</strong> {request.employee?.skills.join(", ")}
              </p>
              <p className="text-gray-600 mb-3">
                <strong>Email:</strong> {request.user?.email}
              </p>
              <p className="text-gray-700">{request.employee?.bio}</p>
            </div>
            
            {request.status === "pending" && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleResponse(request._id, "approved")}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleResponse(request._id, "rejected")}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
            
            {request.status !== "pending" && (
              <span className={`px-3 py-1 rounded text-sm ${
                request.status === "approved" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {request.status}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
