import type { AppData } from "../types";

export const initialData: AppData = {
  users: [
    {
      id: "f1",
      name: "Dr. Sarah Mitchell",
      email: "faculty@demo.com",
      password: "demo123",
      role: "faculty",
    },
    {
      id: "s1",
      name: "Alex Johnson",
      email: "student@demo.com",
      password: "demo123",
      role: "student",
    },
  ],
  resources: [],
  courses: [],
  quizzes: [],
  quizResults: [],
  assignments: [],
  assignmentSubmissions: [],
  studentCount: 0,
  loading: false,
};
