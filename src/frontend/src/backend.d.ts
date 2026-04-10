import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Notification {
    id: bigint;
    userId: bigint;
    createdAt: bigint;
    type: string;
    isRead: boolean;
    message: string;
}
export interface User {
    id: bigint;
    password: string;
    name: string;
    createdAt: bigint;
    role: UserRole;
    email: string;
}
export interface Resource {
    id: bigint;
    url: string;
    title: string;
    createdAt: bigint;
    type: string;
    courseId: bigint;
    uploadedBy: bigint;
}
export interface QuizResult {
    id: bigint;
    total: bigint;
    userId: bigint;
    submittedAt: bigint;
    score: bigint;
    quizId: bigint;
}
export interface Quiz {
    id: bigint;
    title: string;
    createdAt: bigint;
    questions: Array<QuizQuestion>;
    courseId: bigint;
}
export interface QuizQuestion {
    correctIndex: bigint;
    text: string;
    options: Array<string>;
}
export interface AssignmentSubmission {
    id: bigint;
    content: string;
    userId: bigint;
    submittedAt: bigint;
    assignmentId: bigint;
}
export interface Assignment {
    id: bigint;
    title: string;
    createdAt: bigint;
    dueDate: string;
    description: string;
    courseId: bigint;
}
export interface Course {
    id: bigint;
    title: string;
    facultyId: bigint;
    createdAt: bigint;
    description: string;
}
export enum UserRole {
    faculty = "faculty",
    student = "student"
}
export interface backendInterface {
    addAssignment(title: string, courseId: bigint, dueDate: string, description: string): Promise<bigint>;
    addCourse(title: string, description: string, facultyId: bigint): Promise<bigint>;
    addNotification(userId: bigint, message: string, type: string): Promise<bigint>;
    addQuiz(title: string, courseId: bigint, questions: Array<QuizQuestion>): Promise<bigint>;
    addResource(title: string, type: string, courseId: bigint, url: string, uploadedBy: bigint): Promise<bigint>;
    getAllUsers(): Promise<Array<User>>;
    getAssignmentSubmissions(): Promise<Array<AssignmentSubmission>>;
    getAssignments(): Promise<Array<Assignment>>;
    getAssignmentsByCourse(courseId: bigint): Promise<Array<Assignment>>;
    getCourse(id: bigint): Promise<Course | null>;
    getCourses(): Promise<Array<Course>>;
    getNotifications(userId: bigint): Promise<Array<Notification>>;
    getQuizResults(): Promise<Array<QuizResult>>;
    getQuizResultsByUser(userId: bigint): Promise<Array<QuizResult>>;
    getQuizzes(): Promise<Array<Quiz>>;
    getQuizzesByCourse(courseId: bigint): Promise<Array<Quiz>>;
    getResources(): Promise<Array<Resource>>;
    getResourcesByCourse(courseId: bigint): Promise<Array<Resource>>;
    getStudentCount(): Promise<bigint>;
    getSubmissionsByUser(userId: bigint): Promise<Array<AssignmentSubmission>>;
    getUser(id: bigint): Promise<User | null>;
    login(email: string, password: string): Promise<{
        __kind__: "ok";
        ok: User;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markNotificationRead(id: bigint): Promise<boolean>;
    register(email: string, password: string, role: UserRole, name: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitAssignment(userId: bigint, assignmentId: bigint, content: string): Promise<bigint>;
    submitQuizResult(userId: bigint, quizId: bigint, score: bigint, total: bigint): Promise<bigint>;
}
