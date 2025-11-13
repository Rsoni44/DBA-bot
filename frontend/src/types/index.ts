/**
 * TypeScript types for DBA-Bot frontend
 */

export enum InstructionType {
  DISCUSSION_POST = "discussion_post",
  REFLECTIVE_JOURNAL = "reflective_journal",
  PEER_RESPONSE = "peer_response",
  ASSIGNMENT = "assignment",
}

export interface Course {
  id: number;
  name: string;
  code?: string;
  semester: string;
  year: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseCreate {
  name: string;
  code?: string;
  semester: string;
  year: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  is_active?: boolean;
}

export interface Week {
  id: number;
  course_id: number;
  week_number: number;
  title?: string;
  learning_outcomes?: string;
  discussion_question?: string;
  discussion_requirements?: string;
  reflective_question?: string;
  reflective_requirements?: string;
  assignment_description?: string;
  created_at: string;
  updated_at: string;
}

export interface WeekCreate {
  course_id: number;
  week_number: number;
  title?: string;
  learning_outcomes?: string;
  discussion_question?: string;
  discussion_requirements?: string;
  reflective_question?: string;
  reflective_requirements?: string;
  assignment_description?: string;
}

export interface GeneralInstruction {
  id: number;
  instruction_type: InstructionType;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneralInstructionCreate {
  instruction_type: InstructionType;
  title: string;
  content: string;
  is_active?: boolean;
}

export interface WeekInstruction {
  id: number;
  week_id: number;
  instruction_type: InstructionType;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  course_id?: number;
  title: string;
  filename: string;
  file_path: string;
  document_type?: string;
  page_count?: number;
  is_indexed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedPost {
  id: number;
  week_id: number;
  post_type: InstructionType;
  prompt: string;
  generated_content: string;
  final_content?: string;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatRequest {
  week_id: number;
  post_type: InstructionType;
  context?: string;
  refinement_request?: string;
}

export interface ChatResponse {
  content: string;
  sources_used?: string[];
  post_id?: number;
}
