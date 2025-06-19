import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface CompanyRegistrationProps {
  onBack?: () => void;
  onComplete?: () => void;
}

export function CompanyRegistration({ onBack, onComplete }: CompanyRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    headquarters: "",
    country: "",
    description: "",
    industry: "",
    size: "",
    website: "",
  });

  const createCompany = useMutation(api.companies.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createCompany({
        ...formData,
        website: formData.website || undefined,
      });
      
      toast.success("Company profile created successfully!");
      
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to create company profile");
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
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Complete Your Company Profile</h2>
        <p className="text-[#333] mt-1 text-sm">Tell us about your company to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-[#ffa731] border-opacity-20">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Company Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
            placeholder="Enter your company name"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Headquarters *</label>
            <input
              type="text"
              required
              value={formData.headquarters}
              onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
              placeholder="City, State"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Country *</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
              placeholder="United States"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Industry *</label>
            <input
              type="text"
              required
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
              placeholder="e.g., Technology, Marketing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Company Size *</label>
            <select
              required
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
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
          <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
            placeholder="https://yourcompany.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#1f1f1f]">Company Description *</label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
            placeholder="Tell us about your company, culture, and what makes it unique..."
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
