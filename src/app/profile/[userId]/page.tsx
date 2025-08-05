
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/post-card";
import ProjectCard from "@/components/project-card-collab";
import UserSearchCard from "@/components/user-search-card";
import type { Post, UserProfile, Following, Conversation, Project } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, UserCheck, MessageSquare, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function ProfilePage() {
  const { user: loggedInUser, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);

  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [userListTitle, setUserListTitle] = useState('');
  const [userList, setUserList] = useState<UserProfile[]>([]);


  useEffect(() => {
    // This page can be viewed publicly, so no redirect here.
    // Actions on the page will require login.
  }, [loggedInUser, loading, router, userId]);

  useEffect(() => {
    if (!userId) return;

    const ownProfile = loggedInUser?.uid === userId;
    setIsOwnProfile(ownProfile);

    let userToDisplay: UserProfile | null = null;
    const knownUsers: UserProfile[] = JSON.parse(localStorage.getItem('knownUsers') || '[]');

    if (ownProfile && loggedInUser) {
        userToDisplay = {
            uid: loggedInUser.uid,
            name: loggedInUser.displayName || 'Anonymous',
            email: loggedInUser.email,
            avatarUrl: loggedInUser.photoURL || 'https://placehold.co/40x40.png',
            profileUrl: `/profile/${loggedInUser.uid}`,
        };
    } else {
        userToDisplay = knownUsers.find(u => u.uid === userId) || null;
    }
    
    setProfileUser(userToDisplay);

    if (userToDisplay) {
        // Fetch posts
        const allUserPosts: Post[] = JSON.parse(localStorage.getItem('userPosts') || '[]');
        const allInitialPosts: Post[] = JSON.parse(localStorage.getItem('initialPosts') || '[]');
        const combinedPosts = [...allUserPosts, ...allInitialPosts];

        const profilePosts = combinedPosts.filter((p: Post) => p.author.uid === userToDisplay!.uid)
          .sort((a: Post, b: Post) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setUserPosts(profilePosts);

        // Fetch projects
        const allProjects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
        const profileProjects = allProjects.filter(p => 
            p.collaborators.some(c => c.uid === userToDisplay!.uid)
        );
        setUserProjects(profileProjects);
    } 

    // Handle following/follower logic
    const followingList: Following[] = JSON.parse(localStorage.getItem('following') || '[]');
    
    // Calculate followers
    const followerProfiles = followingList
      .filter(f => f.followingIds.includes(userId))
      .map(f => knownUsers.find(u => u.uid === f.userId))
      .filter((u): u is UserProfile => !!u);
    setFollowers(followerProfiles);

    // Calculate and get profiles of users this profile is following
    const profileUserFollowing = followingList.find(f => f.userId === userId);
    if (profileUserFollowing) {
        const followedProfiles = knownUsers.filter(u => profileUserFollowing.followingIds.includes(u.uid));
        setFollowing(followedProfiles);
    } else {
        setFollowing([]);
    }

    // Check if logged-in user is following this profile
    if (loggedInUser) {
        const userFollowing = followingList.find(f => f.userId === loggedInUser.uid);
        if (userFollowing && userFollowing.followingIds.includes(userId)) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
    }
    
  }, [userId, loggedInUser, loading]);
  
  const showUserList = (title: 'Followers' | 'Following', users: UserProfile[]) => {
    setUserListTitle(title);
    setUserList(users);
    setIsUserListOpen(true);
  };


  const handleFollowToggle = () => {
    if (!loggedInUser) {
      router.push('/login');
      return;
    }

    const knownUsers: UserProfile[] = JSON.parse(localStorage.getItem('knownUsers') || '[]');
    const followingList: Following[] = JSON.parse(localStorage.getItem('following') || '[]');
    let userFollowing = followingList.find(f => f.userId === loggedInUser.uid);
    
    if (!userFollowing) {
        userFollowing = { userId: loggedInUser.uid, followingIds: [] };
        followingList.push(userFollowing);
    }

    const currentlyFollowing = userFollowing.followingIds.includes(userId);
    
    const loggedInUserProfile = knownUsers.find(u => u.uid === loggedInUser.uid);

    if (currentlyFollowing) {
        userFollowing.followingIds = userFollowing.followingIds.filter(id => id !== userId);
        setIsFollowing(false);
        setFollowers(prev => prev.filter(u => u.uid !== loggedInUser.uid));
    } else {
        userFollowing.followingIds.push(userId);
        setIsFollowing(true);
        if (loggedInUserProfile) {
            setFollowers(prev => [...prev, loggedInUserProfile]);
        }
    }

    localStorage.setItem('following', JSON.stringify(followingList));
  };
  
  const handleMessage = () => {
    if (!loggedInUser) {
        toast({ title: "Please log in to send a message.", variant: 'destructive' });
        router.push('/login');
        return;
    }
    if (!profileUser || loggedInUser.uid === profileUser.uid) {
        toast({ title: "You cannot send a message to yourself."});
        return;
    }

    const conversationId = [loggedInUser.uid, profileUser.uid].sort().join('--');
    const allConversations: Conversation[] = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    let existingConversation = allConversations.find(c => c.id === conversationId);

    if (!existingConversation) {
        const newConversation: Conversation = {
            id: conversationId,
            participantIds: [loggedInUser.uid, profileUser.uid],
            messages: [],
        };
        allConversations.push(newConversation);
        localStorage.setItem('conversations', JSON.stringify(allConversations));
    }
    
    router.push(`/messages/${conversationId}`);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setUserProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Loading profile...</p>
        </div>
    );
  }

  if (!profileUser) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-8">We couldn't find a profile for this user.</p>
            <Button asChild>
                <Link href="/">Go back to Home</Link>
            </Button>
        </div>
    );
  }

  return (
    <>
    <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src={profileUser.avatarUrl ?? "https://placehold.co/96x96.png"} alt={profileUser.name ?? "User"} data-ai-hint="person portrait" />
                <AvatarFallback>{profileUser.name?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-grow text-center sm:text-left">
                <h1 className="font-headline text-3xl font-bold">{profileUser.name}</h1>
                <p className="text-muted-foreground">{profileUser.email}</p>
                <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start">
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={() => showUserList('Followers', followers)}>
                        <Users className="h-4 w-4" />
                        <span className="font-semibold">{followers.length}</span> Followers
                    </button>
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={() => showUserList('Following', following)}>
                        <UserCheck className="h-4 w-4" />
                        <span className="font-semibold">{following.length}</span> Following
                    </button>
                </div>
                </div>
                <div className="sm:ml-auto mt-4 sm:mt-0 flex flex-col items-center sm:items-end gap-2">
                {isOwnProfile ? (
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <Button variant="outline">Edit Profile</Button>
                    </div>
                ) : (
                    <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={handleFollowToggle} className="flex-1">
                        {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button onClick={handleMessage} variant="outline" className="flex-1">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                    </Button>
                    </div>
                )}
                </div>
              </div>
          </CardHeader>
          <CardContent className="p-6">
             <p className="max-w-xl text-sm text-center sm:text-left">
                This is a placeholder bio. Users will be able to edit this in the future.
              </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            {userPosts.length > 0 ? (
              <div className="space-y-6">
                {userPosts.map(post => <PostCard key={post.id} post={post} />)}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <h3 className="font-headline text-xl font-semibold">No Posts Yet</h3>
                  <p className="text-muted-foreground mt-2">When this user creates posts, they will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
           <TabsContent value="projects" className="mt-6">
             {userProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProjects.map(project => <ProjectCard key={project.id} project={project} onProjectUpdate={handleProjectUpdate} />)}
                </div>
             ) : (
                <Card className="text-center py-12">
                    <CardContent>
                    <h3 className="font-headline text-xl font-semibold">No Projects Yet</h3>
                    <p className="text-muted-foreground mt-2">When this user joins or creates projects, they will appear here.</p>
                    </CardContent>
                </Card>
             )}
          </TabsContent>
          <TabsContent value="contributions" className="mt-6">
              <Card className="text-center py-12">
                <CardContent>
                  <h3 className="font-headline text-xl font-semibold">No Contributions Yet</h3>
                  <p className="text-muted-foreground mt-2">Financial contributions to projects will be shown here.</p>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    <Dialog open={isUserListOpen} onOpenChange={setIsUserListOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{userListTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {userList.length > 0 ? (
                    userList.map(user => <UserSearchCard key={user.uid} user={user} />)
                ) : (
                    <p className="text-muted-foreground text-center py-4">This list is empty.</p>
                )}
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
