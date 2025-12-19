import React from 'react';
import Banner from '../components/Banner';
import PostCard from '../components/PostCard';
import TagsSidebar from '../components/TagsSidebar';
import { mockPosts, getAllTags } from '../data/mockData';

const HomePage: React.FC = () => {
  const latestPosts = mockPosts.slice(0, 3);
  const tags = getAllTags();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner */}
      <Banner />
      
      {/* 主要内容 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 文章列表 */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">最新文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
          
          {/* 侧边栏 */}
          <div>
            <TagsSidebar tags={tags} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;