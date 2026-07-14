import { useEffect, useState } from 'react';
import { ApiError, authApi } from '../api';
import { SessionContext } from './sessionContext';

export function SessionProvider({ children, client = authApi }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    client.me()
      .then(({ user: currentUser }) => { if (active) { setUser(currentUser); setStatus('authenticated'); } })
      .catch((error) => { if (active) setStatus(error instanceof ApiError && error.status !== 401 ? 'error' : 'anonymous'); });
    return () => { active = false; };
  }, [client]);

  async function login(credentials) {
    const result = await client.login(credentials);
    if (result.selection_role_requise) return result;
    setUser(result.user);
    setStatus('authenticated');
    return result;
  }

  async function logout() {
    await client.logout();
    setUser(null);
    setStatus('anonymous');
  }

  async function changeRole(roleActif) {
    const result = await client.changeRole(roleActif);
    setUser(result.user);
    return result.user;
  }

  return <SessionContext.Provider value={{ status, user, login, logout, changeRole }}>{children}</SessionContext.Provider>;
}
