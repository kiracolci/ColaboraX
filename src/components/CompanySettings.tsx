import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";

export function CompanySettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  const company = useQuery(api.companies.getMyCompany);
  const updateCompany = useMutation(api.companies.update);
  const deleteCompany = useMutation(api.companies.deleteProfile);
  const { signOut } = useAuthActions();

  const [formData, setFormData] = useState({
    name: company?.name || "",
    headquarters: company?.headquarters || "",
    country: company?.country || "",
    description: company?.description || "",
    industry: company?.industry || "",
    size: company?.size || "",
    website: company?.website || "",
  });

  // Update form data when company data loads
  if (company && !isEditing) {
    const newFormData = {
      name: company.name,
      headquarters: company.headquarters || "",
      country: company.country,
      description: company.description,
      industry: company.industry,
      size: company.size || "",
      website: company.website || "",
    };
    
    // Only update if data has actually changed
    if (JSON.stringify(newFormData) !== JSON.stringify(formData)) {
      setFormData(newFormData);
    }
  }

  const handleSave = async () => {
    try {
      await updateCompany({
        name: formData.name,
        headquarters: formData.headquarters,
        country: formData.country,
        description: formData.description,
        industry: formData.industry,
        size: formData.size,
        website: formData.website,
      });
      toast.success("Company profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update company profile");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== "DELETE MY COMPANY") {
      toast.error("Please type 'DELETE MY COMPANY' to confirm");
      return;
    }

    try {
      await deleteCompany();
      toast.success("Company account deleted successfully");
      
      // Sign out and redirect to homepage
      await signOut();
      
      // Force redirect to homepage
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Failed to delete company account");
    }
  };

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Company Settings</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data
                  setFormData({
                    name: company.name,
                    headquarters: company.headquarters || "",
                    country: company.country,
                    description: company.description,
                    industry: company.industry,
                    size: company.size || "",
                    website: company.website || "",
                  });
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Headquarters</label>
              <input
                type="text"
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company Size</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
              placeholder="https://www.company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
              placeholder="Describe your company..."
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
        <p className="text-red-700 mb-4">
          Once you delete your company account, there is no going back. This will also remove all associated employees and job postings. Please be certain.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Company Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">
              Confirm Company Account Deletion
            </h3>
            <p className="text-gray-700 mb-4">
              This action cannot be undone. This will permanently delete your company account, all associated employees, job postings, and remove all data from our servers.
            </p>
            <p className="text-gray-700 mb-4">
              Type <strong>DELETE MY COMPANY</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="DELETE MY COMPANY"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== "DELETE MY COMPANY"}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Company Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
