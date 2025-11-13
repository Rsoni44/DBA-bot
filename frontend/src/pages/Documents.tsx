/**
 * Document Management Page
 */

import { useEffect, useState } from 'react';
import { documentsApi, coursesApi } from '../api/client';
import type { Document, Course } from '../types';

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(
    undefined
  );
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    courseId: undefined as number | undefined,
    documentType: '',
  });

  useEffect(() => {
    loadCourses();
    loadDocuments();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.list();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await documentsApi.list(selectedCourseId);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({
        ...uploadForm,
        file,
        title: uploadForm.title || file.name.replace('.pdf', ''),
      });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    setUploading(true);
    try {
      await documentsApi.upload(
        uploadForm.file,
        uploadForm.title,
        uploadForm.courseId,
        uploadForm.documentType
      );

      // Reset form
      setUploadForm({
        file: null,
        title: '',
        courseId: undefined,
        documentType: '',
      });

      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      loadDocuments();
      alert('Document uploaded and indexed successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentsApi.delete(id);
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  const handleReindex = async (id: number) => {
    try {
      await documentsApi.reindex(id);
      alert('Document reindexed successfully!');
      loadDocuments();
    } catch (error) {
      console.error('Error reindexing document:', error);
      alert('Error reindexing document');
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload and manage course materials (PDFs)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Document
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF File *
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="e.g., Strategic Management Textbook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course (Optional)
                </label>
                <select
                  value={uploadForm.courseId || ''}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      courseId: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">No specific course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type (Optional)
                </label>
                <input
                  type="text"
                  value={uploadForm.documentType}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, documentType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="e.g., Textbook, Article, Case Study"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !uploadForm.file}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading & Indexing...' : 'Upload Document'}
              </button>
            </form>
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Documents ({documents.length})
              </h2>
              <select
                value={selectedCourseId || ''}
                onChange={(e) =>
                  setSelectedCourseId(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No documents uploaded yet
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{doc.title}</h3>
                          {doc.is_indexed && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Indexed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{doc.filename}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {doc.document_type && (
                            <span>Type: {doc.document_type}</span>
                          )}
                          {doc.page_count && (
                            <span>{doc.page_count} pages</span>
                          )}
                          <span>
                            Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleReindex(doc.id)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Reindex
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
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
        </div>
      </div>
    </div>
  );
};

export default Documents;
