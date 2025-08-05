
'use server';

/**
 * @fileOverview An AI agent that suggests relevant tags for a given post.
 *
 * - suggestTags - A function that suggests tags.
 * - SuggestTagsInput - The input type for the suggestTags function.
 * - SuggestTagsOutput - The return type for the suggestTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  postContent: z
    .string()
    .describe('The text content of the post for which to suggest tags.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  suggestedTags: z
    .array(z.string())
    .describe('An array of suggested tags for the post.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(
  input: SuggestTagsInput
): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `You are an expert in content categorization. Given the content of a post, you will suggest relevant tags to improve its discoverability and reach the appropriate audience.

  Post Content: {{{postContent}}}

  Please provide a list of suggested tags that are most relevant to the post content. Focus on suggesting tags that will help the author reach the target audience.
  Tags should be descriptive and concise.
  Format the output as a JSON object.`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
