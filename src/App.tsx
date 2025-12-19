import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AllPostsPage from './pages/AllPostsPage';
import PostDetailPage from './pages/PostDetailPage';
import TagsPage from './pages/TagsPage';
import AboutPage from './pages/AboutPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* 导航栏 */}
        <Navbar />
        
        {/* 主要内容 */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts" element={<AllPostsPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tags/:tag" element={<TagsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        
        {/* 页脚 */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;