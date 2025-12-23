# 预加载文件测试开发技术

## 模块概述
本模块提供视频文件的预加载功能，在用户播放前预先下载部分视频内容，减少播放等待时间，提升用户体验，特别适用于网络环境不稳定或带宽有限的情况。

## 技术组件

### 预加载策略
- **应用场景**：视频播放前的内容预取，播放列表预加载
- **特点**：智能预测，自适应预加载，资源优化
- **实现要点**：
  - 分析用户观看习惯
  - 确定预加载内容和大小
  - 管理预加载优先级
  - 控制预加载资源消耗

### 预加载管理器
- **应用场景**：协调多个预加载任务，管理预加载资源
- **特点**：任务调度，资源控制，状态跟踪
- **实现要点**：
  - 实现预加载任务队列
  - 管理网络带宽分配
  - 跟踪预加载进度
  - 处理预加载失败情况

## 技术实现细节

### 预加载管理器
```java
public class PreloadManager {
    private static final String TAG = "PreloadManager";
    
    // 预加载策略
    public enum PreloadStrategy {
        AGGRESSIVE,    // 积极预加载，占用更多带宽和存储
        MODERATE,      // 适中预加载，平衡资源使用和体验
        CONSERVATIVE   // 保守预加载，最小化资源消耗
    }
    
    // 预加载状态
    public enum PreloadStatus {
        PENDING,       // 等待中
        DOWNLOADING,   // 下载中
        COMPLETED,     // 已完成
        FAILED,        // 失败
        CANCELLED      // 已取消
    }
    
    private PreloadConfig config;
    private ExecutorService downloadExecutor;
    private Map<String, PreloadTask> activeTasks;
    private PriorityQueue<PreloadTask> pendingTasks;
    private NetworkMonitor networkMonitor;
    private StorageManager storageManager;
    private PreloadEventListener eventListener;
    
    public PreloadManager(PreloadConfig config) {
        this.config = config;
        this.downloadExecutor = Executors.newFixedThreadPool(config.getMaxConcurrentDownloads());
        this.activeTasks = new ConcurrentHashMap<>();
        this.pendingTasks = new PriorityQueue<>(config.getTaskComparator());
        this.networkMonitor = new NetworkMonitor();
        this.storageManager = new StorageManager(config.getCacheDirectory());
        
        // 启动预加载调度器
        startPreloadScheduler();
    }
    
    // 提交预加载任务
    public String submitPreloadTask(String url, PreloadPriority priority, PreloadStrategy strategy) {
        String taskId = UUID.randomUUID().toString();
        PreloadTask task = new PreloadTask(taskId, url, priority, strategy);
        
        // 检查是否已存在相同URL的任务
        for (PreloadTask existingTask : activeTasks.values()) {
            if (existingTask.getUrl().equals(url)) {
                Log.d(TAG, "URL已存在预加载任务: " + url);
                return existingTask.getTaskId();
            }
        }
        
        // 检查是否已缓存
        if (storageManager.isCached(url)) {
            Log.d(TAG, "文件已缓存: " + url);
            task.setStatus(PreloadStatus.COMPLETED);
            task.setProgress(100);
            return taskId;
        }
        
        // 添加到待处理队列
        synchronized (pendingTasks) {
            pendingTasks.offer(task);
        }
        
        Log.d(TAG, "提交预加载任务: " + taskId + ", URL: " + url);
        
        return taskId;
    }
    
    // 启动预加载调度器
    private void startPreloadScheduler() {
        Thread schedulerThread = new Thread(new Runnable() {
            @Override
            public void run() {
                while (!Thread.currentThread().isInterrupted()) {
                    try {
                        // 检查是否可以开始新任务
                        if (canStartNewTask()) {
                            PreloadTask task = getNextTask();
                            if (task != null) {
                                startPreloadTask(task);
                            }
                        }
                        
                        // 检查正在进行的任务
                        checkActiveTasks();
                        
                        // 休眠一段时间
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    } catch (Exception e) {
                        Log.e(TAG, "预加载调度器异常", e);
                    }
                }
            }
        });
        
        schedulerThread.setDaemon(true);
        schedulerThread.start();
    }
    
    // 检查是否可以开始新任务
    private boolean canStartNewTask() {
        // 检查并发任务数限制
        if (activeTasks.size() >= config.getMaxConcurrentDownloads()) {
            return false;
        }
        
        // 检查网络状态
        if (!networkMonitor.isNetworkAvailable()) {
            return false;
        }
        
        // 检查存储空间
        if (storageManager.getAvailableSpace() < config.getMinRequiredSpace()) {
            return false;
        }
        
        // 检查网络带宽
        if (networkMonitor.getCurrentBandwidth() < config.getMinRequiredBandwidth()) {
            return false;
        }
        
        return true;
    }
    
    // 获取下一个任务
    private PreloadTask getNextTask() {
        synchronized (pendingTasks) {
            return pendingTasks.poll();
        }
    }
    
    // 开始预加载任务
    private void startPreloadTask(PreloadTask task) {
        activeTasks.put(task.getTaskId(), task);
        
        downloadExecutor.submit(new Runnable() {
            @Override
            public void run() {
                try {
                    executePreloadTask(task);
                } catch (Exception e) {
                    Log.e(TAG, "执行预加载任务失败: " + task.getTaskId(), e);
                    task.setStatus(PreloadStatus.FAILED);
                    task.setErrorMessage(e.getMessage());
                    
                    if (eventListener != null) {
                        eventListener.onPreloadFailed(task);
                    }
                } finally {
                    activeTasks.remove(task.getTaskId());
                }
            }
        });
    }
    
    // 执行预加载任务
    private void executePreloadTask(PreloadTask task) {
        Log.d(TAG, "开始执行预加载任务: " + task.getTaskId());
        
        task.setStatus(PreloadStatus.DOWNLOADING);
        
        // 确定下载范围
        long contentLength = getContentLength(task.getUrl());
        long downloadSize = calculateDownloadSize(contentLength, task.getStrategy());
        
        // 创建下载请求
        DownloadRequest request = new DownloadRequest();
        request.setUrl(task.getUrl());
        request.setRange(0, downloadSize - 1);
        request.setOutputPath(storageManager.getCacheFilePath(task.getUrl()));
        request.setProgressListener(new DownloadProgressListener() {
            @Override
            public void onProgress(long downloaded, long total) {
                int progress = (int) (downloaded * 100 / total);
                task.setProgress(progress);
                
                if (eventListener != null) {
                    eventListener.onPreloadProgress(task, progress);
                }
            }
        });
        
        // 执行下载
        try {
            DownloadResult result = downloadFile(request);
            
            if (result.isSuccess()) {
                task.setStatus(PreloadStatus.COMPLETED);
                task.setProgress(100);
                task.setDownloadedSize(result.getFileSize());
                
                // 保存到缓存管理器
                storageManager.addCachedFile(task.getUrl(), result.getFilePath());
                
                if (eventListener != null) {
                    eventListener.onPreloadCompleted(task);
                }
                
                Log.d(TAG, "预加载任务完成: " + task.getTaskId());
            } else {
                task.setStatus(PreloadStatus.FAILED);
                task.setErrorMessage(result.getErrorMessage());
                
                if (eventListener != null) {
                    eventListener.onPreloadFailed(task);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("预加载下载失败", e);
        }
    }
    
    // 获取内容长度
    private long getContentLength(String url) throws IOException {
        HttpURLConnection connection = null;
        try {
            URL downloadUrl = new URL(url);
            connection = (HttpURLConnection) downloadUrl.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                return connection.getContentLengthLong();
            } else {
                throw new IOException("HTTP错误: " + responseCode);
            }
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
    
    // 计算下载大小
    private long calculateDownloadSize(long contentLength, PreloadStrategy strategy) {
        switch (strategy) {
            case AGGRESSIVE:
                // 积极策略：下载整个文件
                return contentLength;
                
            case MODERATE:
                // 适中策略：下载文件的前30%
                return Math.min(contentLength, contentLength * 3 / 10);
                
            case CONSERVATIVE:
                // 保守策略：下载文件的前10%
                return Math.min(contentLength, contentLength / 10);
                
            default:
                return Math.min(contentLength, contentLength / 5);
        }
    }
    
    // 下载文件
    private DownloadResult downloadFile(DownloadRequest request) throws IOException {
        HttpURLConnection connection = null;
        InputStream inputStream = null;
        OutputStream outputStream = null;
        
        try {
            URL downloadUrl = new URL(request.getUrl());
            connection = (HttpURLConnection) downloadUrl.openConnection();
            
            // 设置请求范围
            if (request.getRangeStart() >= 0 && request.getRangeEnd() >= 0) {
                connection.setRequestProperty("Range", "bytes=" + request.getRangeStart() + "-" + request.getRangeEnd());
            }
            
            // 设置请求头
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(30000);
            
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK && responseCode != HttpURLConnection.HTTP_PARTIAL) {
                return new DownloadResult(false, 0, "HTTP错误: " + responseCode);
            }
            
            // 获取文件大小
            long fileSize = connection.getContentLengthLong();
            
            // 创建输出目录
            File outputFile = new File(request.getOutputPath());
            File parentDir = outputFile.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }
            
            // 开始下载
            inputStream = connection.getInputStream();
            outputStream = new FileOutputStream(outputFile);
            
            byte[] buffer = new byte[8192];
            long totalBytesRead = 0;
            int bytesRead;
            
            DownloadProgressListener progressListener = request.getProgressListener();
            
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
                totalBytesRead += bytesRead;
                
                // 通知进度
                if (progressListener != null) {
                    progressListener.onProgress(totalBytesRead, fileSize);
                }
            }
            
            outputStream.flush();
            
            return new DownloadResult(true, totalBytesRead, outputFile.getAbsolutePath());
            
        } finally {
            if (outputStream != null) {
                try {
                    outputStream.close();
                } catch (IOException e) {
                    Log.w(TAG, "关闭输出流失败", e);
                }
            }
            
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    Log.w(TAG, "关闭输入流失败", e);
                }
            }
            
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
    
    // 检查正在进行的任务
    private void checkActiveTasks() {
        List<PreloadTask> tasksToCancel = new ArrayList<>();
        
        for (PreloadTask task : activeTasks.values()) {
            // 检查任务是否超时
            if (System.currentTimeMillis() - task.getStartTime() > config.getTaskTimeout()) {
                Log.w(TAG, "预加载任务超时: " + task.getTaskId());
                tasksToCancel.add(task);
                continue;
            }
            
            // 检查网络状态是否允许继续
            if (!networkMonitor.isNetworkAvailable()) {
                Log.w(TAG, "网络不可用，取消预加载任务: " + task.getTaskId());
                tasksToCancel.add(task);
                continue;
            }
            
            // 检查存储空间是否足够
            if (storageManager.getAvailableSpace() < config.getMinRequiredSpace()) {
                Log.w(TAG, "存储空间不足，取消预加载任务: " + task.getTaskId());
                tasksToCancel.add(task);
            }
        }
        
        // 取消任务
        for (PreloadTask task : tasksToCancel) {
            cancelPreloadTask(task.getTaskId());
        }
    }
    
    // 取消预加载任务
    public boolean cancelPreloadTask(String taskId) {
        PreloadTask task = activeTasks.get(taskId);
        if (task != null) {
            task.setStatus(PreloadStatus.CANCELLED);
            
            if (eventListener != null) {
                eventListener.onPreloadCancelled(task);
            }
            
            Log.d(TAG, "取消预加载任务: " + taskId);
            return true;
        }
        
        return false;
    }
    
    // 获取任务状态
    public PreloadTask getTaskStatus(String taskId) {
        return activeTasks.get(taskId);
    }
    
    // 获取所有任务状态
    public List<PreloadTask> getAllTasks() {
        List<PreloadTask> allTasks = new ArrayList<>();
        allTasks.addAll(activeTasks.values());
        
        synchronized (pendingTasks) {
            allTasks.addAll(pendingTasks);
        }
        
        return allTasks;
    }
    
    // 设置事件监听器
    public void setEventListener(PreloadEventListener listener) {
        this.eventListener = listener;
    }
    
    // 清理资源
    public void cleanup() {
        if (downloadExecutor != null && !downloadExecutor.isShutdown()) {
            downloadExecutor.shutdown();
        }
        
        if (networkMonitor != null) {
            networkMonitor.stopMonitoring();
        }
        
        if (storageManager != null) {
            storageManager.cleanup();
        }
    }
}
```

