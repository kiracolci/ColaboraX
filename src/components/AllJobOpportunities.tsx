import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AllJobOpportunities() {
  const positions = useQuery(api.jobSwaps.getAllJobSwaps);

  if (!positions?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No job opportunities available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">All Job Opportunities</h2>
      <p className="text-gray-600">
        Browse all available positions from companies worldwide. This is a read-only view for companies to see what opportunities are available.
      </p>
      
      {positions.map(position => (
        <div key={position._id} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{position.title}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  position.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {position.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-gray-600 mb-1">
                <strong>Company:</strong> {position.company?.name}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Industry:</strong> {position.company?.industry}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Location:</strong> {position.location}, {position.country}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Duration:</strong> {position.duration}
              </p>
              {position.currentEmployee && (
                <p className="text-gray-600 mb-2">
                  <strong>Current Employee:</strong> {position.currentEmployee.firstName} {position.currentEmployee.lastName}
                </p>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 mb-3">{position.description}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
              <ul className="text-gray-600 text-sm">
                {position.requirements.map((req, index) => (
                  <li key={index}>• {req}</li>
                ))}
              </ul>
            </div>
            {position.benefits.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                <ul className="text-gray-600 text-sm">
                  {position.benefits.map((benefit, index) => (
                    <li key={index}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
