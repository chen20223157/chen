# OpenSLES和AudioRecord测试开发技术

## 概述

OpenSLES (Open Sound Library for Embedded Systems) 和 AudioRecord 是 Android 平台上两种主要的音频录制 API，作为测试开发工程师，需要掌握它们的测试方法、性能分析和兼容性验证技术。

## 测试框架设计

### 1. 音频录制API兼容性测试框架

```java
public class AndroidAudioRecordTestFramework {
    private static final String TAG = "AndroidAudioRecordTest";
    
    // 音频录制API类型
    public enum AudioRecordAPIType {
        OPENSLES,
        AUDIO_RECORD
    }
    
    // 测试配置
    public static class TestConfig {
        public AudioRecordAPIType apiType;
        public int sampleRate = 44100;
        public int channels = AudioFormat.CHANNEL_IN_STEREO;
        public int audioEncoding = AudioFormat.ENCODING_PCM_16BIT;
        public int bufferSize = 4096;
        public boolean testLatency = true;
        public boolean testNoiseReduction = true;
        public boolean testEchoCancellation = true;
        public boolean testPerformance = true;
        public boolean testMultipleSources = true;
        public int recordDurationSeconds = 10;
    }
    
    // 测试结果
    public static class TestResult {
        public boolean success;
        public String errorMessage;
        public long latencyMs;
        public int cpuUsagePercent;
        public long memoryUsageBytes;
        public Map<String, Object> metrics;
        public byte[] recordedAudioData;
    }
    
    // 执行兼容性测试
    public TestResult runCompatibilityTest(TestConfig config) {
        TestResult result = new TestResult();
        Map<String, Object> metrics = new HashMap<>();
        
        try {
            Log.d(TAG, "开始测试音频录制API: " + config.apiType);
            
            // 1. 初始化测试
            boolean initSuccess = initializeAudioRecordAPI(config.apiType, config);
            if (!initSuccess) {
                result.success = false;
                result.errorMessage = "音频录制API初始化失败";
                return result;
            }
            
            // 2. 音频源枚举测试
            List<AudioSource> sources = enumerateAudioSources(config.apiType);
            metrics.put("sourceCount", sources.size());
            
            // 3. 音频格式支持测试
            boolean formatSupported = testAudioFormatSupport(config);
            metrics.put("formatSupported", formatSupported);
            
            // 4. 延迟测试
            if (config.testLatency) {
                long latency = measureLatency(config);
                metrics.put("latencyMs", latency);
                result.latencyMs = latency;
            }
            
            // 5. 噪声抑制测试
            if (config.testNoiseReduction) {
                boolean noiseReductionSupport = testNoiseReduction(config);
                metrics.put("noiseReductionSupport", noiseReductionSupport);
            }
            
            // 6. 回声消除测试
            if (config.testEchoCancellation) {
                boolean echoCancellationSupport = testEchoCancellation(config);
                metrics.put("echoCancellationSupport", echoCancellationSupport);
            }
            
            // 7. 多音源测试
            if (config.testMultipleSources) {
                boolean multipleSourcesSupport = testMultipleSources(config);
                metrics.put("multipleSourcesSupport", multipleSourcesSupport);
            }
            
            // 8. 性能测试
            if (config.testPerformance) {
                Map<String, Object> perfMetrics = measurePerformance(config);
                metrics.putAll(perfMetrics);
                result.cpuUsagePercent = (int) perfMetrics.get("cpuUsagePercent");
                result.memoryUsageBytes = (long) perfMetrics.get("memoryUsageBytes");
            }
            
            // 9. 录制音频测试
            byte[] recordedData = recordAudio(config);
            if (recordedData != null && recordedData.length > 0) {
                result.recordedAudioData = recordedData;
                metrics.put("recordedDataSize", recordedData.length);
                
                // 音频质量分析
                Map<String, Object> qualityMetrics = analyzeAudioQuality(recordedData, config);
                metrics.putAll(qualityMetrics);
            }
            
            result.success = true;
            result.metrics = metrics;
            
        } catch (Exception e) {
            Log.e(TAG, "音频录制API测试失败", e);
            result.success = false;
            result.errorMessage = e.getMessage();
        } finally {
            cleanupAudioRecordAPI(config.apiType);
        }
        
        return result;
    }
    
    // 初始化音频录制API
    private boolean initializeAudioRecordAPI(AudioRecordAPIType apiType, TestConfig config) {
        switch (apiType) {
            case OPENSLES:
                return initializeOpenSLES(config);
            case AUDIO_RECORD:
                return initializeAudioRecord(config);
            default:
                return false;
        }
    }
    
    // 初始化OpenSLES
    private boolean initializeOpenSLES(TestConfig config) {
        try {
            // OpenSLES初始化代码
            Log.d(TAG, "初始化OpenSLES");
            // 实际实现...
            return true;
        } catch (Exception e) {
            Log.e(TAG, "OpenSLES初始化失败", e);
            return false;
        }
    }
    
    // 初始化AudioRecord
    private boolean initializeAudioRecord(TestConfig config) {
        try {
            // 计算缓冲区大小
            int minBufferSize = AudioRecord.getMinBufferSize(
                config.sampleRate, 
                config.channels, 
                config.audioEncoding
            );
            
            if (minBufferSize == AudioRecord.ERROR_BAD_VALUE || 
                minBufferSize == AudioRecord.ERROR) {
                Log.e(TAG, "不支持的音频参数");
                return false;
            }
            
            // 创建AudioRecord实例
            AudioRecord audioRecord = new AudioRecord(
                MediaRecorder.AudioSource.MIC,
                config.sampleRate,
                config.channels,
                config.audioEncoding,
                Math.max(minBufferSize, config.bufferSize)
            );
            
            // 检查初始化状态
            if (audioRecord.getState() != AudioRecord.STATE_INITIALIZED) {
                Log.e(TAG, "AudioRecord初始化失败");
                audioRecord.release();
                return false;
            }
            
            // 保存实例供后续使用
            // 实际实现中应保存为成员变量
            audioRecord.release();
            
            Log.d(TAG, "AudioRecord初始化成功");
            return true;
            
        } catch (Exception e) {
            Log.e(TAG, "AudioRecord初始化失败", e);
            return false;
        }
    }
    
    // 枚举音频源
    private List<AudioSource> enumerateAudioSources(AudioRecordAPIType apiType) {
        List<AudioSource> sources = new ArrayList<>();
        
        try {
            switch (apiType) {
                case OPENSLES:
                    sources = enumerateOpenSLESSources();
                    break;
                case AUDIO_RECORD:
                    sources = enumerateAudioRecordSources();
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "枚举音频源失败", e);
        }
        
        return sources;
    }
    
    // 测试音频格式支持
    private boolean testAudioFormatSupport(TestConfig config) {
        try {
            Log.d(TAG, "测试音频格式支持: " + config.sampleRate + "Hz, " + 
                  config.channels + ", " + config.audioEncoding);
            
            // 测试不同采样率支持
            int[] sampleRates = {8000, 16000, 22050, 44100, 48000, 96000, 192000};
            boolean[] sampleRateSupport = new boolean[sampleRates.length];
            
            for (int i = 0; i < sampleRates.length; i++) {
                int minBufferSize = AudioRecord.getMinBufferSize(
                    sampleRates[i], 
                    config.channels, 
                    config.audioEncoding
                );
                
                sampleRateSupport[i] = (minBufferSize != AudioRecord.ERROR_BAD_VALUE && 
                                       minBufferSize != AudioRecord.ERROR);
            }
            
            // 测试不同通道配置支持
            int[] channelConfigs = {
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.CHANNEL_IN_STEREO,
                AudioFormat.CHANNEL_IN_FRONT_BACK,
                AudioFormat.CHANNEL_IN_LEFT_RIGHT
            };
            boolean[] channelSupport = new boolean[channelConfigs.length];
            
            for (int i = 0; i < channelConfigs.length; i++) {
                int minBufferSize = AudioRecord.getMinBufferSize(
                    config.sampleRate, 
                    channelConfigs[i], 
                    config.audioEncoding
                );
                
                channelSupport[i] = (minBufferSize != AudioRecord.ERROR_BAD_VALUE && 
                                    minBufferSize != AudioRecord.ERROR);
            }
            
            // 测试不同编码格式支持
            int[] audioEncodings = {
                AudioFormat.ENCODING_PCM_8BIT,
                AudioFormat.ENCODING_PCM_16BIT,
                AudioFormat.ENCODING_PCM_24BIT_PACKED,
                AudioFormat.ENCODING_PCM_32BIT,
                AudioFormat.ENCODING_IEC61937,
                AudioFormat.ENCODING_AC3,
                AudioFormat.ENCODING_E_AC3,
                AudioFormat.ENCODING_DTS,
                AudioFormat.ENCODING_DTS_HD
            };
            boolean[] encodingSupport = new boolean[audioEncodings.length];
            
            for (int i = 0; i < audioEncodings.length; i++) {
                int minBufferSize = AudioRecord.getMinBufferSize(
                    config.sampleRate, 
                    config.channels, 
                    audioEncodings[i]
                );
                
                encodingSupport[i] = (minBufferSize != AudioRecord.ERROR_BAD_VALUE && 
                                     minBufferSize != AudioRecord.ERROR);
            }
            
            // 记录测试结果
            Log.d(TAG, "采样率支持: " + Arrays.toString(sampleRateSupport));
            Log.d(TAG, "通道配置支持: " + Arrays.toString(channelSupport));
            Log.d(TAG, "编码格式支持: " + Arrays.toString(encodingSupport));
            
            // 返回当前配置是否支持
            int minBufferSize = AudioRecord.getMinBufferSize(
                config.sampleRate, 
                config.channels, 
                config.audioEncoding
            );
            
            return (minBufferSize != AudioRecord.ERROR_BAD_VALUE && 
                    minBufferSize != AudioRecord.ERROR);
            
        } catch (Exception e) {
            Log.e(TAG, "测试音频格式支持失败", e);
            return false;
        }
    }
    
    // 测量延迟
    private long measureLatency(TestConfig config) {
        try {
            Log.d(TAG, "测量音频录制延迟");
            
            // 实际实现需要通过回环测试测量延迟
            // 这里返回模拟值
            return 30; // 示例值，表示30ms的延迟
        } catch (Exception e) {
            Log.e(TAG, "测量延迟失败", e);
            return -1;
        }
    }
    
    // 测试噪声抑制
    private boolean testNoiseReduction(TestConfig config) {
        try {
            Log.d(TAG, "测试噪声抑制");
            
            // 检查设备是否支持噪声抑制
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                // 使用AudioRecord检查噪声抑制支持
                AudioRecord audioRecord = new AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    config.sampleRate,
                    config.channels,
                    config.audioEncoding,
                    config.bufferSize
                );
                
                boolean noiseSuppressorSupported = false;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    noiseSuppressorSupported = audioRecord.isAcousticEchoCancelerSupported() ||
                                             audioRecord.isNoiseSuppressorSupported();
                }
                
                audioRecord.release();
                return noiseSuppressorSupported;
            }
            
            return false;
        } catch (Exception e) {
            Log.e(TAG, "测试噪声抑制失败", e);
            return false;
        }
    }
    
    // 测试回声消除
    private boolean testEchoCancellation(TestConfig config) {
        try {
            Log.d(TAG, "测试回声消除");
            
            // 检查设备是否支持回声消除
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                // 使用AudioRecord检查回声消除支持
                AudioRecord audioRecord = new AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    config.sampleRate,
                    config.channels,
                    config.audioEncoding,
                    config.bufferSize
                );
                
                boolean echoCancellationSupported = false;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    echoCancellationSupported = audioRecord.isAcousticEchoCancelerSupported();
                }
                
                audioRecord.release();
                return echoCancellationSupported;
            }
            
            return false;
        } catch (Exception e) {
            Log.e(TAG, "测试回声消除失败", e);
            return false;
        }
    }
    
    // 测试多音源支持
    private boolean testMultipleSources(TestConfig config) {
        try {
            Log.d(TAG, "测试多音源支持");
            
            // 测试不同音频源的支持情况
            int[] audioSources = {
                MediaRecorder.AudioSource.DEFAULT,
                MediaRecorder.AudioSource.MIC,
                MediaRecorder.AudioSource.VOICE_UPLINK,
                MediaRecorder.AudioSource.VOICE_DOWNLINK,
                MediaRecorder.AudioSource.VOICE_CALL,
                MediaRecorder.AudioSource.CAMCORDER,
                MediaRecorder.AudioSource.VOICE_RECOGNITION,
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                MediaRecorder.AudioSource.UNPROCESSED,
                MediaRecorder.AudioSource.VOICE_PERFORMANCE
            };
            
            boolean[] sourceSupport = new boolean[audioSources.length];
            
            for (int i = 0; i < audioSources.length; i++) {
                try {
                    AudioRecord audioRecord = new AudioRecord(
                        audioSources[i],
                        config.sampleRate,
                        config.channels,
                        config.audioEncoding,
                        config.bufferSize
                    );
                    
                    sourceSupport[i] = (audioRecord.getState() == AudioRecord.STATE_INITIALIZED);
                    audioRecord.release();
                } catch (Exception e) {
                    sourceSupport[i] = false;
                }
            }
            
            // 记录测试结果
            Log.d(TAG, "音频源支持: " + Arrays.toString(sourceSupport));
            
            // 检查是否支持多个音频源
            int supportedSources = 0;
            for (boolean supported : sourceSupport) {
                if (supported) supportedSources++;
            }
            
            return supportedSources > 1; // 支持超过一个音频源
        } catch (Exception e) {
            Log.e(TAG, "测试多音源支持失败", e);
            return false;
        }
    }
    
    // 性能测量
    private Map<String, Object> measurePerformance(TestConfig config) {
        Map<String, Object> metrics = new HashMap<>();
        
        try {
            Log.d(TAG, "测量性能指标");
            
            // CPU使用率
            int cpuUsage = measureCPUUsage();
            metrics.put("cpuUsagePercent", cpuUsage);
            
            // 内存使用
            long memoryUsage = measureMemoryUsage();
            metrics.put("memoryUsageBytes", memoryUsage);
            
            // 吞吐量
            double throughput = measureThroughput(config);
            metrics.put("throughputMBps", throughput);
            
            // 电池消耗
            double batteryDrain = measureBatteryDrain(config);
            metrics.put("batteryDrainPercentPerHour", batteryDrain);
            
        } catch (Exception e) {
            Log.e(TAG, "性能测量失败", e);
        }
        
        return metrics;
    }
    
    // 录制音频
    private byte[] recordAudio(TestConfig config) {
        try {
            Log.d(TAG, "录制音频，时长: " + config.recordDurationSeconds + "秒");
            
            // 计算缓冲区大小
            int minBufferSize = AudioRecord.getMinBufferSize(
                config.sampleRate, 
                config.channels, 
                config.audioEncoding
            );
            
            int bufferSize = Math.max(minBufferSize, config.bufferSize);
            
            // 创建AudioRecord实例
            AudioRecord audioRecord = new AudioRecord(
                MediaRecorder.AudioSource.MIC,
                config.sampleRate,
                config.channels,
                config.audioEncoding,
                bufferSize
            );
            
            if (audioRecord.getState() != AudioRecord.STATE_INITIALIZED) {
                Log.e(TAG, "AudioRecord初始化失败");
                audioRecord.release();
                return null;
            }
            
            // 开始录制
            audioRecord.startRecording();
            
            // 计算总样本数
            int bytesPerSample = AudioFormat.getBytesPerSample(config.audioEncoding);
            int totalBytesToRead = config.sampleRate * config.recordDurationSeconds * bytesPerSample;
            
            // 读取音频数据
            byte[] audioData = new byte[totalBytesToRead];
            int totalBytesRead = 0;
            
            while (totalBytesRead < totalBytesToRead) {
                int bytesRead = audioRecord.read(
                    audioData, 
                    totalBytesRead, 
                    Math.min(bufferSize, totalBytesToRead - totalBytesRead)
                );
                
                if (bytesRead > 0) {
                    totalBytesRead += bytesRead;
                } else {
                    Log.w(TAG, "读取音频数据失败: " + bytesRead);
                    break;
                }
            }
            
            // 停止录制并释放资源
            audioRecord.stop();
            audioRecord.release();
            
            // 调整数组大小
            if (totalBytesRead < totalBytesToRead) {
                byte[] trimmedAudioData = new byte[totalBytesRead];
                System.arraycopy(audioData, 0, trimmedAudioData, 0, totalBytesRead);
                audioData = trimmedAudioData;
            }
            
            Log.d(TAG, "录制完成，总字节数: " + totalBytesRead);
            return audioData;
            
        } catch (Exception e) {
            Log.e(TAG, "录制音频失败", e);
            return null;
        }
    }
    
    // 分析音频质量
    private Map<String, Object> analyzeAudioQuality(byte[] audioData, TestConfig config) {
        Map<String, Object> metrics = new HashMap<>();
        
        try {
            Log.d(TAG, "分析音频质量");
            
            // 计算音频电平
            double audioLevel = calculateAudioLevel(audioData, config.audioEncoding);
            metrics.put("audioLevelDb", audioLevel);
            
            // 计算信噪比
            double snr = calculateSNR(audioData, config);
            metrics.put("snrDb", snr);
            
            // 检测静音段
            double silenceRatio = calculateSilenceRatio(audioData, config);
            metrics.put("silenceRatio", silenceRatio);
            
            // 检测削波
            double clippingRatio = calculateClippingRatio(audioData, config.audioEncoding);
            metrics.put("clippingRatio", clippingRatio);
            
            // 频谱分析
            Map<String, Object> spectrumAnalysis = performSpectrumAnalysis(audioData, config);
            metrics.putAll(spectrumAnalysis);
            
        } catch (Exception e) {
            Log.e(TAG, "分析音频质量失败", e);
        }
        
        return metrics;
    }
    
    // 计算音频电平
    private double calculateAudioLevel(byte[] audioData, int audioEncoding) {
        // 实际实现需要根据编码格式计算音频电平
        return -20.0; // 示例值，表示-20dB的音频电平
    }
    
    // 计算信噪比
    private double calculateSNR(byte[] audioData, TestConfig config) {
        // 实际实现需要信号和噪声功率计算
        return 60.0; // 示例值，表示60dB的信噪比
    }
    
    // 计算静音比例
    private double calculateSilenceRatio(byte[] audioData, TestConfig config) {
        // 实际实现需要静音检测算法
        return 0.05; // 示例值，表示5%的静音比例
    }
    
    // 计算削波比例
    private double calculateClippingRatio(byte[] audioData, int audioEncoding) {
        // 实际实现需要削波检测算法
        return 0.01; // 示例值，表示1%的削波比例
    }
    
    // 执行频谱分析
    private Map<String, Object> performSpectrumAnalysis(byte[] audioData, TestConfig config) {
        Map<String, Object> spectrumMetrics = new HashMap<>();
        
        // 实际实现需要FFT分析
        spectrumMetrics.put("lowFrequencyEnergy", 0.3);  // 低频能量比例
        spectrumMetrics.put("midFrequencyEnergy", 0.5);  // 中频能量比例
        spectrumMetrics.put("highFrequencyEnergy", 0.2); // 高频能量比例
        
        return spectrumMetrics;
    }
    
    // 清理音频录制API
    private void cleanupAudioRecordAPI(AudioRecordAPIType apiType) {
        try {
            switch (apiType) {
                case OPENSLES:
                    cleanupOpenSLES();
                    break;
                case AUDIO_RECORD:
                    cleanupAudioRecord();
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "清理音频录制API失败", e);
        }
    }
    
    // 辅助方法（实际实现需要补充）
    private List<AudioSource> enumerateOpenSLESSources() { return new ArrayList<>(); }
    private List<AudioSource> enumerateAudioRecordSources() { return new ArrayList<>(); }
    private int measureCPUUsage() { return 0; }
    private long measureMemoryUsage() { return 0; }
    private double measureThroughput(TestConfig config) { return 0.0; }
    private double measureBatteryDrain(TestConfig config) { return 0.0; }
    private void cleanupOpenSLES() {}
    private void cleanupAudioRecord() {}
}
```

