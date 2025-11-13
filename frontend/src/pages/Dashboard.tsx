/**
 * Dashboard - Overview and quick access
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi, weeksApi, documentsApi } from '../api/client';
import type { Course, Week, Document } from '../types';

const Dashboard = () => {
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get active courses
      const coursesResponse = await coursesApi.listActive();
      const activeCourses = coursesResponse.data;

      if (activeCourses.length > 0) {
        const course = activeCourses[0]; // Get first active course
        setActiveCourse(course);

        // Load weeks for this course
        const weeksResponse = await weeksApi.getByCourse(course.id);
        setWeeks(weeksResponse.data);

        // Load documents for this course
        const docsResponse = await documentsApi.list(course.id);
        setDocuments(docsResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!activeCourse) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to DBA-Bot</h2>
          <p className="text-gray-600 mb-6">
            Get started by creating your first course.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Quick overview of your current course and progress
        </p>
      </div>

      {/* Active Course Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Course</h2>
          <Link
            to="/courses"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Manage
          </Link>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{activeCourse.name}</h3>
          {activeCourse.code && (
            <p className="text-sm text-gray-500">{activeCourse.code}</p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            {activeCourse.semester} {activeCourse.year}
          </p>
          {activeCourse.description && (
            <p className="text-sm text-gray-700 mt-3">{activeCourse.description}</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Link
          to="/workspace"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-6 shadow-sm transition-colors"
        >
          <div className="text-3xl mb-2">✍️</div>
          <h3 className="text-lg font-semibold mb-1">Week Workspace</h3>
          <p className="text-sm text-indigo-100">Generate discussion posts and assignments</p>
        </Link>

        <Link
          to="/documents"
          className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg p-6 shadow-sm transition-colors"
        >
          <div className="text-3xl mb-2">📄</div>
          <h3 className="text-lg font-semibold mb-1 text-gray-900">Documents</h3>
          <p className="text-sm text-gray-600">
            {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
          </p>
        </Link>

        <Link
          to="/instructions"
          className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg p-6 shadow-sm transition-colors"
        >
          <div className="text-3xl mb-2">📝</div>
          <h3 className="text-lg font-semibold mb-1 text-gray-900">Instructions</h3>
          <p className="text-sm text-gray-600">Manage general guidelines</p>
        </Link>
      </div>

      {/* Weeks Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Course Weeks</h2>
          <span className="text-sm text-gray-500">
            {weeks.length} week{weeks.length !== 1 ? 's' : ''} created
          </span>
        </div>
        {weeks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No weeks created yet. Start by creating weeks for your course.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {weeks.map((week) => (
              <Link
                key={week.id}
                to={`/workspace?week=${week.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div className="text-sm font-semibold text-gray-900">
                  Week {week.week_number}
                </div>
                {week.title && (
                  <div className="text-xs text-gray-600 mt-1 truncate">
                    {week.title}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
