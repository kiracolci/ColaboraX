import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function EmployeeSwapRequests() {
  // This component is deprecated - functionality moved to ExchangeManagement
  const requests: any[] = [];
  const respondToRequest = useMutation(api.exchanges.respondToExchange);

  const handleResponse = async (requestId: string, status: "approved" | "rejected") => {
    try {
      await respondToRequest({ exchangeId: requestId as any, status });
      toast.success(`Request ${status} successfully!`);
    } catch (error) {
      toast.error("Failed to respond to request");
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
        return "Pending Your Approval";
      case "approved_by_from_company":
        return "Approved - Waiting for Target Company";
      case "approved_by_both_companies":
        return "Approved by Both Companies";
      case "completed":
        return "Swap Completed";
      case "cancelled":
        return "Cancelled by Employee";
      case "rejected_by_from_company":
        return "Rejected by You";
      case "rejected_by_to_company":
        return "Rejected by Target Company";
      default:
        return status;
    }
  };

  if (!requests?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No swap requests from your employees at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Employee Swap Requests</h2>
      <p className="text-gray-600">
        These are swap requests made by your employees. You need to approve them before the target company can review.
      </p>
      
      {requests.map((request: any) => (
        <div key={request._id} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {request.fromEmployee?.firstName} {request.fromEmployee?.lastName} wants to swap
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Position:</h4>
                  <p className="text-gray-600">
                    <strong>Title:</strong> {request.fromEmployee?.jobTitle}
                  </p>
                  <p className="text-gray-600">
                    <strong>Experience:</strong> {request.fromEmployee?.experience}
                  </p>
                  <p className="text-gray-600">
                    <strong>Skills:</strong> {request.fromEmployee?.skills.join(", ")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Target Position:</h4>
                  <p className="text-gray-600">
                    <strong>Title:</strong> {request.toSwap?.title}
                  </p>
                  <p className="text-gray-600">
                    <strong>Company:</strong> {request.toCompany?.name}
                  </p>
                  <p className="text-gray-600">
                    <strong>Location:</strong> {request.toSwap?.location}, {request.toSwap?.country}
                  </p>
                  <p className="text-gray-600">
                    <strong>Duration:</strong> {request.toSwap?.duration}
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
              
              {request.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(request._id, "approved")}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Approve
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
              <p className="text-sm text-gray-600"><strong>Message from employee:</strong></p>
              <p className="text-gray-700">{request.message}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
