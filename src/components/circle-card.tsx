
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Users, Check } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Circle, CircleMembership } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export interface CircleCardProps {
  circle: Circle;
  onCircleUpdate: (updatedCircle: Circle) => void;
}

export default function CircleCard({ circle, onCircleUpdate }: CircleCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isMember, setIsMember] = useState(false);
  const [currentMemberCount, setCurrentMemberCount] = useState(circle.memberCount);

  useEffect(() => {
    if (user) {
      const memberships: CircleMembership[] = JSON.parse(localStorage.getItem('circleMemberships') || '[]');
      const userMembership = memberships.find(m => m.userId === user.uid);
      if (userMembership && userMembership.circleIds.includes(circle.id)) {
        setIsMember(true);
      } else {
        setIsMember(false);
      }
    } else {
        setIsMember(false);
    }
  }, [user, circle.id]);

  const handleJoinToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please log in to join a circle.", variant: 'destructive' });
      router.push('/login');
      return;
    }

    let memberships: CircleMembership[] = JSON.parse(localStorage.getItem('circleMemberships') || '[]');
    let userMembership = memberships.find(m => m.userId === user.uid);

    if (!userMembership) {
      userMembership = { userId: user.uid, circleIds: [] };
      memberships.push(userMembership);
    }

    let allCircles: Circle[] = JSON.parse(localStorage.getItem('circles') || '[]');
    const circleIndex = allCircles.findIndex(c => c.id === circle.id);

    const wasMember = isMember;
    let updatedCircle: Circle = { ...circle };

    if (wasMember) {
      // Leave the circle
      userMembership.circleIds = userMembership.circleIds.filter(id => id !== circle.id);
      setIsMember(false);
      setCurrentMemberCount(prev => prev > 0 ? prev - 1 : 0);
      updatedCircle.memberCount = Math.max(0, updatedCircle.memberCount - 1);
    } else {
      // Join the circle
      if (!userMembership.circleIds.includes(circle.id)) {
        userMembership.circleIds.push(circle.id);
      }
      setIsMember(true);
      setCurrentMemberCount(prev => prev + 1);
      updatedCircle.memberCount++;
    }
    
    if (circleIndex !== -1) {
        allCircles[circleIndex] = updatedCircle;
        localStorage.setItem('circles', JSON.stringify(allCircles));
    }
    localStorage.setItem('circleMemberships', JSON.stringify(memberships));
    onCircleUpdate(updatedCircle); // This updates the parent page's state

    // If the user just joined, take them to the circle chat
    if (!wasMember) {
        router.push(`/circles/${circle.id}`);
    }
  }

  return (
    <Link href={`/circles/${circle.id}`} className="flex h-full">
    <Card className="overflow-hidden flex flex-col h-full w-full shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">{circle.name}</CardTitle>
        <CardDescription className="line-clamp-3 h-[60px]">{circle.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="bg-muted/50 p-4 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Users className="h-4 w-4" />
          <span>{currentMemberCount.toLocaleString()} members</span>
        </div>
        <Button size="sm" onClick={handleJoinToggle} variant={isMember ? 'secondary' : 'default'}>
          {isMember && <Check className="mr-2 h-4 w-4" />}
          {isMember ? 'Joined' : 'Join'}
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
}
