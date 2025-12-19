import React from 'react';
import { Link } from 'react-router-dom';
import { Tag } from '../types/blog';

interface TagsSidebarProps {
  tags: Tag[];
}

const TagsSidebar: React.FC<TagsSidebarProps> = ({ tags }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">热门标签</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Link
            key={index}
            to={`/tags/${tag.name}`}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full hover:bg-primary hover:text-white transition-all duration-200 hover:shadow-md"
          >
            {tag.name} <span className="text-xs opacity-70">({tag.count})</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TagsSidebar;