# SeekBuffer/NormalBuffer 测试开发技术

## 模块概述
本模块提供视频播放中的缓冲区管理功能，包括SeekBuffer和NormalBuffer两种缓冲策略，优化播放体验，减少卡顿，提高响应速度。

## 技术组件

### SeekBuffer
- **应用场景**：视频拖拽定位，快速跳转播放位置
- **特点**：快速响应，预加载关键帧，优化拖拽体验
- **实现要点**：
  - 预加载关键帧数据
  - 实现快速定位算法
  - 管理缓冲区大小与生命周期
  - 优化拖拽响应时间

### NormalBuffer
- **应用场景**：正常顺序播放，连续播放体验
- **特点**：平滑播放，预加载后续数据，减少卡顿
- **实现要点**：
  - 预加载后续播放数据
  - 实现自适应缓冲策略
  - 管理缓冲区水位线
  - 优化网络请求策略

## 技术实现细节

### 缓冲区管理器
```java
public class BufferManager {
    private static final String TAG = "BufferManager";
    
    // 缓冲区类型
    public enum BufferType {
        SEEK_BUFFER,    // 拖拽缓冲区
        NORMAL_BUFFER   // 正常播放缓冲区
    }
    
    // 缓冲区状态
    public enum BufferState {
        IDLE,           // 空闲
        LOADING,        // 加载中
        READY,          // 就绪
        PLAYING,        // 播放中
        INSUFFICIENT    // 数据不足
    }
    
    private SeekBuffer seekBuffer;
    private NormalBuffer normalBuffer;
    private BufferConfig config;
    private BufferEventListener listener;
    
    public BufferManager(BufferConfig config) {
        this.config = config;
        this.seekBuffer = new SeekBuffer(config.getSeekBufferSize(), config.getSeekBufferPreloadSize());
        this.normalBuffer = new NormalBuffer(config.getNormalBufferSize(), config.getNormalBufferPreloadSize());
    }
    
    // 初始化缓冲区
    public void initialize(DataSource dataSource) {
        seekBuffer.setDataSource(dataSource);
        normalBuffer.setDataSource(dataSource);
        
        seekBuffer.setEventListener(new SeekBufferEventListener() {
            @Override
            public void onSeekBufferReady(long position) {
                if (listener != null) {
                    listener.onSeekBufferReady(position);
                }
            }
            
            @Override
            public void onSeekBufferError(long position, String error) {
                if (listener != null) {
                    listener.onSeekBufferError(position, error);
                }
            }
        });
        
        normalBuffer.setEventListener(new NormalBufferEventListener() {
            @Override
            public void onNormalBufferReady() {
                if (listener != null) {
                    listener.onNormalBufferReady();
                }
            }
            
            @Override
            public void onNormalBufferInsufficient() {
                if (listener != null) {
                    listener.onNormalBufferInsufficient();
                }
            }
            
            @Override
            public void onNormalBufferError(String error) {
                if (listener != null) {
                    listener.onNormalBufferError(error);
                }
            }
        });
    }
    
    // 处理拖拽请求
    public void seekTo(long positionMs) {
        Log.d(TAG, "处理拖拽请求: " + positionMs + "ms");
        
        // 停止正常缓冲
        normalBuffer.pause();
        
        // 启动拖拽缓冲
        seekBuffer.seekTo(positionMs);
    }
    
    // 开始正常播放
    public void startPlayback() {
        Log.d(TAG, "开始正常播放");
        
        // 停止拖拽缓冲
        seekBuffer.pause();
        
        // 启动正常缓冲
        normalBuffer.start();
    }
    
    // 获取当前播放数据
    public MediaData getCurrentData() {
        // 优先使用拖拽缓冲区数据
        if (seekBuffer.getState() == BufferState.READY || seekBuffer.getState() == BufferState.PLAYING) {
            return seekBuffer.getCurrentData();
        }
        
        // 使用正常缓冲区数据
        if (normalBuffer.getState() == BufferState.READY || normalBuffer.getState() == BufferState.PLAYING) {
            return normalBuffer.getCurrentData();
        }
        
        return null;
    }
    
    // 释放已播放数据
    public void releasePlayedData(MediaData data) {
        if (seekBuffer.contains(data)) {
            seekBuffer.releasePlayedData(data);
        } else if (normalBuffer.contains(data)) {
            normalBuffer.releasePlayedData(data);
        }
    }
    
    // 获取缓冲状态
    public BufferStatus getBufferStatus() {
        BufferStatus status = new BufferStatus();
        
        status.setSeekBufferState(seekBuffer.getState());
        status.setSeekBufferPosition(seekBuffer.getCurrentPosition());
        status.setSeekBufferProgress(seekBuffer.getBufferProgress());
        
        status.setNormalBufferState(normalBuffer.getState());
        status.setNormalBufferPosition(normalBuffer.getCurrentPosition());
        status.setNormalBufferProgress(normalBuffer.getBufferProgress());
        
        return status;
    }
    
    // 设置事件监听器
    public void setEventListener(BufferEventListener listener) {
        this.listener = listener;
    }
    
    // 清理资源
    public void cleanup() {
        if (seekBuffer != null) {
            seekBuffer.cleanup();
        }
        
        if (normalBuffer != null) {
            normalBuffer.cleanup();
        }
    }
}
```

