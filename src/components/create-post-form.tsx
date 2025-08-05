
'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Sparkles, Loader2, ImagePlus } from 'lucide-react';
import { getSuggestions } from '@/app/create/actions';
import { useToast } from '@/hooks/use-toast';
import debounce from 'lodash.debounce';
import { Switch } from './ui/switch';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Post } from '@/lib/types';


const formSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
  type: z.enum(['research', 'idea', 'question']),
  tags: z.array(z.string()).min(1, 'Please add at least one tag.'),
  imageUrl: z.string().optional(),
  enableCrowdfunding: z.boolean().default(false),
  fundingGoal: z.coerce.number().optional(),
}).refine(data => {
    if (data.enableCrowdfunding) {
        return data.fundingGoal !== undefined && data.fundingGoal > 0;
    }
    return true;
}, {
    message: "Funding goal is required when crowdfunding is enabled.",
    path: ["fundingGoal"],
});


type FormData = z.infer<typeof formSchema>;

interface CreatePostFormProps {
    onFormChange: (data: Partial<Post>) => void;
    onPostCreated: (post: Post) => void;
}

export default function CreatePostForm({ onFormChange, onPostCreated }: CreatePostFormProps) {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<{ suggestedTags: string[] }>({ suggestedTags: [] });
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      type: 'idea',
      tags: [],
      imageUrl: '',
      enableCrowdfunding: false,
      fundingGoal: undefined,
    },
  });
  
  const watchedValues = form.watch();

  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChange({
        ...value,
        imageUrl: imagePreview || undefined,
        funding: value.enableCrowdfunding ? { goal: value.fundingGoal || 0, raised: 0 } : undefined,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange, imagePreview]);


  const fetchSuggestions = useCallback((content: string) => {
    if (content.length > 20) {
      setIsFetchingSuggestions(true);
      startTransition(async () => {
        const result = await getSuggestions(content);
        setSuggestions(result);
        setIsFetchingSuggestions(false);
      });
    } else {
      setSuggestions({ suggestedTags: [] });
    }
  }, []);
  
  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 1000), [fetchSuggestions]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setValue('content', e.target.value);
    debouncedFetchSuggestions(e.target.value);
  };
  
  function addTag(tag: string) {
    const currentTags = form.getValues('tags');
    if (!currentTags.includes(tag)) {
      form.setValue('tags', [...currentTags, tag]);
    }
  }

  function removeTag(tagToRemove: string) {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter((tag) => tag !== tagToRemove));
  }
  
  function handleTagInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const input = event.currentTarget;
      const newTag = input.value.trim();
      if (newTag) {
        addTag(newTag);
        input.value = '';
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('imageUrl', dataUrl);
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: FormData) {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to post.'});
        return;
    }
    const newPost: Post = {
        id: new Date().toISOString() + Math.random(),
        author: {
            uid: user.uid,
            name: user.displayName || 'Anonymous',
            email: user.email || '',
            avatarUrl: user.photoURL || 'https://placehold.co/40x40.png',
            profileUrl: `/profile/${user.uid}`,
        },
        creatorId: user.uid,
        ...values,
        timestamp: new Date().toLocaleString(),
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        commentCount: 0,
        funding: values.enableCrowdfunding ? { goal: values.fundingGoal!, raised: 0 } : undefined,
    };

    const existingPosts: Post[] = JSON.parse(localStorage.getItem('userPosts') || '[]');
    localStorage.setItem('userPosts', JSON.stringify([newPost, ...existingPosts]));

    toast({
      title: "Post Created!",
      description: "Your post has been successfully shared.",
    });

    onPostCreated(newPost);
    form.reset();
    setImagePreview(null);
    router.push('/');
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="md:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </FormControl>
                  <label htmlFor='picture' className='cursor-pointer'>
                  <Card className={cn("border-2 border-dashed flex flex-col items-center justify-center text-center p-6 h-48", imagePreview && "p-0")}>
                      {imagePreview ? (
                          <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImagePlus className="h-8 w-8" />
                            <p>Upload an image</p>
                            <p className="text-xs">Click here to browse files</p>
                        </div>
                      )}
                  </Card>
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={10}
                      placeholder="Share your thoughts, findings, or questions..."
                      onChange={handleContentChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a post type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="idea">Idea</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="question">Question</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          placeholder="Add tags and press Enter"
                          onKeyDown={handleTagInputKeyDown}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                              <button
                                type="button"
                                className="ml-1.5"
                                onClick={() => removeTag(tag)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card className="border-dashed">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Crowdfunding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="enableCrowdfunding"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Enable Crowdfunding</FormLabel>
                                <FormDescription>
                                Allow others to fund this research/idea.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                     {watchedValues.enableCrowdfunding && (
                        <FormField
                            control={form.control}
                            name="fundingGoal"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Funding Goal ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g. 5000" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                     )}
                </CardContent>
            </Card>
            
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publish Post
            </Button>
          </form>
        </Form>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Sparkles className="h-5 w-5 text-accent" />
              Smart Suggestions
              {isFetchingSuggestions && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <h4 className="font-semibold text-sm mb-2">Suggested Tags</h4>
              {suggestions.suggestedTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {suggestions.suggestedTags.map(tag => (
                    <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => addTag(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Start typing your content to see suggestions.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
