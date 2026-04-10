import {
  BarChart2,
  BookOpen,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Library,
  MessageSquare,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { UserRole } from "../../types";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  children?: string[];
}

interface AppSidebarProps {
  role: UserRole;
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({
  role,
  activePage,
  onNavigate,
  isOpen,
  onClose,
}: AppSidebarProps) {
  const [coursesOpen, setCoursesOpen] = useState(true);

  const facultyItems: SidebarItem[] = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: "My Courses",
      children: ["BIO 301", "CHEM 102", "PHY 201"],
    },
    { icon: <Library className="w-4 h-4" />, label: "Resources" },
    { icon: <ClipboardList className="w-4 h-4" />, label: "Quizzes" },
    { icon: <Users className="w-4 h-4" />, label: "Students" },
    { icon: <BarChart2 className="w-4 h-4" />, label: "Reports" },
  ];

  const studentItems: SidebarItem[] = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: "My Courses",
      children: ["BIO 301", "CHEM 102", "PHY 201"],
    },
    { icon: <Library className="w-4 h-4" />, label: "Resources" },
    { icon: <ClipboardList className="w-4 h-4" />, label: "Quizzes" },
    { icon: <TrendingUp className="w-4 h-4" />, label: "My Progress" },
    { icon: <MessageSquare className="w-4 h-4" />, label: "Messages" },
  ];

  const items = role === "faculty" ? facultyItems : studentItems;

  const handleNavClick = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <aside
      className={[
        // Desktop: inline sticky sidebar
        "md:static md:translate-x-0 md:w-56 md:shrink-0 md:flex md:flex-col md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:z-auto",
        // Mobile: fixed overlay sidebar
        "fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 z-40 flex flex-col",
        "glass-dark border-r border-white/10 overflow-y-auto",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="p-4">
        {/* Mobile close button */}
        <div className="flex items-center justify-between md:hidden mb-2">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center py-4 mb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
            {role === "faculty" ? "DR" : "A"}
          </div>
          <p className="text-white text-xs font-medium mt-2 capitalize">
            {role}
          </p>
        </div>

        {/* Nav items */}
        <nav className="space-y-0.5">
          {items.map((item) => (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => {
                  if (item.children) setCoursesOpen(!coursesOpen);
                  else handleNavClick(item.label);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  activePage === item.label
                    ? "bg-white/20 text-white font-semibold shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
                data-ocid={`sidebar.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
              >
                <span
                  className={`${
                    activePage === item.label
                      ? "text-purple-300"
                      : "text-white/50"
                  } transition-colors`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.children && (
                  <ChevronDown
                    className={`w-3 h-3 text-white/40 transition-transform duration-200 ${
                      coursesOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
              {item.children && coursesOpen && (
                <div className="ml-7 mt-0.5 space-y-0.5">
                  {item.children.map((child) => (
                    <button
                      type="button"
                      key={child}
                      onClick={() => handleNavClick(child)}
                      className="w-full text-left text-xs text-white/50 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
                    >
                      {child}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
