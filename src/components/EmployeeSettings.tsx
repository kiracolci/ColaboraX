import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";

export function EmployeeSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  const employee = useQuery(api.employees.getMyProfile);
  const updateProfile = useMutation(api.employees.update);
  const deleteProfile = useMutation(api.employees.deleteProfile);
  const { signOut } = useAuthActions();

  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    jobTitle: employee?.jobTitle || "",
    experience: employee?.experience || "",
    skills: employee?.skills?.join(", ") || "",
    bio: employee?.bio || "",
    languages: employee?.languages || [],
    desiredDestinations: employee?.desiredDestinations || [],
  });

  // Update form data when employee data loads
  if (employee && !isEditing) {
    const newFormData = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      jobTitle: employee.jobTitle,
      experience: employee.experience,
      skills: employee.skills.join(", "),
      bio: employee.bio,
      languages: employee.languages || [],
      desiredDestinations: employee.desiredDestinations || [],
    };
    
    // Only update if data has actually changed
    if (JSON.stringify(newFormData) !== JSON.stringify(formData)) {
      setFormData(newFormData);
    }
  }

  const handleSave = async () => {
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        jobTitle: formData.jobTitle,
        experience: formData.experience,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s),
        bio: formData.bio,
        languages: formData.languages,
        desiredDestinations: formData.desiredDestinations,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' to confirm");
      return;
    }

    try {
      await deleteProfile();
      toast.success("Account deleted successfully");
      
      // Sign out and redirect to homepage
      await signOut();
      
      // Force redirect to homepage
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  const addLanguage = () => {
    setFormData({
      ...formData,
      languages: [...formData.languages, { language: "", proficiency: "basic" as const }]
    });
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const newLanguages = [...formData.languages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    setFormData({ ...formData, languages: newLanguages });
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index)
    });
  };

  const addDestination = () => {
    setFormData({
      ...formData,
      desiredDestinations: [...formData.desiredDestinations, { country: "", priority: 3 }]
    });
  };

  const updateDestination = (index: number, field: string, value: string | number) => {
    const newDestinations = [...formData.desiredDestinations];
    newDestinations[index] = { ...newDestinations[index], [field]: value };
    setFormData({ ...formData, desiredDestinations: newDestinations });
  };

  const removeDestination = (index: number) => {
    setFormData({
      ...formData,
      desiredDestinations: formData.desiredDestinations.filter((_, i) => i !== index)
    });
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Profile Settings</h2>
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
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    jobTitle: employee.jobTitle,
                    experience: employee.experience,
                    skills: employee.skills.join(", "),
                    bio: employee.bio,
                    languages: employee.languages || [],
                    desiredDestinations: employee.desiredDestinations || [],
                  });
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Job Title</label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Experience</label>
          <input
            type="text"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
            placeholder="e.g., 5+ years"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
            placeholder="e.g., JavaScript, React, Node.js"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Languages Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">Languages</label>
            {isEditing && (
              <button
                onClick={addLanguage}
                className="text-primary hover:text-primary-hover text-sm"
              >
                + Add Language
              </button>
            )}
          </div>
          <div className="space-y-2">
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => updateLanguage(index, "language", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Language"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
                />
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateLanguage(index, "proficiency", e.target.value)}
                  disabled={!isEditing}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
                >
                  <option value="basic">Basic</option>
                  <option value="conversational">Conversational</option>
                  <option value="fluent">Fluent</option>
                  <option value="native">Native</option>
                </select>
                {isEditing && (
                  <button
                    onClick={() => removeLanguage(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desired Destinations Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">Desired Destinations</label>
            {isEditing && (
              <button
                onClick={addDestination}
                className="text-primary hover:text-primary-hover text-sm"
              >
                + Add Destination
              </button>
            )}
          </div>
          <div className="space-y-2">
            {formData.desiredDestinations.map((dest, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={dest.country}
                  onChange={(e) => updateDestination(index, "country", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Country"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
                />
                <select
                  value={dest.priority}
                  onChange={(e) => updateDestination(index, "priority", parseInt(e.target.value))}
                  disabled={!isEditing}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
                >
                  <option value={1}>Low Priority</option>
                  <option value={2}>Medium-Low</option>
                  <option value={3}>Medium</option>
                  <option value={4}>Medium-High</option>
                  <option value={5}>High Priority</option>
                </select>
                {isEditing && (
                  <button
                    onClick={() => removeDestination(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
        <p className="text-red-700 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-gray-700 mb-4">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <p className="text-gray-700 mb-4">
              Type <strong>DELETE MY ACCOUNT</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="DELETE MY ACCOUNT"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== "DELETE MY ACCOUNT"}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Account
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
