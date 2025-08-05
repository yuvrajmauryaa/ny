
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface UserSearchCardProps {
  user: UserProfile;
}

export default function UserSearchCard({ user }: UserSearchCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{user.name}</h3>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={user.profileUrl}>
            View Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