### SeekBuffer实现
```java
public class SeekBuffer {
    private static final String TAG = "SeekBuffer";
    
    // 缓冲区配置
    private int bufferSize;
    private int preloadSize;
    
    // 缓冲区状态
    private BufferState state;
    private long currentPosition;
    private long targetPosition;
    
    // 数据源和缓冲区
    private DataSource dataSource;
    private Queue<MediaData> bufferQueue;
    private Map<Long, MediaData> keyFrameMap; // 关键帧映射
    private Object lock = new Object();
    
    // 事件监听器
    private SeekBufferEventListener eventListener;
    
    // 后台加载线程
    private Thread loadingThread;
    private volatile boolean isLoading;
    
    public SeekBuffer(int bufferSize, int preloadSize) {
        this.bufferSize = bufferSize;
        this.preloadSize = preloadSize;
        this.state = BufferState.IDLE;
        this.bufferQueue = new LinkedList<>();
        this.keyFrameMap = new HashMap<>();
        this.isLoading = false;
    }
    
    // 设置数据源
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    // 设置事件监听器
    public void setEventListener(SeekBufferEventListener listener) {
        this.eventListener = listener;
    }
    
    // 跳转到指定位置
    public void seekTo(long positionMs) {
        synchronized (lock) {
            Log.d(TAG, "SeekBuffer跳转到: " + positionMs + "ms");
            
            targetPosition = positionMs;
            currentPosition = positionMs;
            
            // 清空当前缓冲区
            bufferQueue.clear();
            keyFrameMap.clear();
            
            // 设置状态为加载中
            state = BufferState.LOADING;
            
            // 启动加载线程
            startLoadingThread();
        }
    }
    
    // 启动加载线程
    private void startLoadingThread() {
        if (isLoading) {
            return;
        }
        
        isLoading = true;
        loadingThread = new Thread(new Runnable() {
            @Override
            public void run() {
                loadSeekData();
            }
        });
        loadingThread.start();
    }
    
    // 加载拖拽数据
    private void loadSeekData() {
        try {
            // 查找最近的关键帧
            long keyFramePosition = dataSource.findNearestKeyFrame(targetPosition);
            Log.d(TAG, "找到最近关键帧位置: " + keyFramePosition + "ms");
            
            // 从关键帧开始加载数据
            long loadPosition = keyFramePosition;
            int loadedSize = 0;
            
            while (isLoading && loadedSize < bufferSize && loadPosition < dataSource.getDuration()) {
                // 读取媒体数据
                MediaData data = dataSource.readDataAt(loadPosition);
                if (data != null) {
                    synchronized (lock) {
                        bufferQueue.offer(data);
                        
                        // 如果是关键帧，添加到关键帧映射
                        if (data.isKeyFrame()) {
                            keyFrameMap.put(data.getTimestamp(), data);
                        }
                        
                        loadedSize += data.getSize();
                    }
                    
                    loadPosition += data.getDuration();
                } else {
                    break;
                }
            }
            
            // 检查是否已加载到目标位置
            boolean hasTargetPosition = false;
            synchronized (lock) {
                for (MediaData data : bufferQueue) {
                    if (data.getTimestamp() <= targetPosition && 
                        data.getTimestamp() + data.getDuration() > targetPosition) {
                        hasTargetPosition = true;
                        break;
                    }
                }
                
                if (hasTargetPosition) {
                    state = BufferState.READY;
                    if (eventListener != null) {
                        eventListener.onSeekBufferReady(targetPosition);
                    }
                } else {
                    state = BufferState.INSUFFICIENT;
                    if (eventListener != null) {
                        eventListener.onSeekBufferError(targetPosition, "无法加载到目标位置");
                    }
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "加载拖拽数据失败", e);
            synchronized (lock) {
                state = BufferState.INSUFFICIENT;
            }
            
            if (eventListener != null) {
                eventListener.onSeekBufferError(targetPosition, e.getMessage());
            }
        } finally {
            isLoading = false;
        }
    }
    
    // 获取当前数据
    public MediaData getCurrentData() {
        synchronized (lock) {
            if (state != BufferState.READY && state != BufferState.PLAYING) {
                return null;
            }
            
            // 查找包含当前位置的数据
            for (MediaData data : bufferQueue) {
                if (data.getTimestamp() <= currentPosition && 
                    data.getTimestamp() + data.getDuration() > currentPosition) {
                    return data;
                }
            }
            
            return null;
        }
    }
    
    // 更新播放位置
    public void updatePlaybackPosition(long positionMs) {
        synchronized (lock) {
            currentPosition = positionMs;
            
            // 释放已播放的数据
            while (!bufferQueue.isEmpty() && 
                   bufferQueue.peek().getTimestamp() + bufferQueue.peek().getDuration() <= currentPosition) {
                MediaData removed = bufferQueue.poll();
                
                // 从关键帧映射中移除
                if (removed.isKeyFrame()) {
                    keyFrameMap.remove(removed.getTimestamp());
                }
            }
            
            // 检查是否需要继续加载
            if (state == BufferState.PLAYING && 
                bufferQueue.size() < preloadSize && 
                !isLoading) {
                startLoadingThread();
            }
        }
    }
    
    // 检查是否包含指定数据
    public boolean contains(MediaData data) {
        synchronized (lock) {
            return bufferQueue.contains(data);
        }
    }
    
    // 释放已播放数据
    public void releasePlayedData(MediaData data) {
        synchronized (lock) {
            bufferQueue.remove(data);
            
            if (data.isKeyFrame()) {
                keyFrameMap.remove(data.getTimestamp());
            }
        }
    }
    
    // 获取缓冲进度
    public int getBufferProgress() {
        synchronized (lock) {
            if (dataSource == null || dataSource.getDuration() <= 0) {
                return 0;
            }
            
            if (bufferQueue.isEmpty()) {
                return 0;
            }
            
            // 计算缓冲区最远位置
            long bufferedEnd = 0;
            for (MediaData data : bufferQueue) {
                bufferedEnd = Math.max(bufferedEnd, data.getTimestamp() + data.getDuration());
            }
            
            return (int) (bufferedEnd * 100 / dataSource.getDuration());
        }
    }
    
    // 获取当前状态
    public BufferState getState() {
        synchronized (lock) {
            return state;
        }
    }
    
    // 获取当前位置
    public long getCurrentPosition() {
        synchronized (lock) {
            return currentPosition;
        }
    }
    
    // 暂停缓冲
    public void pause() {
        isLoading = false;
        
        if (loadingThread != null && loadingThread.isAlive()) {
            try {
                loadingThread.interrupt();
                loadingThread.join(1000);
            } catch (InterruptedException e) {
                Log.w(TAG, "停止加载线程被中断", e);
            }
        }
        
        synchronized (lock) {
            if (state == BufferState.LOADING) {
                state = BufferState.IDLE;
            }
        }
    }
    
    // 清理资源
    public void cleanup() {
        pause();
        
        synchronized (lock) {
            bufferQueue.clear();
            keyFrameMap.clear();
            state = BufferState.IDLE;
        }
    }
}
```

