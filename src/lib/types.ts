

export type PostType = 'research' | 'idea' | 'question';

export interface UserProfile {
    uid: string;
    name: string;
    email?: string | null;
    avatarUrl: string;
    profileUrl: string;
    dataAiHint?: string;
}

export interface Comment {
  id: string;
  author: UserProfile;
  text: string;
  timestamp: string;
  replies: Comment[];
}

export interface Post {
  id: string;
  author: UserProfile;
  creatorId: string;
  type: PostType;
  timestamp: string;
  createdAt?: string;
  content: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  commentCount: number;
  imageUrl?: string;
  imageAiHint?: string;
  funding?: {
    goal: number;
    raised: number;
  }
}

export interface Message {
    id: string;
    senderId: string;
    sender: UserProfile;
    text: string;
    timestamp: string;
}

export interface Conversation {
    id:string; // e.g., "userId1--userId2" sorted alphabetically
    participantIds: string[];
    messages: Message[];
}

export interface Following {
    userId: string;
    followingIds: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  collaborators: UserProfile[];
}

export interface ProjectDiscussion {
  id: string; // Same as projectId
  messages: Message[];
}


export interface Circle {
    id: string;
    name: string;
    description: string;
    creatorId: string;
    memberCount: number;
}

export interface CircleMembership {
    userId: string;
    circleIds: string[];
}

export interface CircleChat {
    id: string; // Same as circleId
    messages: Message[];
}
