import { Loader } from '../components/ui';
import { LoginPage } from './LoginPage';
import { FirstPasswordPage } from './FirstPasswordPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import { useSession } from './sessionContext';

export function ProtectedRoute({ children }) {
  const { status, user } = useSession();
  const resetToken = new URLSearchParams(window.location.search).get('reset_token');

  if (resetToken) return <ResetPasswordPage token={resetToken}/>;
  if (status === 'loading') return <div className="grid min-h-screen place-items-center bg-oriana-fond"><Loader label="Ouverture de votre espace…"/></div>;
  if (status === 'anonymous' || status === 'error') return <LoginPage sessionUnavailable={status === 'error'}/>;
  if (user?.doit_changer_mot_de_passe === true) return <FirstPasswordPage/>;
  return children;
}