### 2. 音频录制质量测试工具

```java
public class AudioRecordQualityTester {
    private static final String TAG = "AudioRecordQualityTester";
    
    // 音频录制质量测试参数
    public static class QualityTestParams {
        public int testDurationSeconds = 10;
        public int sampleRate = 44100;
        public int channels = AudioFormat.CHANNEL_IN_STEREO;
        public int audioEncoding = AudioFormat.ENCODING_PCM_16BIT;
        public String referenceAudioFile;
        public boolean testTHD = true;           // 总谐波失真
        public boolean testSNR = true;            // 信噪比
        public boolean testFrequencyResponse = true; // 频率响应
        public boolean testDynamicRange = true;   // 动态范围
        public boolean testNoiseLevel = true;     // 噪声水平
        public boolean testMicrophoneCharacteristics = true; // 麦克风特性
    }
    
    // 音频录制质量测试结果
    public static class QualityTestResult {
        public boolean success;
        public String errorMessage;
        public double thdPercent;                  // 总谐波失真百分比
        public double snrDb;                       // 信噪比(dB)
        public Map<Integer, Double> frequencyResponse; // 频率响应
        public double dynamicRangeDb;              // 动态范围(dB)
        public double noiseLevelDb;                // 噪声水平(dB)
        public Map<String, Object> microphoneCharacteristics; // 麦克风特性
        public double similarityPercent;           // 与参考音频相似度
    }
    
    // 执行音频录制质量测试
    public QualityTestResult runQualityTest(QualityTestParams params, AndroidAudioRecordTestFramework.AudioRecordAPIType apiType) {
        QualityTestResult result = new QualityTestResult();
        
        try {
            Log.d(TAG, "开始音频录制质量测试，API类型: " + apiType);
            
            // 1. 配置录制参数
            AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
            config.apiType = apiType;
            config.sampleRate = params.sampleRate;
            config.channels = params.channels;
            config.audioEncoding = params.audioEncoding;
            config.recordDurationSeconds = params.testDurationSeconds;
            
            // 2. 录制测试音频
            AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
            AndroidAudioRecordTestFramework.TestResult testResult = framework.runCompatibilityTest(config);
            
            if (!testResult.success) {
                result.success = false;
                result.errorMessage = "录制音频失败: " + testResult.errorMessage;
                return result;
            }
            
            byte[] recordedAudioData = testResult.recordedAudioData;
            
            // 3. 分析录制音频质量
            if (params.testTHD) {
                result.thdPercent = calculateTHD(recordedAudioData, params);
            }
            
            if (params.testSNR) {
                result.snrDb = calculateSNR(recordedAudioData, params);
            }
            
            if (params.testFrequencyResponse) {
                result.frequencyResponse = calculateFrequencyResponse(recordedAudioData, params);
            }
            
            if (params.testDynamicRange) {
                result.dynamicRangeDb = calculateDynamicRange(recordedAudioData, params);
            }
            
            if (params.testNoiseLevel) {
                result.noiseLevelDb = calculateNoiseLevel(recordedAudioData, params);
            }
            
            if (params.testMicrophoneCharacteristics) {
                result.microphoneCharacteristics = analyzeMicrophoneCharacteristics(recordedAudioData, params);
            }
            
            // 4. 与参考音频比较
            if (params.referenceAudioFile != null) {
                result.similarityPercent = calculateSimilarity(recordedAudioData, params.referenceAudioFile);
            }
            
            result.success = true;
            
        } catch (Exception e) {
            Log.e(TAG, "音频录制质量测试失败", e);
            result.success = false;
            result.errorMessage = e.getMessage();
        }
        
        return result;
    }
    
    // 计算总谐波失真(THD)
    private double calculateTHD(byte[] audioData, QualityTestParams params) {
        // 实际实现需要FFT分析
        return 0.05; // 示例值，表示0.05%的THD
    }
    
    // 计算信噪比(SNR)
    private double calculateSNR(byte[] audioData, QualityTestParams params) {
        // 实际实现需要信号和噪声功率计算
        return 65.0; // 示例值，表示65dB的信噪比
    }
    
    // 计算频率响应
    private Map<Integer, Double> calculateFrequencyResponse(byte[] audioData, QualityTestParams params) {
        Map<Integer, Double> frequencyResponse = new HashMap<>();
        
        // 测试多个频率点的响应
        int[] testFrequencies = {100, 500, 1000, 2000, 5000, 10000};
        
        for (int freq : testFrequencies) {
            // 实际实现需要FFT分析
            frequencyResponse.put(freq, -3.0); // 示例值，表示-3dB的响应
        }
        
        return frequencyResponse;
    }
    
    // 计算动态范围
    private double calculateDynamicRange(byte[] audioData, QualityTestParams params) {
        // 实际实现需要最大和最小信号电平计算
        return 85.0; // 示例值，表示85dB的动态范围
    }
    
    // 计算噪声水平
    private double calculateNoiseLevel(byte[] audioData, QualityTestParams params) {
        // 实际实现需要噪声分析算法
        return -75.0; // 示例值，表示-75dB的噪声水平
    }
    
    // 分析麦克风特性
    private Map<String, Object> analyzeMicrophoneCharacteristics(byte[] audioData, QualityTestParams params) {
        Map<String, Object> characteristics = new HashMap<>();
        
        // 麦克风方向性
        characteristics.put("directionality", "omnidirectional");
        
        // 麦克风灵敏度
        characteristics.put("sensitivityDb", -38.0);
        
        // 麦克风频率响应范围
        Map<String, Integer> frequencyRange = new HashMap<>();
        frequencyRange.put("low", 100);
        frequencyRange.put("high", 10000);
        characteristics.put("frequencyRange", frequencyRange);
        
        // 最大声压级
        characteristics.put("maxSPL", 120.0);
        
        return characteristics;
    }
    
    // 计算与参考音频的相似度
    private double calculateSimilarity(byte[] audioData, String referenceAudioFile) {
        // 实际实现需要相关系数计算
        return 95.0; // 示例值，表示95%的相似度
    }
}
```

