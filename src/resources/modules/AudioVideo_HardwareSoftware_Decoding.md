# 音视频硬解与软解测试开发技术

## 模块概述
本模块提供音视频解码的两种实现方式：硬件解码和软件解码，根据设备能力、性能需求和兼容性要求自动选择最适合的解码方案。

## 技术组件

### 硬件解码
- **应用场景**：高性能视频播放，低功耗需求，支持硬件加速的设备
- **特点**：低CPU占用，低功耗，解码速度快
- **实现要点**：
  - 检测设备硬件解码能力
  - 初始化硬件解码器
  - 配置解码参数
  - 处理解码输出数据

### 软件解码
- **应用场景**：兼容性要求高，特殊格式支持，无硬件加速的设备
- **特点**：高兼容性，格式支持广泛，可定制性强
- **实现要点**：
  - 选择合适的软件解码库
  - 配置解码参数
  - 优化解码性能
  - 处理内存管理

## 技术实现细节

### 硬件解码实现
```java
// Android MediaCodec硬件解码示例
public class HardwareDecoder {
    private MediaCodec mediaCodec;
    private MediaFormat mediaFormat;
    private int videoWidth;
    private int videoHeight;
    private long presentationTimeUs;
    
    public boolean initialize(String mimeType, int width, int height, byte[] csd0, byte[] csd1) {
        try {
            videoWidth = width;
            videoHeight = height;
            
            // 创建MediaFormat
            mediaFormat = MediaFormat.createVideoFormat(mimeType, width, height);
            
            // 添加SPS/PPS数据
            if (csd0 != null) {
                mediaFormat.setByteBuffer("csd-0", ByteBuffer.wrap(csd0));
            }
            if (csd1 != null) {
                mediaFormat.setByteBuffer("csd-1", ByteBuffer.wrap(csd1));
            }
            
            // 创建解码器
            mediaCodec = MediaCodec.createDecoderByType(mimeType);
            
            // 配置解码器
            mediaCodec.configure(mediaFormat, null, null, 0);
            
            // 启动解码器
            mediaCodec.start();
            
            return true;
        } catch (IOException e) {
            Log.e("HardwareDecoder", "初始化失败", e);
            return false;
        }
    }
    
    public boolean decodeFrame(byte[] data, long pts) {
        if (mediaCodec == null) {
            return false;
        }
        
        try {
            // 获取输入缓冲区
            int inputBufferIndex = mediaCodec.dequeueInputBuffer(10000);
            if (inputBufferIndex >= 0) {
                ByteBuffer inputBuffer = mediaCodec.getInputBuffer(inputBufferIndex);
                inputBuffer.clear();
                inputBuffer.put(data);
                
                // 提交数据到解码器
                mediaCodec.queueInputBuffer(inputBufferIndex, 0, data.length, pts, 0);
            }
            
            // 获取解码后的数据
            MediaCodec.BufferInfo bufferInfo = new MediaCodec.BufferInfo();
            int outputBufferIndex = mediaCodec.dequeueOutputBuffer(bufferInfo, 10000);
            
            if (outputBufferIndex >= 0) {
                // 解码成功，获取输出
                ByteBuffer outputBuffer = mediaCodec.getOutputBuffer(outputBufferIndex);
                
                // 处理解码后的数据（渲染或保存）
                processDecodedFrame(outputBuffer, bufferInfo);
                
                // 释放输出缓冲区
                mediaCodec.releaseOutputBuffer(outputBufferIndex, true); // true表示渲染到Surface
                
                return true;
            } else if (outputBufferIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                // 输出格式变化
                MediaFormat newFormat = mediaCodec.getOutputFormat();
                Log.d("HardwareDecoder", "输出格式变化: " + newFormat);
            }
            
            return false;
        } catch (Exception e) {
            Log.e("HardwareDecoder", "解码失败", e);
            return false;
        }
    }
    
    private void processDecodedFrame(ByteBuffer outputBuffer, MediaCodec.BufferInfo bufferInfo) {
        // 处理解码后的帧数据
        // 可以在这里进行渲染、保存或其他处理
        presentationTimeUs = bufferInfo.presentationTimeUs;
    }
    
    public void release() {
        if (mediaCodec != null) {
            try {
                mediaCodec.stop();
                mediaCodec.release();
            } catch (Exception e) {
                Log.e("HardwareDecoder", "释放资源失败", e);
            }
            mediaCodec = null;
        }
    }
}
```

