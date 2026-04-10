// Frontend UI types — these mirror backend types but use string IDs for convenience.
// Conversion from bigint happens in AppContext via toStr/toBig helpers.

export type UserRole = "student" | "faculty";

export interface User {
  id: string; // bigint converted to string
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Resource {
  id: string;
  title: string;
  type: "pdf" | "video" | "doc" | string;
  courseId: string;
  uploadedBy: string;
  url: string;
  // UI-derived fields (not in backend, computed or defaulted)
  subject: string;
  uploadedAt: string;
  size: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  facultyId: string;
  // UI-derived fields
  code: string;
  name: string;
  subject: string;
  studentCount: number;
  progress: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number; // index
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  questions: QuizQuestion[];
  // UI-derived fields
  subject: string;
  createdBy: string;
  dueDate: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  total: number;
  submittedAt: string;
  // UI-derived (looked up)
  studentName: string;
  quizTitle: string;
  totalQuestions: number;
  completedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  dueDate: string;
  // UI-derived
  subject: string;
  createdBy: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  content: string;
  submittedAt: string;
  // UI-derived
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  subject: string;
  note: string;
}

export interface AppData {
  users: User[];
  resources: Resource[];
  courses: Course[];
  quizzes: Quiz[];
  quizResults: QuizResult[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  studentCount: number;
  loading: boolean;
}
