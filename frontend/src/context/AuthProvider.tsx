// src/context/AuthProvider.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext, type SessionUser } from "./AuthContext";
import toast from "react-hot-toast";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Signout handler
 const signOut = async () => {
  try {
    // 1. Clear Local Storage FIRST (Synchronous)
    // This ensures that when the page reloads, the user is gone.
    localStorage.removeItem("bevis_user");
    localStorage.removeItem("overrideRole");
    setUser(null);

    // 2. Trigger Supabase SignOut (Fire and forget)
    // We don't await this because we are about to force-reload the page anyway.
    supabase.auth.signOut(); 

    // 3. Show toast 
    // Note: Toast might disappear quickly due to reload, but it's good practice.
    toast.success("👋 Logged out");

    // 4. Force Redirect/Reload to Landing Page
    // This wipes the app state cleanly.
    window.location.replace("/");

  } catch (err) {
    console.error("Logout error:", err);
    // Even if error, force clear to ensure user isn't stuck
    localStorage.removeItem("bevis_user");
    window.location.replace("/");
  }
};

  useEffect(() => {
    // 1️⃣ Try cached user first
    const cachedUser = localStorage.getItem("bevis_user");
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }

    // 2️⃣ Always confirm current Supabase session
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const role =
          (sessionUser.user_metadata.role as SessionUser["role"]) ??
          "candidate";
        const newUser = {
          id: sessionUser.id,
          email: sessionUser.email!,
          role,
        };
        setUser(newUser);
        localStorage.setItem("bevis_user", JSON.stringify(newUser));
      } else {
        setUser(null);
        localStorage.removeItem("bevis_user");
      }
      setLoading(false);
    });

    // 3️⃣ Auth change listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          window.location.href = "/auth/reset";
          return;
        }

        const sessionUser = session?.user;
        if (sessionUser) {
          const role =
            (sessionUser.user_metadata.role as SessionUser["role"]) ??
            "candidate";
          const newUser = {
            id: sessionUser.id,
            email: sessionUser.email!,
            role,
          };
          setUser(newUser);
          localStorage.setItem("bevis_user", JSON.stringify(newUser));
        } else {
          setUser(null);
          localStorage.removeItem("bevis_user");
          localStorage.removeItem("overrideRole");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🪄 Listen to localStorage override changes globally
  const [overrideVersion, setOverrideVersion] = useState(0);

  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "overrideRole") {
        setOverrideVersion((v) => v + 1);
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  // 🔁 React to same-tab override changes immediately
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

  // 🔁 Apply local override
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
