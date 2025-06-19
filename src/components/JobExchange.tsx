import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function JobExchange() {
  const jobSwaps = useQuery(api.jobSwaps.getAvailableOpportunities);
  const createExchange = useMutation(api.exchanges.create);

  const handleRequestExchange = async (jobSwapId: string) => {
    try {
      await createExchange({ toSwapId: jobSwapId as any });
      toast.success("Exchange request sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send exchange request");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Available Job Exchanges</h2>
      <p className="text-gray-600">
        Browse job opportunities from other companies and request exchanges.
      </p>

      {jobSwaps?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No job exchanges available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobSwaps?.map(jobSwap => (
            <div key={jobSwap._id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{jobSwap.title}</h3>
                  <p className="text-gray-600 mb-1">
                    <strong>Company:</strong> {jobSwap.company?.name}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Location:</strong> {jobSwap.location}, {jobSwap.country}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Duration:</strong> {jobSwap.duration}
                  </p>

                </div>
                <button
                  onClick={() => handleRequestExchange(jobSwap._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Request Exchange
                </button>
              </div>

              <p className="text-gray-700 mb-4">{jobSwap.description}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Requirements:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {jobSwap.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                {jobSwap.benefits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Benefits:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {jobSwap.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {jobSwap.currentEmployee && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Current Employee:</strong> {jobSwap.currentEmployee.firstName} {jobSwap.currentEmployee.lastName}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
