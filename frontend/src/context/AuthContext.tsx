import { createContext } from "react";

export type SessionUser = {
  id: string;
  email: string;
  role: "candidate" | "employer" | "admin" | "demo_admin" | null;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  company_name?: string | null;
  company_id?: string | null;
  credits?: number;
  subscription_tier?: "free" | "pro_saas";
  is_public?: boolean;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
};

// Extended context type
export type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setOverride?: (role: SessionUser["role"]) => void;
  refreshProfile?: () => Promise<void>; // Call this after updating profile
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => { },
  setOverride: undefined,
  refreshProfile: undefined,
});
