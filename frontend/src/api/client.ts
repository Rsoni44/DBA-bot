/**
 * API client for DBA-Bot backend
 */

import axios from 'axios';
import type {
  Course,
  CourseCreate,
  Week,
  WeekCreate,
  GeneralInstruction,
  GeneralInstructionCreate,
  WeekInstruction,
  Document,
  GeneratedPost,
  ChatRequest,
  ChatResponse,
  InstructionType,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Courses ====================

export const coursesApi = {
  list: () => apiClient.get<Course[]>('/courses/'),
  listActive: () => apiClient.get<Course[]>('/courses/active'),
  get: (id: number) => apiClient.get<Course>(`/courses/${id}`),
  create: (data: CourseCreate) => apiClient.post<Course>('/courses/', data),
  update: (id: number, data: Partial<CourseCreate>) =>
    apiClient.put<Course>(`/courses/${id}`, data),
  delete: (id: number) => apiClient.delete(`/courses/${id}`),
};

// ==================== Weeks ====================

export const weeksApi = {
  getByCourse: (courseId: number) =>
    apiClient.get<Week[]>(`/weeks/course/${courseId}`),
  get: (id: number) => apiClient.get<Week>(`/weeks/${id}`),
  create: (data: WeekCreate) => apiClient.post<Week>('/weeks/', data),
  update: (id: number, data: Partial<WeekCreate>) =>
    apiClient.put<Week>(`/weeks/${id}`, data),
  delete: (id: number) => apiClient.delete(`/weeks/${id}`),
};

// ==================== General Instructions ====================

export const generalInstructionsApi = {
  list: (type?: InstructionType) =>
    apiClient.get<GeneralInstruction[]>('/instructions/general', {
      params: type ? { instruction_type: type } : {},
    }),
  get: (id: number) =>
    apiClient.get<GeneralInstruction>(`/instructions/general/${id}`),
  create: (data: GeneralInstructionCreate) =>
    apiClient.post<GeneralInstruction>('/instructions/general', data),
  update: (id: number, data: Partial<GeneralInstructionCreate>) =>
    apiClient.put<GeneralInstruction>(`/instructions/general/${id}`, data),
  delete: (id: number) => apiClient.delete(`/instructions/general/${id}`),
};

// ==================== Week Instructions ====================

export const weekInstructionsApi = {
  getByWeek: (weekId: number) =>
    apiClient.get<WeekInstruction[]>(`/instructions/week/${weekId}`),
  get: (id: number) =>
    apiClient.get<WeekInstruction>(`/instructions/week/instruction/${id}`),
  create: (data: { week_id: number; instruction_type: InstructionType; content: string }) =>
    apiClient.post<WeekInstruction>('/instructions/week', data),
  update: (id: number, data: Partial<{ instruction_type: InstructionType; content: string }>) =>
    apiClient.put<WeekInstruction>(`/instructions/week/instruction/${id}`, data),
  delete: (id: number) => apiClient.delete(`/instructions/week/instruction/${id}`),
};

// ==================== Documents ====================

export const documentsApi = {
  list: (courseId?: number) =>
    apiClient.get<Document[]>('/documents/', {
      params: courseId ? { course_id: courseId } : {},
    }),
  get: (id: number) => apiClient.get<Document>(`/documents/${id}`),
  upload: (file: File, title: string, courseId?: number, documentType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (courseId) formData.append('course_id', courseId.toString());
    if (documentType) formData.append('document_type', documentType);

    return apiClient.post<Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id: number, data: { title?: string; document_type?: string }) =>
    apiClient.put<Document>(`/documents/${id}`, data),
  delete: (id: number) => apiClient.delete(`/documents/${id}`),
  reindex: (id: number) => apiClient.post(`/documents/${id}/reindex`),
};

// ==================== Chat / Generation ====================

export const chatApi = {
  generate: (data: ChatRequest) =>
    apiClient.post<ChatResponse>('/chat/generate', data),
  refine: (postId: number, refinementRequest: string) =>
    apiClient.post<ChatResponse>('/chat/refine', null, {
      params: { post_id: postId, refinement_request: refinementRequest },
    }),
  getPostsByWeek: (weekId: number) =>
    apiClient.get<GeneratedPost[]>(`/chat/posts/week/${weekId}`),
  getPost: (id: number) =>
    apiClient.get<GeneratedPost>(`/chat/posts/${id}`),
  markSubmitted: (id: number) =>
    apiClient.put(`/chat/posts/${id}/submit`),
  deletePost: (id: number) =>
    apiClient.delete(`/chat/posts/${id}`),
};

export default apiClient;