## 测试用例设计

### 1. API兼容性测试用例

```java
public class AudioRecordCompatibilityTestCases {
    
    // 测试OpenSLES API兼容性
    @Test
    public void testOpenSLESCompatibility() {
        AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
        config.apiType = AndroidAudioRecordTestFramework.AudioRecordAPIType.OPENSLES;
        config.sampleRate = 44100;
        config.channels = AudioFormat.CHANNEL_IN_STEREO;
        config.audioEncoding = AudioFormat.ENCODING_PCM_16BIT;
        
        AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
        AndroidAudioRecordTestFramework.TestResult result = framework.runCompatibilityTest(config);
        
        assertTrue("OpenSLES API兼容性测试失败", result.success);
        assertNotNull("音频源列表不应为空", result.metrics.get("sourceCount"));
        assertTrue("音频格式应支持", (boolean) result.metrics.get("formatSupported"));
        assertTrue("延迟应小于100ms", result.latencyMs < 100);
    }
    
    // 测试AudioRecord API兼容性
    @Test
    public void testAudioRecordCompatibility() {
        AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
        config.apiType = AndroidAudioRecordTestFramework.AudioRecordAPIType.AUDIO_RECORD;
        config.sampleRate = 44100;
        config.channels = AudioFormat.CHANNEL_IN_STEREO;
        config.audioEncoding = AudioFormat.ENCODING_PCM_16BIT;
        
        AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
        AndroidAudioRecordTestFramework.TestResult result = framework.runCompatibilityTest(config);
        
        assertTrue("AudioRecord API兼容性测试失败", result.success);
        assertNotNull("音频源列表不应为空", result.metrics.get("sourceCount"));
        assertTrue("音频格式应支持", (boolean) result.metrics.get("formatSupported"));
        assertTrue("延迟应小于100ms", result.latencyMs < 100);
    }
    
    // 测试多格式支持
    @Test
    public void testMultiFormatSupport() {
        AndroidAudioRecordTestFramework.AudioRecordAPIType[] apiTypes = {
            AndroidAudioRecordTestFramework.AudioRecordAPIType.OPENSLES,
            AndroidAudioRecordTestFramework.AudioRecordAPIType.AUDIO_RECORD
        };
        
        int[] sampleRates = {8000, 16000, 22050, 44100, 48000, 96000, 192000};
        int[] channelConfigs = {
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.CHANNEL_IN_STEREO,
            AudioFormat.CHANNEL_IN_FRONT_BACK
        };
        int[] audioEncodings = {
            AudioFormat.ENCODING_PCM_8BIT,
            AudioFormat.ENCODING_PCM_16BIT,
            AudioFormat.ENCODING_PCM_24BIT_PACKED,
            AudioFormat.ENCODING_PCM_32BIT
        };
        
        AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
        
        for (AndroidAudioRecordTestFramework.AudioRecordAPIType apiType : apiTypes) {
            for (int sampleRate : sampleRates) {
                for (int channelConfig : channelConfigs) {
                    for (int audioEncoding : audioEncodings) {
                        AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
                        config.apiType = apiType;
                        config.sampleRate = sampleRate;
                        config.channels = channelConfig;
                        config.audioEncoding = audioEncoding;
                        
                        AndroidAudioRecordTestFramework.TestResult result = framework.runCompatibilityTest(config);
                        
                        // 记录测试结果
                        Log.d("MultiFormatTest", String.format("API: %s, %dHz, %s, %s - %s", 
                            apiType, sampleRate, channelConfigToString(channelConfig), 
                            audioEncodingToString(audioEncoding),
                            result.success ? "PASS" : "FAIL"));
                    }
                }
            }
        }
    }
    
    // 测试多音源支持
    @Test
    public void testMultipleAudioSources() {
        AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
        config.apiType = AndroidAudioRecordTestFramework.AudioRecordAPIType.AUDIO_RECORD;
        config.sampleRate = 44100;
        config.channels = AudioFormat.CHANNEL_IN_MONO;
        config.audioEncoding = AudioFormat.ENCODING_PCM_16BIT;
        config.testMultipleSources = true;
        
        AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
        AndroidAudioRecordTestFramework.TestResult result = framework.runCompatibilityTest(config);
        
        assertTrue("多音源测试失败", result.success);
        assertTrue("应支持多个音频源", (boolean) result.metrics.get("multipleSourcesSupport"));
    }
    
    // 辅助方法
    private String channelConfigToString(int channelConfig) {
        switch (channelConfig) {
            case AudioFormat.CHANNEL_IN_MONO: return "MONO";
            case AudioFormat.CHANNEL_IN_STEREO: return "STEREO";
            case AudioFormat.CHANNEL_IN_FRONT_BACK: return "FRONT_BACK";
            default: return "UNKNOWN";
        }
    }
    
    private String audioEncodingToString(int audioEncoding) {
        switch (audioEncoding) {
            case AudioFormat.ENCODING_PCM_8BIT: return "PCM_8BIT";
            case AudioFormat.ENCODING_PCM_16BIT: return "PCM_16BIT";
            case AudioFormat.ENCODING_PCM_24BIT_PACKED: return "PCM_24BIT";
            case AudioFormat.ENCODING_PCM_32BIT: return "PCM_32BIT";
            default: return "UNKNOWN";
        }
    }
}
```

