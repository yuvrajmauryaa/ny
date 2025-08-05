
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
import type { Circle } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.').max(50, 'Name must be less than 50 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(200, 'Description must be less than 200 characters.'),
});

export default function CreateCircleForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
        toast({ title: 'You must be logged in to create a circle.', variant: 'destructive'});
        return;
    }

    const newCircle: Circle = {
      id: values.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: values.name,
      description: values.description,
      creatorId: user.uid,
      memberCount: 1, // Creator is the first member
    };

    const allCircles: Circle[] = JSON.parse(localStorage.getItem('circles') || '[]');
    allCircles.push(newCircle);
    localStorage.setItem('circles', JSON.stringify(allCircles));

    // Also automatically join the user to the circle they created
    const memberships = JSON.parse(localStorage.getItem('circleMemberships') || '[]');
    let userMembership = memberships.find((m: any) => m.userId === user.uid);
    if (userMembership) {
        userMembership.circleIds.push(newCircle.id);
    } else {
        memberships.push({ userId: user.uid, circleIds: [newCircle.id] });
    }
    localStorage.setItem('circleMemberships', JSON.stringify(memberships));
    
    // Create an empty chat history for the new circle
    const chats = JSON.parse(localStorage.getItem('circleChats') || '[]');
    chats.push({ id: newCircle.id, messages: [] });
    localStorage.setItem('circleChats', JSON.stringify(chats));

    toast({
      title: 'Circle Created!',
      description: `The "${values.name}" circle has been successfully created.`,
    });

    router.push('/circles');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Circle Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Quantum Physics" {...field} />
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
                <Textarea placeholder="What is this circle about?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Circle</Button>
      </form>
    </Form>
  );
}
