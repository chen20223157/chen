# 预转码测试开发技术

## 模块概述
本模块提供视频预转码功能，将原始视频转换为更适合播放的格式，优化播放性能，减少播放卡顿，提升用户体验。

## 技术组件

### 预转码策略
- **应用场景**：视频播放前的预处理，格式兼容性优化
- **特点**：后台处理，格式标准化，码率优化
- **实现要点**：
  - 检测原始视频格式与参数
  - 确定目标转码参数
  - 执行转码处理
  - 验证转码结果

### 转码质量控制
- **应用场景**：平衡视频质量与文件大小，适配不同网络环境
- **特点**：自适应码率，分辨率调整，编码优化
- **实现要点**：
  - 分析原始视频质量
  - 根据场景调整转码参数
  - 实现多码率输出
  - 监控转码进度与质量

## 技术实现细节

### 预转码管理器
```java
public class PreTranscodingManager {
    private static final String TAG = "PreTranscodingManager";
    private ExecutorService transcodingExecutor;
    private Map<String, TranscodingTask> activeTasks;
    private TranscodingConfig defaultConfig;
    
    public PreTranscodingManager() {
        transcodingExecutor = Executors.newFixedThreadPool(2); // 限制并发转码任务数
        activeTasks = new ConcurrentHashMap<>();
        defaultConfig = new TranscodingConfig();
    }
    
    // 提交转码任务
    public String submitTranscodingTask(String sourcePath, String targetPath, TranscodingConfig config) {
        String taskId = UUID.randomUUID().toString();
        TranscodingTask task = new TranscodingTask(taskId, sourcePath, targetPath, 
                                                  config != null ? config : defaultConfig);
        
        activeTasks.put(taskId, task);
        
        transcodingExecutor.submit(() -> {
            try {
                performTranscoding(task);
            } catch (Exception e) {
                Log.e(TAG, "转码任务失败: " + taskId, e);
                task.setStatus(TranscodingTask.Status.FAILED);
                task.setErrorMessage(e.getMessage());
            }
        });
        
        return taskId;
    }
    
    // 执行转码
    private void performTranscoding(TranscodingTask task) {
        Log.i(TAG, "开始转码任务: " + task.getTaskId());
        task.setStatus(TranscodingTask.Status.RUNNING);
        
        try {
            // 获取视频信息
            VideoInfo sourceInfo = getVideoInfo(task.getSourcePath());
            task.setSourceInfo(sourceInfo);
            
            // 确定转码参数
            TranscodingParams params = determineTranscodingParams(sourceInfo, task.getConfig());
            task.setTranscodingParams(params);
            
            // 执行转码
            boolean success = executeFFmpegTranscode(task.getSourcePath(), task.getTargetPath(), params, task);
            
            if (success) {
                // 验证转码结果
                VideoInfo targetInfo = getVideoInfo(task.getTargetPath());
                task.setTargetInfo(targetInfo);
                
                task.setStatus(TranscodingTask.Status.COMPLETED);
                Log.i(TAG, "转码任务完成: " + task.getTaskId());
            } else {
                task.setStatus(TranscodingTask.Status.FAILED);
                Log.e(TAG, "转码任务失败: " + task.getTaskId());
            }
        } catch (Exception e) {
            Log.e(TAG, "转码过程中发生异常", e);
            task.setStatus(TranscodingTask.Status.FAILED);
            task.setErrorMessage(e.getMessage());
        } finally {
            // 清理资源
            activeTasks.remove(task.getTaskId());
        }
    }
    
    // 获取视频信息
    private VideoInfo getVideoInfo(String videoPath) throws IOException {
        VideoInfo info = new VideoInfo();
        
        // 使用FFprobe获取视频信息
        String[] cmd = {
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            videoPath
        };
        
        ProcessBuilder pb = new ProcessBuilder(cmd);
        Process process = pb.start();
        
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }
        }
        
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new IOException("FFprobe执行失败，退出码: " + exitCode);
        }
        
        // 解析JSON输出
        parseVideoInfoFromJson(output.toString(), info);
        
        return info;
    }
    
    // 确定转码参数
    private TranscodingParams determineTranscodingParams(VideoInfo sourceInfo, TranscodingConfig config) {
        TranscodingParams params = new TranscodingParams();
        
        // 视频编码器
        params.setVideoCodec(config.getVideoCodec());
        
        // 分辨率
        int targetWidth = sourceInfo.getWidth();
        int targetHeight = sourceInfo.getHeight();
        
        // 如果源分辨率超过目标最大分辨率，进行缩放
        if (sourceInfo.getWidth() > config.getMaxWidth() || sourceInfo.getHeight() > config.getMaxHeight()) {
            float aspectRatio = (float) sourceInfo.getWidth() / sourceInfo.getHeight();
            
            if (aspectRatio > (float) config.getMaxWidth() / config.getMaxHeight()) {
                targetWidth = config.getMaxWidth();
                targetHeight = (int) (targetWidth / aspectRatio);
            } else {
                targetHeight = config.getMaxHeight();
                targetWidth = (int) (targetHeight * aspectRatio);
            }
        }
        
        params.setWidth(targetWidth);
        params.setHeight(targetHeight);
        
        // 码率
        int targetBitrate = calculateTargetBitrate(targetWidth, targetHeight, config.getQualityLevel());
        params.setVideoBitrate(targetBitrate);
        
        // 帧率
        params.setFrameRate(Math.min(sourceInfo.getFrameRate(), config.getMaxFrameRate()));
        
        // 音频编码器
        params.setAudioCodec(config.getAudioCodec());
        params.setAudioBitrate(config.getAudioBitrate());
        params.setAudioSampleRate(config.getAudioSampleRate());
        
        // 容器格式
        params.setContainerFormat(config.getContainerFormat());
        
        return params;
    }
    
    // 计算目标码率
    private int calculateTargetBitrate(int width, int height, String qualityLevel) {
        int pixels = width * height;
        
        // 基于分辨率和质量级别计算码率
        switch (qualityLevel.toLowerCase()) {
            case "low":
                return Math.max(500, (int) (pixels * 0.05)); // 最低500kbps
            case "medium":
                return Math.max(1000, (int) (pixels * 0.1)); // 最低1Mbps
            case "high":
                return Math.max(2000, (int) (pixels * 0.2)); // 最低2Mbps
            default:
                return Math.max(1000, (int) (pixels * 0.1)); // 默认中等质量
        }
    }
    
    // 执行FFmpeg转码
    private boolean executeFFmpegTranscode(String inputPath, String outputPath, 
                                         TranscodingParams params, TranscodingTask task) {
        List<String> cmd = new ArrayList<>();
        cmd.add("ffmpeg");
        cmd.add("-i");
        cmd.add(inputPath);
        
        // 视频编码参数
        cmd.add("-c:v");
        cmd.add(params.getVideoCodec());
        
        cmd.add("-b:v");
        cmd.add(params.getVideoBitrate() + "k");
        
        cmd.add("-maxrate");
        cmd.add((int)(params.getVideoBitrate() * 1.5) + "k");
        
        cmd.add("-bufsize");
        cmd.add(params.getVideoBitrate() * 2 + "k");
        
        cmd.add("-r");
        cmd.add(String.valueOf(params.getFrameRate()));
        
        cmd.add("-s");
        cmd.add(params.getWidth() + "x" + params.getHeight());
        
        // 音频编码参数
        cmd.add("-c:a");
        cmd.add(params.getAudioCodec());
        
        cmd.add("-b:a");
        cmd.add(params.getAudioBitrate() + "k");
        
        cmd.add("-ar");
        cmd.add(String.valueOf(params.getAudioSampleRate()));
        
        // 其他参数
        cmd.add("-movflags");
        cmd.add("+faststart"); // 优化网络播放
        
        cmd.add("-y"); // 覆盖输出文件
        
        cmd.add(outputPath);
        
        try {
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // 读取输出并更新进度
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    // 解析FFmpeg输出获取进度
                    updateTranscodingProgress(line, task);
                }
            }
            
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (IOException | InterruptedException e) {
            Log.e(TAG, "执行FFmpeg转码失败", e);
            return false;
        }
    }
    
    // 更新转码进度
    private void updateTranscodingProgress(String ffmpegOutput, TranscodingTask task) {
        // 示例解析FFmpeg时间输出: frame=  123 fps= 25 q=28.0 size=    512kB time=00:00:04.92 bitrate= 851.2kbits/s
        Pattern timePattern = Pattern.compile("time=(\\d{2}):(\\d{2}):(\\d{2})\\.(\\d{2})");
        Matcher matcher = timePattern.matcher(ffmpegOutput);
        
        if (matcher.find()) {
            int hours = Integer.parseInt(matcher.group(1));
            int minutes = Integer.parseInt(matcher.group(2));
            int seconds = Integer.parseInt(matcher.group(3));
            int centiseconds = Integer.parseInt(matcher.group(4));
            
            long currentTimeMs = (hours * 3600 + minutes * 60 + seconds) * 1000 + centiseconds * 10;
            
            if (task.getSourceInfo() != null && task.getSourceInfo().getDurationMs() > 0) {
                int progress = (int) (currentTimeMs * 100 / task.getSourceInfo().getDurationMs());
                task.setProgress(Math.min(100, progress));
            }
        }
    }
    
    // 获取任务状态
    public TranscodingTask getTaskStatus(String taskId) {
        return activeTasks.get(taskId);
    }
    
    // 取消转码任务
    public boolean cancelTask(String taskId) {
        TranscodingTask task = activeTasks.get(taskId);
        if (task != null && task.getStatus() == TranscodingTask.Status.RUNNING) {
            task.setStatus(TranscodingTask.Status.CANCELLED);
            return true;
        }
        return false;
    }
    
    // 清理资源
    public void cleanup() {
        if (transcodingExecutor != null && !transcodingExecutor.isShutdown()) {
            transcodingExecutor.shutdown();
        }
        activeTasks.clear();
    }
}
```

