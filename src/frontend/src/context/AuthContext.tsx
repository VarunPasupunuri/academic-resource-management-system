import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Backend } from "../backend";
import type { User, UserRole } from "../types";

interface AuthContextType {
  currentUser: User | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function backendUserToUser(bu: {
  id: bigint;
  name: string;
  email: string;
  password: string;
  role: { faculty: null } | { student: null } | string;
}): User {
  const role: UserRole =
    typeof bu.role === "string"
      ? (bu.role as UserRole)
      : "faculty" in (bu.role as object)
        ? "faculty"
        : "student";
  return {
    id: bu.id.toString(),
    name: bu.name,
    email: bu.email,
    password: bu.password,
    role,
  };
}

interface AuthProviderProps {
  children: ReactNode;
  actor: Backend | null;
  actorReady: boolean;
}

export function AuthProvider({
  children,
  actor,
  actorReady,
}: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // On actor ready: restore session by re-fetching user from backend
  useEffect(() => {
    if (!actorReady || !actor) return;
    const savedId = localStorage.getItem("armsUserId");
    if (!savedId) {
      setIsAuthLoading(false);
      return;
    }
    actor
      .getUser(BigInt(savedId))
      .then((u) => {
        if (u)
          setCurrentUser(
            backendUserToUser(u as Parameters<typeof backendUserToUser>[0]),
          );
      })
      .catch(() => {
        localStorage.removeItem("armsUserId");
      })
      .finally(() => setIsAuthLoading(false));
  }, [actor, actorReady]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!actor) return "Backend not ready. Please try again.";
      try {
        const result = await actor.login(email, password);
        if (result.__kind__ === "ok") {
          const user = backendUserToUser(
            result.ok as Parameters<typeof backendUserToUser>[0],
          );
          setCurrentUser(user);
          localStorage.setItem("armsUserId", user.id);
          return null;
        }
        return result.err;
      } catch {
        return "Login failed. Please try again.";
      }
    },
    [actor],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("armsUserId");
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
    ): Promise<string | null> => {
      if (!actor) return "Backend not ready. Please try again.";
      try {
        // Map UI role to backend UserRole enum format
        const backendRole =
          role === "faculty"
            ? ("faculty" as unknown as import("../backend").UserRole)
            : ("student" as unknown as import("../backend").UserRole);
        const result = await actor.register(email, password, backendRole, name);
        if (result.__kind__ === "ok") {
          return await login(email, password);
        }
        return result.err;
      } catch {
        return "Registration failed. Please try again.";
      }
    },
    [actor, login],
  );

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthLoading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
