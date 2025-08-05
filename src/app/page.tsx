
'use client';

import PostCard from '@/components/post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { Post, UserProfile } from '@/lib/types';


const initialPosts: Post[] = [
  {
    id: '1',
    author: {
      uid: 'evelyn-reed-author-id',
      name: 'Dr. Evelyn Reed',
      avatarUrl: 'https://placehold.co/40x40.png',
      profileUrl: '/profile/evelyn-reed-author-id',
      dataAiHint: 'female scientist portrait',
    },
    creatorId: 'evelyn-reed-author-id',
    type: 'research',
    timestamp: '2 hours ago',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    content: "Just published our findings on a new enzyme that breaks down plastics at room temperature. We're seeking funding to scale up production and run larger trials. This could be a huge step forward for recycling. Full paper linked in my bio! #Biotechnology #Sustainability",
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'plastic bottles',
    tags: ['Biotechnology', 'Sustainability', 'Recycling'],
    likes: 302,
    commentCount: 0,
    comments: [],
    funding: {
      goal: 50000,
      raised: 12500,
    }
  },
  {
    id: '2',
    author: {
      uid: 'kenji-tanaka-author-id',
      name: 'Dr. Kenji Tanaka',
      avatarUrl: 'https://placehold.co/40x40.png',
      profileUrl: '/profile/kenji-tanaka-author-id',
      dataAiHint: 'male engineer portrait',
    },
    creatorId: 'kenji-tanaka-author-id',
    type: 'idea',
    timestamp: '1 day ago',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    content: "What if we used drone swarms for reforestation? They could plant seeds in hard-to-reach areas, like after a wildfire. Each drone could carry hundreds of seed pods and use mapping data to plant them in the best spots. #Drones #Reforestation",
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'drone forest',
    tags: ['Drones', 'Reforestation', 'ClimateAction'],
    likes: 521,
    commentCount: 0,
    comments: [],
  },
  {
    id: '3',
    author: {
      uid: 'sofia-ramirez-author-id',
      name: 'Sofia Ramirez',
      avatarUrl: 'https://placehold.co/40x40.png',
      profileUrl: '/profile/sofia-ramirez-author-id',
      dataAiHint: 'female student portrait',
    },
    creatorId: 'sofia-ramirez-author-id',
    type: 'question',
    timestamp: '2 days ago',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    content: "I'm a grad student working with large language models. How do you all handle ethical issues like bias in training data? I'm looking for practical strategies to make sure my models are as fair as possible. Any advice or good papers to read? #AIethics #LLM #MachineLearning",
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'abstract data',
    tags: ['AIethics', 'LLM', 'MachineLearning'],
    likes: 215,
    commentCount: 0,
    comments: [],
  },
  {
    id: '4',
    author: {
        uid: 'ben-carter-author-id',
        name: 'Dr. Ben Carter',
        avatarUrl: 'https://placehold.co/40x40.png',
        profileUrl: '/profile/ben-carter-author-id',
        dataAiHint: 'male astronomer portrait',
    },
    creatorId: 'ben-carter-author-id',
    type: 'research',
    timestamp: '4 days ago',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    content: "The latest images from the Webb Telescope are stunning! We're seeing galaxies that are older than we thought possible. This picture shows a galaxy cluster whose light has traveled for over 13 billion years to reach us. #JWST #Space #Cosmology",
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'galaxy cluster',
    tags: ['JWST', 'Space', 'Cosmology'],
    likes: 1200,
    commentCount: 0,
    comments: [],
  }
];

const seedInitialData = () => {
    if (typeof window !== 'undefined') {
        if (!localStorage.getItem('initialPosts')) {
            localStorage.setItem('initialPosts', JSON.stringify(initialPosts));
        }
        if (!localStorage.getItem('knownUsers')) {
            const userProfiles = new Map<string, UserProfile>();
            initialPosts.forEach(post => {
                if (!userProfiles.has(post.author.uid)) {
                    userProfiles.set(post.author.uid, post.author);
                }
            });
            localStorage.setItem('knownUsers', JSON.stringify(Array.from(userProfiles.values())));
        }
    }
};

seedInitialData();


export default function Home() {
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadPosts = () => {
        const storedInitialPostsString = localStorage.getItem('initialPosts');
        const storedUserPostsString = localStorage.getItem('userPosts');
        
        const storedInitialPosts = storedInitialPostsString ? JSON.parse(storedInitialPostsString) : [];
        const storedUserPosts = storedUserPostsString ? JSON.parse(storedUserPostsString) : [];
        
        const combinedPosts = [...storedUserPosts, ...storedInitialPosts];

        const uniquePostsMap = new Map<string, Post>();
        combinedPosts.forEach((post: Post) => {
            if (!uniquePostsMap.has(post.id)) {
                uniquePostsMap.set(post.id, post);
            }
        });

        const uniquePosts = Array.from(uniquePostsMap.values());
        uniquePosts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        
        setAllPosts(uniquePosts);
    };

    loadPosts();

    // Listen for storage changes to update posts if a new post is created in another tab
    const handleStorageChange = () => {
        loadPosts();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient]);

  const qaPosts = allPosts.filter(p => p.type === 'question');
  const researchPosts = allPosts.filter(p => p.type === 'research');

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-3xl font-bold text-foreground">Home</h1>
        {user && (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/messages">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/notifications">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                    </Link>
                </Button>
            </div>
        )}
      </div>
      
      <Tabs defaultValue="latest" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="qa">Q&A</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>
        <TabsContent value="latest" className="mt-6">
          <div className="space-y-6">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="qa" className="mt-6">
           <div className="space-y-6">
            {qaPosts.length > 0 ? (
                qaPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                    <h3 className="font-headline text-xl font-semibold">No Questions Yet</h3>
                    <p className="text-muted-foreground mt-2">Check back later for questions from the community.</p>
                    </CardContent>
                </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="research" className="mt-6">
             {researchPosts.length > 0 ? (
                <div className="space-y-6">
                    {researchPosts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
             ) : (
                <Card className="text-center py-12">
                    <CardContent>
                    <h3 className="font-headline text-xl font-semibold">No Research Posts Yet</h3>
                    <p className="text-muted-foreground mt-2">Find research proposals and findings from the community here.</p>
                    </CardContent>
                </Card>
             )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