### 2. 性能测试用例

```java
public class AudioRecordPerformanceTestCases {
    
    // 测试CPU使用率
    @Test
    public void testCPUUsage() {
        AndroidAudioRecordTestFramework.AudioRecordAPIType[] apiTypes = {
            AndroidAudioRecordTestFramework.AudioRecordAPIType.OPENSLES,
            AndroidAudioRecordTestFramework.AudioRecordAPIType.AUDIO_RECORD
        };
        
        for (AndroidAudioRecordTestFramework.AudioRecordAPIType apiType : apiTypes) {
            AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
            config.apiType = apiType;
            config.testPerformance = true;
            config.recordDurationSeconds = 30; // 录制30秒以获得更准确的CPU使用率
            
            AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
            AndroidAudioRecordTestFramework.TestResult result = framework.runCompatibilityTest(config);
            
            assertTrue("性能测试失败: " + apiType, result.success);
            assertTrue("CPU使用率过高: " + apiType + " - " + result.cpuUsagePercent + "%", 
                      result.cpuUsagePercent < 25);
            
            Log.d("CPUUsageTest", apiType + " CPU使用率: " + result.cpuUsagePercent + "%");
        }
    }
    
    // 测试内存使用
    @Test
    public void testMemoryUsage() {
        AndroidAudioRecordTestFramework.AudioRecordAPIType[] apiTypes = {
            AndroidAudioRecordTestFramework.AudioRecordAPIType.OPENSLES,
            AndroidAudioRecordTestFramework.AudioRecordAPIType.AUDIO_RECORD
        };
        
        for (AndroidAudioRecordTestFramework.AudioRecordAPIType apiType : apiTypes) {
            AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
            config.apiType = apiType;
            config.testPerformance = true;
            config.recordDurationSeconds = 60; // 录制60秒以测试内存增长
            
            AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
            AndroidAudioRecordTestFramework.TestResult result = framework.runCompatibilityTest(config);
            
            assertTrue("性能测试失败: " + apiType, result.success);
            assertTrue("内存使用过高: " + apiType + " - " + result.memoryUsageBytes + " bytes", 
                      result.memoryUsageBytes < 100 * 1024 * 1024); // 小于100MB
            
            Log.d("MemoryUsageTest", apiType + " 内存使用: " + result.memoryUsageBytes + " bytes");
        }
    }
    
    // 测试延迟
    @Test
    public void testLatency() {
        AndroidAudioRecordTestFramework.AudioRecordAPIType[] apiTypes = {
            AndroidAudioRecordTestFramework.AudioRecordAPIType.OPENSLES,
            AndroidAudioRecordTestFramework.AudioRecordAPIType.AUDIO_RECORD
        };
        
        for (AndroidAudioRecordTestFramework.AudioRecordAPIType apiType : apiTypes) {
            AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
            config.apiType = apiType;
            config.testLatency = true;
            
            AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
            AndroidAudioRecordTestFramework.TestResult result = framework.runCompatibilityTest(config);
            
            assertTrue("延迟测试失败: " + apiType, result.success);
            assertTrue("延迟应小于100ms: " + apiType + " - " + result.latencyMs + "ms", 
                      result.latencyMs < 100);
            
            Log.d("LatencyTest", apiType + " 延迟: " + result.latencyMs + "ms");
        }
    }
    
    // 测试电池消耗
    @Test
    public void testBatteryDrain() {
        AndroidAudioRecordTestFramework.AudioRecordAPIType[] apiTypes = {
            AndroidAudioRecordTestFramework.AudioRecordAPIType.OPENSLES,
            AndroidAudioRecordTestFramework.AudioRecordAPIType.AUDIO_RECORD
        };
        
        for (AndroidAudioRecordTestFramework.AudioRecordAPIType apiType : apiTypes) {
            AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
            config.apiType = apiType;
            config.testPerformance = true;
            config.recordDurationSeconds = 300; // 录制5分钟以测试电池消耗
            
            AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
            AndroidAudioRecordTestFramework.TestResult result = framework.runCompatibilityTest(config);
            
            assertTrue("电池消耗测试失败: " + apiType, result.success);
            
            Double batteryDrain = (Double) result.metrics.get("batteryDrainPercentPerHour");
            assertNotNull("电池消耗数据不应为空", batteryDrain);
            assertTrue("电池消耗过高: " + apiType + " - " + batteryDrain + "%/小时", 
                      batteryDrain < 10.0); // 小于10%每小时
            
            Log.d("BatteryDrainTest", apiType + " 电池消耗: " + batteryDrain + "%/小时");
        }
    }
}
```

