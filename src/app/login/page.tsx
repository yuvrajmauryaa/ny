
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push(`/profile/${user.uid}`);
    }
  }, [user, authLoading, router]);
  
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    // signInWithGoogle will trigger a redirect, so the user will navigate away.
    // We set loading state to give feedback, though it will be brief.
    await signInWithGoogle();
    // No need to set isSigningIn to false, as the page will redirect.
  };
  
  const isLoading = authLoading || isSigningIn;

  // Do not show the login page if the user is already authenticated
  // and the initial check is complete. The useEffect above will handle the redirect.
  if (!authLoading && user) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Log In</CardTitle>
          <CardDescription>to continue to Prylics</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full" variant="outline" disabled={isLoading}>
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 64.5C308.6 92.6 279.1 80 248 80c-73.2 0-133.2 59.9-133.2 133.2S174.8 386.3 248 386.3c82.7 0 119.3-59.5 124.9-90.8h-125v-74.5h220.8c2.4 13.8 3.6 28.5 3.6 44.5z"></path></svg>}
            Sign in with Google
          </Button>
        </CardContent>
         <CardFooter className="flex justify-center text-sm">
            <p className="text-muted-foreground">
                Don't have an account?&nbsp;
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </p>
         </CardFooter>
      </Card>
    </div>
  );
}
