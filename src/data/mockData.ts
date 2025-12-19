import { Post } from '../types/blog';

export const mockPosts: Post[] = [
  {
    id: 1,
    title: 'React 18 新特性深度解析',
    excerpt: '本文深入探讨 React 18 引入的并发特性、自动批处理、Suspense 改进等核心功能，帮助开发者更好地理解和应用这些新特性。',
    content: `
      <h2>React 18 新特性概述</h2>
      <p>React 18 是 React 框架的一个重要版本，引入了多项激动人心的新特性，主要围绕并发渲染和性能优化展开。</p>
      
      <h3>并发特性</h3>
      <p>并发特性是 React 18 最核心的改进，它允许 React 同时处理多个任务，并根据优先级进行调度。</p>
      
      <pre><code class="language-jsx">import { useState, startTransition } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);

  const handleClick = () => {
    // 紧急更新 - 立即执行
    setCount(c => c + 1);
    
    // 非紧急更新 - 在浏览器空闲时执行
    startTransition(() => {
      setData(fetchData());
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Click me</button>
      <p>Count: {count}</p>
      {data && <div>{data}</div>}
    </div>
  );
}</code></pre>
      
      <h3>自动批处理</h3>
      <p>React 18 自动批处理所有状态更新，无论它们来自何处，包括 Promise、setTimeout 和原生事件处理函数。</p>
      
      <h3>Suspense 改进</h3>
      <p>Suspense 现在支持在服务器端渲染中使用，并且可以更好地处理组件的加载状态。</p>
      
      <h2>总结</h2>
      <p>React 18 引入的新特性为开发者提供了更强大的工具来构建高性能、响应式的应用程序。通过合理利用这些特性，开发者可以显著提升应用的用户体验。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop',
    category: '前端开发',
    tags: ['React', 'JavaScript', '前端'],
    publishDate: '2024-01-15',
    readTime: '8 分钟'
  },
  {
    id: 2,
    title: 'TypeScript 5.0 新特性详解',
    excerpt: 'TypeScript 5.0 带来了装饰器、const 类型参数、联合类型优化等多项新特性，本文将详细介绍这些特性的使用方法和最佳实践。',
    content: `
      <h2>TypeScript 5.0 新特性</h2>
      <p>TypeScript 5.0 是 TypeScript 语言的一个重大更新，引入了多项期待已久的特性。</p>
      
      <h3>装饰器</h3>
      <p>TypeScript 5.0 正式支持了 ECMAScript 装饰器提案，允许开发者使用装饰器来增强类、方法、属性和参数。</p>
      
      <pre><code class="language-ts">// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  // 方法装饰器
  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}

// 方法装饰器实现
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}</code></pre>
      
      <h3>const 类型参数</h3>
      <p>const 类型参数允许开发者在泛型函数中保留字面量类型，提供更精确的类型推断。</p>
      
      <h3>联合类型优化</h3>
      <p>TypeScript 5.0 对联合类型的处理进行了优化，减少了不必要的类型检查和错误提示。</p>
      
      <h2>总结</h2>
      <p>TypeScript 5.0 的新特性进一步增强了 TypeScript 的类型系统和开发体验，使开发者能够编写更安全、更高效的代码。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1629903688450-47610a25efee?w=800&h=400&fit=crop',
    category: '前端开发',
    tags: ['TypeScript', 'JavaScript', '类型系统'],
    publishDate: '2024-01-10',
    readTime: '10 分钟'
  },
  {
    id: 3,
    title: 'Tailwind CSS 3.0 全面指南',
    excerpt: 'Tailwind CSS 3.0 带来了 JIT 编译器、新的颜色系统、容器查询等多项重大更新，本文将带你全面了解这些新特性。',
    content: `
      <h2>Tailwind CSS 3.0 新特性</h2>
      <p>Tailwind CSS 3.0 是 Tailwind CSS 框架的一个重大版本更新，引入了多项革命性的新特性。</p>
      
      <h3>JIT 编译器</h3>
      <p>JIT（Just-in-Time）编译器是 Tailwind CSS 3.0 最核心的改进，它实时编译 CSS，只生成你实际使用的样式，显著减小了 CSS 文件的大小。</p>
      
      <h3>新的颜色系统</h3>
      <p>Tailwind CSS 3.0 引入了新的颜色系统，包括 5 种新的颜色系列和改进的颜色命名。</p>
      
      <h3>容器查询</h3>
      <p>容器查询允许开发者根据元素的父容器大小而不是视口大小来应用样式，是响应式设计的重大突破。</p>
      
      <pre><code class="language-html"><div class="container mx-auto">
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold mb-4">容器查询示例</h2>
    <div class="md:grid md:grid-cols-2 gap-4">
      <div class="bg-blue-100 p-4 rounded-lg">
        <h3 class="text-lg font-semibold">Card 1</h3>
        <p>This card uses container queries to adapt its layout.</p>
      </div>
      <div class="bg-green-100 p-4 rounded-lg">
        <h3 class="text-lg font-semibold">Card 2</h3>
        <p>This card also uses container queries for responsive design.</p>
      </div>
    </div>
  </div>
</div></code></pre>
      
      <h2>总结</h2>
      <p>Tailwind CSS 3.0 的新特性使开发者能够更高效、更灵活地构建现代化的 Web 应用。JIT 编译器、新的颜色系统和容器查询等特性，为开发者提供了更强大的工具来创建美观、响应式的用户界面。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1621575284759-43c28903575e?w=800&h=400&fit=crop',
    category: '前端开发',
    tags: ['Tailwind CSS', 'CSS', '前端'],
    publishDate: '2024-01-05',
    readTime: '12 分钟'
  },
  {
    id: 4,
    title: '现代前端性能优化最佳实践',
    excerpt: '本文介绍了现代前端性能优化的核心策略，包括代码分割、懒加载、缓存策略、图片优化等，帮助开发者构建高性能的 Web 应用。',
    content: `
      <h2>前端性能优化概述</h2>
      <p>前端性能优化是 Web 开发中不可或缺的一部分，它直接影响用户体验和业务转化率。</p>
      
      <h3>代码分割</h3>
      <p>代码分割是将应用代码拆分为多个小块，按需加载，减少初始加载时间。</p>
      
      <pre><code class="language-jsx">// 动态导入 - 实现代码分割
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}</code></pre>
      
      <h3>懒加载</h3>
      <p>懒加载是指延迟加载非关键资源，直到它们需要被显示或使用。</p>
      
      <h3>缓存策略</h3>
      <p>合理的缓存策略可以显著减少网络请求，提高应用的加载速度。</p>
      
      <h3>图片优化</h3>
      <p>图片是 Web 应用中最主要的资源之一，优化图片可以显著减小文件大小，提高加载速度。</p>
      
      <h2>总结</h2>
      <p>前端性能优化是一个持续的过程，需要开发者不断学习和实践。通过合理运用代码分割、懒加载、缓存策略和图片优化等技术，开发者可以构建出高性能、响应式的 Web 应用，提供良好的用户体验。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    category: '性能优化',
    tags: ['性能优化', '前端', 'Web 开发'],
    publishDate: '2023-12-25',
    readTime: '15 分钟'
  },
  {
    id: 5,
    title: 'Next.js 14 全栈开发实践',
    excerpt: 'Next.js 14 引入了 App Router、Server Components、Streaming 等多项新特性，本文将带你从零开始构建一个全栈应用。',
    content: `
      <h2>Next.js 14 新特性</h2>
      <p>Next.js 14 是 Next.js 框架的一个重大版本更新，引入了多项革命性的新特性。</p>
      
      <h3>App Router</h3>
      <p>App Router 是 Next.js 14 最核心的改进，它基于 React Server Components 构建，提供了更灵活、更强大的路由系统。</p>
      
      <h3>Server Components</h3>
      <p>Server Components 允许开发者在服务器端渲染组件，减少客户端 JavaScript 的大小，提高应用的性能。</p>
      
      <h3>Streaming</h3>
      <p>Streaming 允许开发者将页面内容分块发送到浏览器，提高页面的首次内容绘制时间。</p>
      
      <pre><code class="language-jsx">// app/page.js - Server Component
import { fetchPosts } from '../lib/posts';

async function HomePage() {
  const posts = await fetchPosts();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">最新文章</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;</code></pre>
      
      <h2>总结</h2>
      <p>Next.js 14 的新特性为开发者提供了更强大的工具来构建现代化的全栈应用。App Router、Server Components 和 Streaming 等特性，使开发者能够创建高性能、可扩展的 Web 应用，提供出色的用户体验。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=400&fit=crop',
    category: '全栈开发',
    tags: ['Next.js', 'React', '全栈'],
    publishDate: '2023-12-20',
    readTime: '20 分钟'
  },
  {
    id: 6,
    title: 'GraphQL 入门与实践',
    excerpt: 'GraphQL 是一种用于 API 的查询语言，它提供了更高效、更强大、更灵活的数据获取方式。本文将带你从零开始学习 GraphQL。',
    content: `
      <h2>GraphQL 概述</h2>
      <p>GraphQL 是由 Facebook 开发的一种用于 API 的查询语言，它提供了更高效、更强大、更灵活的数据获取方式。</p>
      
      <h3>核心概念</h3>
      <p>GraphQL 的核心概念包括查询（Query）、变更（Mutation）、订阅（Subscription）和类型系统（Type System）。</p>
      
      <h3>查询语言</h3>
      <p>GraphQL 查询语言允许客户端精确指定需要获取的数据，避免了过度获取和不足获取的问题。</p>
      
      <pre><code class="language-graphql"># 查询示例
query GetPosts {
  posts {
    id
    title
    excerpt
    author {
      name
      avatar
    }
    tags {
      name
    }
  }
}

# 变更示例
mutation CreatePost($input: PostInput!) {
  createPost(input: $input) {
    id
    title
    content
  }
}</code></pre>
      
      <h3>类型系统</h3>
      <p>GraphQL 使用类型系统来定义 API 的结构，包括对象类型、标量类型、枚举类型、接口和联合类型等。</p>
      
      <h2>总结</h2>
      <p>GraphQL 是一种强大的 API 查询语言，它提供了更高效、更灵活的数据获取方式。通过学习和实践 GraphQL，开发者可以构建出更高效、更强大的 API，提供更好的开发体验。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop',
    category: '后端开发',
    tags: ['GraphQL', 'API', '后端'],
    publishDate: '2023-12-15',
    readTime: '18 分钟'
  }
];

export const getPostsByTag = (tag: string): Post[] => {
  return mockPosts.filter(post => post.tags.includes(tag));
};

export const getPostById = (id: number): Post | undefined => {
  return mockPosts.find(post => post.id === id);
};

export const getAllTags = () => {
  const tagMap = new Map<string, number>();
  
  mockPosts.forEach(post => {
    post.tags.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }));
};