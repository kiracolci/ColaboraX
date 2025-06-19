import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ExchangeManagement() {
  const user = useQuery(api.auth.loggedInUser);
  const company = useQuery(api.companies.getMyCompany);
  const exchanges = useQuery(api.companyExchanges.getExchangesForCompany);
  const respondToExchange = useMutation(api.exchanges.respondToExchange);

  const handleResponse = async (exchangeId: string, status: "approved" | "rejected") => {
    try {
      await respondToExchange({
        exchangeId: exchangeId as any,
        status,
      });
      toast.success(`Exchange ${status} successfully`);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} exchange`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "mutual_interest":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected_by_from_company":
      case "rejected_by_to_company":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "mutual_interest":
        return "Mutual Interest - Awaiting Approval";
      case "completed":
        return "Exchange Completed";
      case "rejected_by_from_company":
        return "Rejected by Requesting Company";
      case "rejected_by_to_company":
        return "Rejected by Target Company";
      default:
        return status;
    }
  };

  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You need to register a company first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Exchange Requests</h2>
      
      {!exchanges?.length ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No exchange requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exchanges.map((exchange) => {
            const isFromCompany = exchange.fromCompanyId === company._id;
            const isToCompany = exchange.toCompanyId === company._id;
            const needsApproval = exchange.status === "mutual_interest" && 
              ((isFromCompany && !exchange.fromCompanyApprovedAt) || 
               (isToCompany && !exchange.toCompanyApprovedAt));

            return (
              <div key={exchange._id} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Exchange Request: {exchange.fromSwap?.title} ↔ {exchange.toSwap?.title}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">From Position:</h4>
                        <p className="text-gray-600">
                          <strong>Company:</strong> {exchange.fromCompany?.name}
                        </p>
                        <p className="text-gray-600">
                          <strong>Employee:</strong> {exchange.fromEmployee?.firstName} {exchange.fromEmployee?.lastName}
                        </p>
                        <p className="text-gray-600">
                          <strong>Location:</strong> {exchange.fromSwap?.location}, {exchange.fromSwap?.country}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">To Position:</h4>
                        <p className="text-gray-600">
                          <strong>Company:</strong> {exchange.toCompany?.name}
                        </p>
                        {exchange.toEmployee && (
                          <p className="text-gray-600">
                            <strong>Employee:</strong> {exchange.toEmployee.firstName} {exchange.toEmployee.lastName}
                          </p>
                        )}
                        <p className="text-gray-600">
                          <strong>Location:</strong> {exchange.toSwap?.location}, {exchange.toSwap?.country}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded text-sm ${getStatusColor(exchange.status)}`}>
                    {getStatusText(exchange.status)}
                  </span>
                </div>

                {exchange.message && (
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="text-sm text-gray-600"><strong>Message:</strong></p>
                    <p className="text-gray-700">{exchange.message}</p>
                  </div>
                )}

                {needsApproval && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleResponse(exchange._id, "approved")}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Approve Exchange
                    </button>
                    <button
                      onClick={() => handleResponse(exchange._id, "rejected")}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Reject Exchange
                    </button>
                  </div>
                )}

                {exchange.status === "completed" && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <p className="text-sm text-green-800">
                      ✅ Exchange completed! A chat has been created for all parties to coordinate the swap details.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
