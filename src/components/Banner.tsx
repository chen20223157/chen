import React from 'react';
import { Link } from 'react-router-dom';

const Banner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 dark:from-primary/80 dark:to-purple-600/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
            探索技术世界
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            分享前端开发、技术趋势和编程经验
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link 
              to="/posts" 
              className="px-8 py-3 bg-white text-primary font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              查看全部文章
            </Link>
            <Link 
              to="/tags" 
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              浏览标签
            </Link>
          </div>
        </div>
      </div>
      {/* 装饰性元素 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-dark to-transparent"></div>
    </div>
  );
};

export default Banner;