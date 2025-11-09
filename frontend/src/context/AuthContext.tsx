// src/context/AuthContext.tsx
import { createContext } from "react";

export type SessionUser = {
  id: string;
  email: string;
  role: "candidate" | "employer" | "admin" | null;
};

// ✅ Extended context type
export type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setOverride?: (role: SessionUser["role"]) => void; // ← new optional helper
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setOverride: undefined,
});
