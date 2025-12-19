import React from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import TagsSidebar from '../components/TagsSidebar';
import { getPostsByTag, getAllTags } from '../data/mockData';

const TagsPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const tags = getAllTags();
  const posts = tag ? getPostsByTag(tag) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 文章列表 */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {tag ? `标签: ${tag}` : '标签分类'}
            </h2>
            
            {tag ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">暂无相关文章</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  点击左侧标签查看相关文章
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tagItem, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full"
                    >
                      {tagItem.name} <span className="text-xs opacity-70">({tagItem.count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
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

export default TagsPage;