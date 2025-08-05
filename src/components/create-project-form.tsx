
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { Project, ProjectDiscussion, UserProfile } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').max(50, 'Title must be less than 50 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(500, 'Description must be less than 500 characters.'),
});

export default function CreateProjectForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
        toast({ title: 'You must be logged in to create a project.', variant: 'destructive'});
        return;
    }

    const creatorProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || 'Anonymous',
      avatarUrl: user.photoURL || 'https://placehold.co/40x40.png',
      profileUrl: `/profile/${user.uid}`
    };

    const newProject: Project = {
      id: values.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      title: values.title,
      description: values.description,
      creatorId: user.uid,
      collaborators: [creatorProfile], // Creator is the first collaborator
    };

    const allProjects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    allProjects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(allProjects));

    const discussions: ProjectDiscussion[] = JSON.parse(localStorage.getItem('projectDiscussions') || '[]');
    discussions.push({ id: newProject.id, messages: [] });
    localStorage.setItem('projectDiscussions', JSON.stringify(discussions));

    toast({
      title: 'Project Created!',
      description: `The "${values.title}" project has been successfully created.`,
    });

    router.push('/projects');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Open Source Mars Rover" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Describe your project's goals, scope, and what you're looking for in collaborators." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Project</Button>
      </form>
    </Form>
  );
}
