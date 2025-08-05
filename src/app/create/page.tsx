
'use client';

import { useCallback, useEffect, useState } from 'react';
import CreatePostForm from "@/components/create-post-form";
import PostCard from '@/components/post-card';
import { useAuth } from '@/contexts/auth-context';
import type { Post } from '@/lib/types';
import withAuth from '@/components/with-auth';

function CreatePostPage() {
  const { user, loading } = useAuth();
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  const handleFormChange = useCallback((data: Partial<Post>) => {
    if (!user) return;

    const placeholderPost: Post = {
      id: 'preview',
      author: {
        uid: user.uid,
        name: user.displayName || 'You',
        avatarUrl: user.photoURL || 'https://placehold.co/40x40.png',
        profileUrl: '/profile',
      },
      timestamp: 'Just now',
      tags: [],
      likes: 0,
      comments: [],
      commentCount: 0,
      ...data,
      type: data.type || 'idea',
      content: data.content || 'Your content will appear here...',
    };
    setPreviewPost(placeholderPost);
  }, [user]);

  const handlePostCreated = (post: Post) => {
    setPreviewPost(null);
  };
  
  if (loading || !user) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold text-foreground">Create New Post</h1>
          <p className="text-muted-foreground">Share your research, ideas, or questions with the community. You can optionally enable crowdfunding for your research proposals.</p>
        </div>
        <CreatePostForm onFormChange={handleFormChange} onPostCreated={handlePostCreated} />
      </div>
      <div className="space-y-4">
        <h2 className="font-headline text-2xl font-bold text-foreground">Live Preview</h2>
        {previewPost ? (
          <PostCard post={previewPost} />
        ) : (
          <div className="border-2 border-dashed border-muted rounded-lg flex items-center justify-center h-96">
            <p className="text-muted-foreground">Your post preview will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CreatePostPage);