### 预加载任务类
```java
public class PreloadTask {
    private String taskId;
    private String url;
    private PreloadPriority priority;
    private PreloadStrategy strategy;
    private PreloadStatus status;
    private int progress;
    private long startTime;
    private long downloadedSize;
    private String errorMessage;
    
    public PreloadTask(String taskId, String url, PreloadPriority priority, PreloadStrategy strategy) {
        this.taskId = taskId;
        this.url = url;
        this.priority = priority;
        this.strategy = strategy;
        this.status = PreloadStatus.PENDING;
        this.progress = 0;
        this.startTime = System.currentTimeMillis();
        this.downloadedSize = 0;
    }
    
    // Getters and setters
    public String getTaskId() { return taskId; }
    
    public String getUrl() { return url; }
    
    public PreloadPriority getPriority() { return priority; }
    
    public PreloadStrategy getStrategy() { return strategy; }
    
    public PreloadStatus getStatus() { return status; }
    public void setStatus(PreloadStatus status) { this.status = status; }
    
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    
    public long getStartTime() { return startTime; }
    
    public long getDownloadedSize() { return downloadedSize; }
    public void setDownloadedSize(long downloadedSize) { this.downloadedSize = downloadedSize; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
```

### 预加载配置类
```java
public class PreloadConfig {
    private String cacheDirectory;
    private int maxConcurrentDownloads = 2;
    private long taskTimeout = 5 * 60 * 1000; // 5分钟
    private long minRequiredSpace = 100 * 1024 * 1024; // 100MB
    private long minRequiredBandwidth = 100 * 1024; // 100kbps
    private Comparator<PreloadTask> taskComparator;
    
    public PreloadConfig(String cacheDirectory) {
        this.cacheDirectory = cacheDirectory;
        
        // 默认任务比较器：按优先级排序
        this.taskComparator = new Comparator<PreloadTask>() {
            @Override
            public int compare(PreloadTask t1, PreloadTask t2) {
                return t2.getPriority().getValue() - t1.getPriority().getValue();
            }
        };
    }
    
    // Getters and setters
    public String getCacheDirectory() { return cacheDirectory; }
    public void setCacheDirectory(String cacheDirectory) { this.cacheDirectory = cacheDirectory; }
    
    public int getMaxConcurrentDownloads() { return maxConcurrentDownloads; }
    public void setMaxConcurrentDownloads(int maxConcurrentDownloads) { this.maxConcurrentDownloads = maxConcurrentDownloads; }
    
    public long getTaskTimeout() { return taskTimeout; }
    public void setTaskTimeout(long taskTimeout) { this.taskTimeout = taskTimeout; }
    
    public long getMinRequiredSpace() { return minRequiredSpace; }
    public void setMinRequiredSpace(long minRequiredSpace) { this.minRequiredSpace = minRequiredSpace; }
    
    public long getMinRequiredBandwidth() { return minRequiredBandwidth; }
    public void setMinRequiredBandwidth(long minRequiredBandwidth) { this.minRequiredBandwidth = minRequiredBandwidth; }
    
    public Comparator<PreloadTask> getTaskComparator() { return taskComparator; }
    public void setTaskComparator(Comparator<PreloadTask> taskComparator) { this.taskComparator = taskComparator; }
}
```

