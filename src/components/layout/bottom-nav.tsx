
'use client';

import { Home, PlusSquare, User, LogIn, Handshake, Search, LogOut, Users, Briefcase, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Logo from '../logo';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const desktopLinks = [
  { href: '/', label: 'Home', icon: Home, authRequired: false },
  { href: '/create', label: 'New Post', icon: PlusSquare, authRequired: true },
  { href: '/search', label: 'Search', icon: Search, authRequired: true },
  { href: '/projects', label: 'Projects', icon: Briefcase, authRequired: true },
  { href: '/crowdfunding', label: 'Funding', icon: Handshake, authRequired: false },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent, href: string, authRequired: boolean) => {
    if (authRequired && !user) {
        e.preventDefault();
        router.push('/login');
    }
  }
  
  const mobileLinks = [
    { href: '/', label: 'Home', icon: Home, authRequired: false },
    { href: '/search', label: 'Search', icon: Search, authRequired: true },
    { href: '/create', label: 'Post', icon: PlusSquare, authRequired: true },
    { href: '/projects', label: 'Projects', icon: Briefcase, authRequired: true },
    user 
        ? { href: `/profile/${user.uid}`, label: 'Profile', icon: User, authRequired: true }
        : { href: '/login', label: 'Login', icon: LogIn, authRequired: false }
  ];

  return (
    <>
      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-10">
        <div className="flex justify-around items-center h-16">
          {mobileLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.authRequired)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-full h-full',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <link.icon className="h-6 w-6" />
                <span className="text-xs">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {/* Dummy div to push content up on mobile */}
      <div className="md:hidden h-16" /> 

      {/* Side Nav for Desktop */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-card border-r flex-col p-4 gap-4">
        <div className="px-3 py-2">
            <Logo />
        </div>
        <div className="flex flex-col gap-2">
            {desktopLinks.map((link) => {
                const isActive = pathname.startsWith(link.href) && (link.href === '/' ? pathname === '/' : true);
                return (
                <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.authRequired)}
                    className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium',
                    isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                </Link>
                );
            })}
        </div>
        <div className="mt-auto flex flex-col gap-2 p-2">
            {user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="justify-start h-auto p-0">
                             <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10">
                                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className='text-left'>
                                    <p className="font-semibold">{user.displayName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2" align="start" side="top">
                        <DropdownMenuItem asChild>
                            <Link href={`/profile/${user.uid}`}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              
            ) : (
                <Button variant="outline" asChild>
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                    </Link>
                </Button>
            )}
        </div>
      </nav>
      {/* Main content with margin for desktop */}
      <div className="hidden md:block ml-64">
        {/* This div is a placeholder for where the desktop page content will go, handled by the main layout */}
      </div>
    </>
  );
}
