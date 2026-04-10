import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileIcon,
  FileText,
  MessageSquare,
  Play,
  Search,
  Send,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAppData } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import type {
  Assignment,
  AssignmentSubmission,
  Course,
  Quiz,
  QuizResult,
  Resource,
  User,
} from "../../types";
import { downloadResource } from "../../utils/downloadResource";
import QuizAttemptPage from "./QuizAttemptPage";

const ResourceIcon = ({ type }: { type: string }) => {
  if (type === "video") return <Video className="w-5 h-5 text-purple-300" />;
  if (type === "doc") return <FileIcon className="w-5 h-5 text-blue-300" />;
  return <FileText className="w-5 h-5 text-purple-300" />;
};

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

interface Message {
  id: number;
  sender: string;
  role: string;
  time: string;
  text: string;
  avatar: string;
  isMe?: boolean;
}

interface Conversation {
  id: number;
  sender: string;
  role: string;
  avatar: string;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    sender: "Dr. Emily Carter",
    role: "Faculty",
    avatar: "EC",
    messages: [
      {
        id: 1,
        sender: "Dr. Emily Carter",
        role: "Faculty",
        time: "Today, 10:32 AM",
        text: "Please review the updated syllabus for Advanced Mathematics. The quiz schedule has been revised for next week.",
        avatar: "EC",
      },
    ],
  },
  {
    id: 2,
    sender: "System",
    role: "Notification",
    avatar: "SY",
    messages: [
      {
        id: 1,
        sender: "System",
        role: "Notification",
        time: "Yesterday, 4:15 PM",
        text: "Your submission for Assignment 3 has been received and is under review. You will be notified once grading is complete.",
        avatar: "SY",
      },
    ],
  },
  {
    id: 3,
    sender: "Prof. James Lin",
    role: "Faculty",
    avatar: "JL",
    messages: [
      {
        id: 1,
        sender: "Prof. James Lin",
        role: "Faculty",
        time: "Mon, Mar 30",
        text: "Great work on last week's quiz! Keep it up. Office hours this Thursday are moved to 3 PM – 5 PM.",
        avatar: "JL",
      },
    ],
  },
];

// ─── Course Detail Panel (defined outside to avoid remount bug) ───────────────
interface CourseDetailPanelProps {
  course: Course;
  resources: Resource[];
  quizzes: Quiz[];
  assignments: Assignment[];
  attemptedQuizIds: Set<string>;
  myResults: QuizResult[];
  mySubmissions: AssignmentSubmission[];
  currentUser: User | null;
  onBack: () => void;
  onTakeQuiz: (quiz: Quiz) => void;
  onSubmitAssignment: (submission: {
    assignmentId: string;
    userId: string;
    content: string;
    note: string;
  }) => void;
}

