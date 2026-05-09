import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext, type SessionUser } from "./AuthContext";
import toast from "react-hot-toast";

// Helper function to fetch profile data from the profiles table
async function fetchProfileFromDB(userId: string): Promise<{
  role: SessionUser["role"];
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_id: string | null;
  credits: number;
  subscription_tier?: "free" | "plus" | "starter" | "growth" | "pro_saas" | string;
  is_public?: boolean;
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, full_name, username, avatar_url, company_name, credits, subscription_tier, is_public")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.warn("Failed to fetch profile from profiles:", error.message);
    } else {
      console.warn("No profile found for user:", userId, "- attempting auto-creation.");
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const activeUser = sessionData?.session?.user;
        if (activeUser && activeUser.id === userId) {
          await supabase.from("profiles").insert({
            id: userId,
            email: activeUser.email,
            role: activeUser.user_metadata?.role || "candidate",
            full_name: activeUser.user_metadata?.full_name || null
          });
          console.log("Auto-provisioned missing profile for", userId);
        }
      } catch (e) {
        console.error("Failed to auto-provision profile", e);
      }
    }

    return {
        role: "candidate",
        full_name: null,
        username: null,
        avatar_url: null,
        company_name: null,
        company_id: null,
        credits: 0,
        subscription_tier: "free",
        is_public: false
    };
  }

  // Look up company_id from company_members
  let companyId: string | null = null;
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  
  if (membership) {
    companyId = membership.company_id;
  }

  return {
    role: (data?.role as SessionUser["role"]) ?? "candidate",
    full_name: data?.full_name ?? null,
    username: data?.username ?? null,
    avatar_url: data?.avatar_url ?? null,
    company_name: data?.company_name ?? null,
    company_id: companyId,
    credits: data?.credits ?? 0,
    subscription_tier: data?.subscription_tier as string | undefined,
    is_public: data?.is_public ?? false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    try {
      toast.success("👋 Logging out...");
      await supabase.auth.signOut();
      localStorage.removeItem("bevisly_user");
      localStorage.removeItem("overrideRole");
      localStorage.removeItem("bevisly_last_activity");
      window.location.replace("/");
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.removeItem("bevisly_user");
      localStorage.removeItem("overrideRole");
      localStorage.removeItem("bevisly_last_activity");
      window.location.replace("/");
    }
  }, []);

  // Refresh profile data from database - call this after profile updates
  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;
    if (sessionUser) {
      const profile = await fetchProfileFromDB(sessionUser.id);
      const newUser: SessionUser = {
        id: sessionUser.id,
        email: sessionUser.email!,
        role: profile.role,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        company_name: profile.company_name,
        company_id: profile.company_id,
        credits: profile.credits,
        subscription_tier: profile.subscription_tier,
        is_public: profile.is_public,
        app_metadata: {
          provider: sessionUser.app_metadata?.provider,
          providers: sessionUser.app_metadata?.providers,
        },
      };
      setUser(newUser);
      localStorage.setItem("bevisly_user", JSON.stringify(newUser));
    }
  }, []);

  useEffect(() => {
    // Unblock the app immediately — cached user (if any) is good enough for
    // the first render. initializeAuth then verifies/refreshes in the background.
    const cachedUser = localStorage.getItem("bevisly_user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        localStorage.removeItem("bevisly_user");
      }
    }
    setLoading(false);

    // Background session verification — never blocks rendering.
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data.session?.user;
        if (sessionUser) {
          const profile = await fetchProfileFromDB(sessionUser.id);
          const newUser: SessionUser = {
            id: sessionUser.id,
            email: sessionUser.email!,
            role: profile.role,
            full_name: profile.full_name,
            username: profile.username,
            avatar_url: profile.avatar_url,
            company_name: profile.company_name,
            company_id: profile.company_id,
            credits: profile.credits,
            subscription_tier: profile.subscription_tier,
            is_public: profile.is_public,
            app_metadata: {
              provider: sessionUser.app_metadata?.provider,
              providers: sessionUser.app_metadata?.providers,
            },
          };
          setUser(newUser);
          localStorage.setItem("bevisly_user", JSON.stringify(newUser));
        } else {
          // Supabase confirmed no valid session — clear any stale cached user.
          setUser(null);
          localStorage.removeItem("bevisly_user");
        }
      } catch (err) {
        // Network / transient error — keep cached user rather than logging out.
        console.warn("Auth background check failed:", err);
      }
    };

    initializeAuth();

    // Auth change listener - synchronous callback so Supabase JS v2 does NOT
    // await it before resolving signInWithPassword. Profile fetch runs in the
    // background via .then() to avoid blocking the auth handshake.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[Auth] onAuthStateChange fired:", event, session?.user?.id ?? "no session");

        if (event === "PASSWORD_RECOVERY") {
          window.location.href = "/auth/reset";
          return;
        }

        const sessionUser = session?.user;
        if (sessionUser) {
          fetchProfileFromDB(sessionUser.id).then((profile) => {
            console.log("[Auth] fetchProfileFromDB done. role:", profile.role);
            const newUser: SessionUser = {
              id: sessionUser.id,
              email: sessionUser.email!,
              role: profile.role,
              full_name: profile.full_name,
              username: profile.username,
              avatar_url: profile.avatar_url,
              company_name: profile.company_name,
              company_id: profile.company_id,
              credits: profile.credits,
              subscription_tier: profile.subscription_tier,
              is_public: profile.is_public,
              app_metadata: {
                provider: sessionUser.app_metadata?.provider,
                providers: sessionUser.app_metadata?.providers,
              },
            };
            setUser(newUser);
            localStorage.setItem("bevisly_user", JSON.stringify(newUser));
          });
        } else {
          setUser(null);
          localStorage.removeItem("bevisly_user");
          localStorage.removeItem("overrideRole");
          localStorage.removeItem("bevisly_last_activity");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Listen to localStorage override changes globally
  const [, setOverrideVersion] = useState(0);

  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "overrideRole") {
        setOverrideVersion((v) => v + 1);
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  // React to same-tab override changes immediately
  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === "overrideRole") {
        // Force re-render so effectiveUser picks up new override; do NOT mutate user.role.
        setOverrideVersion((v) => v + 1);
      }
    };
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Apply local override
  const overrideRole = localStorage.getItem("overrideRole");
  const effectiveUser = user
    ? { ...user, role: (overrideRole as SessionUser["role"]) || user.role, original_role: user.role }
    : null;

  const setOverride = (role: SessionUser["role"]) => {
    if (role) {
      localStorage.setItem("overrideRole", role);
    } else {
      localStorage.removeItem("overrideRole");
    }
    // Force re-render directly so effectiveUser picks up the new override.
    // Do NOT mutate user.role — it stays pinned to DB role.
    setOverrideVersion((v) => v + 1);
  };

  // Session Timeout Logic (2 hours)
  useEffect(() => {
    if (!user) return;

    const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in ms
    const STORAGE_KEY = "bevisly_last_activity";

    const checkTimeout = () => {
      const lastActivity = localStorage.getItem(STORAGE_KEY);
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity, 10);
        if (timeSinceActivity > SESSION_TIMEOUT) {
          console.log("Session timed out after 2 hours of inactivity.");
          signOut();
        }
      }
    };

    const updateActivity = () => {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    };

    // Initial check
    checkTimeout();

    // Update activity on various events
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Periodic check every minute
    const interval = setInterval(checkTimeout, 60 * 1000);

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, [user, signOut]);

  return (
    <AuthContext.Provider
      value={{ user: effectiveUser, loading, signOut, setOverride, refreshProfile }}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-screen text-gray-500">
          Loading session…
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}