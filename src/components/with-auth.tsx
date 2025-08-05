
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // This effect will only run after the initial auth check is complete (loading is false).
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    // While loading is true, we want to show a loader.
    // This prevents the flicker or premature redirect that caused the loop.
    if (loading) {
      return (
         <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    // If loading is false and there is no user, the useEffect above will have already
    // initiated the redirect. Rendering null here prevents the wrapped component from
    // briefly flashing on the screen.
    if (!user) {
      return null;
    }
    
    // If loading is false and there is a user, render the wrapped component.
    return <WrappedComponent {...props} />;
  };
  
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
};

export default withAuth;