### 软件解码实现
```java
// FFmpeg软件解码示例
public class SoftwareDecoder {
    static {
        System.loadLibrary("avutil");
        System.loadLibrary("swresample");
        System.loadLibrary("avcodec");
        System.loadLibrary("avformat");
        System.loadLibrary("swscale");
        System.loadLibrary("ffmpegdecoder");
    }
    
    private long decoderContext; // 原生解码器上下文指针
    
    public native boolean initialize(String filename);
    public native boolean seekTo(long position);
    public native int getNextFrame(byte[] outputBuffer);
    public native int getVideoWidth();
    public native int getVideoHeight();
    public native long getDuration();
    public native long getCurrentPosition();
    public native void release();
    
    // Java层封装
    public boolean openFile(String filePath) {
        return initialize(filePath);
    }
    
    public Bitmap getNextFrameAsBitmap() {
        int width = getVideoWidth();
        int height = getVideoHeight();
        
        if (width <= 0 || height <= 0) {
            return null;
        }
        
        // 计算RGB数据大小
        int bufferSize = width * height * 4; // RGBA
        byte[] frameData = new byte[bufferSize];
        
        // 获取下一帧数据
        int result = getNextFrame(frameData);
        
        if (result <= 0) {
            return null;
        }
        
        // 创建Bitmap
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        bitmap.copyPixelsFromBuffer(ByteBuffer.wrap(frameData));
        
        return bitmap;
    }
    
    public void cleanup() {
        release();
    }
}
```

### 解码器选择策略
```java
public class DecoderSelector {
    public static BaseDecoder createDecoder(String mimeType, int width, int height) {
        // 首先检查是否支持硬件解码
        if (isHardwareDecodingSupported(mimeType, width, height)) {
            HardwareDecoder hardwareDecoder = new HardwareDecoder();
            if (hardwareDecoder.initialize(mimeType, width, height, null, null)) {
                Log.d("DecoderSelector", "使用硬件解码器");
                return hardwareDecoder;
            }
        }
        
        // 硬件解码不可用，使用软件解码
        SoftwareDecoder softwareDecoder = new SoftwareDecoder();
        Log.d("DecoderSelector", "使用软件解码器");
        return softwareDecoder;
    }
    
    private static boolean isHardwareDecodingSupported(String mimeType, int width, int height) {
        try {
            // 检查设备是否支持硬件解码
            MediaCodecInfo[] codecInfos = new MediaCodecList(MediaCodecList.ALL_CODECS).getCodecInfos();
            
            for (MediaCodecInfo codecInfo : codecInfos) {
                if (!codecInfo.isEncoder()) {
                    String[] types = codecInfo.getSupportedTypes();
                    for (String type : types) {
                        if (type.equalsIgnoreCase(mimeType)) {
                            // 检查是否支持硬件加速
                            if (codecInfo.getName().startsWith("OMX.") || 
                                codecInfo.getName().startsWith("c2.")) {
                                
                                // 检查分辨率支持
                                MediaCodecInfo.CodecCapabilities capabilities = codecInfo.getCapabilitiesForType(type);
                                MediaCodecInfo.VideoCapabilities videoCapabilities = capabilities.getVideoCapabilities();
                                
                                if (videoCapabilities != null && 
                                    videoCapabilities.isSizeSupported(width, height)) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.e("DecoderSelector", "检查硬件解码支持失败", e);
        }
        
        return false;
    }
}
```

## 性能优化策略

### 硬件解码优化
1. **缓冲区管理**：
   - 合理设置输入输出缓冲区数量
   - 及时释放不用的缓冲区
   - 避免频繁的缓冲区分配与释放

2. **同步机制**：
   - 使用适当的超时设置
   - 实现解码线程与渲染线程的同步
   - 处理解码器状态变化

### 软件解码优化
1. **多线程处理**：
   - 使用多线程进行解码
   - 实现生产者-消费者模式
   - 平衡CPU核心负载

2. **内存管理**：
   - 减少内存拷贝次数
   - 使用内存池管理缓冲区
   - 及时释放大型数据结构

## 测试验证方法

### 功能测试
1. **解码质量测试**：
   - 对比硬解和软解的解码质量
   - 验证不同分辨率和码率的视频解码
   - 检查特殊格式视频的解码支持

2. **兼容性测试**：
   - 在不同设备上测试解码性能
   - 验证不同Android版本的兼容性
   - 测试各种编码格式的支持情况

### 性能测试
1. **解码速度测试**：
   - 测量硬解和软解的解码速度
   - 比较不同分辨率下的解码性能
   - 检查解码延迟

2. **资源消耗测试**：
   - 监控CPU使用率
   - 检查内存占用情况
   - 测试电池消耗

### 稳定性测试
1. **长时间播放测试**：
   - 测试长时间视频播放的稳定性
   - 检查内存泄漏情况
   - 验证异常恢复能力

2. **边界条件测试**：
   - 测试极端参数下的解码表现
   - 验证损坏数据的处理能力
   - 检查资源不足时的行为

## 常见问题排查

### 硬件解码问题
1. **初始化失败**：
   - 检查设备是否支持硬件解码
   - 验证视频格式是否受支持
   - 确认分辨率是否在支持范围内

2. **解码异常**：
   - 检查输入数据格式是否正确
   - 验证SPS/PPS数据是否完整
   - 确认解码器状态是否正常

### 软件解码问题
1. **性能问题**：
   - 优化解码算法
   - 调整线程数量
   - 检查内存使用情况

2. **兼容性问题**：
   - 检查FFmpeg库版本
   - 验证编译参数
   - 确认平台特定实现

## 使用场景
- 视频播放应用
- 视频编辑应用
- 视频转码应用
- 实时视频通信

## 相关模块
- NVIDIA显卡硬解码模块
- 预转码模块
- 视频播放模块
- 缓存文件存储模块