function CourseDetailPanel({
  course,
  resources,
  quizzes,
  assignments,
  attemptedQuizIds,
  myResults,
  mySubmissions,
  currentUser,
  onBack,
  onTakeQuiz,
  onSubmitAssignment,
}: CourseDetailPanelProps) {
  const [expandedSubmitId, setExpandedSubmitId] = useState<string | null>(null);
  const [submitNote, setSubmitNote] = useState("");
  const courseResources = resources.filter((r) => r.courseId === course.id);
  const courseQuizzes = quizzes.filter((q) => q.courseId === course.id);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);

  const handleSubmit = (assignment: Assignment) => {
    if (!currentUser) return;
    onSubmitAssignment({
      assignmentId: assignment.id,
      userId: currentUser.id,
      content: submitNote.trim(),
      note: submitNote.trim(),
    });
    setExpandedSubmitId(null);
    setSubmitNote("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5 min-w-0"
      data-ocid="student.course_detail.panel"
    >
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 font-medium transition-colors"
        data-ocid="student.course_detail.back.button"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        Back to Courses
      </button>

      {/* Course header card */}
      <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-purple-500/20 to-blue-600/10 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge className="bg-purple-400/20 text-purple-200 border border-purple-400/30 text-xs">
                {course.code}
              </Badge>
              <Badge className="bg-green-400/20 text-green-300 text-[10px] border border-green-400/30">
                Active
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-white mt-2 truncate">
              {course.name}
            </h2>
            <p className="text-sm text-white/60 mt-0.5 truncate">
              {course.subject}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-white/50 text-sm shrink-0">
            <Users className="w-4 h-4" />
            <span>{course.studentCount} students</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/50">Overall Progress</span>
            <span className="font-semibold text-white">{course.progress}%</span>
          </div>
          <Progress
            value={course.progress}
            className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-blue-500"
          />
        </div>
      </div>

      {/* Course Resources */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-300 shrink-0" />
          <h3 className="text-sm font-semibold text-white">Course Resources</h3>
          <Badge className="ml-auto bg-white/10 text-white/50 border border-white/15 text-[10px] shrink-0">
            {courseResources.length}
          </Badge>
        </div>
        {courseResources.length > 0 ? (
          <div className="divide-y divide-white/10">
            {courseResources.map((res, i) => (
              <div
                key={res.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                data-ocid={`student.course_detail.resources.item.${i + 1}`}
              >
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <ResourceIcon type={res.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {res.title}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    {res.subject} · {res.size}
                  </p>
                </div>
                {/* Action buttons — hidden on mobile to prevent overflow */}
                <div className="hidden sm:flex gap-1.5 shrink-0">
                  <button
                    type="button"
                    className="w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                    onClick={(e) => downloadResource(res, e)}
                    data-ocid={`student.course_detail.resources.download.${i + 1}`}
                  >
                    <Download className="w-3.5 h-3.5 text-white/50" />
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                    data-ocid={`student.course_detail.resources.view.${i + 1}`}
                  >
                    <Eye className="w-3.5 h-3.5 text-white/50" />
                  </button>
                </div>
                {/* Mobile: single download icon */}
                <button
                  type="button"
                  className="sm:hidden w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                  onClick={(e) => downloadResource(res, e)}
                  data-ocid={`student.course_detail.resources.download.${i + 1}`}
                >
                  <Download className="w-3.5 h-3.5 text-white/50" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="p-8 text-center"
            data-ocid="student.course_detail.resources.empty_state"
          >
            <p className="text-sm text-white/40">None available</p>
          </div>
        )}
      </div>

      {/* Related Quizzes */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-300 shrink-0" />
          <h3 className="text-sm font-semibold text-white">Related Quizzes</h3>
          <Badge className="ml-auto bg-white/10 text-white/50 border border-white/15 text-[10px] shrink-0">
            {courseQuizzes.length}
          </Badge>
        </div>
        {courseQuizzes.length > 0 ? (
          <div className="divide-y divide-white/10">
            {courseQuizzes.map((quiz, i) => {
              const attempted = attemptedQuizIds.has(quiz.id);
              const result = myResults.find((r) => r.quizId === quiz.id);
              return (
                <div
                  key={quiz.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  data-ocid={`student.course_detail.quizzes.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {quiz.title}
                    </p>
                    <p className="text-xs text-white/50">
                      {quiz.questions.length} questions · Due {quiz.dueDate}
                    </p>
                  </div>
                  {attempted && result ? (
                    <Badge
                      className={`border shrink-0 self-start sm:self-auto ${
                        result.score / result.total >= 0.7
                          ? "bg-green-400/20 text-green-300 border-green-400/30"
                          : "bg-red-400/20 text-red-300 border-red-400/30"
                      }`}
                    >
                      {result.score}/{result.total} ·{" "}
                      {Math.round((result.score / result.total) * 100)}%
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onTakeQuiz(quiz)}
                      className="gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-md transition-all duration-300 w-full sm:w-auto shrink-0"
                      data-ocid={`student.course_detail.take_quiz.button.${i + 1}`}
                    >
                      <Play className="w-3 h-3" /> Take Quiz
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="p-8 text-center"
            data-ocid="student.course_detail.quizzes.empty_state"
          >
            <p className="text-sm text-white/40">None available</p>
          </div>
        )}
      </div>

      {/* Assignments */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-indigo-300 shrink-0" />
          <h3 className="text-sm font-semibold text-white">Assignments</h3>
          <Badge className="ml-auto bg-white/10 text-white/50 border border-white/15 text-[10px] shrink-0">
            {courseAssignments.length}
          </Badge>
        </div>
        {courseAssignments.length > 0 ? (
          <div className="divide-y divide-white/10">
            {courseAssignments.map((assignment, i) => {
              const submitted = mySubmissions.some(
                (s) => s.assignmentId === assignment.id,
              );
              const isExpanded = expandedSubmitId === assignment.id;
              return (
                <div
                  key={assignment.id}
                  className="px-4 py-3 hover:bg-white/5 transition-colors"
                  data-ocid={`student.course_detail.assignments.item.${i + 1}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <p className="text-sm font-semibold text-white leading-snug">
                      {assignment.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <Badge className="bg-orange-400/20 text-orange-300 border border-orange-400/30 text-[10px]">
                        Due {assignment.dueDate}
                      </Badge>
                      {submitted ? (
                        <Badge
                          className="bg-green-400/20 text-green-300 border border-green-400/30 text-[10px]"
                          data-ocid={`student.course_detail.assignments.submitted.${i + 1}`}
                        >
                          ✓ Submitted
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            setExpandedSubmitId(
                              isExpanded ? null : assignment.id,
                            )
                          }
                          className="h-6 text-[10px] px-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                          data-ocid={`student.course_detail.assignments.submit.button.${i + 1}`}
                        >
                          Submit Assignment
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                    {assignment.description}
                  </p>
                  {isExpanded && !submitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2"
                      data-ocid={`student.course_detail.assignments.submit.panel.${i + 1}`}
                    >
                      <p className="text-xs font-medium text-white/70">
                        Add a note (optional)
                      </p>
                      <textarea
                        value={submitNote}
                        onChange={(e) => setSubmitNote(e.target.value)}
                        placeholder="Any notes for your instructor..."
                        rows={3}
                        className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-xs text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-400/50"
                        data-ocid="student.course_detail.assignments.note.textarea"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedSubmitId(null);
                            setSubmitNote("");
                          }}
                          className="text-xs text-white/50 hover:text-white/80 px-3 py-1.5 rounded border border-white/10 hover:bg-white/5 transition-colors"
                          data-ocid="student.course_detail.assignments.cancel.button"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmit(assignment)}
                          className="text-xs text-white font-medium px-3 py-1.5 rounded bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all"
                          data-ocid="student.course_detail.assignments.confirm.button"
                        >
                          Submit
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="p-8 text-center"
            data-ocid="student.course_detail.assignments.empty_state"
          >
            <p className="text-sm text-white/40">None available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudentDashboard({ activePage, onNavigate }: Props) {
  const { data, addAssignmentSubmission } = useAppData();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map: Record<string, string> = {
      Quizzes: "quizzes",
      "My Progress": "progress",
      Messages: "messages",
      Resources: "resources",
      Dashboard: "dashboard",
      "My Courses": "dashboard",
    };
    if (map[activePage]) {
      setActiveTab(map[activePage]);
    }
  }, [activePage]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, conversations]);

  const myResults = data.quizResults.filter(
    (r) => r.userId === currentUser?.id,
  );
  const attemptedQuizIds = new Set(myResults.map((r) => r.quizId));
  const availableQuizzes = data.quizzes.filter(
    (q) => !attemptedQuizIds.has(q.id),
  );
  const avgScore =
    myResults.length > 0
      ? Math.round(
          (myResults.reduce((s, r) => s + r.score / r.total, 0) /
            myResults.length) *
            100,
        )
      : 0;

  const courseCompletionRate =
    data.courses.length > 0
      ? Math.round(
          data.courses.reduce((s, c) => s + c.progress, 0) /
            data.courses.length,
        )
      : 0;

  const filteredResources = data.resources.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()),
  );

  const kpis = [
    {
      label: "Enrolled Courses",
      value: data.courses.length,
      gradient: "from-purple-500/20 to-purple-600/10",
    },
    {
      label: "Resources Available",
      value: data.resources.length,
      gradient: "from-blue-500/20 to-blue-600/10",
    },
    {
      label: "Quizzes Taken",
      value: myResults.length,
      gradient: "from-indigo-500/20 to-indigo-600/10",
    },
    {
      label: "Avg Score",
      value: `${avgScore}%`,
      gradient: "from-violet-500/20 to-violet-600/10",
    },
  ];

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) ?? null;

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConvId) return;
    const newMsg: Message = {
      id: Date.now(),
      sender: currentUser?.name ?? "You",
      role: "Student",
      time: "Just now",
      text: messageText.trim(),
      avatar: (currentUser?.name ?? "Y").slice(0, 2).toUpperCase(),
      isMe: true,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, messages: [...c.messages, newMsg] } : c,
      ),
    );
    setMessageText("");
  };

  if (selectedQuiz) {
    return (
      <QuizAttemptPage
        quiz={selectedQuiz}
        onBack={() => setSelectedQuiz(null)}
        onComplete={() => {
          setSelectedQuiz(null);
          setActiveTab("quizzes");
        }}
      />
    );
  }

  return (
    <div
      className="flex-1 p-4 sm:p-6 space-y-6 min-w-0 overflow-hidden"
      data-ocid="student.page"
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/60 mt-0.5">
            Welcome back, {currentUser?.name}
          </p>
        </motion.div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources, courses…"
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-purple-400/50 focus-visible:border-white/40"
            data-ocid="student.search_input"
          />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`glass-card p-5 bg-gradient-to-br ${kpi.gradient}`}
            data-ocid={`student.kpi.item.${i + 1}`}
          >
            <p className="text-xs font-medium text-white/60 mb-2">
              {kpi.label}
            </p>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setSelectedCourse(null);
          const reverseMap: Record<string, string> = {
            dashboard: "Dashboard",
            resources: "Resources",
            quizzes: "Quizzes",
            progress: "My Progress",
            messages: "Messages",
          };
          if (reverseMap[val]) onNavigate(reverseMap[val]);
        }}
        data-ocid="student.tab"
      >
        <div className="overflow-x-auto">
          <TabsList className="mb-4 bg-white/10 border border-white/15 w-max min-w-full">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 whitespace-nowrap text-xs sm:text-sm"
              data-ocid="student.dashboard.tab"
            >
              My Courses
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 whitespace-nowrap text-xs sm:text-sm"
              data-ocid="student.resources.tab"
            >
              Resources
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 whitespace-nowrap text-xs sm:text-sm"
              data-ocid="student.quizzes.tab"
            >
              Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 whitespace-nowrap text-xs sm:text-sm"
              data-ocid="student.progress.tab"
            >
              My Progress
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 whitespace-nowrap text-xs sm:text-sm"
              data-ocid="student.messages.tab"
            >
              Messages
            </TabsTrigger>
          </TabsList>
        </div>

        {/* My Courses */}
        <TabsContent value="dashboard">
          {selectedCourse ? (
            <CourseDetailPanel
              course={selectedCourse}
              resources={data.resources}
              quizzes={data.quizzes}
              assignments={data.assignments}
              attemptedQuizIds={attemptedQuizIds}
              myResults={myResults}
              mySubmissions={data.assignmentSubmissions.filter(
                (s) => s.userId === currentUser?.id,
              )}
              currentUser={currentUser}
              onBack={() => setSelectedCourse(null)}
              onTakeQuiz={(quiz) => setSelectedQuiz(quiz)}
              onSubmitAssignment={addAssignmentSubmission}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.courses.map((course, i) => (
                <div
                  key={course.id}
                  className="glass-card p-4"
                  data-ocid={`student.courses.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-sm text-white">
                      {course.code}
                    </p>
                    <Badge className="bg-green-400/20 text-green-300 text-[10px] border border-green-400/30">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-white/60 mb-1">{course.name}</p>
                  <p className="text-xs text-white/50 mb-3">{course.subject}</p>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">Progress</span>
                      <span className="font-medium text-white">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress
                      value={course.progress}
                      className="h-1.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                    className="text-xs text-purple-300 font-medium hover:text-purple-200 hover:underline transition-colors"
                    data-ocid={`student.courses.link.${i + 1}`}
                  >
                    View Course →
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources">
          <div className="glass-card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white">
                Resource Library
              </h2>
            </div>
            <div className="divide-y divide-white/10">
              {filteredResources.map((res, i) => (
                <div
                  key={res.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  data-ocid={`student.resources.item.${i + 1}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <ResourceIcon type={res.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {res.title}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {res.subject} · {res.size}
                    </p>
                  </div>
                  <div className="hidden sm:flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      className="w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                      onClick={(e) => downloadResource(res, e)}
                      data-ocid={`student.resources.download.${i + 1}`}
                    >
                      <Download className="w-3.5 h-3.5 text-white/50" />
                    </button>
                    <button
                      type="button"
                      className="w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                      data-ocid={`student.resources.view.${i + 1}`}
                    >
                      <Eye className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="sm:hidden w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                    onClick={(e) => downloadResource(res, e)}
                    data-ocid={`student.resources.download.${i + 1}`}
                  >
                    <Download className="w-3.5 h-3.5 text-white/50" />
                  </button>
                </div>
              ))}
              {filteredResources.length === 0 && (
                <p
                  className="text-white/50 text-sm py-8 text-center"
                  data-ocid="student.resources.empty_state"
                >
                  No resources available yet.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Quizzes */}
        <TabsContent value="quizzes">
          <div className="space-y-4">
            {availableQuizzes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  Available Quizzes
                </h3>
                <div className="space-y-3">
                  {availableQuizzes.map((quiz, i) => (
                    <div
                      key={quiz.id}
                      className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between"
                      data-ocid={`student.available_quizzes.item.${i + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">
                          {quiz.title}
                        </p>
                        <p className="text-xs text-white/50">
                          {quiz.subject} · {quiz.questions.length} questions ·
                          Due {quiz.dueDate}
                        </p>
                        {quiz.questions.length > 0 && (
                          <p className="text-xs text-white/40 mt-1 italic">
                            Preview:{" "}
                            {quiz.questions[0].questionText.slice(0, 60)}
                            {quiz.questions[0].questionText.length > 60
                              ? "…"
                              : ""}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setSelectedQuiz(quiz)}
                        className="gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-md transition-all duration-300 w-full sm:w-auto sm:ml-4 shrink-0"
                        data-ocid={`student.take_quiz.button.${i + 1}`}
                      >
                        <Play className="w-3 h-3" /> Take Quiz
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myResults.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  Completed Quizzes
                </h3>
                <div className="space-y-3">
                  {myResults.map((result, i) => (
                    <div
                      key={result.id}
                      className="glass-card p-4 flex items-center justify-between gap-3"
                      data-ocid={`student.completed_quizzes.item.${i + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">
                          {result.quizTitle}
                        </p>
                        <p className="text-xs text-white/50">
                          Completed {result.completedAt}
                        </p>
                      </div>
                      <Badge
                        className={`border shrink-0 ${
                          result.score / result.total >= 0.7
                            ? "bg-green-400/20 text-green-300 border-green-400/30"
                            : "bg-red-400/20 text-red-300 border-red-400/30"
                        }`}
                      >
                        {result.score}/{result.total} ·{" "}
                        {Math.round((result.score / result.total) * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableQuizzes.length === 0 && myResults.length === 0 && (
              <div
                className="glass-card p-12 text-center"
                data-ocid="student.quizzes.empty_state"
              >
                <ClipboardList className="w-10 h-10 text-white/30 mx-auto mb-3" />
                <p className="text-white/50">No quizzes available yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Progress */}
        <TabsContent value="progress">
          <div className="space-y-4">
            {/* Top KPI block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-5 bg-gradient-to-br from-purple-500/20 to-purple-600/10"
                data-ocid="student.progress.academic_score.card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-300" />
                  <p className="text-xs text-white/60">
                    Overall Academic Score
                  </p>
                </div>
                <p className="text-4xl font-bold text-white">{avgScore}%</p>
                <p className="text-xs text-white/40 mt-1">
                  Based on {myResults.length} completed quiz
                  {myResults.length !== 1 ? "zes" : ""}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="glass-card p-5 bg-gradient-to-br from-blue-500/20 to-blue-600/10"
                data-ocid="student.progress.assignments.card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-300" />
                  <p className="text-xs text-white/60">Total Assignments</p>
                </div>
                <p className="text-4xl font-bold text-white">
                  {data.assignments.length}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Across all subjects
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="glass-card p-5 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10"
                data-ocid="student.progress.completion.card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-300" />
                  <p className="text-xs text-white/60">
                    Course Completion Rate
                  </p>
                </div>
                <p className="text-4xl font-bold text-white">
                  {courseCompletionRate}%
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Average across all courses
                </p>
              </motion.div>
            </div>

            {/* Results table */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-white/10">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-purple-300" /> Quiz
                  History
                </h2>
              </div>
              {myResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-white/60">Quiz</TableHead>
                        <TableHead className="text-white/60">Score</TableHead>
                        <TableHead className="text-white/60">
                          Percentage
                        </TableHead>
                        <TableHead className="text-white/60">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myResults.map((result, i) => (
                        <TableRow
                          key={result.id}
                          className="border-white/10 hover:bg-white/5"
                          data-ocid={`student.progress.row.${i + 1}`}
                        >
                          <TableCell className="font-medium text-sm text-white">
                            {result.quizTitle}
                          </TableCell>
                          <TableCell className="text-sm text-white/70">
                            {result.score}/{result.total}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 sm:w-24 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                  style={{
                                    width: `${Math.round((result.score / result.total) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-white/50">
                                {Math.round(
                                  (result.score / result.total) * 100,
                                )}
                                %
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-white/50">
                            {result.completedAt}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div
                  className="p-12 text-center"
                  data-ocid="student.progress.empty_state"
                >
                  <ClipboardList className="w-10 h-10 text-white/30 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">
                    No quiz history yet. Take a quiz to see your progress!
                  </p>
                </div>
              )}
            </div>

            {/* Course progress bars */}
            <div className="glass-card p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-white mb-4">
                Course Completion
              </h2>
              <div className="space-y-3">
                {data.courses.map((course) => (
                  <div key={course.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-white truncate mr-2">
                        {course.code} — {course.name}
                      </span>
                      <span className="text-white/50 shrink-0">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress
                      value={course.progress}
                      className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages">
          <div
            className="glass-card overflow-hidden h-[520px]"
            data-ocid="student.messages.panel"
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Conversations list — hidden on mobile when a convo is open */}
              <div
                className={`${
                  activeConvId !== null ? "hidden md:flex" : "flex"
                } w-full md:w-[35%] border-b md:border-b-0 md:border-r border-white/10 flex-col`}
              >
                <div className="flex items-center gap-2 p-4 border-b border-white/10">
                  <MessageSquare className="w-4 h-4 text-purple-300" />
                  <h2 className="text-sm font-semibold text-white">Messages</h2>
                  <Badge className="ml-auto bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px]">
                    {conversations.length}
                  </Badge>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-white/10">
                  {conversations.map((conv, i) => (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setActiveConvId(conv.id)}
                      className={`w-full text-left flex gap-3 px-4 py-3.5 transition-colors ${
                        activeConvId === conv.id
                          ? "bg-white/20"
                          : "hover:bg-white/5"
                      }`}
                      data-ocid={`student.messages.item.${i + 1}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                        {conv.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-semibold text-white truncate">
                            {conv.sender}
                          </span>
                          <span className="text-[10px] text-white/40 whitespace-nowrap">
                            {conv.messages[conv.messages.length - 1]?.time ??
                              ""}
                          </span>
                        </div>
                        <Badge className="mb-1 bg-white/10 text-white/50 border border-white/15 text-[10px] px-1.5">
                          {conv.role}
                        </Badge>
                        <p className="text-[11px] text-white/50 leading-tight line-clamp-2">
                          {conv.messages[conv.messages.length - 1]?.text ?? ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Thread panel */}
              <div
                className={`${
                  activeConvId !== null ? "flex" : "hidden md:flex"
                } flex-1 flex-col min-w-0`}
              >
                {activeConversation ? (
                  <>
                    {/* Thread header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                      {/* Back button — mobile only */}
                      <button
                        type="button"
                        onClick={() => setActiveConvId(null)}
                        className="md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Back to conversations"
                        data-ocid="student.messages.back.button"
                      >
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                      </button>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                        {activeConversation.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {activeConversation.sender}
                        </p>
                        <p className="text-[10px] text-white/40">
                          {activeConversation.role}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {activeConversation.messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={`flex gap-2 ${
                            msg.isMe ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
                            {msg.isMe
                              ? (currentUser?.name ?? "Y")
                                  .slice(0, 2)
                                  .toUpperCase()
                              : msg.avatar}
                          </div>
                          <div
                            className={`max-w-[70%] rounded-2xl px-3 py-2 ${
                              msg.isMe
                                ? "bg-gradient-to-br from-purple-500/60 to-blue-500/60 text-white rounded-tr-sm"
                                : "bg-white/10 text-white/90 rounded-tl-sm"
                            }`}
                          >
                            <p className="text-xs leading-relaxed">
                              {msg.text}
                            </p>
                            <p className="text-[10px] mt-1 opacity-50 text-right">
                              {msg.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={threadEndRef} />
                    </div>

                    {/* Compose */}
                    <div className="p-3 border-t border-white/10 flex gap-2">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder="Type a reply…"
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-purple-400/50"
                        data-ocid="student.messages.input"
                      />
                      <Button
                        onClick={handleSendMessage}
                        size="sm"
                        className="gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-md"
                        data-ocid="student.messages.button"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div
                    className="flex-1 flex flex-col items-center justify-center gap-3"
                    data-ocid="student.messages.empty_state"
                  >
                    <MessageSquare className="w-10 h-10 text-white/20" />
                    <p className="text-sm text-white/40">
                      Select a conversation to view messages
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
