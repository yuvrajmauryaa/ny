
'use client';

import CreateProjectForm from '@/components/create-project-form';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import withAuth from '@/components/with-auth';

function CreateProjectPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/projects">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Projects
            </Link>
        </Button>
      </div>
       <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-foreground">Create a New Project</h1>
          <p className="text-muted-foreground">Start a new project and invite others to collaborate.</p>
        </div>
        <CreateProjectForm />
    </div>
  );
}

export default withAuth(CreateProjectPage);
