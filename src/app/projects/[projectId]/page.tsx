
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, Send, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Project, Message, UserProfile, ProjectDiscussion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import withAuth from '@/components/with-auth';

function ProjectDiscussionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [discussion, setDiscussion] = useState<ProjectDiscussion | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [discussion?.messages]);

  useEffect(() => {
    if (loading || !user) return;

    const allProjects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentProject = allProjects.find(p => p.id === projectId);

    if (currentProject) {
      setProject(currentProject);
      if (user) {
        setIsCreator(currentProject.creatorId === user.uid);
        const collaboratorIds = currentProject.collaborators.map(c => c.uid);
        setIsCollaborator(collaboratorIds.includes(user.uid));
      }
    } else {
      return;
    }

    const allDiscussions: ProjectDiscussion[] = JSON.parse(localStorage.getItem('projectDiscussions') || '[]');
    const currentDiscussion = allDiscussions.find(d => d.id === projectId);
    setDiscussion(currentDiscussion || { id: projectId, messages: [] });

  }, [projectId, user, loading]);


  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !discussion) return;

    const message: Message = {
      id: new Date().toISOString(),
      senderId: user.uid,
      sender: {
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        avatarUrl: user.photoURL || 'https://placehold.co/40x40.png',
        profileUrl: `/profile/${user.uid}`
      },
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedDiscussion: ProjectDiscussion = {
      ...discussion,
      messages: [...discussion.messages, message],
    };
    
    setDiscussion(updatedDiscussion);

    const allDiscussions: ProjectDiscussion[] = JSON.parse(localStorage.getItem('projectDiscussions') || '[]');
    const discussionIndex = allDiscussions.findIndex(d => d.id === projectId);
    if (discussionIndex !== -1) {
      allDiscussions[discussionIndex] = updatedDiscussion;
    } else {
      allDiscussions.push(updatedDiscussion);
    }
    localStorage.setItem('projectDiscussions', JSON.stringify(allDiscussions));
    
    setNewMessage('');
  };
  
  const handleDeleteProject = () => {
    if (!user || !project || user.uid !== project.creatorId) return;

    // Remove project
    let allProjects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    allProjects = allProjects.filter(p => p.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(allProjects));

    // Remove discussion history
    let allDiscussions: ProjectDiscussion[] = JSON.parse(localStorage.getItem('projectDiscussions') || '[]');
    allDiscussions = allDiscussions.filter(d => d.id !== projectId);
    localStorage.setItem('projectDiscussions', JSON.stringify(allDiscussions));

    toast({ title: "Project Deleted", description: `The "${project.title}" project has been removed.` });
    router.push('/projects');
  };

  if (loading || !user) {
    return null;
  }
  
  if (!project) {
     return <div className="flex items-center justify-center h-screen">Loading project...</div>;
  }

  if (!isCollaborator) {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">Not a Collaborator</h1>
            <p className="text-muted-foreground">You must join this project to view its content.</p>
            <Button asChild>
                <Link href="/projects">Back to Projects</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-128px)] md:h-screen w-full max-w-4xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b flex items-center p-4 gap-4 justify-between">
        <div className='flex items-center gap-4'>
            <Button asChild variant="ghost" size="icon" className="md:hidden">
                <Link href="/projects">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
             <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href="/projects">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                </Link>
            </Button>
            <div>
                <h2 className="font-semibold text-lg">{project.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.collaborators.length.toLocaleString()} collaborators</span>
                </div>
            </div>
        </div>
        {isCreator && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project and all of its discussion.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProject}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {discussion && discussion.messages.map((message, index) => {
           const isCurrentUser = message.senderId === user?.uid;
           const previousMessage = discussion.messages[index-1];
           const showAvatar = !previousMessage || previousMessage.senderId !== message.senderId;
           
           return (
            <div key={message.id} className={cn("flex items-end gap-2", isCurrentUser && "justify-end")}>
                {!isCurrentUser && (
                     <div className='w-10'>
                        {showAvatar && (
                        <Link href={message.sender.profileUrl}>
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={message.sender.avatarUrl} />
                                <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        )}
                    </div>
                )}
                 <div className={cn(
                    "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg", 
                    isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                    )}>
                    {showAvatar && !isCurrentUser && <p className="font-semibold text-sm mb-1">{message.sender.name}</p>}
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                 </div>
            </div>
           )
        })}
        {(!discussion || discussion.messages.length === 0) && (
            <div className="text-center text-muted-foreground pt-10">
                <p>No messages yet.</p>
                <p className="text-sm">Be the first to start the discussion!</p>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <footer className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex items-center gap-2">
            <Input 
                placeholder='Type a message...'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-5 w-5" />
            </Button>
        </div>
      </footer>
    </div>
  );
}

export default withAuth(ProjectDiscussionPage);
