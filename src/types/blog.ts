export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  publishDate: string;
  readTime: string;
}

export interface Tag {
  name: string;
  count: number;
}