
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import CircleCard from '@/components/circle-card';
import type { Circle } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import withAuth from '@/components/with-auth';
import { FixedSizeList as List } from 'react-window';

// Define item size (height) based on your CircleCard component's estimated height.
// You might need to adjust this value.
const itemSize = 300; // Example size in pixels (assuming similar height to ProjectCard)

function CirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    // On component mount, load circles from localStorage.
    const allCircles: Circle[] = JSON.parse(localStorage.getItem('circles') || '[]');
    setCircles(allCircles);
  }, []);
  
  // This function is passed to the CircleCard to update the list when a user joins/leaves
  const handleCircleUpdate = (updatedCircle: Circle) => {
    setCircles(prevCircles => prevCircles.map(c => c.id === updatedCircle.id ? updatedCircle : c));
  };
  
  if (loading || !user) {
    return null;
  }

  // Render function for each row in the virtualized list
  const RenderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const circle = circles[index];
    return (
      <div style={style} key={circle.id}>
        <CircleCard circle={circle} onCircleUpdate={handleCircleUpdate} />
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
            <h1 className="font-headline text-3xl font-bold text-foreground flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Knowledge Circles
            </h1>
            <p className="text-muted-foreground max-w-2xl">
                Create and join communities to discuss topics, share research, and collaborate.
            </p>
        </div>
        <Button asChild>
          <Link href="/circles/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Circle
          </Link>
        </Button>
      </div>

      {circles.length > 0 ? (
        // Adjust the height and width based on your layout. You might need to use a library
        // like react-resize-observer-hook to make the list responsive.
        <List
          height={600} // Example height (adjust as needed)
          itemCount={circles.length}
          itemSize={itemSize}
          width={'100%'} // Use 100% or a fixed width
        >
          {RenderRow}
        </List>
      ) : (
        <div className="text-center border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 mt-10">
            <h2 className="text-xl font-semibold text-foreground">No Circles Yet</h2>
            <p className="text-muted-foreground mt-2">
                Be the first to create a Knowledge Circle and start a new community.
            </p>
        </div>
      )}
    </div>
  );
}

export default withAuth(CirclesPage);
