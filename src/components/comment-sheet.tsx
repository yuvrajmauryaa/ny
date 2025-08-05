
'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '@/contexts/auth-context';
import { Send } from 'lucide-react';
import type { Post, Comment } from '@/lib/types';

interface CommentSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  post: Post;
  onCommentPosted: (comments: Comment[]) => void;
}

interface CommentCardProps {
  comment: Comment;
  onReply: (authorName: string, commentId: string) => void;
  level: number;
}

const CommentCard = ({ comment, onReply, level }: CommentCardProps) => {
    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatarUrl} />
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
                </div>
                <Button variant="link" size="sm" className="px-3" onClick={() => onReply(comment.author.name, comment.id)}>Reply</Button>
                {comment.replies && comment.replies.length > 0 && (
                    <div className={`mt-2 space-y-2 ${level < 3 ? 'pl-4 border-l-2' : ''}`}>
                        {comment.replies.map(reply => (
                            <CommentCard key={reply.id} comment={reply} onReply={onReply} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export function CommentSheet({ isOpen, onOpenChange, post, onCommentPosted }: CommentSheetProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [replyingTo, setReplyingTo] = useState<{ authorName: string; commentId: string } | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    // Update comments if the post prop changes
    setComments(post.comments || []);
  }, [post]);

  const saveCommentsToLocalStorage = (allPosts: Post[], postId: string, updatedComments: Comment[]) => {
      const postIndex = allPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
          allPosts[postIndex].comments = updatedComments;
          allPosts[postIndex].commentCount = updatedComments.reduce((acc, c) => acc + 1 + c.replies.length, 0); // Recalculate count
          return true;
      }
      return false;
  }

  const handlePostComment = () => {
    if (!newComment.trim() || !user) return;

    const newCommentData: Comment = {
      id: new Date().toISOString() + Math.random(),
      author: {
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        avatarUrl: user.photoURL || `https://placehold.co/40x40.png`,
        profileUrl: '/profile',
      },
      text: newComment,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    let updatedComments;
    if (replyingTo) {
      const addReply = (allComments: Comment[], parentId: string, newReply: Comment): Comment[] => {
        return allComments.map(comment => {
          if (comment.id === parentId) {
            return { ...comment, replies: [...comment.replies, newReply] };
          }
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: addReply(comment.replies, parentId, newReply) };
          }
          return comment;
        });
      };
      updatedComments = addReply(comments, replyingTo.commentId, newCommentData);
    } else {
      updatedComments = [...comments, newCommentData];
    }
    
    setComments(updatedComments);

    // Save to localStorage
    const userPosts: Post[] = JSON.parse(localStorage.getItem('userPosts') || '[]');
    const initialPosts: Post[] = JSON.parse(localStorage.getItem('initialPosts') || '[]');

    if (saveCommentsToLocalStorage(userPosts, post.id, updatedComments)) {
        localStorage.setItem('userPosts', JSON.stringify(userPosts));
    } else if(saveCommentsToLocalStorage(initialPosts, post.id, updatedComments)) {
        localStorage.setItem('initialPosts', JSON.stringify(initialPosts));
    }
    
    onCommentPosted(updatedComments);
    setNewComment('');
    setReplyingTo(null);
  };

  const handleReply = (authorName: string, commentId: string) => {
    setReplyingTo({ authorName, commentId });
    setNewComment(`@${authorName} `);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Comments on {post.author.name}'s post</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto space-y-4 pr-6">
          {comments.map(comment => (
            <CommentCard key={comment.id} comment={comment} onReply={handleReply} level={1} />
          ))}
           {comments.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to share your thoughts!</p>
           )}
        </div>
        <SheetFooter className="mt-auto bg-background py-4">
          {user ? (
            <div className="flex w-full items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL ?? undefined} />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Input 
                placeholder={replyingTo ? `Replying to ${replyingTo.authorName}...` : "Add a comment..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                autoFocus={!!replyingTo}
              />
              <Button onClick={handlePostComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground text-center w-full'>Please log in to comment.</p>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
