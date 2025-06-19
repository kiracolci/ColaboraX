import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function SwapRequestsManager() {
  const requests: any[] = [];
  const respondToRequest = useMutation(api.exchanges.respondToExchange);

  const handleResponse = async (exchangeId: string, status: "approved" | "rejected") => {
    try {
      await respondToRequest({ exchangeId: exchangeId as any, status });
      toast.success(`Exchange ${status} successfully!`);
    } catch (error) {
      toast.error("Failed to respond to exchange");
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved_by_from_company":
        return "bg-blue-100 text-blue-800";
      case "approved_by_both_companies":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "rejected_by_from_company":
      case "rejected_by_to_company":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Waiting for Employee's Company Approval";
      case "approved_by_from_company":
        return "Pending Your Approval";
      case "approved_by_both_companies":
        return "Approved - Awaiting Employee Acceptance";
      case "completed":
        return "Swap Completed";
      case "cancelled":
        return "Cancelled";
      case "rejected_by_from_company":
        return "Rejected by Employee's Company";
      case "rejected_by_to_company":
        return "Rejected by You";
      default:
        return status;
    }
  };

  if (!requests?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No swap requests for your positions at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Position Swap Requests</h2>
      <p className="text-gray-600">
        These are requests from other companies' employees to swap with your positions.
      </p>
      
      {requests.map((request: any) => (
        <div key={request._id} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Exchange for: {request.toSwap?.title}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Applicant:</h4>
                  <p className="text-gray-600">
                    <strong>Name:</strong> {request.fromEmployee?.firstName} {request.fromEmployee?.lastName}
                  </p>
                  <p className="text-gray-600">
                    <strong>Current Position:</strong> {request.fromSwap?.title}
                  </p>
                  <p className="text-gray-600">
                    <strong>Company:</strong> {request.fromCompany?.name}
                  </p>
                  <p className="text-gray-600">
                    <strong>Location:</strong> {request.fromSwap?.location}, {request.fromSwap?.country}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Employee Details:</h4>
                  <p className="text-gray-600">
                    <strong>Experience:</strong> {request.fromEmployee?.experience}
                  </p>
                  <p className="text-gray-600">
                    <strong>Skills:</strong> {request.fromEmployee?.skills.join(", ")}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-3">
                <strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded text-sm ${getStatusColor(request.status)}`}>
                {getStatusText(request.status)}
              </span>
              
              {(request.status === "pending" || request.status === "approved_by_from_company") && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(request._id, "approved")}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleResponse(request._id, "rejected")}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {request.message && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600"><strong>Message from applicant:</strong></p>
              <p className="text-gray-700">{request.message}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