### 转码配置类
```java
public class TranscodingConfig {
    private String videoCodec = "libx264"; // 默认H.264
    private String audioCodec = "aac";     // 默认AAC
    private String containerFormat = "mp4";
    private int maxWidth = 1920;
    private int maxHeight = 1080;
    private int maxFrameRate = 30;
    private int audioBitrate = 128; // kbps
    private int audioSampleRate = 44100; // Hz
    private String qualityLevel = "medium"; // low, medium, high
    
    // Getters and setters
    public String getVideoCodec() { return videoCodec; }
    public void setVideoCodec(String videoCodec) { this.videoCodec = videoCodec; }
    
    public String getAudioCodec() { return audioCodec; }
    public void setAudioCodec(String audioCodec) { this.audioCodec = audioCodec; }
    
    public String getContainerFormat() { return containerFormat; }
    public void setContainerFormat(String containerFormat) { this.containerFormat = containerFormat; }
    
    public int getMaxWidth() { return maxWidth; }
    public void setMaxWidth(int maxWidth) { this.maxWidth = maxWidth; }
    
    public int getMaxHeight() { return maxHeight; }
    public void setMaxHeight(int maxHeight) { this.maxHeight = maxHeight; }
    
    public int getMaxFrameRate() { return maxFrameRate; }
    public void setMaxFrameRate(int maxFrameRate) { this.maxFrameRate = maxFrameRate; }
    
    public int getAudioBitrate() { return audioBitrate; }
    public void setAudioBitrate(int audioBitrate) { this.audioBitrate = audioBitrate; }
    
    public int getAudioSampleRate() { return audioSampleRate; }
    public void setAudioSampleRate(int audioSampleRate) { this.audioSampleRate = audioSampleRate; }
    
    public String getQualityLevel() { return qualityLevel; }
    public void setQualityLevel(String qualityLevel) { this.qualityLevel = qualityLevel; }
}
```

