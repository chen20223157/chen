import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types/blog';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Link 
      to={`/posts/${post.id}`} 
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
    >
      {/* 文章封面图 */}
      <div className="relative overflow-hidden">
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
            {post.category}
          </span>
        </div>
      </div>
      
      {/* 文章内容 */}
      <div className="p-6">
        {/* 文章标题 */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {post.title}
        </h3>
        
        {/* 文章摘要 */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        {/* 文章标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full hover:bg-primary hover:text-white transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* 文章元信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{post.publishDate}</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;