### NormalBuffer实现
```java
public class NormalBuffer {
    private static final String TAG = "NormalBuffer";
    
    // 缓冲区配置
    private int bufferSize;
    private int preloadSize;
    private int lowWatermark;    // 低水位线
    private int highWatermark;    // 高水位线
    
    // 缓冲区状态
    private BufferState state;
    private long currentPosition;
    
    // 数据源和缓冲区
    private DataSource dataSource;
    private Queue<MediaData> bufferQueue;
    private Object lock = new Object();
    
    // 事件监听器
    private NormalBufferEventListener eventListener;
    
    // 后台加载线程
    private Thread loadingThread;
    private volatile boolean isLoading;
    
    public NormalBuffer(int bufferSize, int preloadSize) {
        this.bufferSize = bufferSize;
        this.preloadSize = preloadSize;
        this.lowWatermark = (int) (preloadSize * 0.3);  // 30%为低水位线
        this.highWatermark = (int) (preloadSize * 0.8); // 80%为高水位线
        
        this.state = BufferState.IDLE;
        this.bufferQueue = new LinkedList<>();
        this.isLoading = false;
    }
    
    // 设置数据源
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    // 设置事件监听器
    public void setEventListener(NormalBufferEventListener listener) {
        this.eventListener = listener;
    }
    
    // 开始缓冲
    public void start() {
        synchronized (lock) {
            Log.d(TAG, "NormalBuffer开始缓冲");
            
            if (state == BufferState.IDLE) {
                state = BufferState.LOADING;
                startLoadingThread();
            }
        }
    }
    
    // 启动加载线程
    private void startLoadingThread() {
        if (isLoading) {
            return;
        }
        
        isLoading = true;
        loadingThread = new Thread(new Runnable() {
            @Override
            public void run() {
                loadNormalData();
            }
        });
        loadingThread.start();
    }
    
    // 加载正常播放数据
    private void loadNormalData() {
        try {
            // 确定起始加载位置
            long loadPosition = currentPosition;
            
            // 如果缓冲区不为空，从最后位置继续加载
            synchronized (lock) {
                if (!bufferQueue.isEmpty()) {
                    MediaData lastData = ((LinkedList<MediaData>) bufferQueue).getLast();
                    loadPosition = lastData.getTimestamp() + lastData.getDuration();
                }
            }
            
            int loadedSize = 0;
            
            while (isLoading && loadedSize < bufferSize && loadPosition < dataSource.getDuration()) {
                // 读取媒体数据
                MediaData data = dataSource.readDataAt(loadPosition);
                if (data != null) {
                    synchronized (lock) {
                        bufferQueue.offer(data);
                        loadedSize += data.getSize();
                        
                        // 如果是第一次加载到数据，状态变为就绪
                        if (state == BufferState.LOADING) {
                            state = BufferState.READY;
                            if (eventListener != null) {
                                eventListener.onNormalBufferReady();
                            }
                        }
                    }
                    
                    loadPosition += data.getDuration();
                } else {
                    break;
                }
                
                // 检查是否达到高水位线，如果是则暂停加载
                synchronized (lock) {
                    if (bufferQueue.size() >= highWatermark) {
                        break;
                    }
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "加载正常播放数据失败", e);
            synchronized (lock) {
                state = BufferState.INSUFFICIENT;
            }
            
            if (eventListener != null) {
                eventListener.onNormalBufferError(e.getMessage());
            }
        } finally {
            isLoading = false;
        }
    }
    
    // 获取当前数据
    public MediaData getCurrentData() {
        synchronized (lock) {
            if (state != BufferState.READY && state != BufferState.PLAYING) {
                return null;
            }
            
            // 查找包含当前位置的数据
            for (MediaData data : bufferQueue) {
                if (data.getTimestamp() <= currentPosition && 
                    data.getTimestamp() + data.getDuration() > currentPosition) {
                    return data;
                }
            }
            
            return null;
        }
    }
    
    // 更新播放位置
    public void updatePlaybackPosition(long positionMs) {
        synchronized (lock) {
            currentPosition = positionMs;
            
            // 释放已播放的数据
            while (!bufferQueue.isEmpty() && 
                   bufferQueue.peek().getTimestamp() + bufferQueue.peek().getDuration() <= currentPosition) {
                bufferQueue.poll();
            }
            
            // 检查是否低于低水位线，如果是则继续加载
            if (state == BufferState.PLAYING && 
                bufferQueue.size() < lowWatermark && 
                !isLoading) {
                state = BufferState.LOADING;
                startLoadingThread();
            }
            
            // 检查是否缓冲区不足
            if (bufferQueue.isEmpty() && state == BufferState.PLAYING) {
                state = BufferState.INSUFFICIENT;
                if (eventListener != null) {
                    eventListener.onNormalBufferInsufficient();
                }
            }
        }
    }
    
    // 检查是否包含指定数据
    public boolean contains(MediaData data) {
        synchronized (lock) {
            return bufferQueue.contains(data);
        }
    }
    
    // 释放已播放数据
    public void releasePlayedData(MediaData data) {
        synchronized (lock) {
            bufferQueue.remove(data);
        }
    }
    
    // 获取缓冲进度
    public int getBufferProgress() {
        synchronized (lock) {
            if (dataSource == null || dataSource.getDuration() <= 0) {
                return 0;
            }
            
            if (bufferQueue.isEmpty()) {
                return 0;
            }
            
            // 计算缓冲区最远位置
            long bufferedEnd = 0;
            for (MediaData data : bufferQueue) {
                bufferedEnd = Math.max(bufferedEnd, data.getTimestamp() + data.getDuration());
            }
            
            return (int) (bufferedEnd * 100 / dataSource.getDuration());
        }
    }
    
    // 获取当前状态
    public BufferState getState() {
        synchronized (lock) {
            return state;
        }
    }
    
    // 获取当前位置
    public long getCurrentPosition() {
        synchronized (lock) {
            return currentPosition;
        }
    }
    
    // 暂停缓冲
    public void pause() {
        isLoading = false;
        
        if (loadingThread != null && loadingThread.isAlive()) {
            try {
                loadingThread.interrupt();
                loadingThread.join(1000);
            } catch (InterruptedException e) {
                Log.w(TAG, "停止加载线程被中断", e);
            }
        }
        
        synchronized (lock) {
            if (state == BufferState.LOADING) {
                state = BufferState.IDLE;
            }
        }
    }
    
    // 清理资源
    public void cleanup() {
        pause();
        
        synchronized (lock) {
            bufferQueue.clear();
            state = BufferState.IDLE;
        }
    }
}
```