### 转码任务类
```java
public class TranscodingTask {
    public enum Status {
        PENDING,    // 等待中
        RUNNING,    // 运行中
        COMPLETED,  // 已完成
        FAILED,     // 失败
        CANCELLED   // 已取消
    }
    
    private String taskId;
    private String sourcePath;
    private String targetPath;
    private TranscodingConfig config;
    private Status status;
    private int progress;
    private String errorMessage;
    private VideoInfo sourceInfo;
    private VideoInfo targetInfo;
    private TranscodingParams transcodingParams;
    private long createTime;
    private long startTime;
    private long endTime;
    
    public TranscodingTask(String taskId, String sourcePath, String targetPath, TranscodingConfig config) {
        this.taskId = taskId;
        this.sourcePath = sourcePath;
        this.targetPath = targetPath;
        this.config = config;
        this.status = Status.PENDING;
        this.progress = 0;
        this.createTime = System.currentTimeMillis();
    }
    
    // Getters and setters
    public String getTaskId() { return taskId; }
    
    public String getSourcePath() { return sourcePath; }
    
    public String getTargetPath() { return targetPath; }
    
    public TranscodingConfig getConfig() { return config; }
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { 
        this.status = status;
        if (status == Status.RUNNING && startTime == 0) {
            startTime = System.currentTimeMillis();
        } else if ((status == Status.COMPLETED || status == Status.FAILED || status == Status.CANCELLED) && endTime == 0) {
            endTime = System.currentTimeMillis();
        }
    }
    
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    
    public VideoInfo getSourceInfo() { return sourceInfo; }
    public void setSourceInfo(VideoInfo sourceInfo) { this.sourceInfo = sourceInfo; }
    
    public VideoInfo getTargetInfo() { return targetInfo; }
    public void setTargetInfo(VideoInfo targetInfo) { this.targetInfo = targetInfo; }
    
    public TranscodingParams getTranscodingParams() { return transcodingParams; }
    public void setTranscodingParams(TranscodingParams transcodingParams) { this.transcodingParams = transcodingParams; }
    
    public long getCreateTime() { return createTime; }
    
    public long getStartTime() { return startTime; }
    
    public long getEndTime() { return endTime; }
    
    public long getDuration() {
        if (startTime > 0 && endTime > 0) {
            return endTime - startTime;
        }
        return 0;
    }
}
```

