import { useAuthStore } from '../store/authStore';

/**
 * Primary auth hook for screens: exposes the resolved session state plus the
 * auth actions. Selectors are wired individually so components only re-render
 * on relevant slices.
 */
export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const status = useAuthStore(state => state.status);
  const signIn = useAuthStore(state => state.signIn);
  const signOut = useAuthStore(state => state.signOut);
  const restoreSession = useAuthStore(state => state.restoreSession);

  return { user, status, signIn, signOut, restoreSession };
};

export default useAuth;