
'use client';
import { Bell, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import withAuth from '@/components/with-auth';

function NotificationsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Home
            </Link>
        </Button>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <Bell className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl font-bold text-foreground">Notifications</h1>
      </div>
      <div className="text-center border-2 border-dashed border-muted-foreground/20 rounded-lg p-12">
        <h2 className="text-xl font-semibold text-foreground">No New Notifications</h2>
        <p className="text-muted-foreground mt-2">
          You're all caught up! We'll let you know when there's something new.
        </p>
      </div>
    </div>
  );
}

export default withAuth(NotificationsPage);
