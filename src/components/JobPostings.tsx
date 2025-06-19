import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian",
  "Chinese (Mandarin)", "Japanese", "Korean", "Arabic", "Hindi", "Swedish", "Norwegian",
  "Danish", "Finnish", "Polish", "Czech", "Hungarian", "Romanian", "Bulgarian", "Greek",
  "Turkish", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay", "Tagalog"
];

const PROFICIENCY_LEVELS = [
  { value: "basic", label: "Basic" },
  { value: "conversational", label: "Conversational" },
  { value: "fluent", label: "Fluent" },
  { value: "native", label: "Native" }
];

export function JobPostings() {
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const jobSwaps = useQuery(api.jobSwaps.getMyCompanyJobSwaps);
  const employees = useQuery(api.employees.getMyEmployees);
  const createJobSwap = useMutation(api.jobSwaps.create);
  const updateJobSwap = useMutation(api.jobSwaps.update);
  const deleteJobSwap = useMutation(api.jobSwaps.delete_);
  const toggleActive = useMutation(api.jobSwaps.toggleActive);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    country: "",
    duration: "",
    benefits: "",
    employeeId: "",
    startDate: "",
    endDate: "",
    requiredLanguages: [] as Array<{ language: string; proficiency: "native" | "fluent" | "conversational" | "basic" }>,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: "",
      location: "",
      country: "",
      duration: "",
      benefits: "",
      employeeId: "",
      startDate: "",
      endDate: "",
      requiredLanguages: [] as Array<{ language: string; proficiency: "native" | "fluent" | "conversational" | "basic" }>,
    });
    setShowForm(false);
    setEditingJob(null);
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements.join(", "),
      location: job.location,
      country: job.country,
      duration: job.duration,
      benefits: job.benefits.join(", "),
      employeeId: job.employeeId,
      startDate: job.startDate || "",
      endDate: job.endDate || "",
      requiredLanguages: job.requiredLanguages || [],
    });
    setShowForm(true);
  };

  const addLanguageRequirement = () => {
    setFormData({
      ...formData,
      requiredLanguages: [...formData.requiredLanguages, { language: "", proficiency: "conversational" as const }]
    });
  };

  const removeLanguageRequirement = (index: number) => {
    setFormData({
      ...formData,
      requiredLanguages: formData.requiredLanguages.filter((_, i) => i !== index)
    });
  };

  const updateLanguageRequirement = (index: number, field: string, value: string) => {
    const updated = [...formData.requiredLanguages];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, requiredLanguages: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      toast.error("Please select an employee for this position");
      return;
    }

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.split(",").map(r => r.trim()).filter(r => r),
        requiredLanguages: formData.requiredLanguages.filter(lang => lang.language && lang.proficiency),
        location: formData.location,
        country: formData.country,
        duration: formData.duration,
        benefits: formData.benefits.split(",").map(b => b.trim()).filter(b => b),
        employeeId: formData.employeeId as any,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };

      if (editingJob) {
        await updateJobSwap({
          id: editingJob._id,
          ...jobData,
        });
        toast.success("Job swap updated successfully!");
      } else {
        await createJobSwap(jobData);
        toast.success("Job swap posted successfully!");
      }
      
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save job swap");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this job swap?")) {
      try {
        await deleteJobSwap({ id: id as any });
        toast.success("Job swap deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete job swap");
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleActive({ id: id as any, isActive: !isActive });
      toast.success(`Job swap ${!isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update job swap status");
    }
  };

  // Get employees that don't have active job postings
  const availableEmployees = employees?.filter(employee => 
    !jobSwaps?.some(job => job.employeeId === employee._id && job.isActive)
  ) || [];

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editingJob ? "Edit Job Swap" : "Post New Job Swap"}
          </h2>
          <button
            onClick={resetForm}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to listings
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Employee *</label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select an employee</option>
                {editingJob && (
                  <option value={editingJob.employeeId}>
                    {editingJob.employee?.firstName} {editingJob.employee?.lastName} - {editingJob.employee?.jobTitle} (Current)
                  </option>
                )}
                {availableEmployees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} - {employee.jobTitle}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Each employee can only have one active job posting at a time.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the position and what the exchange would involve..."
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <input
              type="text"
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 6 months, 1 year, Flexible"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Requirements (comma-separated)</label>
            <input
              type="text"
              required
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 3+ years experience, JavaScript, Team leadership"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Required Languages</label>
              <button
                type="button"
                onClick={addLanguageRequirement}
                className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
              >
                + Add Language
              </button>
            </div>
            {formData.requiredLanguages.map((lang, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={lang.language}
                  onChange={(e) => updateLanguageRequirement(index, "language", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select language</option>
                  {LANGUAGES.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateLanguageRequirement(index, "proficiency", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PROFICIENCY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeLanguageRequirement(index)}
                  className="px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
            <p className="text-xs text-gray-500 mt-1">
              Specify language requirements for the position. Applicants must meet these requirements to apply.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Benefits (comma-separated)</label>
            <input
              type="text"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Housing allowance, Language training, Cultural immersion"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date (Optional)</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
            >
              {editingJob ? "Update Job Swap" : "Post Job Swap"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Job Swap Postings</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
          disabled={availableEmployees.length === 0}
        >
          Post New Job Swap
        </button>
      </div>

      {availableEmployees.length === 0 && !jobSwaps?.length && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You need verified employees to create job postings. Go to the "Employees" tab to verify your employees first.
          </p>
        </div>
      )}

      {!jobSwaps?.length ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No job swaps posted yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Post your first job swap opportunity to start connecting with international talent.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobSwaps.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {job.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{job.description}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Employee:</strong> {job.employee ? `${job.employee.firstName} ${job.employee.lastName}` : "Employee not found"}</p>
                      <p><strong>Location:</strong> {job.location}, {job.country}</p>
                      <p><strong>Duration:</strong> {job.duration}</p>
                    </div>
                    <div>
                      <p><strong>Requirements:</strong> {job.requirements.join(", ")}</p>
                      {job.requiredLanguages && job.requiredLanguages.length > 0 && (
                        <p><strong>Required Languages:</strong> {job.requiredLanguages.map(lang => `${lang.language} (${lang.proficiency})`).join(", ")}</p>
                      )}
                      {job.benefits.length > 0 && (
                        <p><strong>Benefits:</strong> {job.benefits.join(", ")}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(job._id, job.isActive)}
                    className={`px-3 py-1 rounded text-sm ${
                      job.isActive
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {job.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleEdit(job)}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
