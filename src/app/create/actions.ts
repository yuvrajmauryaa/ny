
'use server';

import { suggestTags } from "@/ai/flows/suggest-tags-and-circles";

export async function getSuggestions(postContent: string) {
  if (!postContent || postContent.trim().length < 20) {
    return { suggestedTags: [] };
  }
  try {
    const suggestions = await suggestTags({ postContent });
    return suggestions;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return { suggestedTags: [] };
  }
}