## 自动化测试流程

### 1. 持续集成测试脚本

```bash
#!/bin/bash

echo "开始Android音频录制API自动化测试..."

# 设置测试环境变量
TEST_RESULTS_DIR="./test_results"
TEST_REPORT_DIR="./test_reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 创建结果目录
mkdir -p $TEST_RESULTS_DIR
mkdir -p $TEST_REPORT_DIR

# 连接设备或启动模拟器
echo "检查Android设备连接..."
adb devices

# 运行OpenSLES测试
echo "运行OpenSLES兼容性测试..."
adb shell am instrument -w -e class com.test.audio.OpenSLESCompatibilityTest com.test.audio/androidx.test.runner.AndroidJUnitRunner > $TEST_RESULTS_DIR/opensles_$TIMESTAMP.log

# 运行AudioRecord测试
echo "运行AudioRecord兼容性测试..."
adb shell am instrument -w -e class com.test.audio.AudioRecordCompatibilityTest com.test.audio/androidx.test.runner.AndroidJUnitRunner > $TEST_RESULTS_DIR/audiorecord_$TIMESTAMP.log

# 运行性能测试
echo "运行性能测试..."
adb shell am instrument -w -e class com.test.audio.AudioRecordPerformanceTest com.test.audio/androidx.test.runner.AndroidJUnitRunner > $TEST_RESULTS_DIR/performance_$TIMESTAMP.log

# 运行音频质量测试
echo "运行音频质量测试..."
adb shell am instrument -w -e class com.test.audio.AudioRecordQualityTest com.test.audio/androidx.test.runner.AndroidJUnitRunner > $TEST_RESULTS_DIR/quality_$TIMESTAMP.log

# 从设备拉取测试结果
echo "从设备拉取测试结果..."
adb pull /sdcard/test_results/ $TEST_RESULTS_DIR/device_$TIMESTAMP/

# 生成测试报告
echo "生成测试报告..."
java -cp ".:lib/*" com.test.report.AndroidAudioRecordTestReportGenerator $TEST_RESULTS_DIR $TEST_REPORT_DIR/audio_record_test_report_$TIMESTAMP.html

echo "测试完成，报告已生成: $TEST_REPORT_DIR/audio_record_test_report_$TIMESTAMP.html"
```

### 2. 测试报告生成器

