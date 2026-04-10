import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Backend } from "../backend";
import type {
  AppData,
  Assignment,
  AssignmentSubmission,
  Course,
  Quiz,
  QuizQuestion,
  QuizResult,
  Resource,
  User,
} from "../types";

// ─── BigInt helpers ──────────────────────────────────────────────────────────
const toStr = (n: bigint | string | number) => String(n);

// ─── Backend → UI adapters ───────────────────────────────────────────────────
type CourseMap = Record<string, Course>;

function adaptCourse(c: {
  id: bigint;
  title: string;
  description: string;
  facultyId: bigint;
}): Course {
  // Derive a code from the title (first word + number if any)
  const words = c.title.split(" ");
  const code =
    words.length >= 2
      ? `${words[0].slice(0, 4).toUpperCase()} ${words[words.length - 1].slice(0, 3)}`
      : c.title.slice(0, 8).toUpperCase();

  return {
    id: toStr(c.id),
    title: c.title,
    description: c.description,
    facultyId: toStr(c.facultyId),
    code,
    name: c.title,
    subject: words[0] ?? "General",
    studentCount: 0,
    progress: 72,
  };
}

function adaptResource(
  r: {
    id: bigint;
    title: string;
    type: string;
    courseId: bigint;
    uploadedBy: bigint;
    url: string;
    createdAt: bigint;
  },
  courseMap: CourseMap,
): Resource {
  const course = courseMap[toStr(r.courseId)];
  const uploadedAt =
    Number(r.createdAt) > 0
      ? new Date(Number(r.createdAt) / 1_000_000).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
  return {
    id: toStr(r.id),
    title: r.title,
    type: r.type as "pdf" | "video" | "doc",
    courseId: toStr(r.courseId),
    uploadedBy: toStr(r.uploadedBy),
    url: r.url,
    subject: course?.subject ?? "General",
    uploadedAt,
    size: "—",
    description: r.title,
  };
}

function adaptQuizQuestion(q: {
  text: string;
  options: string[];
  correctIndex: bigint;
}): QuizQuestion {
  return {
    id: `${q.text.slice(0, 6)}_${String(q.correctIndex)}`,
    questionText: q.text,
    options: q.options,
    correctAnswer: Number(q.correctIndex),
  };
}

function adaptQuiz(
  q: {
    id: bigint;
    title: string;
    courseId: bigint;
    createdAt: bigint;
    questions: Array<{ text: string; options: string[]; correctIndex: bigint }>;
  },
  courseMap: CourseMap,
): Quiz {
  const course = courseMap[toStr(q.courseId)];
  return {
    id: toStr(q.id),
    title: q.title,
    courseId: toStr(q.courseId),
    questions: q.questions.map(adaptQuizQuestion),
    subject: course?.subject ?? "General",
    createdBy: course?.facultyId ?? "",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  };
}

function adaptQuizResult(
  r: {
    id: bigint;
    userId: bigint;
    quizId: bigint;
    score: bigint;
    total: bigint;
    submittedAt: bigint;
  },
  users: User[],
  quizzes: Quiz[],
): QuizResult {
  const student = users.find((u) => u.id === toStr(r.userId));
  const quiz = quizzes.find((q) => q.id === toStr(r.quizId));
  const dateMs = Number(r.submittedAt);
  const dateStr =
    dateMs > 0
      ? new Date(dateMs / 1_000_000).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
  return {
    id: toStr(r.id),
    userId: toStr(r.userId),
    quizId: toStr(r.quizId),
    score: Number(r.score),
    total: Number(r.total),
    submittedAt: dateStr,
    studentName: student?.name ?? "Unknown",
    quizTitle: quiz?.title ?? "Unknown Quiz",
    totalQuestions: Number(r.total),
    completedAt: dateStr,
  };
}

function adaptAssignment(
  a: {
    id: bigint;
    title: string;
    description: string;
    courseId: bigint;
    dueDate: string;
    createdAt: bigint;
  },
  courseMap: CourseMap,
): Assignment {
  const course = courseMap[toStr(a.courseId)];
  return {
    id: toStr(a.id),
    title: a.title,
    description: a.description,
    courseId: toStr(a.courseId),
    dueDate: a.dueDate,
    subject: course?.subject ?? "General",
    createdBy: course?.facultyId ?? "",
  };
}

function adaptSubmission(
  s: {
    id: bigint;
    assignmentId: bigint;
    userId: bigint;
    content: string;
    submittedAt: bigint;
  },
  users: User[],
  assignments: Assignment[],
): AssignmentSubmission {
  const student = users.find((u) => u.id === toStr(s.userId));
  const assignment = assignments.find((a) => a.id === toStr(s.assignmentId));
  const dateMs = Number(s.submittedAt);
  const dateStr =
    dateMs > 0
      ? new Date(dateMs / 1_000_000).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
  return {
    id: toStr(s.id),
    assignmentId: toStr(s.assignmentId),
    userId: toStr(s.userId),
    content: s.content,
    submittedAt: dateStr,
    assignmentTitle: assignment?.title ?? "Unknown Assignment",
    studentId: toStr(s.userId),
    studentName: student?.name ?? "Unknown",
    subject: assignment?.subject ?? "General",
    note: s.content,
  };
}

// ─── Context type ─────────────────────────────────────────────────────────────
interface AppContextType {
  data: AppData;
  refreshData: () => Promise<void>;
  addResource: (r: {
    title: string;
    type: string;
    courseId: string;
    url: string;
    uploadedBy: string;
  }) => Promise<void>;
  addQuiz: (q: {
    title: string;
    courseId: string;
    questions: QuizQuestion[];
  }) => Promise<void>;
  addQuizResult: (r: {
    userId: string;
    quizId: string;
    score: number;
    total: number;
  }) => Promise<void>;
  addAssignmentSubmission: (s: {
    assignmentId: string;
    userId: string;
    content: string;
    note: string;
  }) => Promise<void>;
  getUserById: (id: string) => User | undefined;
}

