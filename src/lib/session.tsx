import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

type SessionValue = { user: User | null; ready: boolean };

const SessionContext = createContext<SessionValue>({ user: null, ready: false });

export function SessionProvider({ value, children }: { value: SessionValue; children: ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
