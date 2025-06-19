import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ExchangeRequests() {
  const exchanges: any[] = [];
  const respondToExchange = useMutation(api.exchanges.respondToExchange);

  const handleRespond = async (exchangeId: string, status: "approved" | "rejected") => {
    try {
      await respondToExchange({ exchangeId: exchangeId as any, status });
      toast.success(`Exchange ${status} successfully!`);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} exchange`);
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
      case "rejected_by_from_company":
      case "rejected_by_to_company":
      case "rejected_by_from_employee":
      case "rejected_by_to_employee":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "approved_by_from_company":
        return "Approved by Requesting Company";
      case "approved_by_both_companies":
        return "Approved by Both Companies";
      case "accepted_by_from_employee":
        return "Accepted by Requesting Employee";
      case "completed":
        return "Completed";
      case "rejected_by_from_company":
        return "Rejected by Requesting Company";
      case "rejected_by_to_company":
        return "Rejected by Your Company";
      case "rejected_by_from_employee":
        return "Rejected by Requesting Employee";
      case "rejected_by_to_employee":
        return "Rejected by Your Employee";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const canRespond = (exchange: any) => {
    if (exchange.isFromCompany && exchange.status === "pending") {
      return true;
    }
    if (exchange.isToCompany && exchange.status === "approved_by_from_company") {
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Exchange Requests</h2>

      {exchanges?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No exchange requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exchanges?.map((exchange: any) => (
            <div key={exchange._id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">
                    {exchange.isFromCompany ? "Outgoing" : "Incoming"} Exchange Request
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">From:</p>
                      <p className="text-gray-700">{exchange.fromCompany?.name}</p>
                      <p className="text-gray-600">{exchange.fromSwap?.title}</p>
                      <p className="text-gray-600">{exchange.fromSwap?.location}, {exchange.fromSwap?.country}</p>
                      {exchange.fromEmployee && (
                        <p className="text-sm text-gray-600">
                          Employee: {exchange.fromEmployee.firstName} {exchange.fromEmployee.lastName}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">To:</p>
                      <p className="text-gray-700">{exchange.toCompany?.name}</p>
                      <p className="text-gray-600">{exchange.toSwap?.title}</p>
                      <p className="text-gray-600">{exchange.toSwap?.location}, {exchange.toSwap?.country}</p>
                      {exchange.toEmployee && (
                        <p className="text-sm text-gray-600">
                          Employee: {exchange.toEmployee.firstName} {exchange.toEmployee.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {exchange.message && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900">Message:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">{exchange.message}</p>
                    </div>
                  )}

                  <p className="text-sm text-gray-500">
                    Requested: {new Date(exchange.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(exchange.status)}`}>
                    {getStatusText(exchange.status)}
                  </span>

                  {canRespond(exchange) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(exchange._id, "approved")}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRespond(exchange._id, "rejected")}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Timeline:</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• Created: {new Date(exchange.createdAt).toLocaleString()}</p>
                  {exchange.fromCompanyApprovedAt && (
                    <p>• Approved by requesting company: {new Date(exchange.fromCompanyApprovedAt).toLocaleString()}</p>
                  )}
                  {exchange.toCompanyApprovedAt && (
                    <p>• Approved by target company: {new Date(exchange.toCompanyApprovedAt).toLocaleString()}</p>
                  )}
                  {exchange.fromEmployeeAcceptedAt && (
                    <p>• Accepted by requesting employee: {new Date(exchange.fromEmployeeAcceptedAt).toLocaleString()}</p>
                  )}
                  {exchange.toEmployeeAcceptedAt && (
                    <p>• Accepted by target employee: {new Date(exchange.toEmployeeAcceptedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