## 测试验证方法

### 功能测试
1. **SeekBuffer测试**：
   - 测试拖拽定位的响应速度
   - 验证关键帧预加载功能
   - 检查拖拽后的播放连续性

2. **NormalBuffer测试**：
   - 测试顺序播放的流畅性
   - 验证自适应缓冲策略
   - 检查缓冲区水位线管理

### 性能测试
1. **缓冲效率测试**：
   - 测量缓冲区填充速度
   - 检查内存使用情况
   - 验证缓冲区大小设置

2. **网络适应性测试**：
   - 测试不同网络环境下的缓冲表现
   - 验证网络波动时的缓冲策略
   - 检查缓冲区恢复能力

### 稳定性测试
1. **长时间播放测试**：
   - 测试长时间播放的稳定性
   - 检查内存泄漏情况
   - 验证缓冲区状态转换

2. **边界条件测试**：
   - 测试视频开始和结束的处理
   - 验证极端拖拽操作
   - 检查资源不足时的行为

## 常见问题排查

### SeekBuffer问题
1. **拖拽响应慢**：
   - 检查关键帧索引是否正确
   - 验证预加载策略是否合适
   - 优化数据源读取速度

2. **拖拽后卡顿**：
   - 检查缓冲区大小设置
   - 验证数据加载策略
   - 优化关键帧查找算法

### NormalBuffer问题
1. **播放卡顿**：
   - 检查缓冲区水位线设置
   - 验证网络请求策略
   - 优化预加载算法

2. **缓冲不足**：
   - 调整缓冲区大小
   - 优化加载触发条件
   - 检查网络连接稳定性

## 使用场景
- 视频播放器
- 直播应用
- 视频点播平台
- 在线教育应用

## 相关模块
- 预加载文件模块
- 双IO播放模块
- HLS支持模块
- 缓存文件存储模块