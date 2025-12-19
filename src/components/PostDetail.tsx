import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types/blog';
import PostCard from './PostCard';

interface PostDetailProps {
  post: Post;
  relatedPosts: Post[];
}

const PostDetail: React.FC<PostDetailProps> = ({ post, relatedPosts }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // 处理文章内容中的代码块，添加代码高亮
  useEffect(() => {
    if (contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        // 这里可以添加代码高亮逻辑，目前使用的是prism-react-renderer，所以在渲染时处理
      });
    }
  }, [post.content]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* 文章封面图 */}
      <div className="relative">
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-64 md:h-96 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
            {post.category}
          </span>
        </div>
      </div>
      
      {/* 文章内容 */}
      <div className="p-6 md:p-10">
        {/* 文章标题 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>
        
        {/* 文章元信息 */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-500 dark:text-gray-400">
          <span>{post.publishDate}</span>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>
        
        {/* 文章标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag, index) => (
            <Link
              key={index}
              to={`/tags/${tag}`}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full hover:bg-primary hover:text-white transition-colors duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>
        
        {/* 文章正文 */}
        <div 
          ref={contentRef}
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Giscus评论区 */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">评论</h3>
          <div className="giscus" data-repo="your-username/your-repo" data-repo-id="your-repo-id" data-category="General" data-category-id="your-category-id" data-mapping="pathname" data-strict="0" data-reactions-enabled="1" data-emit-metadata="0" data-input-position="bottom" data-theme="preferred_color_scheme" data-lang="zh-CN" data-loading="lazy"></div>
          <script src="https://giscus.app/client.js" crossOrigin="anonymous" async></script>
        </div>
      </div>
      
      {/* 相关推荐 */}
      {relatedPosts.length > 0 && (
        <div className="p-6 md:p-10 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">相关推荐</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <PostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;