import { useAuth } from '../hooks/useAuth';
import { Loading } from '@shared/components/Loading';
import { LoginRequiredDialog } from '@shared/components/LoginRequiredDialog';

type ProtectedRouteProps = {
  readonly children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Loading
        bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        text="Signing out..."
        color="white"
      />
    );
  }

  // A direct/bookmarked link (e.g. csmuat.neurealm.com/aimi/activities) can land here with no
  // session at all. Rather than silently sending the user to AIMI's own mock Google Sign-In
  // page, explain why and send them to the real CSM login (matching the CSAT microapp's
  // equivalent popup) once they click OK.
  if (!isAuthenticated) {
    return <LoginRequiredDialog open />;
  }

  return <>{children}</>;
}