## 测试验证方法

### 功能测试
1. **转码功能测试**：
   - 测试不同格式视频的转码
   - 验证转码参数设置是否生效
   - 检查转码后的视频质量

2. **任务管理测试**：
   - 测试任务提交与状态跟踪
   - 验证任务取消功能
   - 检查并发任务处理

### 性能测试
1. **转码速度测试**：
   - 测量不同分辨率视频的转码时间
   - 比较不同编码参数的转码效率
   - 检查转码过程中的资源消耗

2. **并发处理测试**：
   - 测试多任务并发转码
   - 验证资源限制是否生效
   - 检查系统稳定性

### 质量测试
1. **视频质量评估**：
   - 对比转码前后的视频质量
   - 测量视频质量损失程度
   - 验证不同质量级别的效果

2. **兼容性测试**：
   - 测试转码后视频的播放兼容性
   - 验证不同设备的播放效果
   - 检查特殊格式的处理能力

## 常见问题排查

### 转码失败问题
1. **FFmpeg执行失败**：
   - 检查FFmpeg是否正确安装
   - 验证输入文件是否存在且可读
   - 确认输出路径是否有写入权限

2. **参数配置错误**：
   - 检查编码参数是否合法
   - 验证分辨率和码率设置
   - 确认音频参数兼容性

### 性能问题
1. **转码速度慢**：
   - 优化编码参数设置
   - 考虑使用硬件加速
   - 调整并发任务数量

2. **资源占用高**：
   - 限制并发转码任务数
   - 优化内存使用
   - 调整处理优先级

## 使用场景
- 视频播放平台
- 视频编辑应用
- 视频转码服务
- 内容管理系统

## 相关模块
- 音视频硬解与软解模块
- 缓存文件存储模块
- 视频播放模块
- HLS支持模块