```java
public class AndroidAudioRecordTestReportGenerator {
    
    public static void generateReport(String testResultsDir, String reportFile) {
        try {
            StringBuilder html = new StringBuilder();
            
            // HTML头部
            html.append("<!DOCTYPE html>\n");
            html.append("<html>\n<head>\n");
            html.append("<title>Android音频录制API测试报告</title>\n");
            html.append("<style>\n");
            html.append("body { font-family: Arial, sans-serif; margin: 20px; }\n");
            html.append("table { border-collapse: collapse; width: 100%; }\n");
            html.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n");
            html.append("th { background-color: #f2f2f2; }\n");
            html.append(".pass { color: green; }\n");
            html.append(".fail { color: red; }\n");
            html.append(".warning { color: orange; }\n");
            html.append(".chart { margin: 20px 0; }\n");
            html.append("</style>\n");
            html.append("<script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>\n");
            html.append("</head>\n<body>\n");
            
            // 报告标题
            html.append("<h1>Android音频录制API测试报告</h1>\n");
            html.append("<p>生成时间: ").append(new Date()).append("</p>\n");
            
            // 测试结果汇总
            html.append("<h2>测试结果汇总</h2>\n");
            html.append("<table>\n");
            html.append("<tr><th>API类型</th><th>兼容性测试</th><th>性能测试</th><th>延迟(ms)</th><th>CPU使用率(%)</th><th>内存使用(MB)</th><th>电池消耗(%/小时)</th></tr>\n");
            
            // 解析测试结果文件并生成表格行
            File resultsDir = new File(testResultsDir);
            File[] resultFiles = resultsDir.listFiles((dir, name) -> name.endsWith(".log"));
            
            if (resultFiles != null) {
                for (File file : resultFiles) {
                    Map<String, String> resultData = parseTestResultFile(file);
                    html.append("<tr>\n");
                    html.append("<td>").append(resultData.get("apiType")).append("</td>\n");
                    html.append("<td class=\"").append(resultData.get("compatibility")).append("\">")
                        .append(resultData.get("compatibility")).append("</td>\n");
                    html.append("<td class=\"").append(resultData.get("performance")).append("\">")
                        .append(resultData.get("performance")).append("</td>\n");
                    html.append("<td>").append(resultData.get("latency")).append("</td>\n");
                    html.append("<td>").append(resultData.get("cpuUsage")).append("</td>\n");
                    html.append("<td>").append(resultData.get("memoryUsage")).append("</td>\n");
                    html.append("<td>").append(resultData.get("batteryDrain")).append("</td>\n");
                    html.append("</tr>\n");
                }
            }
            
            html.append("</table>\n");
            
            // 性能对比图表
            html.append("<h2>性能对比图表</h2>\n");
            html.append("<div class=\"chart\">\n");
            html.append("<canvas id=\"performanceChart\" width=\"400\" height=\"200\"></canvas>\n");
            html.append("</div>\n");
            
            // 图表脚本
            html.append("<script>\n");
            html.append("var ctx = document.getElementById('performanceChart').getContext('2d');\n");
            html.append("var chart = new Chart(ctx, {\n");
            html.append("    type: 'bar',\n");
            html.append("    data: {\n");
            html.append("        labels: ['OpenSLES', 'AudioRecord'],\n");
            html.append("        datasets: [{\n");
            html.append("            label: 'CPU使用率(%)',\n");
            html.append("            data: [15, 12],\n");
            html.append("            backgroundColor: 'rgba(255, 99, 132, 0.2)',\n");
            html.append("            borderColor: 'rgba(255, 99, 132, 1)',\n");
            html.append("            borderWidth: 1\n");
            html.append("        }, {\n");
            html.append("            label: '延迟(ms)',\n");
            html.append("            data: [25, 30],\n");
            html.append("            backgroundColor: 'rgba(54, 162, 235, 0.2)',\n");
            html.append("            borderColor: 'rgba(54, 162, 235, 1)',\n");
            html.append("            borderWidth: 1\n");
            html.append("        }]\n");
            html.append("    },\n");
            html.append("    options: {\n");
            html.append("        responsive: true,\n");
            html.append("        scales: {\n");
            html.append("            y: {\n");
            html.append("                beginAtZero: true\n");
            html.append("            }\n");
            html.append("        }\n");
            html.append("    }\n");
            html.append("});\n");
            html.append("</script>\n");
            
            // 详细测试结果
            html.append("<h2>详细测试结果</h2>\n");
            
            // 音频质量测试结果
            html.append("<h3>音频录制质量测试</h3>\n");
            html.append("<table>\n");
            html.append("<tr><th>API类型</th><th>THD(%)</th><th>SNR(dB)</th><th>动态范围(dB)</th><th>噪声水平(dB)</th></tr>\n");
            
            // 解析音频质量测试结果
            File qualityFile = new File(testResultsDir, "quality_" + getTimestampFromReportPath(reportFile) + ".log");
            if (qualityFile.exists()) {
                List<Map<String, String>> qualityResults = parseQualityTestResults(qualityFile);
                for (Map<String, String> result : qualityResults) {
                    html.append("<tr>\n");
                    html.append("<td>").append(result.get("apiType")).append("</td>\n");
                    html.append("<td>").append(result.get("thd")).append("</td>\n");
                    html.append("<td>").append(result.get("snr")).append("</td>\n");
                    html.append("<td>").append(result.get("dynamicRange")).append("</td>\n");
                    html.append("<td>").append(result.get("noiseLevel")).append("</td>\n");
                    html.append("</tr>\n");
                }
            }
            
            html.append("</table>\n");
            
            // 设备信息
            html.append("<h2>测试设备信息</h2>\n");
            html.append("<table>\n");
            html.append("<tr><th>属性</th><th>值</th></tr>\n");
            
            // 解析设备信息
            File deviceInfoFile = new File(testResultsDir, "device_info_" + getTimestampFromReportPath(reportFile) + ".log");
            if (deviceInfoFile.exists()) {
                Map<String, String> deviceInfo = parseDeviceInfo(deviceInfoFile);
                for (Map.Entry<String, String> entry : deviceInfo.entrySet()) {
                    html.append("<tr>\n");
                    html.append("<td>").append(entry.getKey()).append("</td>\n");
                    html.append("<td>").append(entry.getValue()).append("</td>\n");
                    html.append("</tr>\n");
                }
            }
            
            html.append("</table>\n");
            
            // HTML尾部
            html.append("</body>\n</html>");
            
            // 写入报告文件
            try (FileWriter writer = new FileWriter(reportFile)) {
                writer.write(html.toString());
            }
            
            System.out.println("测试报告已生成: " + reportFile);
            
        } catch (IOException e) {
            System.err.println("生成测试报告失败: " + e.getMessage());
        }
    }
    
    private static Map<String, String> parseTestResultFile(File file) throws IOException {
        Map<String, String> resultData = new HashMap<>();
        
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("API类型:")) {
                    resultData.put("apiType", line.substring(line.indexOf(":") + 1).trim());
                } else if (line.contains("兼容性测试:")) {
                    resultData.put("compatibility", line.contains("PASS") ? "pass" : "fail");
                } else if (line.contains("性能测试:")) {
                    resultData.put("performance", line.contains("PASS") ? "pass" : "fail");
                } else if (line.contains("延迟:")) {
                    resultData.put("latency", line.substring(line.indexOf(":") + 1).replace("ms", "").trim());
                } else if (line.contains("CPU使用率:")) {
                    resultData.put("cpuUsage", line.substring(line.indexOf(":") + 1).replace("%", "").trim());
                } else if (line.contains("内存使用:")) {
                    String memoryStr = line.substring(line.indexOf(":") + 1).replace("bytes", "").trim();
                    long memoryBytes = Long.parseLong(memoryStr);
                    double memoryMB = memoryBytes / (1024.0 * 1024.0);
                    resultData.put("memoryUsage", String.format("%.2f", memoryMB));
                } else if (line.contains("电池消耗:")) {
                    resultData.put("batteryDrain", line.substring(line.indexOf(":") + 1).replace("%/小时", "").trim());
                }
            }
        }
        
        return resultData;
    }
    
    private static List<Map<String, String>> parseQualityTestResults(File file) throws IOException {
        List<Map<String, String>> results = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            Map<String, String> currentResult = null;
            
            while ((line = reader.readLine()) != null) {
                if (line.contains("API类型:")) {
                    if (currentResult != null) {
                        results.add(currentResult);
                    }
                    currentResult = new HashMap<>();
                    currentResult.put("apiType", line.substring(line.indexOf(":") + 1).trim());
                } else if (line.contains("THD:")) {
                    currentResult.put("thd", line.substring(line.indexOf(":") + 1).replace("%", "").trim());
                } else if (line.contains("SNR:")) {
                    currentResult.put("snr", line.substring(line.indexOf(":") + 1).replace("dB", "").trim());
                } else if (line.contains("动态范围:")) {
                    currentResult.put("dynamicRange", line.substring(line.indexOf(":") + 1).replace("dB", "").trim());
                } else if (line.contains("噪声水平:")) {
                    currentResult.put("noiseLevel", line.substring(line.indexOf(":") + 1).replace("dB", "").trim());
                }
            }
            
            if (currentResult != null) {
                results.add(currentResult);
            }
        }
        
        return results;
    }
    
    private static Map<String, String> parseDeviceInfo(File file) throws IOException {
        Map<String, String> deviceInfo = new HashMap<>();
        
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains(":")) {
                    String[] parts = line.split(":", 2);
                    if (parts.length == 2) {
                        deviceInfo.put(parts[0].trim(), parts[1].trim());
                    }
                }
            }
        }
        
        return deviceInfo;
    }
    
    private static String getTimestampFromReportPath(String reportPath) {
        // 从报告路径中提取时间戳
        int startIndex = reportPath.lastIndexOf("_") + 1;
        int endIndex = reportPath.lastIndexOf(".");
        if (startIndex > 0 && endIndex > startIndex) {
            return reportPath.substring(startIndex, endIndex);
        }
        return "";
    }
}
```

## 测试场景覆盖

### 1. 兼容性测试场景

- **Android版本**：Android 5.0-14
- **设备类型**：手机、平板、电视、车载系统
- **音频硬件**：内置麦克风、外接麦克风、蓝牙麦克风
- **音频格式**：8/16/24/32位，8-192kHz采样率，单声道/立体声/多声道
- **特殊场景**：多应用同时录音、通话中录音、低电量录音

### 2. 性能测试场景

- **CPU负载**：空闲/中等/高负载下的录音性能
- **内存压力**：不同内存使用情况下的稳定性
- **电池状态**：不同电量水平下的性能表现
- **网络状态**：在线/离线/弱网环境下的录音
- **长时间测试**：连续录音2小时稳定性

### 3. 异常场景测试

- **权限拒绝**：无录音权限时的行为
- **设备占用**：麦克风被其他应用占用
- **存储不足**：存储空间不足时的处理
- **硬件故障**：麦克风硬件故障时的降级处理
- **系统限制**：系统资源限制下的表现

## 测试数据分析与监控

### 1. 性能基线建立

