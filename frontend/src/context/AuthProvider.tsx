import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext, type SessionUser } from "./AuthContext";
import toast from "react-hot-toast";

// Helper function to fetch role from the profiles table (database is source of truth)
async function fetchRoleFromDB(userId: string): Promise<SessionUser["role"]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.warn("Failed to fetch role from profiles:", error.message);
    return "candidate"; // fallback
  }
  return (data?.role as SessionUser["role"]) ?? "candidate";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      // 1. Show feedback immediately so the user knows something is happening
      toast.success("👋 Logging out...");

      // 2. AWAIT the Supabase cleanup. 
      // This is critical. We must wait for it to delete the 'sb-xxxx-auth-token' 
      // from the browser's local storage/cookies.
      await supabase.auth.signOut();

      // 3. Clear our custom app keys
      localStorage.removeItem("bevisly_user");
      localStorage.removeItem("overrideRole");

      // Note: We DO NOT call setUser(null) here. 
      // If we did, the ProtectedRoute would trigger and send you to /auth 
      // for a split second before the reload happens. 
      // We want to stay on the current screen until the hard reload wipes everything.

      // 4. Force Redirect/Reload to Landing Page
      // Now that the token is definitely gone, this reload will result in a logged-out state.
      window.location.replace("/");

    } catch (err) {
      console.error("Logout error:", err);
      // Fallback: ensure storage is cleared even if the API call fails
      localStorage.removeItem("bevisly_user");
      localStorage.removeItem("overrideRole");
      window.location.replace("/");
    }
  };

  useEffect(() => {
    // Try cached user first
    const cachedUser = localStorage.getItem("bevisly_user");
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }

    // Always confirm current Supabase session and fetch role from DB
    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const role = await fetchRoleFromDB(sessionUser.id);
        const newUser = {
          id: sessionUser.id,
          email: sessionUser.email!,
          role,
        };
        setUser(newUser);
        localStorage.setItem("bevisly_user", JSON.stringify(newUser));
      } else {
        setUser(null);
        localStorage.removeItem("bevisly_user");
      }
      setLoading(false);
    });

    // Auth change listener - fetch role from database
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          window.location.href = "/auth/reset";
          return;
        }

        const sessionUser = session?.user;
        if (sessionUser) {
          const role = await fetchRoleFromDB(sessionUser.id);
          const newUser = {
            id: sessionUser.id,
            email: sessionUser.email!,
            role,
          };
          setUser(newUser);
          localStorage.setItem("bevisly_user", JSON.stringify(newUser));
        } else {
          setUser(null);
          localStorage.removeItem("bevisly_user");
          localStorage.removeItem("overrideRole");
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
        setUser((u) =>
          u ? { ...u, role: value as SessionUser["role"] } : null
        );
      }
    };
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Apply local override
  const overrideRole = localStorage.getItem("overrideRole");
  const effectiveUser = user
    ? { ...user, role: (overrideRole as SessionUser["role"]) || user.role }
    : null;

  const setOverride = (role: SessionUser["role"]) => {
    localStorage.setItem("overrideRole", role ?? "");
    setUser((u) => (u ? { ...u, role } : null)); // immediately update context
  };

  return (
    <AuthContext.Provider
      value={{ user: effectiveUser, loading, signOut, setOverride }}
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