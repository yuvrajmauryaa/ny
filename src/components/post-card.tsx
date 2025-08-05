
'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import {
  FlaskConical,
  Lightbulb,
  HelpCircle,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CommentSheet } from './comment-sheet';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { Post, Comment, Conversation } from '@/lib/types';


export default function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [isDeleted, setIsDeleted] = useState(false);

  const Icon = post.type ? {
    research: FlaskConical,
    idea: Lightbulb,
    question: HelpCircle,
  }[post.type] : HelpCircle;
  
  const label = post.type ? {
    research: 'Research',
    idea: 'Idea',
    question: 'Question',
  }[post.type] : 'Post';


  const isFunded = post.funding && post.funding.raised >= post.funding.goal;
  const fundingProgress = post.funding ? (post.funding.raised / post.funding.goal) * 100 : 0;
  
  const requireLogin = (e?: React.MouseEvent) => {
    if (!user) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      router.push('/login');
      return true;
    }
    return false;
  }

  const handleLike = (e: React.MouseEvent) => {
    if (requireLogin(e)) return;
    if (isLiked) {
      setLikeCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
    }
  };
  
  const handleCommentClick = (e: React.MouseEvent) => {
    if (requireLogin(e)) return;
    setIsCommentSheetOpen(true);
  }

  const handleShare = (e: React.MouseEvent) => {
    if (requireLogin(e)) return;
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({
        title: 'Link Copied!',
        description: 'The post link has been copied to your clipboard.',
    });
  }

  const handleDm = (e: React.MouseEvent) => {
    if (requireLogin(e)) return;
    if (user && user.uid === post.author.uid) {
        toast({ title: "You cannot send a message to yourself."});
        return;
    }

    const conversationId = [user!.uid, post.author.uid].sort().join('--');
    const allConversations: Conversation[] = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    let existingConversation = allConversations.find(c => c.id === conversationId);

    if (!existingConversation) {
        const newConversation: Conversation = {
            id: conversationId,
            participantIds: [user!.uid, post.author.uid],
            messages: [],
        };
        allConversations.push(newConversation);
        localStorage.setItem('conversations', JSON.stringify(allConversations));
    }
    
    router.push(`/messages/${conversationId}`);
  }

  const handleContribute = (e: React.MouseEvent) => {
    if (requireLogin(e)) return;
    toast({
        title: 'Contribute clicked!',
        description: 'This functionality is for demonstration purposes.',
    });
  }
  
  const countReplies = (comments: Comment[]): number => {
    let count = 0;
    for (const comment of comments) {
      count++; // count the comment itself
      if (comment.replies && comment.replies.length > 0) {
        count += countReplies(comment.replies);
      }
    }
    return count;
  };

  const handleCommentPosted = (updatedComments: Comment[]) => {
    const newCommentCount = countReplies(updatedComments);
    setCurrentPost(prevPost => ({
        ...prevPost,
        comments: updatedComments,
        commentCount: newCommentCount
    }));
  }

  const handleDelete = (e: React.MouseEvent) => {
    if (requireLogin(e)) return;
    const allPosts: Post[] = JSON.parse(localStorage.getItem('initialPosts') || '[]');
    const userPosts: Post[] = JSON.parse(localStorage.getItem('userPosts') || '[]');

    const updatedInitialPosts = allPosts.filter(p => p.id !== post.id);
    const updatedUserPosts = userPosts.filter(p => p.id !== post.id);

    localStorage.setItem('initialPosts', JSON.stringify(updatedInitialPosts));
    localStorage.setItem('userPosts', JSON.stringify(updatedUserPosts));
    
    setIsDeleted(true);

    toast({
        title: "Post Deleted",
        description: "The post has been removed.",
    });
  }
  
  const handleProfileClick = (e: React.MouseEvent) => {
    // Navigating to a profile is a public action, no login required.
    // However, if we wanted to restrict it, we would use requireLogin(e).
    e.preventDefault();
    router.push(post.author.profileUrl);
  }


  if (isDeleted) {
    return null;
  }

  return (
    <>
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Link href={post.author.profileUrl} onClick={handleProfileClick}>
            <Avatar>
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} data-ai-hint={post.author.dataAiHint ?? 'person'} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </Link>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div>
               <Link href={post.author.profileUrl} onClick={handleProfileClick} className="font-semibold hover:underline">
                {post.author.name}
              </Link>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
            <div className="flex items-center gap-2">
                {user?.uid === post.author.uid && (
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                )}
                <Badge variant="secondary" className="capitalize flex items-center gap-1.5">
                    <Icon className="h-3 w-3" />
                    {label}
                </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {post.imageUrl && (
          <div className="relative h-64 w-full mb-4 rounded-md overflow-hidden">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
              data-ai-hint={post.imageAiHint}
            />
          </div>
        )}
        <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        
        {post.funding && (
           <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className='font-semibold'>Crowdfunding</h4>
                    {isFunded && <Badge variant="default" className='bg-green-600'>Fully Funded!</Badge>}
                </div>
                <Progress value={fundingProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span className="font-semibold text-primary">${post.funding.raised.toLocaleString()}</span>
                <span>Goal: ${post.funding.goal.toLocaleString()}</span>
                </div>
            </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-2 flex justify-end gap-1">
         {post.funding && (
             <Button className="w-full mr-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={isFunded} onClick={handleContribute}>
                {isFunded ? "Fully Funded" : "Contribute"}
            </Button>
         )}
        <Button variant="ghost" size="sm" className={cn("flex items-center gap-2 text-muted-foreground", isLiked && "text-primary")} onClick={handleLike}>
          <ThumbsUp className="h-4 w-4" />
          <span>{likeCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground" onClick={handleCommentClick}>
          <MessageCircle className="h-4 w-4" />
          <span>{currentPost.commentCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
         <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleDm}>
          <Send className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
    <CommentSheet 
        isOpen={isCommentSheetOpen}
        onOpenChange={setIsCommentSheetOpen}
        post={currentPost}
        onCommentPosted={handleCommentPosted}
    />
    </>
  );
}
