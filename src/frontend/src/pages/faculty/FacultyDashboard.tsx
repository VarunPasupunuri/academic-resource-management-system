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
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Eye,
  FileIcon,
  FileText,
  Plus,
  Search,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import AddResourceModal from "../../components/modals/AddResourceModal";
import CreateQuizModal from "../../components/modals/CreateQuizModal";
import { useAppData } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { downloadResource } from "../../utils/downloadResource";

const ResourceIcon = ({ type }: { type: string }) => {
  if (type === "video") return <Video className="w-5 h-5 text-purple-300" />;
  if (type === "doc") return <FileIcon className="w-5 h-5 text-blue-300" />;
  return <FileText className="w-5 h-5 text-purple-300" />;
};

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function FacultyDashboard({ activePage, onNavigate }: Props) {
  const { data } = useAppData();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");
  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  useEffect(() => {
    const map: Record<string, string> = {
      Quizzes: "quizzes",
      Resources: "resources",
      Students: "students",
      Reports: "students",
      Dashboard: "courses",
    };
    if (map[activePage]) {
      setActiveTab(map[activePage]);
    }
  }, [activePage]);

  const totalStudents = data.studentCount;
  const pendingReviews = data.assignmentSubmissions.length;

  const filteredResources = data.resources.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()),
  );

  // Show loading state
  if (data.loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-purple-400/30 border-t-purple-400 animate-spin mx-auto" />
          <p className="text-white/50 text-sm">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Resources",
      value: data.resources.length,
      icon: <FileText className="w-5 h-5 text-purple-300" />,
      gradient: "from-purple-500/20 to-purple-600/10",
    },
    {
      label: "Total Quizzes",
      value: data.quizzes.length,
      icon: <ClipboardList className="w-5 h-5 text-blue-300" />,
      gradient: "from-blue-500/20 to-blue-600/10",
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: <Users className="w-5 h-5 text-indigo-300" />,
      gradient: "from-indigo-500/20 to-indigo-600/10",
    },
    {
      label: "Pending Reviews",
      value: pendingReviews,
      icon: <BookOpen className="w-5 h-5 text-violet-300" />,
      gradient: "from-violet-500/20 to-violet-600/10",
    },
  ];

  return (
    <div
      className="flex-1 p-4 sm:p-6 space-y-6 min-w-0"
      data-ocid="faculty.page"
    >
      {/* Page Title + Search */}
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
            data-ocid="faculty.search_input"
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
            data-ocid={`faculty.kpi.item.${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-white/60">{kpi.label}</p>
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                {kpi.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Alert tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 glass-card p-4 bg-amber-500/10 border border-amber-400/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              Pending Submissions
            </p>
            <p className="text-xs text-amber-400/70">
              {pendingReviews} assignment{pendingReviews !== 1 ? "s" : ""} need
              grading
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 glass-card p-4 bg-green-500/10 border border-green-400/20">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-300">
              Upcoming Quizzes
            </p>
            <p className="text-xs text-green-400/70">
              {data.quizzes.length} quizzes scheduled
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Tabs */}
        <div className="xl:col-span-2 space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val);
              const reverseMap: Record<string, string> = {
                courses: "Dashboard",
                quizzes: "Quizzes",
                students: "Students",
                resources: "Resources",
              };
              if (reverseMap[val]) onNavigate(reverseMap[val]);
            }}
            data-ocid="faculty.tab"
          >
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 mb-3">
              <div className="overflow-x-auto w-full sm:w-auto pb-1">
                <TabsList className="bg-white/10 border border-white/15 w-max">
                  <TabsTrigger
                    value="courses"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 whitespace-nowrap text-xs sm:text-sm"
                    data-ocid="faculty.courses.tab"
                  >
                    My Courses
                  </TabsTrigger>
                  <TabsTrigger
                    value="quizzes"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 whitespace-nowrap text-xs sm:text-sm"
                    data-ocid="faculty.quizzes.tab"
                  >
                    Quizzes
                  </TabsTrigger>
                  <TabsTrigger
                    value="students"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 whitespace-nowrap text-xs sm:text-sm"
                    data-ocid="faculty.students.tab"
                  >
                    Students
                  </TabsTrigger>
                  <TabsTrigger
                    value="resources"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 whitespace-nowrap text-xs sm:text-sm"
                    data-ocid="faculty.resources.tab"
                  >
                    Resources
                  </TabsTrigger>
                </TabsList>
              </div>
              <Button
                size="sm"
                onClick={() => setCreateQuizOpen(true)}
                className="gap-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-md transition-all duration-300"
                data-ocid="faculty.create_quiz.button"
              >
                <Plus className="w-3.5 h-3.5" /> Create Quiz
              </Button>
            </div>

            <TabsContent value="courses">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.courses.map((course, i) => (
                  <div
                    key={course.id}
                    className="glass-card p-4"
                    data-ocid={`faculty.courses.item.${i + 1}`}
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
                    <p className="text-xs text-white/50 mb-3">
                      Students: {totalStudents}
                    </p>
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
                      className="text-xs text-purple-300 font-medium hover:text-purple-200 hover:underline flex items-center gap-1 transition-colors"
                      data-ocid={`faculty.courses.edit_button.${i + 1}`}
                    >
                      Manage →
                    </button>
                  </div>
                ))}
                {data.courses.length === 0 && (
                  <div className="col-span-3 text-center py-10 text-white/40 text-sm">
                    No courses found. Add courses via the backend.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="quizzes">
              <div className="space-y-3">
                {data.quizzes.map((quiz, i) => {
                  const isExpanded = expandedQuiz === quiz.id;
                  return (
                    <div
                      key={quiz.id}
                      className="glass-card overflow-hidden"
                      data-ocid={`faculty.quizzes.item.${i + 1}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedQuiz(isExpanded ? null : quiz.id)
                        }
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        data-ocid={`faculty.quizzes.toggle.${i + 1}`}
                      >
                        <div className="text-left">
                          <p className="font-semibold text-sm text-white">
                            {quiz.title}
                          </p>
                          <p className="text-xs text-white/50">
                            {quiz.subject} · {quiz.questions.length} questions ·
                            Due {quiz.dueDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-purple-400/20 text-purple-200 border border-purple-400/30">
                            {quiz.questions.length}Q
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-white/60" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white/60" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                          {quiz.questions.length === 0 ? (
                            <p className="text-xs text-white/40 italic">
                              No questions added yet.
                            </p>
                          ) : (
                            quiz.questions.map((q, qi) => (
                              <div
                                key={q.id}
                                className="bg-white/5 rounded-lg p-3"
                              >
                                <p className="text-sm text-white font-medium mb-2">
                                  {qi + 1}. {q.questionText}
                                </p>
                                <div className="space-y-1">
                                  {q.options.map((opt, oi) => (
                                    <div
                                      key={`opt-${q.id}-${oi}`}
                                      className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                                        oi === q.correctAnswer
                                          ? "bg-green-500/20 text-green-300"
                                          : "text-white/60"
                                      }`}
                                    >
                                      {oi === q.correctAnswer && (
                                        <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                                      )}
                                      {oi !== q.correctAnswer && (
                                        <span className="w-3 h-3 flex-shrink-0" />
                                      )}
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {data.quizzes.length === 0 && (
                  <div className="text-center py-10 text-white/40 text-sm glass-card p-8">
                    No quizzes yet. Click &apos;Create Quiz&apos; to add one.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="students">
              <div className="space-y-5">
                {/* Quiz Results */}
                <div className="glass-card overflow-hidden overflow-x-auto">
                  <div className="p-4 border-b border-white/10 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-300" />
                    <h3 className="text-sm font-semibold text-white">
                      Quiz Results
                    </h3>
                    <Badge className="ml-auto bg-white/10 text-white/50 border border-white/15 text-[10px]">
                      {data.quizResults.length}
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-white/60">Student</TableHead>
                        <TableHead className="text-white/60">Quiz</TableHead>
                        <TableHead className="text-white/60">Score</TableHead>
                        <TableHead className="text-white/60">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.quizResults.map((result, i) => (
                        <TableRow
                          key={result.id}
                          className="border-white/10 hover:bg-white/5"
                          data-ocid={`faculty.students.row.${i + 1}`}
                        >
                          <TableCell className="font-medium text-sm text-white">
                            {result.studentName}
                          </TableCell>
                          <TableCell className="text-sm text-white/60">
                            {result.quizTitle}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs border ${
                                result.score / result.total >= 0.7
                                  ? "bg-green-400/20 text-green-300 border-green-400/30"
                                  : "bg-red-400/20 text-red-300 border-red-400/30"
                              }`}
                            >
                              {result.score}/{result.total}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-white/50">
                            {result.completedAt}
                          </TableCell>
                        </TableRow>
                      ))}
                      {data.quizResults.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-white/40 py-8 text-sm"
                          >
                            No quiz results yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Assignment Submissions */}
                <div className="glass-card overflow-hidden overflow-x-auto">
                  <div className="p-4 border-b border-white/10 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-300" />
                    <h3 className="text-sm font-semibold text-white">
                      Assignment Submissions
                    </h3>
                    <Badge className="ml-auto bg-white/10 text-white/50 border border-white/15 text-[10px]">
                      {data.assignmentSubmissions.length}
                    </Badge>
                  </div>
                  {data.assignmentSubmissions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableHead className="text-white/60">
                            Student
                          </TableHead>
                          <TableHead className="text-white/60">
                            Assignment
                          </TableHead>
                          <TableHead className="text-white/60">
                            Subject
                          </TableHead>
                          <TableHead className="text-white/60">Note</TableHead>
                          <TableHead className="text-white/60">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.assignmentSubmissions.map((sub, i) => (
                          <TableRow
                            key={sub.id}
                            className="border-white/10 hover:bg-white/5"
                            data-ocid={`faculty.submissions.row.${i + 1}`}
                          >
                            <TableCell className="font-medium text-sm text-white">
                              {sub.studentName}
                            </TableCell>
                            <TableCell className="text-sm text-white/70 max-w-[160px] truncate">
                              {sub.assignmentTitle}
                            </TableCell>
                            <TableCell className="text-sm text-white/60">
                              {sub.subject}
                            </TableCell>
                            <TableCell className="text-xs text-white/50 max-w-[160px] truncate">
                              {sub.note || (
                                <span className="italic text-white/30">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-white/50 whitespace-nowrap">
                              {sub.submittedAt}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div
                      className="p-8 text-center"
                      data-ocid="faculty.submissions.empty_state"
                    >
                      <ClipboardList className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-sm text-white/40">
                        No assignment submissions yet.
                      </p>
                      <p className="text-xs text-white/30 mt-1">
                        Submissions will appear here when students submit their
                        assignments.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <div className="glass-card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-white/10">
                  <h2 className="text-base font-semibold text-white">
                    Resource Library
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => setAddResourceOpen(true)}
                    className="gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200"
                    data-ocid="faculty.add_resource.button"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Resource
                  </Button>
                </div>
                <div className="divide-y divide-white/10">
                  {filteredResources.map((res, i) => (
                    <div
                      key={res.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                      data-ocid={`faculty.resources.item.${i + 1}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <ResourceIcon type={res.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {res.title}
                        </p>
                        <p className="text-xs text-white/50">
                          {res.subject} · {res.size} · {res.uploadedAt}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          className="w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                          onClick={(e) => downloadResource(res, e)}
                          data-ocid={`faculty.resources.download.${i + 1}`}
                        >
                          <Download className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button
                          type="button"
                          className="w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                          data-ocid={`faculty.resources.view.${i + 1}`}
                        >
                          <Eye className="w-3.5 h-3.5 text-white/50" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredResources.length === 0 && (
                    <p
                      className="text-white/50 text-sm py-8 text-center"
                      data-ocid="faculty.resources.empty_state"
                    >
                      No resources yet. Click &apos;Add Resource&apos; to upload
                      one.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Activities + Progress Chart */}
        <div className="space-y-4">
          {/* Upcoming Activities */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-white/10">
              <CalendarClock className="w-4 h-4 text-purple-300" />
              <h2 className="text-sm font-semibold text-white">
                Upcoming Activities
              </h2>
            </div>
            <div className="divide-y divide-white/10">
              {data.quizzes.map((quiz, i) => (
                <div
                  key={quiz.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                  data-ocid={`faculty.activities.item.${i + 1}`}
                >
                  <div>
                    <p className="text-xs font-medium text-white">
                      {quiz.title}
                    </p>
                    <p className="text-[11px] text-white/50">{quiz.subject}</p>
                  </div>
                  <span className="text-[11px] text-white/40 whitespace-nowrap">
                    {quiz.dueDate}
                  </span>
                </div>
              ))}
              {data.assignments.map((a, i) => (
                <div
                  key={a.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                  data-ocid={`faculty.activities.item.${data.quizzes.length + i + 1}`}
                >
                  <div>
                    <p className="text-xs font-medium text-white">{a.title}</p>
                    <p className="text-[11px] text-white/50">{a.subject}</p>
                  </div>
                  <span className="text-[11px] text-white/40 whitespace-nowrap">
                    {a.dueDate}
                  </span>
                </div>
              ))}
              {data.quizzes.length === 0 && data.assignments.length === 0 && (
                <p className="px-4 py-6 text-xs text-white/30 text-center">
                  No upcoming activities
                </p>
              )}
            </div>
          </div>

          {/* Student Progress Chart */}
          <div className="glass-card p-4">
            <h2 className="text-sm font-semibold text-white mb-4">
              Student Progress Overview
            </h2>
            <div className="space-y-3">
              {data.courses.map((course) => (
                <div key={course.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-white">
                      {course.code}
                    </span>
                    <span className="text-white/50">{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {data.courses.length === 0 && (
                <p className="text-xs text-white/30 text-center py-4">
                  No courses yet
                </p>
              )}
            </div>
            {data.courses.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {data.courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 text-xs text-white/50"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                    {c.code}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddResourceModal
        open={addResourceOpen}
        onClose={() => setAddResourceOpen(false)}
      />
      <CreateQuizModal
        open={createQuizOpen}
        onClose={() => setCreateQuizOpen(false)}
      />
    </div>
  );
}
