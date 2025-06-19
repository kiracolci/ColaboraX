import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function JobPositionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    country: "",
    duration: "",
  });

  const createPosition = useMutation(api.jobSwaps.create);
  const company = useQuery(api.companies.getMyCompany);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // This component is deprecated - use JobPostings instead
      throw new Error("This component is no longer used. Please use the Job Postings tab instead.");
      toast.success("Job position created successfully!");
      setFormData({
        title: "",
        description: "",
        requirements: "",
        location: "",
        country: "",
        duration: "",
      });
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create position");
      console.error(error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        + Create New Position
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Create Job Position</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Job Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Graphic Designer, Software Engineer"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={company?.headquarters || "City"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={company?.country || "Country"}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Duration</label>
          <select
            required
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select duration</option>
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="1 year">1 year</option>
            <option value="2 years">2 years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Requirements (comma-separated)</label>
          <input
            type="text"
            required
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 3+ years experience, Adobe Creative Suite, Portfolio required"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Job Description</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the role and responsibilities..."
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Position
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
