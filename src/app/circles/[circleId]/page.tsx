
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
import type { Circle, Message, UserProfile, CircleChat, CircleMembership } from '@/lib/types';
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

function CircleChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const circleId = params.circleId as string;

  const [circle, setCircle] = useState<Circle | null>(null);
  const [chat, setChat] = useState<CircleChat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [chat?.messages]);

  useEffect(() => {
    if (!user || loading || !circleId) return;

    const allCircles: Circle[] = JSON.parse(localStorage.getItem('circles') || '[]');
    const currentCircle = allCircles.find(c => c.id === circleId);

    if (currentCircle) {
      setCircle(currentCircle);
      setIsCreator(currentCircle.creatorId === user.uid);
    } else {
      return;
    }

    const allChats: CircleChat[] = JSON.parse(localStorage.getItem('circleChats') || '[]');
    const currentChat = allChats.find(c => c.id === circleId);
    setChat(currentChat || { id: circleId, messages: [] });

    const memberships: CircleMembership[] = JSON.parse(localStorage.getItem('circleMemberships') || '[]');
    const userMembership = memberships.find(m => m.userId === user.uid);
    setIsMember(!!userMembership && userMembership.circleIds.includes(circleId));

  }, [circleId, user, loading]);


  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !chat) return;

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

    const updatedChat: CircleChat = {
      ...chat,
      messages: [...chat.messages, message],
    };
    
    setChat(updatedChat);

    const allChats: CircleChat[] = JSON.parse(localStorage.getItem('circleChats') || '[]');
    const chatIndex = allChats.findIndex(c => c.id === circleId);
    if (chatIndex !== -1) {
      allChats[chatIndex] = updatedChat;
    } else {
      allChats.push(updatedChat);
    }
    localStorage.setItem('circleChats', JSON.stringify(allChats));
    
    setNewMessage('');
  };
  
  const handleDeleteCircle = () => {
    if (!user || !circle || user.uid !== circle.creatorId) return;

    // Remove circle
    let allCircles: Circle[] = JSON.parse(localStorage.getItem('circles') || '[]');
    allCircles = allCircles.filter(c => c.id !== circleId);
    localStorage.setItem('circles', JSON.stringify(allCircles));

    // Remove chat history
    let allChats: CircleChat[] = JSON.parse(localStorage.getItem('circleChats') || '[]');
    allChats = allChats.filter(c => c.id !== circleId);
    localStorage.setItem('circleChats', JSON.stringify(allChats));

    // Remove memberships
    let allMemberships: CircleMembership[] = JSON.parse(localStorage.getItem('circleMemberships') || '[]');
    allMemberships.forEach(m => {
        m.circleIds = m.circleIds.filter(id => id !== circleId);
    });
    localStorage.setItem('circleMemberships', JSON.stringify(allMemberships));

    toast({ title: "Circle Deleted", description: `The "${circle.name}" circle has been removed.` });
    router.push('/circles');
  };

  if (loading || !user || !circle) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isMember) {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">Not a Member</h1>
            <p className="text-muted-foreground">You must join this circle to view its content.</p>
            <Button asChild>
                <Link href="/circles">Back to Circles</Link>
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
                <Link href="/circles">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
             <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href="/circles">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Circles
                </Link>
            </Button>
            <div>
                <h2 className="font-semibold text-lg">{circle.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{circle.memberCount.toLocaleString()} members</span>
                </div>
            </div>
        </div>
        {isCreator && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Circle
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the circle and all of its messages.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCircle}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat && chat.messages.map((message, index) => {
           const isCurrentUser = message.senderId === user?.uid;
           const previousMessage = chat.messages[index-1];
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
        {(!chat || chat.messages.length === 0) && (
            <div className="text-center text-muted-foreground pt-10">
                <p>No messages yet.</p>
                <p className="text-sm">Be the first to start the conversation!</p>
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

export default withAuth(CircleChatPage);
