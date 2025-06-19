import { useState } from "react";
import { useMutation } from "convex/react";
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

interface EmployeeRegistrationProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export function EmployeeRegistration({ onComplete, onBack }: EmployeeRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    experience: "",
    skills: "",
    bio: "",
    languages: [] as Array<{ language: string; proficiency: "native" | "fluent" | "conversational" | "basic" }>,
    desiredDestinations: [] as Array<{ country: string; priority: number }>,
  });

  const createEmployee = useMutation(api.employees.create);

  const addLanguage = () => {
    setFormData({
      ...formData,
      languages: [...formData.languages, { language: "", proficiency: "conversational" as const }]
    });
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index)
    });
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const updated = [...formData.languages];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, languages: updated });
  };

  const addDestination = () => {
    setFormData({
      ...formData,
      desiredDestinations: [...formData.desiredDestinations, { country: "", priority: 3 }]
    });
  };

  const removeDestination = (index: number) => {
    setFormData({
      ...formData,
      desiredDestinations: formData.desiredDestinations.filter((_, i) => i !== index)
    });
  };

  const updateDestination = (index: number, field: string, value: string | number) => {
    const updated = [...formData.desiredDestinations];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, desiredDestinations: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createEmployee({
        firstName: formData.firstName,
        lastName: formData.lastName,
        jobTitle: formData.jobTitle,
        experience: formData.experience,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s),
        languages: formData.languages.filter(lang => lang.language && lang.proficiency),
        bio: formData.bio,
        desiredDestinations: formData.desiredDestinations.filter(dest => dest.country),
      });
      
      toast.success("Employee profile created successfully!");
      
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to create employee profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
            ✓
          </div>
          <div className="w-12 h-1 bg-[#ffa731]"></div>
          <div className="w-8 h-8 rounded-full bg-[#ffa731] text-[#2d2d2d] flex items-center justify-center text-sm font-medium">
            2
          </div>
        </div>
        <span className="ml-4 text-sm text-[#333]">Step 2 of 2</span>
      </div>

      {onBack && (
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="text-[#ffa731] hover:text-[#ea580c] flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#ffa731] hover:bg-opacity-10 transition-colors text-sm"
          >
            ← Back to user type selection
          </button>
        </div>
      )}
      
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Complete Your Profile</h2>
        <p className="text-[#333] mt-1 text-sm">Tell us about yourself to find perfect opportunities</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-[#ffa731] border-opacity-20">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">First Name *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Last Name *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Job Title *</label>
          <input
            type="text"
            required
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
            placeholder="e.g., Software Engineer, Marketing Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Experience Level *</label>
          <select
            required
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
          >
            <option value="">Select experience level</option>
            <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
            <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
            <option value="Senior Level (6-10 years)">Senior Level (6-10 years)</option>
            <option value="Expert Level (10+ years)">Expert Level (10+ years)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Skills (comma-separated) *</label>
          <input
            type="text"
            required
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
            placeholder="e.g., JavaScript, React, Project Management"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[#1f1f1f]">Languages</label>
            <button
              type="button"
              onClick={addLanguage}
              className="text-xs bg-[#ffa731] bg-opacity-20 text-[#2d2d2d] px-2 py-1 rounded hover:bg-[#ffa731] hover:bg-opacity-30 transition-colors"
            >
              + Add Language
            </button>
          </div>
          {formData.languages.map((lang, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select
                value={lang.language}
                onChange={(e) => updateLanguage(index, "language", e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa731]"
              >
                <option value="">Select language</option>
                {LANGUAGES.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
              <select
                value={lang.proficiency}
                onChange={(e) => updateLanguage(index, "proficiency", e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa731]"
              >
                {PROFICIENCY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeLanguage(index)}
                className="px-2 py-1.5 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[#1f1f1f]">Desired Destinations</label>
            <button
              type="button"
              onClick={addDestination}
              className="text-xs bg-[#ffa731] bg-opacity-20 text-[#2d2d2d] px-2 py-1 rounded hover:bg-[#ffa731] hover:bg-opacity-30 transition-colors"
            >
              + Add Destination
            </button>
          </div>
          {formData.desiredDestinations.map((dest, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Country"
                value={dest.country}
                onChange={(e) => updateDestination(index, "country", e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa731]"
              />
              <select
                value={dest.priority}
                onChange={(e) => updateDestination(index, "priority", parseInt(e.target.value))}
                className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa731]"
              >
                <option value={1}>Low</option>
                <option value={2}>Medium-Low</option>
                <option value={3}>Medium</option>
                <option value={4}>Medium-High</option>
                <option value={5}>High</option>
              </select>
              <button
                type="button"
                onClick={() => removeDestination(index)}
                className="px-2 py-1.5 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Bio *</label>
          <textarea
            required
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
            placeholder="Tell us about yourself and your career goals..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#ffa731] text-[#2d2d2d] py-2.5 px-6 rounded-md hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2d2d2d] mr-2"></div>
              Creating Profile...
            </span>
          ) : (
            "Complete Setup"
          )}
        </button>
      </form>
    </div>
  );
}
