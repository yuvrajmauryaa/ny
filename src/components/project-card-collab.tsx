
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Users, Check } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Project, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export interface ProjectCardProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
}

export default function ProjectCard({ project, onProjectUpdate }: ProjectCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [collaborators, setCollaborators] = useState<UserProfile[]>(project.collaborators);

  useEffect(() => {
    if (user) {
      const collaboratorIds = collaborators.map(c => c.uid);
      setIsCollaborator(collaboratorIds.includes(user.uid));
    } else {
        setIsCollaborator(false);
    }
  }, [user, collaborators]);

  const handleJoinToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please log in to join a project.", variant: 'destructive' });
      router.push('/login');
      return;
    }

    const allProjects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectIndex = allProjects.findIndex(p => p.id === project.id);
    if (projectIndex === -1) return;

    const updatedProject = { ...allProjects[projectIndex] };
    const collaboratorIds = updatedProject.collaborators.map(c => c.uid);
    const wasCollaborator = collaboratorIds.includes(user.uid);

    if (wasCollaborator) {
      // Leave the project
      updatedProject.collaborators = updatedProject.collaborators.filter(c => c.uid !== user.uid);
      setIsCollaborator(false);
    } else {
      // Join the project
      const userProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || 'Anonymous',
          avatarUrl: user.photoURL || 'https://placehold.co/40x40.png',
          profileUrl: `/profile/${user.uid}`
      };
      updatedProject.collaborators.push(userProfile);
      setIsCollaborator(true);
    }
    
    setCollaborators(updatedProject.collaborators);
    allProjects[projectIndex] = updatedProject;
    localStorage.setItem('projects', JSON.stringify(allProjects));
    onProjectUpdate(updatedProject);

    if (!wasCollaborator) {
        router.push(`/projects/${project.id}`);
    }
  }
  
  const limitedCollaborators = collaborators.slice(0, 5);

  return (
    <Link href={`/projects/${project.id}`} className="flex h-full">
    <Card className="overflow-hidden flex flex-col h-full w-full shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">{project.title}</CardTitle>
        <CardDescription className="line-clamp-3 h-[60px]">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex -space-x-2 overflow-hidden">
            {limitedCollaborators.map((collaborator) => (
                <Avatar key={collaborator.uid} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                    <AvatarImage src={collaborator.avatarUrl} />
                    <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                </Avatar>
            ))}
             {collaborators.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">
                    +{collaborators.length - 5}
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Users className="h-4 w-4" />
          <span>{collaborators.length.toLocaleString()} collaborators</span>
        </div>
        <Button size="sm" onClick={handleJoinToggle} variant={isCollaborator ? 'secondary' : 'default'}>
          {isCollaborator && <Check className="mr-2 h-4 w-4" />}
          {isCollaborator ? 'Joined' : 'Join'}
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
}
