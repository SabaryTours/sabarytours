/** @deprecated Static blog seed — live blog posts are loaded from Supabase `posts`. */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  image: string;
  views: number;
  comments: number;
  author: string;
  date: string;
  content: string;
  excerpt?: string;
}

export const blogPosts: BlogPost[] = [];

export interface Comment {
  id: string;
  author: string;
  date: string;
  content: string;
  avatar?: string;
}

export const comments: Record<string, Comment[]> = {};

export function getBlogPostBySlug(_slug: string): BlogPost | undefined {
  return undefined;
}

export function getRelatedPosts(_currentSlug: string, _limit = 3): BlogPost[] {
  return [];
}
