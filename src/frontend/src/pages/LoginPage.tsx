import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const err = await login(email, password);
      if (err) setError(err);
    } else {
      if (!name.trim()) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }
      const err = await register(name, email, password, role);
      if (err) setError(err);
    }

    setLoading(false);
  };

  const stats = [
    { label: "Active Students", val: "1,240" },
    { label: "Resources", val: "3,800+" },
    { label: "Courses", val: "148" },
    { label: "Quizzes Created", val: "520" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center text-white relative z-10"
        >
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mx-auto mb-6 shadow-xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            ACADEMIA RMS
          </h1>
          <p className="text-lg text-white/70 max-w-sm mx-auto">
            Academic Resource Management System — empowering educators and
            students.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="glass-card p-4"
              >
                <p className="text-2xl font-bold text-white">{s.val}</p>
                <p className="text-sm text-white/60 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ACADEMIA RMS</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-white/60 mb-6">
              {mode === "login"
                ? "Sign in to access your dashboard"
                : "Join Academia RMS today"}
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-ocid="auth.form"
            >
              {mode === "register" && (
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-white/80"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-purple-400/50 focus-visible:border-white/40"
                    data-ocid="auth.input"
                  />
                </div>
              )}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-white/80"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-purple-400/50 focus-visible:border-white/40"
                  data-ocid="auth.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-white/80"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-purple-400/50 focus-visible:border-white/40"
                  data-ocid="auth.input"
                />
              </div>
              {mode === "register" && (
                <div>
                  <Label className="text-sm font-medium text-white/80">
                    Role
                  </Label>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as UserRole)}
                  >
                    <SelectTrigger
                      className="mt-1 bg-white/10 border-white/20 text-white"
                      data-ocid="auth.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {error && (
                <p
                  className="text-sm text-red-400"
                  data-ocid="auth.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-70"
                data-ocid="auth.submit_button"
              >
                {loading
                  ? mode === "login"
                    ? "Signing in…"
                    : "Creating account…"
                  : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-white/50 mt-6">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-purple-300 font-medium hover:text-purple-200 hover:underline transition-colors"
                    data-ocid="auth.link"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-purple-300 font-medium hover:text-purple-200 hover:underline transition-colors"
                    data-ocid="auth.link"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
