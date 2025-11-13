/**
 * Week Workspace - Primary tool for weekly content generation
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { coursesApi, weeksApi, chatApi } from '../api/client';
import type { Course, Week, ChatResponse } from '../types';
import { InstructionType } from '../types';

const WeekWorkspace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [postType, setPostType] = useState<InstructionType>(InstructionType.DISCUSSION_POST);
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refinementRequest, setRefinementRequest] = useState('');

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  useEffect(() => {
    const weekId = searchParams.get('week');
    if (weekId && weeks.length > 0) {
      const week = weeks.find((w) => w.id === parseInt(weekId));
      if (week) setSelectedWeek(week);
    }
  }, [searchParams, weeks]);

  const loadWorkspaceData = async () => {
    try {
      const coursesResponse = await coursesApi.listActive();
      const activeCourses = coursesResponse.data;

      if (activeCourses.length > 0) {
        const course = activeCourses[0];
        setActiveCourse(course);

        const weeksResponse = await weeksApi.getByCourse(course.id);
        setWeeks(weeksResponse.data);
      }
    } catch (error) {
      console.error('Error loading workspace data:', error);
    }
  };

  const handleWeekSelect = (week: Week) => {
    setSelectedWeek(week);
    setSearchParams({ week: week.id.toString() });
    setGeneratedContent('');
    setSources([]);
    setCurrentPostId(null);
    setAdditionalContext('');
    setRefinementRequest('');
  };

  const handleGenerate = async () => {
    if (!selectedWeek) return;

    setIsGenerating(true);
    try {
      const response = await chatApi.generate({
        week_id: selectedWeek.id,
        post_type: postType,
        context: additionalContext || undefined,
      });

      setGeneratedContent(response.data.content);
      setSources(response.data.sources_used || []);
      setCurrentPostId(response.data.post_id || null);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!currentPostId || !refinementRequest.trim()) return;

    setIsGenerating(true);
    try {
      const response = await chatApi.refine(currentPostId, refinementRequest);
      setGeneratedContent(response.data.content);
      setRefinementRequest('');
    } catch (error) {
      console.error('Error refining content:', error);
      alert('Error refining content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Content copied to clipboard!');
  };

  const getPostTypeLabel = (type: InstructionType) => {
    switch (type) {
      case InstructionType.DISCUSSION_POST:
        return 'Discussion Post';
      case InstructionType.REFLECTIVE_JOURNAL:
        return 'Reflective Journal';
      case InstructionType.PEER_RESPONSE:
        return 'Peer Response';
      default:
        return type;
    }
  };

  if (!activeCourse) {
    return (
      <div className="px-4 py-6">
        <div className="text-center text-gray-500">
          No active course found. Please create a course first.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Week Workspace</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate and refine your weekly assignments
        </p>
      </div>

      {/* Week Selection */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Week</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {weeks.map((week) => (
            <button
              key={week.id}
              onClick={() => handleWeekSelect(week)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedWeek?.id === week.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">W{week.week_number}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedWeek && (
        <>
          {/* Week Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Week {selectedWeek.week_number}
              {selectedWeek.title && `: ${selectedWeek.title}`}
            </h2>

            {selectedWeek.learning_outcomes && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Learning Outcomes:
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedWeek.learning_outcomes}
                </p>
              </div>
            )}

            {postType === InstructionType.DISCUSSION_POST &&
              selectedWeek.discussion_question && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Discussion Question:
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedWeek.discussion_question}
                  </p>
                  {selectedWeek.discussion_requirements && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">
                        Requirements:
                      </h4>
                      <p className="text-xs text-gray-500 whitespace-pre-wrap">
                        {selectedWeek.discussion_requirements}
                      </p>
                    </div>
                  )}
                </div>
              )}

            {postType === InstructionType.REFLECTIVE_JOURNAL &&
              selectedWeek.reflective_question && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Reflective Question:
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedWeek.reflective_question}
                  </p>
                  {selectedWeek.reflective_requirements && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">
                        Requirements:
                      </h4>
                      <p className="text-xs text-gray-500 whitespace-pre-wrap">
                        {selectedWeek.reflective_requirements}
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Generation Controls */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Generate Content
            </h2>

            {/* Post Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Content
              </label>
              <div className="flex space-x-4">
                {[
                  InstructionType.DISCUSSION_POST,
                  InstructionType.REFLECTIVE_JOURNAL,
                  InstructionType.PEER_RESPONSE,
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPostType(type)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      postType === type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getPostTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Context */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context{' '}
                {postType === InstructionType.PEER_RESPONSE && (
                  <span className="text-gray-500">(Paste classmate's post here)</span>
                )}
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={
                  postType === InstructionType.PEER_RESPONSE
                    ? "Paste your classmate's post here..."
                    : 'Add any additional context or specific requirements...'
                }
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Generated Content
                </h2>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Copy to Clipboard
                </button>
              </div>

              {sources.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    Sources Used:
                  </h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    {sources.map((source, index) => (
                      <li key={index}>• {source}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="whitespace-pre-wrap text-sm text-gray-800">
                  {generatedContent}
                </div>
              </div>

              {/* Refinement */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Refine Content
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={refinementRequest}
                    onChange={(e) => setRefinementRequest(e.target.value)}
                    placeholder="e.g., 'Make it more analytical' or 'Add more examples'"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleRefine()}
                  />
                  <button
                    onClick={handleRefine}
                    disabled={isGenerating || !refinementRequest.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isGenerating ? 'Refining...' : 'Refine'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeekWorkspace;