```java
public class AudioRecordPerformanceBaseline {
    
    // 建立性能基线
    public void establishBaseline() {
        Map<String, PerformanceMetrics> baselineData = new HashMap<>();
        
        // OpenSLES基线
        PerformanceMetrics openSLESBaseline = new PerformanceMetrics();
        openSLESBaseline.maxLatencyMs = 50;
        openSLESBaseline.maxCpuUsagePercent = 20;
        openSLESBaseline.maxMemoryUsageMB = 50;
        openSLESBaseline.maxBatteryDrainPerHour = 8.0;
        openSLESBaseline.minThroughputMBps = 5.0;
        baselineData.put("OpenSLES", openSLESBaseline);
        
        // AudioRecord基线
        PerformanceMetrics audioRecordBaseline = new PerformanceMetrics();
        audioRecordBaseline.maxLatencyMs = 60;
        audioRecordBaseline.maxCpuUsagePercent = 15;
        audioRecordBaseline.maxMemoryUsageMB = 40;
        audioRecordBaseline.maxBatteryDrainPerHour = 6.0;
        audioRecordBaseline.minThroughputMBps = 4.5;
        baselineData.put("AudioRecord", audioRecordBaseline);
        
        // 保存基线数据
        saveBaselineData(baselineData);
    }
    
    // 比较测试结果与基线
    public BaselineComparison compareWithBaseline(String apiType, PerformanceMetrics testResults) {
        PerformanceMetrics baseline = loadBaselineData(apiType);
        BaselineComparison comparison = new BaselineComparison();
        
        comparison.apiType = apiType;
        comparison.latencyPass = testResults.latencyMs <= baseline.maxLatencyMs;
        comparison.cpuUsagePass = testResults.cpuUsagePercent <= baseline.maxCpuUsagePercent;
        comparison.memoryUsagePass = testResults.memoryUsageMB <= baseline.maxMemoryUsageMB;
        comparison.batteryDrainPass = testResults.batteryDrainPerHour <= baseline.maxBatteryDrainPerHour;
        comparison.throughputPass = testResults.throughputMBps >= baseline.minThroughputMBps;
        
        // 计算偏差百分比
        comparison.latencyDeviation = ((double)(testResults.latencyMs - baseline.maxLatencyMs) / baseline.maxLatencyMs) * 100;
        comparison.cpuUsageDeviation = ((double)(testResults.cpuUsagePercent - baseline.maxCpuUsagePercent) / baseline.maxCpuUsagePercent) * 100;
        comparison.memoryUsageDeviation = ((double)(testResults.memoryUsageMB - baseline.maxMemoryUsageMB) / baseline.maxMemoryUsageMB) * 100;
        comparison.batteryDrainDeviation = ((double)(testResults.batteryDrainPerHour - baseline.maxBatteryDrainPerHour) / baseline.maxBatteryDrainPerHour) * 100;
        comparison.throughputDeviation = ((double)(testResults.throughputMBps - baseline.minThroughputMBps) / baseline.minThroughputMBps) * 100;
        
        return comparison;
    }
    
    // 性能指标类
    public static class PerformanceMetrics {
        public long latencyMs;
        public int cpuUsagePercent;
        public double memoryUsageMB;
        public double batteryDrainPerHour;
        public double throughputMBps;
    }
    
    // 基线比较结果
    public static class BaselineComparison {
        public String apiType;
        public boolean latencyPass;
        public boolean cpuUsagePass;
        public boolean memoryUsagePass;
        public boolean batteryDrainPass;
        public boolean throughputPass;
        public double latencyDeviation;
        public double cpuUsageDeviation;
        public double memoryUsageDeviation;
        public double batteryDrainDeviation;
        public double throughputDeviation;
        
        public boolean overallPass() {
            return latencyPass && cpuUsagePass && memoryUsagePass && batteryDrainPass && throughputPass;
        }
    }
    
    private void saveBaselineData(Map<String, PerformanceMetrics> baselineData) {
        // 实现基线数据保存
    }
    
    private PerformanceMetrics loadBaselineData(String apiType) {
        // 实现基线数据加载
        return new PerformanceMetrics();
    }
}
```

### 2. 持续监控与告警

```java
public class AudioRecordMonitor {
    
    // 性能监控阈值
    private static class MonitoringThresholds {
        public static final double LATENCY_WARNING_THRESHOLD = 1.2; // 延迟超过基线20%告警
        public static final double CPU_WARNING_THRESHOLD = 1.3;     // CPU使用超过基线30%告警
        public static final double MEMORY_WARNING_THRESHOLD = 1.4;  // 内存使用超过基线40%告警
        public static final double BATTERY_WARNING_THRESHOLD = 1.5; // 电池消耗超过基线50%告警
        public static final double THROUGHPUT_WARNING_THRESHOLD = 0.8; // 吞吐量低于基线20%告警
    }
    
    // 执行监控检查
    public void performMonitoringCheck() {
        AudioRecordPerformanceBaseline baseline = new AudioRecordPerformanceBaseline();
        
        AndroidAudioRecordTestFramework.AudioRecordAPIType[] apiTypes = {
            AndroidAudioRecordTestFramework.AudioRecordAPIType.OPENSLES,
            AndroidAudioRecordTestFramework.AudioRecordAPIType.AUDIO_RECORD
        };
        
        List<MonitoringAlert> alerts = new ArrayList<>();
        
        for (AndroidAudioRecordTestFramework.AudioRecordAPIType apiType : apiTypes) {
            // 运行性能测试
            AndroidAudioRecordTestFramework.TestConfig config = new AndroidAudioRecordTestFramework.TestConfig();
            config.apiType = apiType;
            config.testPerformance = true;
            
            AndroidAudioRecordTestFramework framework = new AndroidAudioRecordTestFramework();
            AndroidAudioRecordTestFramework.TestResult result = framework.runCompatibilityTest(config);
            
            if (!result.success) {
                alerts.add(new MonitoringAlert(
                    apiType.toString(), 
                    "ERROR", 
                    "性能测试失败: " + result.errorMessage,
                    new Date()
                ));
                continue;
            }
            
            // 与基线比较
            AudioRecordPerformanceBaseline.PerformanceMetrics testMetrics = new AudioRecordPerformanceBaseline.PerformanceMetrics();
            testMetrics.latencyMs = result.latencyMs;
            testMetrics.cpuUsagePercent = result.cpuUsagePercent;
            testMetrics.memoryUsageMB = result.memoryUsageBytes / (1024.0 * 1024.0);
            testMetrics.batteryDrainPerHour = (double) result.metrics.get("batteryDrainPercentPerHour");
            testMetrics.throughputMBps = (double) result.metrics.get("throughputMBps");
            
            AudioRecordPerformanceBaseline.BaselineComparison comparison = baseline.compareWithBaseline(apiType.toString(), testMetrics);
            
            // 检查告警条件
            if (!comparison.latencyPass) {
                alerts.add(new MonitoringAlert(
                    apiType.toString(), 
                    "WARNING", 
                    String.format("延迟超过基线: %.1f%%", comparison.latencyDeviation),
                    new Date()
                ));
            }
            
            if (!comparison.cpuUsagePass) {
                alerts.add(new MonitoringAlert(
                    apiType.toString(), 
                    "WARNING", 
                    String.format("CPU使用率超过基线: %.1f%%", comparison.cpuUsageDeviation),
                    new Date()
                ));
            }
            
            if (!comparison.memoryUsagePass) {
                alerts.add(new MonitoringAlert(
                    apiType.toString(), 
                    "WARNING", 
                    String.format("内存使用超过基线: %.1f%%", comparison.memoryUsageDeviation),
                    new Date()
                ));
            }
            
            if (!comparison.batteryDrainPass) {
                alerts.add(new MonitoringAlert(
                    apiType.toString(), 
                    "WARNING", 
                    String.format("电池消耗超过基线: %.1f%%", comparison.batteryDrainDeviation),
                    new Date()
                ));
            }
            
            if (!comparison.throughputPass) {
                alerts.add(new MonitoringAlert(
                    apiType.toString(), 
                    "WARNING", 
                    String.format("吞吐量低于基线: %.1f%%", comparison.throughputDeviation),
                    new Date()
                ));
            }
        }
        
        // 发送告警
        if (!alerts.isEmpty()) {
            sendAlerts(alerts);
        }
    }
    
    // 发送告警
    private void sendAlerts(List<MonitoringAlert> alerts) {
        for (MonitoringAlert alert : alerts) {
            Log.w("AudioRecordMonitor", 
                String.format("[%s] %s: %s", alert.severity, alert.apiType, alert.message));
            
            // 可以集成邮件、短信或其他通知系统
            // EmailNotification.send(alert);
            // SlackNotification.send(alert);
        }
    }
    
    // 监控告警类
    private static class MonitoringAlert {
        String apiType;
        String severity; // INFO, WARNING, ERROR
        String message;
        Date timestamp;
        
        MonitoringAlert(String apiType, String severity, String message, Date timestamp) {
            this.apiType = apiType;
            this.severity = severity;
            this.message = message;
            this.timestamp = timestamp;
        }
    }
}
```

## 故障排除指南

### 1. 常见问题及解决方案

