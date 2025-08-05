
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Conversation, UserProfile } from '@/lib/types';
import { MessageSquare, ChevronLeft } from 'lucide-react';
import withAuth from '@/components/with-auth';

function MessagesPage() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [otherUsers, setOtherUsers] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    if (loading || !user) return;
    const allConversations: Conversation[] = JSON.parse(localStorage.getItem('conversations') || '[]');
    const userConversations = allConversations.filter(c => c.participantIds.includes(user.uid));
    
    // Sort conversations by the timestamp of the last message
    userConversations.sort((a, b) => {
        const lastMessageA = a.messages[a.messages.length - 1];
        const lastMessageB = b.messages[b.messages.length - 1];
        if (!lastMessageA) return 1;
        if (!lastMessageB) return -1;
        return new Date(lastMessageB.timestamp).getTime() - new Date(lastMessageA.timestamp).getTime();
    });

    setConversations(userConversations);

    // Fetch user profiles for conversation partners from our user directory
    const knownUsers: UserProfile[] = JSON.parse(localStorage.getItem('knownUsers') || '[]');
    const users: Record<string, UserProfile> = {};
    knownUsers.forEach(u => {
        users[u.uid] = u;
    });

    userConversations.forEach(convo => {
      const otherUserId = convo.participantIds.find(id => id !== user.uid);
      if (otherUserId && !users[otherUserId]) {
         // This is a fallback in case the user profile is not in the directory.
         users[otherUserId] = { 
            uid: otherUserId, 
            name: 'Unknown User', 
            avatarUrl: 'https://placehold.co/40x40.png',
            profileUrl: `/profile/${otherUserId}`,
        };
      }
    });

    setOtherUsers(users);

  }, [user, loading]);
  
  if (loading || !user) {
    return null;
  }

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
        <MessageSquare className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl font-bold text-foreground">Messages</h1>
      </div>
      
      {conversations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {conversations.map(convo => {
                const otherUserId = convo.participantIds.find(id => id !== user.uid)!;
                const otherUser = otherUsers[otherUserId];
                const lastMessage = convo.messages[convo.messages.length - 1];

                return (
                  <Link href={`/messages/${convo.id}`} key={convo.id}>
                    <div className="flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherUser?.avatarUrl} />
                        <AvatarFallback>{otherUser?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-semibold truncate">{otherUser?.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage ? (
                            <>
                              <span className="font-medium">{lastMessage.senderId === user.uid ? 'You: ' : ''}</span>
                              {lastMessage.text}
                            </>
                          ) : 'No messages yet.'}
                        </p>
                      </div>
                       <div className="text-right">
                         <p className="text-xs text-muted-foreground">
                            {lastMessage && new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                       </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center border-2 border-dashed border-muted-foreground/20 rounded-lg p-12">
          <h2 className="text-xl font-semibold text-foreground">No Conversations Yet</h2>
          <p className="text-muted-foreground mt-2">
            Start a conversation with another user to see your messages here.
          </p>
        </div>
      )}
    </div>
  );
}

export default withAuth(MessagesPage);
