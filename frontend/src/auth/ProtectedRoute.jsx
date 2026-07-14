import { Loader } from '../components/ui';
import { LoginPage } from './LoginPage';
import { useSession } from './sessionContext';

export function ProtectedRoute({ children }) {
  const { status } = useSession();

  if (status === 'loading') return <div className="grid min-h-screen place-items-center bg-oriana-fond"><Loader label="Ouverture de votre espace…"/></div>;
  if (status === 'anonymous' || status === 'error') return <LoginPage sessionUnavailable={status === 'error'}/>;
  return children;
}