## 测试验证方法

### 功能测试
1. **预加载功能测试**：
   - 测试不同策略的预加载行为
   - 验证预加载任务调度
   - 检查预加载进度报告

2. **资源管理测试**：
   - 测试并发任务限制
   - 验证存储空间管理
   - 检查网络带宽控制

### 性能测试
1. **下载速度测试**：
   - 测量不同网络环境下的下载速度
   - 检查多任务并发下载效率
   - 验证下载稳定性

2. **资源消耗测试**：
   - 监控CPU和内存使用
   - 检查存储空间消耗
   - 测量网络带宽占用

### 稳定性测试
1. **长时间运行测试**：
   - 测试长时间预加载的稳定性
   - 检查内存泄漏情况
   - 验证任务恢复能力

2. **异常情况测试**：
   - 测试网络中断的处理
   - 验证存储空间不足的处理
   - 检查任务超时的处理

## 常见问题排查

### 预加载失败问题
1. **网络连接问题**：
   - 检查网络状态监控
   - 验证URL有效性
   - 确认请求头设置

2. **存储空间问题**：
   - 检查存储空间计算
   - 验证文件路径权限
   - 确认清理机制

### 性能问题
1. **下载速度慢**：
   - 检查网络带宽限制
   - 优化缓冲区大小
   - 调整并发任务数

2. **资源占用高**：
   - 优化任务调度策略
   - 调整资源限制参数
   - 优化内存使用

## 使用场景
- 视频播放应用
- 在线教育平台
- 视频点播服务
- 内容预取系统

## 相关模块
- SeekBuffer/NormalBuffer模块
- 缓存文件存储模块
- HLS支持模块
- 双IO播放模块