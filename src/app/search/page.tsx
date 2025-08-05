
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { UserProfile } from '@/lib/types';
import UserSearchCard from '@/components/user-search-card';
import { useAuth } from '@/contexts/auth-context';
import withAuth from '@/components/with-auth';

function SearchPage() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const knownUsers: UserProfile[] = JSON.parse(localStorage.getItem('knownUsers') || '[]');
    setAllUsers(knownUsers);
  }, []);

  const handleSearch = useCallback(() => {
    // Refresh user list from local storage before searching
    const knownUsers: UserProfile[] = JSON.parse(localStorage.getItem('knownUsers') || '[]');
    setAllUsers(knownUsers);
    
    setHasSearched(true);
    if (!searchTerm.trim()) {
      setUserResults([]);
      return;
    }

    const filteredUsers = knownUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUserResults(filteredUsers);
  }, [searchTerm]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-4 mb-8">
        <h1 className="font-headline text-3xl font-bold text-foreground">Search</h1>
        <p className="text-muted-foreground max-w-2xl">
          Find posts, research, and users across the platform.
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <Input
          type="search"
          placeholder="Search for anything..."
          className="flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}>
          <SearchIcon className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Posts & Research</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="font-headline text-xl font-semibold">Search for Posts</h3>
              <p className="text-muted-foreground mt-2">
                Results for posts and research will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="mt-6">
           {hasSearched ? (
              userResults.length > 0 ? (
                <div className="space-y-4">
                  {userResults.map(user => (
                    <UserSearchCard key={user.uid} user={user} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                    <CardContent>
                    <h3 className="font-headline text-xl font-semibold">No Users Found</h3>
                    <p className="text-muted-foreground mt-2">
                        No users matched your search for "{searchTerm}".
                    </p>
                    </CardContent>
                </Card>
              )
           ) : (
            <Card className="text-center py-12">
                <CardContent>
                <h3 className="font-headline text-xl font-semibold">Search for Users</h3>
                <p className="text-muted-foreground mt-2">
                    Enter a name in the search bar to find users.
                </p>
                </CardContent>
            </Card>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAuth(SearchPage);
