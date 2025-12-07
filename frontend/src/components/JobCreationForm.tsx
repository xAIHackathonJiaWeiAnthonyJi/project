import React, { useState } from 'react';
import { Job } from '../App';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface JobCreationFormProps {
  onSubmit: (job: Omit<Job, 'id' | 'createdAt' | 'candidatesFound' | 'candidatesInPipeline'>) => void;
  onCancel: () => void;
}

export const JobCreationForm: React.FC<JobCreationFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    headcount: 1,
    description: '',
    requirements: [''],
    status: 'active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');
    onSubmit({
      ...formData,
      requirements: filteredRequirements
    });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({
      ...formData,
      requirements: newRequirements
    });
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-gray-100 rounded-lg border border-white p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={onCancel}
              className="mr-4 p-2 text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Create New Job</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2"
                placeholder="e.g. Engineering"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Headcount *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.headcount}
                onChange={(e) => setFormData({ ...formData, headcount: parseInt(e.target.value) })}
                className="w-full px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Job Description *
              </label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2"
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Requirements
              </label>
              <div className="space-y-2">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="flex-1 px-3 py-2"
                      placeholder="e.g. React, 5+ years experience"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="p-2 text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="flex items-center text-white transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Requirement
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-white transition-colors"
              >
                Create Job & Start Grok Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
