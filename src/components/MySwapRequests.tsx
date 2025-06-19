import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function MySwapRequests() {
  const requests = useQuery(api.exchanges.getMyExchanges);
  const cancelApplication = useMutation(api.exchanges.cancelApplication);

  const getRequestData = (request: any) => {
    if (request.isFromEmployee) {
      return {
        title: request.toSwap?.title,
        location: request.toSwap?.location,
        country: request.toSwap?.country,
        duration: request.toSwap?.duration,
        employee: request.toEmployee,
        company: request.toCompany,
        isFromEmployee: true
      };
    } else {
      return {
        title: request.fromSwap?.title,
        location: request.fromSwap?.location,
        country: request.fromSwap?.country,
        duration: request.fromSwap?.duration,
        employee: request.fromEmployee,
        company: request.fromCompany,
        isFromEmployee: false
      };
    }
  };

  const handleCancel = async (exchangeId: string) => {
    try {
      await cancelApplication({ exchangeId: exchangeId as any });
      toast.success("Application cancelled successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel application");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_target_response":
        return "bg-yellow-100 text-yellow-800";
      case "mutual_interest":
        return "bg-blue-100 text-blue-800";
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
      case "pending_target_response":
        return "Waiting for Target Employee to Apply Back";
      case "mutual_interest":
        return "Mutual Interest - Waiting for Company Approval";
      case "completed":
        return "Exchange Completed - Chat Available";
      case "cancelled":
        return "Cancelled";
      case "rejected_by_from_company":
        return "Rejected by Your Company";
      case "rejected_by_to_company":
        return "Rejected by Target Company";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">My Swap Applications</h2>
        
        {!requests?.length ? (
          <div className="text-center py-8">
            <p className="text-gray-600">You haven't applied for any swaps yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Go to "Job Opportunities" to find positions you'd like to swap into.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => {
              const data = getRequestData(request);
              return (
              <div key={request._id} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {data.isFromEmployee 
                        ? `Application to ${data.company?.name}`
                        : `Exchange with ${data.company?.name}`
                      }
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {data.isFromEmployee ? "Target Position:" : "Their Position:"}
                        </h4>
                        <p className="text-gray-600">
                          <strong>Title:</strong> {data.title}
                        </p>
                        <p className="text-gray-600">
                          <strong>Location:</strong> {data.location}, {data.country}
                        </p>
                        <p className="text-gray-600">
                          <strong>Duration:</strong> {data.duration}
                        </p>
                        {data.employee && (
                          <p className="text-gray-600">
                            <strong>Employee:</strong> {data.employee.firstName} {data.employee.lastName}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Application Details:</h4>
                        <p className="text-gray-600">
                          <strong>Applied:</strong> {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        {request.status === "mutual_interest" && (
                          <p className="text-blue-600 font-medium">
                            ✨ Both employees are interested in swapping!
                          </p>
                        )}
                        {request.status === "completed" && (
                          <p className="text-green-600 font-medium">
                            🎉 Exchange approved! Check your chats to coordinate.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-sm ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                    {request.status !== "completed" && request.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(request._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                
                {request.message && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600"><strong>Your message:</strong></p>
                    <p className="text-gray-700">{request.message}</p>
                  </div>
                )}

                {/* Status-specific information */}
                {request.status === "pending_target_response" && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded">
                    <p className="text-sm text-yellow-800">
                      💡 The target employee has been notified about your interest. They can choose to apply for a swap to your position to create a mutual exchange.
                    </p>
                  </div>
                )}

                {request.status === "mutual_interest" && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                      🤝 Both you and {data.employee?.firstName} want to swap! Now both companies need to approve the exchange.
                    </p>
                  </div>
                )}

                {request.status === "completed" && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <p className="text-sm text-green-800">
                      ✅ Both companies have approved the exchange! A chat has been created with you, {data.employee?.firstName}, and {data.company?.name} to coordinate the swap details.
                    </p>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