const EMPTY_DATA: AppData = {
  users: [],
  resources: [],
  courses: [],
  quizzes: [],
  quizResults: [],
  assignments: [],
  assignmentSubmissions: [],
  studentCount: 0,
  loading: true,
};

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
  actor: Backend | null;
  actorReady: boolean;
}

export function AppProvider({ children, actor, actorReady }: AppProviderProps) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);

  const refreshData = useCallback(async () => {
    if (!actor) return;
    try {
      const [
        rawCourses,
        rawResources,
        rawQuizzes,
        rawResults,
        rawAssignments,
        rawSubmissions,
        rawUsers,
        studentCount,
      ] = await Promise.all([
        actor.getCourses(),
        actor.getResources(),
        actor.getQuizzes(),
        actor.getQuizResults(),
        actor.getAssignments(),
        actor.getAssignmentSubmissions(),
        actor.getAllUsers(),
        actor.getStudentCount(),
      ]);

      const courses = (
        rawCourses as Array<{
          id: bigint;
          title: string;
          description: string;
          facultyId: bigint;
        }>
      ).map(adaptCourse);

      const courseMap: CourseMap = {};
      for (const c of courses) courseMap[c.id] = c;

      const users = (
        rawUsers as Array<{
          id: bigint;
          name: string;
          email: string;
          password: string;
          role: { faculty: null } | { student: null } | string;
        }>
      ).map((u) => ({
        id: toStr(u.id),
        name: u.name,
        email: u.email,
        password: u.password,
        role: (typeof u.role === "string"
          ? u.role
          : "faculty" in (u.role as object)
            ? "faculty"
            : "student") as "faculty" | "student",
      }));

      const resources = (
        rawResources as Array<{
          id: bigint;
          title: string;
          type: string;
          courseId: bigint;
          uploadedBy: bigint;
          url: string;
          createdAt: bigint;
        }>
      ).map((r) => adaptResource(r, courseMap));

      const quizzes = (
        rawQuizzes as Array<{
          id: bigint;
          title: string;
          courseId: bigint;
          createdAt: bigint;
          questions: Array<{
            text: string;
            options: string[];
            correctIndex: bigint;
          }>;
        }>
      ).map((q) => adaptQuiz(q, courseMap));

      const quizResults = (
        rawResults as Array<{
          id: bigint;
          userId: bigint;
          quizId: bigint;
          score: bigint;
          total: bigint;
          submittedAt: bigint;
        }>
      ).map((r) => adaptQuizResult(r, users, quizzes));

      const assignments = (
        rawAssignments as Array<{
          id: bigint;
          title: string;
          description: string;
          courseId: bigint;
          dueDate: string;
          createdAt: bigint;
        }>
      ).map((a) => adaptAssignment(a, courseMap));

      const assignmentSubmissions = (
        rawSubmissions as Array<{
          id: bigint;
          assignmentId: bigint;
          userId: bigint;
          content: string;
          submittedAt: bigint;
        }>
      ).map((s) => adaptSubmission(s, users, assignments));

      const studentCountNum = Number(studentCount);
      for (const c of courses) c.studentCount = studentCountNum;

      setData({
        users,
        courses,
        resources,
        quizzes,
        quizResults,
        assignments,
        assignmentSubmissions,
        studentCount: studentCountNum,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to load backend data:", err);
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, [actor]);

  useEffect(() => {
    if (actorReady && actor) {
      refreshData();
    }
  }, [actorReady, actor, refreshData]);

  const addResource = useCallback(
    async (r: {
      title: string;
      type: string;
      courseId: string;
      url: string;
      uploadedBy: string;
    }) => {
      if (!actor) return;
      await actor.addResource(
        r.title,
        r.type,
        BigInt(r.courseId),
        r.url,
        BigInt(r.uploadedBy),
      );
      await refreshData();
    },
    [actor, refreshData],
  );

  const addQuiz = useCallback(
    async (q: {
      title: string;
      courseId: string;
      questions: QuizQuestion[];
    }) => {
      if (!actor) return;
      const questions = q.questions.map((qq) => ({
        text: qq.questionText,
        options: qq.options,
        correctIndex: BigInt(qq.correctAnswer),
      }));
      await actor.addQuiz(q.title, BigInt(q.courseId), questions);
      await refreshData();
    },
    [actor, refreshData],
  );

  const addQuizResult = useCallback(
    async (r: {
      userId: string;
      quizId: string;
      score: number;
      total: number;
    }) => {
      if (!actor) return;
      await actor.submitQuizResult(
        BigInt(r.userId),
        BigInt(r.quizId),
        BigInt(r.score),
        BigInt(r.total),
      );
      await refreshData();
    },
    [actor, refreshData],
  );

  const addAssignmentSubmission = useCallback(
    async (s: {
      assignmentId: string;
      userId: string;
      content: string;
      note: string;
    }) => {
      if (!actor) return;
      await actor.submitAssignment(
        BigInt(s.userId),
        BigInt(s.assignmentId),
        s.content || s.note,
      );
      await refreshData();
    },
    [actor, refreshData],
  );

  const getUserById = useCallback(
    (id: string) => data.users.find((u) => u.id === id),
    [data.users],
  );

  return (
    <AppContext.Provider
      value={{
        data,
        refreshData,
        addResource,
        addQuiz,
        addQuizResult,
        addAssignmentSubmission,
        getUserById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
}
