/**
 * General Instructions Management Page
 */

import { useEffect, useState } from 'react';
import { generalInstructionsApi } from '../api/client';
import type { GeneralInstruction, GeneralInstructionCreate } from '../types';
import { InstructionType } from '../types';

const GeneralInstructions = () => {
  const [instructions, setInstructions] = useState<GeneralInstruction[]>([]);
  const [filterType, setFilterType] = useState<InstructionType | undefined>(
    undefined
  );
  const [showForm, setShowForm] = useState(false);
  const [editingInstruction, setEditingInstruction] =
    useState<GeneralInstruction | null>(null);

  const [form, setForm] = useState<GeneralInstructionCreate>({
    instruction_type: InstructionType.DISCUSSION_POST,
    title: '',
    content: '',
    is_active: true,
  });

  useEffect(() => {
    loadInstructions();
  }, [filterType]);

  const loadInstructions = async () => {
    try {
      const response = await generalInstructionsApi.list(filterType);
      setInstructions(response.data);
    } catch (error) {
      console.error('Error loading instructions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInstruction) {
        await generalInstructionsApi.update(editingInstruction.id, form);
      } else {
        await generalInstructionsApi.create(form);
      }
      setShowForm(false);
      setEditingInstruction(null);
      resetForm();
      loadInstructions();
    } catch (error) {
      console.error('Error saving instruction:', error);
      alert('Error saving instruction');
    }
  };

  const handleEdit = (instruction: GeneralInstruction) => {
    setEditingInstruction(instruction);
    setForm({
      instruction_type: instruction.instruction_type,
      title: instruction.title,
      content: instruction.content,
      is_active: instruction.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this instruction?')) return;

    try {
      await generalInstructionsApi.delete(id);
      loadInstructions();
    } catch (error) {
      console.error('Error deleting instruction:', error);
      alert('Error deleting instruction');
    }
  };

  const resetForm = () => {
    setForm({
      instruction_type: InstructionType.DISCUSSION_POST,
      title: '',
      content: '',
      is_active: true,
    });
  };

  const getTypeLabel = (type: InstructionType) => {
    switch (type) {
      case InstructionType.DISCUSSION_POST:
        return 'Discussion Post';
      case InstructionType.REFLECTIVE_JOURNAL:
        return 'Reflective Journal';
      case InstructionType.PEER_RESPONSE:
        return 'Peer Response';
      case InstructionType.ASSIGNMENT:
        return 'Assignment';
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: InstructionType) => {
    switch (type) {
      case InstructionType.DISCUSSION_POST:
        return 'bg-blue-100 text-blue-800';
      case InstructionType.REFLECTIVE_JOURNAL:
        return 'bg-purple-100 text-purple-800';
      case InstructionType.PEER_RESPONSE:
        return 'bg-green-100 text-green-800';
      case InstructionType.ASSIGNMENT:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">General Instructions</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage reusable guidelines that apply to all weeks
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <select
              value={filterType || ''}
              onChange={(e) =>
                setFilterType(
                  e.target.value ? (e.target.value as InstructionType) : undefined
                )
              }
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="">All Types</option>
              <option value={InstructionType.DISCUSSION_POST}>
                Discussion Post
              </option>
              <option value={InstructionType.REFLECTIVE_JOURNAL}>
                Reflective Journal
              </option>
              <option value={InstructionType.PEER_RESPONSE}>Peer Response</option>
              <option value={InstructionType.ASSIGNMENT}>Assignment</option>
            </select>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingInstruction(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            + Add Instruction
          </button>
        </div>

        {/* Instructions List */}
        {instructions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No instructions found. Create your first general instruction.
          </div>
        ) : (
          <div className="space-y-4">
            {instructions.map((instruction) => (
              <div
                key={instruction.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {instruction.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(
                          instruction.instruction_type
                        )}`}
                      >
                        {getTypeLabel(instruction.instruction_type)}
                      </span>
                      {!instruction.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {instruction.content}
                    </p>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handleEdit(instruction)}
                      className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(instruction.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">
              {editingInstruction ? 'Edit Instruction' : 'Add New Instruction'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruction Type *
                </label>
                <select
                  required
                  value={form.instruction_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      instruction_type: e.target.value as InstructionType,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value={InstructionType.DISCUSSION_POST}>
                    Discussion Post
                  </option>
                  <option value={InstructionType.REFLECTIVE_JOURNAL}>
                    Reflective Journal
                  </option>
                  <option value={InstructionType.PEER_RESPONSE}>
                    Peer Response
                  </option>
                  <option value={InstructionType.ASSIGNMENT}>Assignment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="e.g., General Writing Guidelines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter the instruction guidelines..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active (will be used in content generation)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingInstruction(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingInstruction ? 'Update Instruction' : 'Create Instruction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralInstructions;
