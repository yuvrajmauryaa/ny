
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import Link from 'next/link';
import ProjectCard from '@/components/project-card-collab';
import type { Project } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import withAuth from '@/components/with-auth';
import { FixedSizeList as List } from 'react-window';

// Define item size (height) based on your ProjectCard component's estimated height.
// You might need to adjust this value.
const itemSize = 300; // Example size in pixels

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    // On component mount, load projects from localStorage.
    const allProjects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    setProjects(allProjects);
  }, []);

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  if (loading || !user) {
    return null;
  }

  // Render function for each row in the virtualized list
  const RenderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const project = projects[index];
    return (
      <div style={style} key={project.id}>
        <ProjectCard project={project} onProjectUpdate={handleProjectUpdate} />
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
            <h1 className="font-headline text-3xl font-bold text-foreground flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                Projects
            </h1>
            <p className="text-muted-foreground max-w-2xl">
                Find and collaborate on projects, or create your own to bring new ideas to life.
            </p>
        </div>
        {user && (
            <Button asChild>
            <Link href="/projects/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
            </Link>
            </Button>
        )}
      </div>

      {projects.length > 0 ? (
        // Adjust the height and width based on your layout. You might need to use a library
        // like react-resize-observer-hook to make the list responsive.
        <List
          height={600} // Example height
          itemCount={projects.length}
          itemSize={itemSize}
          width={'100%'} // Use 100% or a fixed width
        >
          {RenderRow}
        </List>
      ) : (
        <div className="text-center border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 mt-10">
            <h2 className="text-xl font-semibold text-foreground">No Projects Yet</h2>
            <p className="text-muted-foreground mt-2">
                Be the first to create a project and start collaborating.
            </p>
        </div>
      )}
    </div>
  );
}

export default withAuth(ProjectsPage);
