import React, { useState } from 'react';
import { Template } from '../types';
import { FileText, Plus, Settings, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TemplateSelectorProps {
  templates: Template[];
  onCreateFromTemplate: (template: Template) => void;
  onCreateBlankNote: () => void;
}

export function TemplateSelector({
  templates,
  onCreateFromTemplate,
  onCreateBlankNote,
}: TemplateSelectorProps) {
  // State for template management
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });

  // Create a new template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = newTemplate.name.toLowerCase().replace(/\s+/g, '-');
    
    const { error } = await supabase
      .from('templates')
      .insert([{ id, ...newTemplate }]);

    if (!error) {
      setNewTemplate({ name: '', content: '' });
      setShowTemplateForm(false);
      window.location.reload();
    }
  };

  // Update an existing template
  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    const { error } = await supabase
      .from('templates')
      .update({ 
        name: editingTemplate.name, 
        content: editingTemplate.content 
      })
      .eq('id', editingTemplate.id);

    if (!error) {
      setEditingTemplate(null);
      window.location.reload();
    }
  };

  // Delete a template
  const handleDeleteTemplate = async (template: Template) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', template.id);

    if (!error) {
      window.location.reload();
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative group">
        {/* New Note button */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Note
        </button>
        
        {/* Dropdown menu with hover bridge */}
        <div className="absolute top-full right-0 w-76">
          <div className="h-2" /> {/* Invisible bridge for hover state */}
          <div className="hidden group-hover:block bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Blank note option */}
            <button
              onClick={onCreateBlankNote}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Blank Note</span>
            </button>
            
            {/* Template list */}
            <div className="border-t border-gray-200">
              {templates.map((template) => (
                <div key={template.id} className="group/template relative">
                  <button
                    onClick={() => onCreateFromTemplate(template)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="mr-16">{template.name}</span>
                  </button>
                  {/* Template actions */}
                  <div className="hidden group-hover/template:flex absolute right-2 top-1/2 -translate-y-1/2 gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTemplate(template);
                      }}
                      className="p-1 text-gray-500 hover:text-blue-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template);
                      }}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create template button */}
            <div className="border-t border-gray-200">
              <button
                onClick={() => setShowTemplateForm(true)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600"
              >
                <Settings className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Template form modal */}
        {(showTemplateForm || editingTemplate) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-[500px]">
              <h3 className="text-lg font-semibold mb-4">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editingTemplate ? editingTemplate.name : newTemplate.name}
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, name: e.target.value });
                      } else {
                        setNewTemplate(prev => ({ ...prev, name: e.target.value }));
                      }
                    }}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Content
                  </label>
                  <textarea
                    value={editingTemplate ? editingTemplate.content : newTemplate.content}
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, content: e.target.value });
                      } else {
                        setNewTemplate(prev => ({ ...prev, content: e.target.value }));
                      }
                    }}
                    className="w-full h-48 p-2 border rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateForm(false);
                      setEditingTemplate(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}