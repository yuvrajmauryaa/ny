
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Conversation, Message, Post, UserProfile } from '@/lib/types';
import withAuth from '@/components/with-auth';


function ConversationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [conversation?.messages]);

  useEffect(() => {
    if (loading || !user) return;

    const allConversations: Conversation[] = JSON.parse(localStorage.getItem('conversations') || '[]');
    const currentConvo = allConversations.find(c => c.id === conversationId);

    if (currentConvo) {
      setConversation(currentConvo);
      
      const otherUserId = currentConvo.participantIds.find(id => id !== user.uid);
      
      if (otherUserId) {
        // Find user profile from our "known users" directory
        const knownUsers: UserProfile[] = JSON.parse(localStorage.getItem('knownUsers') || '[]');
        const conversationPartner = knownUsers.find(u => u.uid === otherUserId);
        
        if (conversationPartner) {
          setOtherUser(conversationPartner);
        } else {
            // Fallback for a user not in the initial posts
             setOtherUser({
                uid: otherUserId,
                name: 'Unknown User',
                avatarUrl: 'https://placehold.co/40x40.png',
                profileUrl: `/profile/${otherUserId}`,
             });
        }
      }
    } else {
      // Conversation not found, maybe redirect
      router.push('/messages');
    }
  }, [conversationId, user, loading, router]);


  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !conversation) return;

    const message: Message = {
      id: new Date().toISOString(),
      senderId: user.uid,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedConversation: Conversation = {
      ...conversation,
      messages: [...conversation.messages, message],
    };
    
    setConversation(updatedConversation);

    const allConversations: Conversation[] = JSON.parse(localStorage.getItem('conversations') || '[]');
    const convoIndex = allConversations.findIndex(c => c.id === conversationId);
    if (convoIndex !== -1) {
      allConversations[convoIndex] = updatedConversation;
      localStorage.setItem('conversations', JSON.stringify(allConversations));
    }
    
    setNewMessage('');
  };
  
  if (loading || !user) {
    return null;
  }

  if (!conversation) {
    return <div className="flex items-center justify-center h-screen">Loading conversation...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-128px)] md:h-screen w-full max-w-3xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b flex items-center p-4 gap-4">
        <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/messages">
                <ChevronLeft className="h-6 w-6" />
            </Link>
        </Button>
         <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/messages">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Messages
            </Link>
        </Button>
        {otherUser && (
            <Link href={otherUser.profileUrl} className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={otherUser.avatarUrl} />
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="font-semibold text-lg">{otherUser.name}</h2>
            </Link>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message, index) => {
           const isCurrentUser = message.senderId === user.uid;
           const showAvatar = index === 0 || conversation.messages[index - 1].senderId !== message.senderId;
           
           return (
            <div key={message.id} className={cn("flex items-end gap-2", isCurrentUser && "justify-end")}>
                {!isCurrentUser && (
                     <div className='w-8'>
                        {showAvatar && otherUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={otherUser.avatarUrl} />
                            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                )}
                 <div className={cn(
                    "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg", 
                    isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                    )}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                 </div>
                 {isCurrentUser && user && (
                     <div className='w-8'>
                        {showAvatar && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL ?? undefined} />
                            <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                )}
            </div>
           )
        })}
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

export default withAuth(ConversationPage);
