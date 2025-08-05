
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SignupPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      router.push(`/profile/${user.uid}`);
    }
  }, [user, loading, router]);
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
       // The redirect will handle navigation. Nothing more to do here.
    } catch (error: any) {
        toast({ title: "Sign-up Failed", description: "Could not sign up with Google. Please try again.", variant: 'destructive' });
    }
  };
  
  if (loading || (!loading && user)) {
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
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>to join Prylics</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full" variant="outline" disabled={loading}>
             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 64.5C308.6 92.6 279.1 80 248 80c-73.2 0-133.2 59.9-133.2 133.2S174.8 386.3 248 386.3c82.7 0 119.3-59.5 124.9-90.8h-125v-74.5h220.8c2.4 13.8 3.6 28.5 3.6 44.5z"></path></svg>}
            Sign up with Google
          </Button>
        </CardContent>
         <CardFooter className="flex justify-center text-sm">
            <p className="text-muted-foreground">
                Already have an account?&nbsp;
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Log in
                </Link>
            </p>
         </CardFooter>
      </Card>
    </div>
  );
}
