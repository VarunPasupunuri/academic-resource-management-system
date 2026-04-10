import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AppHeader from "./components/layout/AppHeader";
import AppSidebar from "./components/layout/AppSidebar";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useBackendActor } from "./hooks/useBackendActor";
import LoginPage from "./pages/LoginPage";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

function AppShell() {
  const { currentUser, isAuthLoading } = useAuth();
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Loading</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-white/60 text-sm">Loading Academia RMS…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <LoginPage />;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        currentUser={currentUser}
        onMenuClick={() => setSidebarOpen((v) => !v)}
      />
      <div className="flex flex-1 min-h-0 relative">
        <AppSidebar
          role={currentUser.role}
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 overflow-y-auto">
          {currentUser.role === "faculty" ? (
            <FacultyDashboard
              activePage={activePage}
              onNavigate={setActivePage}
            />
          ) : (
            <StudentDashboard
              activePage={activePage}
              onNavigate={setActivePage}
            />
          )}
        </main>
      </div>
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md py-3 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
          <div className="flex flex-wrap gap-3">
            {["About", "Support", "FAQs", "Contact"].map((link) => (
              <button
                type="button"
                key={link}
                className="hover:text-white transition-colors"
              >
                {link}
              </button>
            ))}
            <span className="text-white/20">·</span>
            {["Privacy Policy", "Terms of Service"].map((link) => (
              <button
                type="button"
                key={link}
                className="hover:text-white transition-colors"
              >
                {link}
              </button>
            ))}
          </div>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            © {new Date().getFullYear()}. Built with ❤ using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

// Bridge: gets the actor and passes it down to both contexts
function BackendBridge({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useBackendActor();
  const actorReady = !isFetching && actor !== null;

  return (
    <AppProvider actor={actor} actorReady={actorReady}>
      <AuthProvider actor={actor} actorReady={actorReady}>
        {children}
      </AuthProvider>
    </AppProvider>
  );
}

export default function App() {
  return (
    <BackendBridge>
      <AppShell />
      <Toaster />
    </BackendBridge>
  );
}
