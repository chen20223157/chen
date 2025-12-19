import React from 'react';
import { useParams } from 'react-router-dom';
import PostDetail from '../components/PostDetail';
import { mockPosts, getPostById } from '../data/mockData';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || '0', 10);
  const post = getPostById(postId);
  
  // 获取相关推荐文章（根据标签匹配）
  const getRelatedPosts = () => {
    if (!post) return [];
    
    return mockPosts
      .filter(p => p.id !== postId && p.tags.some(tag => post.tags.includes(tag)))
      .slice(0, 3);
  };
  
  const relatedPosts = getRelatedPosts();

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">文章不存在</h2>
          <p className="text-gray-600 dark:text-gray-400">抱歉，您请求的文章不存在或已被删除。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostDetail post={post} relatedPosts={relatedPosts} />
      </div>
    </div>
  );
};

export default PostDetailPage;