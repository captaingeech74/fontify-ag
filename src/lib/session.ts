export type SessionStatus = 'pending' | 'uploaded' | 'completed' | 'error';

export interface Session {
  id: string;
  status: SessionStatus;
  imageUrl?: string;
  createdAt: number;
}

// In-memory store for local dev (Note: This will reset on server restart)
// In production, we should swap this for Vercel KV or Upstash Redis.
const sessions = new Map<string, Session>();

export const getSession = (id: string): Session | undefined => {
  return sessions.get(id);
};

export const createSession = (id: string): Session => {
  const session: Session = {
    id,
    status: 'pending',
    createdAt: Date.now(),
  };
  sessions.set(id, session);
  return session;
};

export const updateSession = (id: string, updates: Partial<Session>): Session | undefined => {
  const session = sessions.get(id);
  if (session) {
    const updated = { ...session, ...updates };
    sessions.set(id, updated);
    return updated;
  }
  return undefined;
};
