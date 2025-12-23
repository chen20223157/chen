import { Post } from '../types/blog';

// 从 resources 目录加载的测试开发技术模块文章数据
const testDevPosts: Post[] = [
  {
    id: 1,
    title: 'DirectSound、WaveOut 和 WASAPI 测试开发技术',
    excerpt: 'Windows 平台上三种主要音频输出 API 的测试方法、性能分析和兼容性验证技术',
    content: `
      <h2>概述</h2>
      <p>DirectSound、WaveOut 和 WASAPI 是 Windows 平台上三种主要的音频输出 API，作为测试开发工程师，需要掌握它们的测试方法、性能分析和兼容性验证技术。</p>
      
      <h3>DirectSound 特点与测试要点</h3>
      <p>DirectSound 是 DirectX 的一部分，专为游戏和多媒体应用设计，提供硬件加速和低延迟音频处理。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>硬件加速兼容性测试</li>
        <li>多声道混音性能测试</li>
        <li>3D音效定位准确性测试</li>
        <li>缓冲区管理效率测试</li>
      </ul>
      
      <h3>WaveOut 特点与测试要点</h3>
      <p>WaveOut 是最古老的 Windows 音频 API，兼容性好但功能有限，适合简单音频播放场景。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>设备兼容性测试</li>
        <li>波形格式支持测试</li>
        <li>同步播放精度测试</li>
        <li>资源占用测试</li>
      </ul>
      
      <h3>WASAPI 特点与测试要点</h3>
      <p>WASAPI 是 Windows Vista 引入的现代音频 API，提供低延迟和高精度的音频处理能力。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>独占模式性能测试</li>
        <li>低延迟音频流测试</li>
        <li>设备动态切换测试</li>
        <li>音频格式自动转换测试</li>
      </ul>
      
      <h2>性能对比测试</h2>
      <p>三种 API 在不同场景下的性能表现对比，包括 CPU 占用、内存使用、延迟和兼容性等指标。</p>
      
      <h2>兼容性测试策略</h3>
      <p>针对不同 Windows 版本和音频设备的兼容性测试方案，确保应用在各种环境下稳定运行。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=400&fit=crop',
    category: '音频技术',
    tags: ['Windows', 'DirectSound', 'WASAPI', '音频API', '测试开发'],
    publishDate: '2024-01-20',
    readTime: '15 分钟'
  },
  {
    id: 2,
    title: 'OpenSLES和AudioRecord测试开发技术',
    excerpt: 'Android 平台上两种主要音频录制 API 的测试方法、性能分析和兼容性验证技术',
    content: `
      <h2>概述</h2>
      <p>OpenSLES (Open Sound Library for Embedded Systems) 和 AudioRecord 是 Android 平台上两种主要的音频录制 API，作为测试开发工程师，需要掌握它们的测试方法、性能分析和兼容性验证技术。</p>
      
      <h3>OpenSLES 特点与测试要点</h3>
      <p>OpenSLES 是基于 Khronos Group 标准的跨平台音频 API，提供低延迟和高性能的音频处理能力。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>低延迟录制性能测试</li>
        <li>多声道录制支持测试</li>
        <li>实时音频处理效果测试</li>
        <li>CPU 资源占用测试</li>
      </ul>
      
      <h3>AudioRecord 特点与测试要点</h3>
      <p>AudioRecord 是 Android SDK 提供的标准音频录制 API，兼容性好，适合大多数音频录制场景。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>设备兼容性测试</li>
        <li>不同采样率和格式支持测试</li>
        <li>录音质量评估测试</li>
        <li>后台录音稳定性测试</li>
      </ul>
      
      <h2>性能对比测试</h2>
      <p>两种 API 在不同 Android 设备和版本上的性能表现对比，包括延迟、音质、资源占用等指标。</p>
      
      <h2>兼容性测试策略</h3>
      <p>针对不同 Android 版本、设备厂商和硬件配置的兼容性测试方案，确保录音功能在各种环境下稳定工作。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=800&h=400&fit=crop',
    category: '音频技术',
    tags: ['Android', 'OpenSLES', 'AudioRecord', '音频录制', '测试开发'],
    publishDate: '2024-01-18',
    readTime: '12 分钟'
  },
  {
    id: 3,
    title: 'Activity/Fragment 生命周期测试开发技术',
    excerpt: 'Android 应用中 Activity 和 Fragment 生命周期的全面管理与监控，确保应用在不同生命周期状态下的稳定运行',
    content: `
      <h2>模块概述</h2>
      <p>本模块提供Android应用中Activity和Fragment生命周期的全面管理与监控，确保应用在不同生命周期状态下的稳定运行和资源合理管理。</p>
      
      <h3>Activity生命周期测试要点</h3>
      <p>Activity 生命周期是 Android 应用的核心，需要全面测试各种状态转换和边界情况。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>正常流程生命周期回调测试</li>
        <li>异常终止状态保存测试</li>
        <li>配置变更（如屏幕旋转）测试</li>
        <li>内存不足导致进程杀死恢复测试</li>
        <li>Activity 栈管理测试</li>
      </ul>
      
      <h3>Fragment生命周期测试要点</h3>
      <p>Fragment 生命周期比 Activity 更复杂，需要测试其与 Activity 的交互以及嵌套 Fragment 的行为。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>Fragment 与 Activity 生命周期同步测试</li>
        <li>Fragment 事务回滚测试</li>
        <li>嵌套 Fragment 生命周期测试</li>
        <li>Fragment 隐藏与显示状态测试</li>
        <li>Fragment 状态保存与恢复测试</li>
      </ul>
      
      <h2>自动化测试框架</h2>
      <p>构建 Activity/Fragment 生命周期自动化测试框架，包括状态监控、异常捕获和性能分析等功能。</p>
      
      <h2>性能优化测试</h2>
      <p>针对生命周期回调中的耗时操作进行性能测试，确保应用响应速度和流畅度。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=400&fit=crop',
    category: 'Android开发',
    tags: ['Activity', 'Fragment', '生命周期', 'Android', '测试开发'],
    publishDate: '2024-01-16',
    readTime: '20 分钟'
  },
  {
    id: 4,
    title: '音视频硬解与软解测试开发技术',
    excerpt: '音视频解码的两种实现方式：硬件解码和软件解码，根据设备能力、性能需求和兼容性要求自动选择最适合的解码方案',
    content: `
      <h2>模块概述</h2>
      <p>本模块提供音视频解码的两种实现方式：硬件解码和软件解码，根据设备能力、性能需求和兼容性要求自动选择最适合的解码方案。</p>
      
      <h3>硬件解码测试要点</h3>
      <p>硬件解码利用设备专用处理单元，具有低功耗和高性能的特点，但兼容性相对较差。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>不同设备硬件解码能力测试</li>
        <li>解码格式支持范围测试</li>
        <li>解码性能和功耗测试</li>
        <li>硬件解码失败回退测试</li>
        <li>多路并发解码性能测试</li>
      </ul>
      
      <h3>软件解码测试要点</h3>
      <p>软件解码使用 CPU 进行解码处理，兼容性好但资源占用高，适合不支持硬件解码的场景。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>不同分辨率和码率解码性能测试</li>
        <li>解码精度和质量评估测试</li>
        <li>CPU 和内存资源占用测试</li>
        <li>解码兼容性测试</li>
        <li>解码器稳定性测试</li>
      </ul>
      
      <h2>解码方案选择策略</h2>
      <p>根据设备性能、网络条件、视频格式等因素动态选择最适合的解码方案，平衡性能和兼容性。</p>
      
      <h2>性能对比分析</h2>
      <p>硬件解码和软件解码在不同场景下的性能对比，包括解码速度、资源占用、功耗等指标。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
    category: '音视频技术',
    tags: ['硬件解码', '软件解码', '性能测试', '音视频', '测试开发'],
    publishDate: '2024-01-14',
    readTime: '18 分钟'
  },
  {
    id: 5,
    title: 'Info日志等级测试开发技术',
    excerpt: '统一的日志管理系统，支持多种日志等级，特别是Info等级日志的规范使用，确保开发、测试和生产环境中日志记录的有效性',
    content: `
      <h2>模块概述</h2>
      <p>本模块提供统一的日志管理系统，支持多种日志等级，特别是Info等级日志的规范使用，确保开发、测试和生产环境中日志记录的有效性和可管理性。</p>
      
      <h3>日志等级体系</h3>
      <p>合理的日志等级体系是有效日志管理的基础，需要明确定义各等级的使用场景和输出控制。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>日志等级过滤功能测试</li>
        <li>不同环境日志输出控制测试</li>
        <li>日志格式标准化测试</li>
        <li>日志文件轮转和清理测试</li>
        <li>敏感信息过滤测试</li>
      </ul>
      
      <h3>Info日志规范</h3>
      <p>Info 日志用于记录系统正常运行状态和关键业务流程，需要制定明确的记录规范。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>Info 日志内容完整性测试</li>
        <li>关键业务流程日志覆盖测试</li>
        <li>日志量控制测试</li>
        <li>日志查询和分析功能测试</li>
        <li>日志性能影响测试</li>
      </ul>
      
      <h2>日志系统性能测试</h2>
      <p>测试日志系统在高并发和大数据量情况下的性能表现，确保不影响主业务流程。</p>
      
      <h2>日志分析工具</h2>
      <p>开发和测试日志分析工具，提高日志数据的利用效率和问题排查能力。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    category: '测试工具',
    tags: ['日志系统', 'Info等级', '性能测试', '测试开发', '日志分析'],
    publishDate: '2024-01-12',
    readTime: '16 分钟'
  },
  {
    id: 6,
    title: 'JNI技术测试开发',
    excerpt: 'Java与C/C++之间的桥梁技术实现，使Android应用能够调用原生代码，实现高性能计算、系统级操作和硬件访问等功能',
    content: `
      <h2>模块概述</h2>
      <p>本模块提供Java与C/C++之间的桥梁技术实现，使Android应用能够调用原生代码，实现高性能计算、系统级操作和硬件访问等功能。</p>
      
      <h3>JNI基础架构测试</h3>
      <p>JNI 基础架构是 Java 与原生代码交互的核心，需要全面测试其稳定性和性能。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>Java 与 C/C++ 数据类型转换测试</li>
        <li>字符串处理和编码转换测试</li>
        <li>数组传递和操作测试</li>
        <li>异常处理和传播测试</li>
        <li>内存管理和泄漏测试</li>
      </ul>
      
      <h3>性能优化测试</h3>
      <p>JNI 调用涉及跨语言边界，性能开销较大，需要测试和优化关键路径。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>JNI 调用延迟测试</li>
        <li>批量数据传输效率测试</li>
        <li>原生代码执行性能测试</li>
        <li>内存占用和回收测试</li>
        <li>多线程并发调用测试</li>
      </ul>
      
      <h2>兼容性测试</h2>
      <p>测试不同 Android 版本和设备架构上的 JNI 兼容性，确保原生库在各种环境下正常工作。</p>
      
      <h2>安全性测试</h2>
      <p>JNI 调用绕过了 Java 的安全机制，需要特别测试安全性问题，防止恶意代码注入和内存破坏。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
    category: 'Android开发',
    tags: ['JNI', '原生代码', '性能测试', 'Android', '测试开发'],
    publishDate: '2024-01-10',
    readTime: '14 分钟'
  },
  {
    id: 7,
    title: '预转码测试开发技术',
    excerpt: '视频预转码功能，将原始视频转换为更适合播放的格式，优化播放性能，减少播放卡顿，提升用户体验',
    content: `
      <h2>模块概述</h2>
      <p>本模块提供视频预转码功能，将原始视频转换为更适合播放的格式，优化播放性能，减少播放卡顿，提升用户体验。</p>
      
      <h3>预转码策略测试</h3>
      <p>预转码策略决定了何时、何地以及如何进行视频转码，需要测试各种场景下的效果。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>不同视频格式转码效果测试</li>
        <li>转码参数优化测试</li>
        <li>转码时间和质量平衡测试</li>
        <li>转码失败处理测试</li>
        <li>转码资源占用测试</li>
      </ul>
      
      <h3>转码质量控制</h3>
      <p>转码质量控制是保证用户体验的关键，需要测试各种质量控制策略的有效性。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>不同码率和分辨率转码测试</li>
        <li>自适应码率调整测试</li>
        <li>转码质量评估测试</li>
        <li>转码兼容性测试</li>
        <li>转码效率优化测试</li>
      </ul>
      
      <h2>性能优化测试</h2>
      <p>测试转码过程的性能表现，优化转码速度和资源占用，提高系统整体效率。</p>
      
      <h2>批量转码测试</h2>
      <p>测试批量转码场景下的系统稳定性和性能，确保大量视频转码任务能够顺利完成。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    category: '音视频技术',
    tags: ['预转码', '视频处理', '性能优化', '音视频', '测试开发'],
    publishDate: '2024-01-08',
    readTime: '16 分钟'
  },
  {
    id: 8,
    title: '预加载文件测试开发技术',
    excerpt: '视频文件的预加载功能，在用户播放前预先下载部分视频内容，减少播放等待时间，提升用户体验',
    content: `
      <h2>模块概述</h2>
      <p>本模块提供视频文件的预加载功能，在用户播放前预先下载部分视频内容，减少播放等待时间，提升用户体验，特别适用于网络环境不稳定或带宽有限的情况。</p>
      
      <h3>预加载策略测试</h3>
      <p>预加载策略决定了预加载的内容、时机和大小，需要测试各种策略的效果。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>不同网络环境下预加载效果测试</li>
        <li>预加载大小和时机优化测试</li>
        <li>预加载优先级管理测试</li>
        <li>预加载失败处理测试</li>
        <li>预加载资源占用测试</li>
      </ul>
      
      <h3>预加载管理器</h3>
      <p>预加载管理器负责协调多个预加载任务，需要测试其任务调度和资源管理能力。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>多任务并发预加载测试</li>
        <li>预加载任务优先级调度测试</li>
        <li>存储空间管理测试</li>
        <li>网络带宽分配测试</li>
        <li>预加载缓存清理测试</li>
      </ul>
      
      <h2>性能优化测试</h2>
      <p>测试预加载过程对系统性能的影响，优化预加载策略，平衡用户体验和资源消耗。</p>
      
      <h2>智能预加载</h2>
      <p>测试基于用户行为预测的智能预加载功能，提高预加载的准确性和效率。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    category: '音视频技术',
    tags: ['预加载', '视频优化', '性能测试', '音视频', '测试开发'],
    publishDate: '2024-01-06',
    readTime: '18 分钟'
  },
  {
    id: 9,
    title: 'SeekBuffer/NormalBuffer 测试开发技术',
    excerpt: '视频播放中的缓冲区管理功能，包括SeekBuffer和NormalBuffer两种缓冲策略，优化播放体验，减少卡顿，提高响应速度',
    content: `
      <h2>模块概述</h2>
      <p>本模块提供视频播放中的缓冲区管理功能，包括SeekBuffer和NormalBuffer两种缓冲策略，优化播放体验，减少卡顿，提高响应速度。</p>
      
      <h3>SeekBuffer测试要点</h3>
      <p>SeekBuffer 专门用于处理视频拖拽和跳转操作，需要测试其响应速度和准确性。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>快速拖拽响应时间测试</li>
        <li>关键帧预加载效果测试</li>
        <li>缓冲区大小优化测试</li>
        <li>拖拽精度测试</li>
        <li>资源占用和清理测试</li>
      </ul>
      
      <h3>NormalBuffer测试要点</h3>
      <p>NormalBuffer 用于正常顺序播放，需要测试其流畅度和稳定性。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>连续播放流畅度测试</li>
        <li>缓冲区大小自适应测试</li>
        <li>网络波动处理测试</li>
        <li>缓冲策略优化测试</li>
        <li>内存使用效率测试</li>
      </ul>
      
      <h2>缓冲区切换测试</h2>
      <p>测试 SeekBuffer 和 NormalBuffer 之间的切换逻辑，确保不同播放模式下的平滑过渡。</p>
      
      <h2>自适应缓冲策略</h2>
      <p>测试基于网络状况和设备性能的自适应缓冲策略，优化各种环境下的播放体验。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    category: '音视频技术',
    tags: ['缓冲区管理', '视频播放', '性能优化', '音视频', '测试开发'],
    publishDate: '2024-01-04',
    readTime: '15 分钟'
  },
  {
    id: 10,
    title: '网页嗅探m3u8测试开发技术',
    excerpt: '网页中m3u8流媒体链接的自动嗅探与提取功能，支持多种网页结构，能够识别和解析m3u8播放列表，为视频播放提供数据源',
    content: `
      <h2>模块概述</h2>
      <p>本模块提供网页中m3u8流媒体链接的自动嗅探与提取功能，支持多种网页结构，能够识别和解析m3u8播放列表，为视频播放提供数据源。</p>
      
      <h3>网页内容嗅探测试</h3>
      <p>网页内容嗅探是提取视频链接的第一步，需要测试各种网页结构和内容格式。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>不同网页结构解析测试</li>
        <li>JavaScript动态内容提取测试</li>
        <li>加密和混淆代码处理测试</li>
        <li>多层嵌套链接提取测试</li>
        <li>反爬虫机制应对测试</li>
      </ul>
      
      <h3>m3u8解析器测试</h3>
      <p>m3u8解析器负责解析HLS播放列表，需要测试各种格式的播放列表。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>标准m3u8格式解析测试</li>
        <li>多级播放列表解析测试</li>
        <li>加密流处理测试</li>
        <li>实时更新播放列表测试</li>
        <li>错误格式容错测试</li>
      </ul>
      
      <h2>链接有效性验证</h2>
      <p>测试提取的视频链接的有效性，确保能够正常播放。</p>
      
      <h2>性能优化测试</h2>
      <p>测试嗅探过程的性能表现，优化嗅探速度和资源占用。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    category: '网络技术',
    tags: ['m3u8', '网页嗅探', 'HLS', '流媒体', '测试开发'],
    publishDate: '2024-01-02',
    readTime: '17 分钟'
  },
  {
    id: 11,
    title: 'AudioQueue 音频播放测试开发技术',
    excerpt: 'iOS平台下的音频播放功能，基于AudioQueue框架实现高效、低延迟的音频播放，支持多种音频格式和播放模式',
    content: `
      <h2>模块概述</h2>
      <p>本模块提供iOS平台下的音频播放功能，基于AudioQueue框架实现高效、低延迟的音频播放，支持多种音频格式和播放模式。</p>
      
      <h3>AudioQueue基础测试</h3>
      <p>AudioQueue 基础功能是音频播放的核心，需要测试其稳定性和性能。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>音频格式兼容性测试</li>
        <li>缓冲区管理测试</li>
        <li>播放控制功能测试</li>
        <li>音频中断处理测试</li>
        <li>多线程播放测试</li>
      </ul>
      
      <h3>音频格式支持测试</h3>
      <p>AudioQueue 支持多种音频格式，需要测试各种格式的播放效果。</p>
      
      <h4>测试要点</h4>
      <ul>
        <li>PCM格式播放测试</li>
        <li>AAC格式播放测试</li>
        <li>MP3格式播放测试</li>
        <li>其他格式兼容性测试</li>
        <li>格式自动识别测试</li>
      </ul>
      
      <h2>性能优化测试</h2>
      <p>测试音频播放的性能表现，优化延迟、资源占用和功耗。</p>
      
      <h2>实时音频处理</h2>
      <p>测试实时音频处理功能，包括音效、均衡器和混音等。</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    category: '音频技术',
    tags: ['AudioQueue', 'iOS', '音频播放', '性能测试', '测试开发'],
    publishDate: '2023-12-31',
    readTime: '15 分钟'
  }
];

// 导出测试开发技术文章
export const mockPosts: Post[] = testDevPosts;

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