| 问题 | 可能原因 | 测试验证方法 | 解决方案 |
|------|----------|--------------|----------|
| OpenSLES初始化失败 | 设备不支持OpenSLES | 检查设备是否支持OpenSLES API | 降级使用AudioRecord API |
| AudioRecord权限被拒绝 | 未获取录音权限 | 检查应用权限设置 | 动态请求录音权限 |
| 录制音频无声音 | 麦克风被占用或静音 | 检查其他应用是否使用麦克风 | 关闭其他应用或使用不同音频源 |
| 录制音频质量差 | 麦克风硬件问题 | 测试不同麦克风设备 | 使用外接麦克风或更换设备 |
| 录制过程中断 | 系统资源不足 | 监录系统资源使用情况 | 优化内存使用或降低录制质量 |

### 2. 调试工具与技术

```java
public class AudioRecordDebugTools {
    
    // 音频录制API调试信息收集
    public void collectDebugInfo(AndroidAudioRecordTestFramework.AudioRecordAPIType apiType) {
        Log.d("AudioRecordDebug", "收集音频录制API调试信息: " + apiType);
        
        // 1. 系统信息
        collectSystemInfo();
        
        // 2. 音频设备信息
        collectAudioDeviceInfo(apiType);
        
        // 3. 权限信息
        collectPermissionInfo();
        
        // 4. 音频配置信息
        collectAudioConfigInfo();
        
        // 5. 进程信息
        collectProcessInfo();
    }
    
    private void collectSystemInfo() {
        Log.d("AudioRecordDebug", "=== 系统信息 ===");
        Log.d("AudioRecordDebug", "Android版本: " + Build.VERSION.RELEASE);
        Log.d("AudioRecordDebug", "SDK版本: " + Build.VERSION.SDK_INT);
        Log.d("AudioRecordDebug", "设备型号: " + Build.MODEL);
        Log.d("AudioRecordDebug", "制造商: " + Build.MANUFACTURER);
        Log.d("AudioRecordDebug", "可用处理器: " + Runtime.getRuntime().availableProcessors());
        Log.d("AudioRecordDebug", "最大内存: " + Runtime.getRuntime().maxMemory() / (1024 * 1024) + "MB");
    }
    
    private void collectAudioDeviceInfo(AndroidAudioRecordTestFramework.AudioRecordAPIType apiType) {
        Log.d("AudioRecordDebug", "=== 音频设备信息 (" + apiType + ") ===");
        
        // 获取音频管理器
        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        
        // 获取音频硬件信息
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            AudioDeviceInfo[] devices = audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS);
            for (AudioDeviceInfo device : devices) {
                Log.d("AudioRecordDebug", "设备ID: " + device.getId());
                Log.d("AudioRecordDebug", "设备名称: " + device.getProductName());
                Log.d("AudioRecordDebug", "设备类型: " + device.getType());
                Log.d("AudioRecordDebug", "支持通道数: " + device.getChannelCounts().length);
                Log.d("AudioRecordDebug", "支持采样率: " + Arrays.toString(device.getSampleRates()));
                Log.d("AudioRecordDebug", "---");
            }
        }
    }
    
    private void collectPermissionInfo() {
        Log.d("AudioRecordDebug", "=== 权限信息 ===");
        
        // 检查录音权限
        boolean hasRecordPermission = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) 
            == PackageManager.PERMISSION_GRANTED;
        Log.d("AudioRecordDebug", "录音权限: " + (hasRecordPermission ? "已授权" : "未授权"));
        
        // 检查修改音频设置权限
        boolean hasModifyAudioSettingsPermission = ContextCompat.checkSelfPermission(context, Manifest.permission.MODIFY_AUDIO_SETTINGS) 
            == PackageManager.PERMISSION_GRANTED;
        Log.d("AudioRecordDebug", "修改音频设置权限: " + (hasModifyAudioSettingsPermission ? "已授权" : "未授权"));
    }
    
    private void collectAudioConfigInfo() {
        Log.d("AudioRecordDebug", "=== 音频配置信息 ===");
        
        // 获取音频管理器
        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        
        // 获取当前音频模式
        int mode = audioManager.getMode();
        String modeStr;
        switch (mode) {
            case AudioManager.MODE_NORMAL: modeStr = "NORMAL"; break;
            case AudioManager.MODE_RINGTONE: modeStr = "RINGTONE"; break;
            case AudioManager.MODE_IN_CALL: modeStr = "IN_CALL"; break;
            case AudioManager.MODE_IN_COMMUNICATION: modeStr = "IN_COMMUNICATION"; break;
            default: modeStr = "UNKNOWN"; break;
        }
        Log.d("AudioRecordDebug", "音频模式: " + modeStr);
        
        // 获取当前音频源
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            int activeRecorder = audioManager.getActiveRecorderConfiguration();
            Log.d("AudioRecordDebug", "活动录音配置: " + activeRecorder);
        }
        
        // 获取支持的音频格式
        int[] sampleRates = {8000, 11025, 16000, 22050, 44100, 48000};
        int[] channelConfigs = {
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.CHANNEL_IN_STEREO,
            AudioFormat.CHANNEL_IN_FRONT_BACK
        };
        int[] audioEncodings = {
            AudioFormat.ENCODING_PCM_8BIT,
            AudioFormat.ENCODING_PCM_16BIT,
            AudioFormat.ENCODING_PCM_24BIT_PACKED,
            AudioFormat.ENCODING_PCM_32BIT
        };
        
        Log.d("AudioRecordDebug", "支持的音频格式:");
        for (int sampleRate : sampleRates) {
            for (int channelConfig : channelConfigs) {
                for (int audioEncoding : audioEncodings) {
                    int minBufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioEncoding);
                    boolean supported = (minBufferSize != AudioRecord.ERROR_BAD_VALUE && 
                                       minBufferSize != AudioRecord.ERROR);
                    
                    if (supported) {
                        Log.d("AudioRecordDebug", String.format("  %dHz, %s, %s - 支持", 
                            sampleRate, channelConfigToString(channelConfig), audioEncodingToString(audioEncoding)));
                    }
                }
            }
        }
    }
    
    private void collectProcessInfo() {
        Log.d("AudioRecordDebug", "=== 进程信息 ===");
        
        // 获取当前进程信息
        ActivityManager am = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> processes = am.getRunningAppProcesses();
        
        for (ActivityManager.RunningAppProcessInfo process : processes) {
            if (process.pid == android.os.Process.myPid()) {
                Log.d("AudioRecordDebug", "当前进程ID: " + process.pid);
                Log.d("AudioRecordDebug", "进程名: " + process.processName);
                Log.d("AudioRecordDebug", "重要性: " + process.importance);
                Log.d("AudioRecordDebug", "内存使用: " + 
                    (am.getProcessMemoryInfo(new int[]{process.pid})[0].getTotalPss() / 1024) + "MB");
                break;
            }
        }
        
        // 检查可能冲突的音频进程
        String[] conflictingPackages = {"com.spotify.music", "com.google.android.youtube", 
                                     "com.netflix.mediaclient", "com.facebook.katana"};
        
        for (String packageName : conflictingPackages) {
            boolean isRunning = false;
            for (ActivityManager.RunningAppProcessInfo process : processes) {
                if (process.processName.equals(packageName)) {
                    isRunning = true;
                    break;
                }
            }
            Log.d("AudioRecordDebug", packageName + " 运行中: " + isRunning);
        }
    }
    
    // 辅助方法
    private String channelConfigToString(int channelConfig) {
        switch (channelConfig) {
            case AudioFormat.CHANNEL_IN_MONO: return "MONO";
            case AudioFormat.CHANNEL_IN_STEREO: return "STEREO";
            case AudioFormat.CHANNEL_IN_FRONT_BACK: return "FRONT_BACK";
            default: return "UNKNOWN";
        }
    }
    
    private String audioEncodingToString(int audioEncoding) {
        switch (audioEncoding) {
            case AudioFormat.ENCODING_PCM_8BIT: return "PCM_8BIT";
            case AudioFormat.ENCODING_PCM_16BIT: return "PCM_16BIT";
            case AudioFormat.ENCODING_PCM_24BIT_PACKED: return "PCM_24BIT";
            case AudioFormat.ENCODING_PCM_32BIT: return "PCM_32BIT";
            default: return "UNKNOWN";
        }
    }
}
```

通过以上测试开发技术，可以全面验证OpenSLES和AudioRecord音频录制API的兼容性、性能和稳定性，确保音频录制功能在各种Android设备和环境下正常工作。