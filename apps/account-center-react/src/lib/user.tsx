import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@nulvless/nulvless-js';
import { nulvless } from '@/lib/nulvless';

interface UserState {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data: session } = await nulvless.auth.getSession();
    if (!session) {
      setUser(null);
      setLoading(false);
      return;
    }
    const { data } = await nulvless.auth.users.me();
    setUser(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
    const clear = () => setUser(null);
    const offSignedIn = nulvless.auth.on('signed-in', refreshUser);
    const offSignedOut = nulvless.auth.on('signed-out', clear);
    const offUnauthorized = nulvless.auth.on('unauthorized', clear);
    return () => {
      offSignedIn();
      offSignedOut();
      offUnauthorized();
    };
  }, [refreshUser]);

  return <UserContext.Provider value={{ user, loading, refreshUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const state = useContext(UserContext);
  if (!state) throw new Error('useUser must be used inside UserProvider');
  return state;
}
