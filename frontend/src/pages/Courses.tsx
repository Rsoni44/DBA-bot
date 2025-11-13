/**
 * Course Management Page
 */

import { useEffect, useState } from 'react';
import { coursesApi, weeksApi } from '../api/client';
import type { Course, CourseCreate, Week, WeekCreate } from '../types';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showWeekForm, setShowWeekForm] = useState(false);
  const [editingWeek, setEditingWeek] = useState<Week | null>(null);

  const [courseForm, setCourseForm] = useState<CourseCreate>({
    name: '',
    code: '',
    semester: '',
    year: new Date().getFullYear(),
    description: '',
    is_active: true,
  });

  const [weekForm, setWeekForm] = useState<WeekCreate>({
    course_id: 0,
    week_number: 1,
    title: '',
    learning_outcomes: '',
    discussion_question: '',
    discussion_requirements: '',
    reflective_question: '',
    reflective_requirements: '',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadWeeks(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.list();
      setCourses(response.data);
      if (response.data.length > 0 && !selectedCourse) {
        setSelectedCourse(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadWeeks = async (courseId: number) => {
    try {
      const response = await weeksApi.getByCourse(courseId);
      setWeeks(response.data);
    } catch (error) {
      console.error('Error loading weeks:', error);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await coursesApi.create(courseForm);
      setShowCourseForm(false);
      setCourseForm({
        name: '',
        code: '',
        semester: '',
        year: new Date().getFullYear(),
        description: '',
        is_active: true,
      });
      loadCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course');
    }
  };

  const handleCreateWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      if (editingWeek) {
        await weeksApi.update(editingWeek.id, weekForm);
      } else {
        await weeksApi.create({ ...weekForm, course_id: selectedCourse.id });
      }
      setShowWeekForm(false);
      setEditingWeek(null);
      resetWeekForm();
      loadWeeks(selectedCourse.id);
    } catch (error) {
      console.error('Error saving week:', error);
      alert('Error saving week');
    }
  };

  const handleEditWeek = (week: Week) => {
    setEditingWeek(week);
    setWeekForm({
      course_id: week.course_id,
      week_number: week.week_number,
      title: week.title || '',
      learning_outcomes: week.learning_outcomes || '',
      discussion_question: week.discussion_question || '',
      discussion_requirements: week.discussion_requirements || '',
      reflective_question: week.reflective_question || '',
      reflective_requirements: week.reflective_requirements || '',
    });
    setShowWeekForm(true);
  };

  const resetWeekForm = () => {
    setWeekForm({
      course_id: selectedCourse?.id || 0,
      week_number: weeks.length + 1,
      title: '',
      learning_outcomes: '',
      discussion_question: '',
      discussion_requirements: '',
      reflective_question: '',
      reflective_requirements: '',
    });
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your courses and weekly content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
              <button
                onClick={() => setShowCourseForm(true)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
              >
                + New
              </button>
            </div>

            <div className="space-y-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    selectedCourse?.id === course.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{course.name}</div>
                  <div className="text-xs text-gray-500">
                    {course.semester} {course.year}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weeks Management */}
        <div className="lg:col-span-2">
          {selectedCourse ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Weeks - {selectedCourse.name}
                </h2>
                <button
                  onClick={() => {
                    resetWeekForm();
                    setEditingWeek(null);
                    setShowWeekForm(true);
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                >
                  + Add Week
                </button>
              </div>

              <div className="space-y-3">
                {weeks.map((week) => (
                  <div
                    key={week.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          Week {week.week_number}
                          {week.title && `: ${week.title}`}
                        </h3>
                        {week.learning_outcomes && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {week.learning_outcomes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditWeek(week)}
                        className="ml-4 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              Select a course to manage weeks
            </div>
          )}
        </div>
      </div>

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, code: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Semester 2"
                    value={courseForm.semester}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, semester: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={courseForm.year}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        year: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Week Form Modal */}
      {showWeekForm && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingWeek ? 'Edit Week' : 'Add New Week'}
            </h2>
            <form onSubmit={handleCreateWeek} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Week Number *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="8"
                    value={weekForm.week_number}
                    onChange={(e) =>
                      setWeekForm({
                        ...weekForm,
                        week_number: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={weekForm.title}
                    onChange={(e) =>
                      setWeekForm({ ...weekForm, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Outcomes
                </label>
                <textarea
                  value={weekForm.learning_outcomes}
                  onChange={(e) =>
                    setWeekForm({ ...weekForm, learning_outcomes: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discussion Question
                </label>
                <textarea
                  value={weekForm.discussion_question}
                  onChange={(e) =>
                    setWeekForm({
                      ...weekForm,
                      discussion_question: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discussion Requirements
                </label>
                <textarea
                  value={weekForm.discussion_requirements}
                  onChange={(e) =>
                    setWeekForm({
                      ...weekForm,
                      discussion_requirements: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reflective Journal Question
                </label>
                <textarea
                  value={weekForm.reflective_question}
                  onChange={(e) =>
                    setWeekForm({ ...weekForm, reflective_question: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reflective Requirements
                </label>
                <textarea
                  value={weekForm.reflective_requirements}
                  onChange={(e) =>
                    setWeekForm({
                      ...weekForm,
                      reflective_requirements: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowWeekForm(false);
                    setEditingWeek(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingWeek ? 'Update Week' : 'Create Week'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
