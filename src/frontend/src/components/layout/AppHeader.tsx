import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BookOpen,
  CheckCheck,
  ChevronDown,
  ClipboardList,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types";

interface Notification {
  id: number;
  icon: React.ReactNode;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const defaultNotifications: Notification[] = [
  {
    id: 1,
    icon: <FileText className="w-4 h-4 text-purple-400" />,
    title: "New Resource Added",
    message: "Introduction to Calculus PDF is now available.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    icon: <ClipboardList className="w-4 h-4 text-blue-400" />,
    title: "Quiz Due Soon",
    message: "Physics Quiz #3 is due tomorrow.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: 3,
    icon: <BookOpen className="w-4 h-4 text-green-400" />,
    title: "Assignment Graded",
    message: "Your Chemistry assignment was graded: 88/100.",
    time: "3 hrs ago",
    read: true,
  },
];

interface AppHeaderProps {
  currentUser: User;
  onMenuClick: () => void;
  onNavigate?: (page: string) => void;
}

export default function AppHeader({
  currentUser,
  onMenuClick,
  onNavigate,
}: AppHeaderProps) {
  const { logout } = useAuth();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [notifications, setNotifications] =
    useState<Notification[]>(defaultNotifications);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const navLinks =
    currentUser.role === "faculty"
      ? [
          { label: "Dashboard", id: "dashboard" },
          { label: "Courses", id: "courses" },
          { label: "Resource Library", id: "resources" },
          { label: "Quizzes", id: "quizzes" },
          { label: "Students", id: "students" },
          { label: "Reports", id: "reports" },
        ]
      : [
          { label: "Dashboard", id: "dashboard" },
          { label: "My Courses", id: "courses" },
          { label: "Resource Library", id: "resources" },
          { label: "Quizzes", id: "quizzes" },
          { label: "Progress", id: "progress" },
          { label: "Messages", id: "messages" },
        ];

  return (
    <header className="bg-header text-white flex items-center gap-0 h-14 px-4 sticky top-0 z-40 border-b border-white/10 shadow-lg">
      {/* Hamburger - mobile only */}
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors mr-2"
        aria-label="Toggle sidebar"
        data-ocid="header.menu.button"
      >
        <Menu className="w-5 h-5 text-white/70" />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-2 mr-4 md:mr-8 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-sm tracking-wide whitespace-nowrap text-white truncate max-w-[120px] sm:max-w-none">
          ACADEMIA RMS
        </span>
      </div>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {navLinks.map((link) => (
          <button
            type="button"
            key={link.id}
            onClick={() => {
              setActiveNav(link.label);
              onNavigate?.(link.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeNav === link.label
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>

      {/* Right utilities */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            data-ocid="header.notifications.button"
          >
            <Bell className="w-4 h-4 text-white/70" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              {/* Backdrop */}
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              {/* Panel */}
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 z-50 rounded-2xl border border-white/15 shadow-2xl backdrop-blur-xl bg-[#1a1040]/90 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-purple-300 hover:text-white transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-white/10 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      type="button"
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-white/10 ${
                        !n.read ? "bg-white/5" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-semibold ${n.read ? "text-white/60" : "text-white"}`}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-white/30 mt-1">
                          {n.time}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-purple-400" />
                      )}
                    </button>
                  ))}
                </div>

                {notifications.length === 0 && (
                  <p className="text-center text-xs text-white/40 py-8">
                    No notifications
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1.5 transition-all duration-200"
              data-ocid="header.profile.button"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-none text-white">
                  {currentUser.name.split(" ")[0].toUpperCase()}
                </p>
                <p className="text-[10px] text-white/50 capitalize">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="text-sm">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-sm text-destructive focus:text-destructive"
              onClick={logout}
              data-ocid="header.logout.button"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
