
'use client';

import CreateCircleForm from '@/components/create-circle-form';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import withAuth from '@/components/with-auth';

function CreateCirclePage() {
  const { user, loading } = useAuth();
  
  if (loading || !user) {
    return null; // or a loading spinner
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/circles">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Circles
            </Link>
        </Button>
      </div>
       <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-foreground">Create a New Knowledge Circle</h1>
          <p className="text-muted-foreground">Build a community around a topic you're passionate about.</p>
        </div>
        <CreateCircleForm />
    </div>
  );
}

export default withAuth(CreateCirclePage);
