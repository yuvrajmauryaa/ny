
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/with-auth';

const ThemeToggle = dynamic(() => import('@/components/theme-toggle').then(mod => mod.ThemeToggle), { ssr: false });

function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
                <Link href={`/profile/${user?.uid}`}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                </Link>
            </Button>
        </div>
      <div className="space-y-4 mb-8">
        <h1 className="font-headline text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app preferences.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your session.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(SettingsPage);
