import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Restoring a session from storage is asynchronous, so callers get an explicit
// isLoading state. Treating "no session yet" as "logged out" would bounce the
// admin back to the login page on every page refresh.
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, isLoading };
}
