# DirectSound、WaveOut 和 WASAPI 测试开发技术

## 概述

DirectSound、WaveOut 和 WASAPI 是 Windows 平台上三种主要的音频输出 API，作为测试开发工程师，需要掌握它们的测试方法、性能分析和兼容性验证技术。

## 测试框架设计

### 1. 音频API兼容性测试框架

```java
public class WindowsAudioAPITestFramework {
    private static final String TAG = "WindowsAudioAPITest";
    
    // 音频API类型
    public enum AudioAPIType {
        DIRECT_SOUND,
        WAVE_OUT,
        WASAPI
    }
    
    // 测试配置
    public static class TestConfig {
        public AudioAPIType apiType;
        public int sampleRate = 44100;
        public int channels = 2;
        public int bitDepth = 16;
        public int bufferSize = 4096;
        public boolean testLatency = true;
        public boolean testMultiChannel = true;
        public boolean testDeviceSwitch = true;
        public boolean testPerformance = true;
    }
    
    // 测试结果
    public static class TestResult {
        public boolean success;
        public String errorMessage;
        public long latencyMs;
        public int cpuUsagePercent;
        public long memoryUsageBytes;
        public Map<String, Object> metrics;
    }
    
    // 执行兼容性测试
    public TestResult runCompatibilityTest(TestConfig config) {
        TestResult result = new TestResult();
        Map<String, Object> metrics = new HashMap<>();
        
        try {
            Log.d(TAG, "开始测试音频API: " + config.apiType);
            
            // 1. 初始化测试
            boolean initSuccess = initializeAudioAPI(config.apiType);
            if (!initSuccess) {
                result.success = false;
                result.errorMessage = "音频API初始化失败";
                return result;
            }
            
            // 2. 设备枚举测试
            List<AudioDevice> devices = enumerateAudioDevices(config.apiType);
            metrics.put("deviceCount", devices.size());
            
            // 3. 音频格式支持测试
            boolean formatSupported = testAudioFormatSupport(config);
            metrics.put("formatSupported", formatSupported);
            
            // 4. 延迟测试
            if (config.testLatency) {
                long latency = measureLatency(config);
                metrics.put("latencyMs", latency);
                result.latencyMs = latency;
            }
            
            // 5. 多通道测试
            if (config.testMultiChannel) {
                boolean multiChannelSupport = testMultiChannelSupport(config);
                metrics.put("multiChannelSupport", multiChannelSupport);
            }
            
            // 6. 设备切换测试
            if (config.testDeviceSwitch) {
                boolean deviceSwitchSupport = testDeviceSwitching(config);
                metrics.put("deviceSwitchSupport", deviceSwitchSupport);
            }
            
            // 7. 性能测试
            if (config.testPerformance) {
                Map<String, Object> perfMetrics = measurePerformance(config);
                metrics.putAll(perfMetrics);
                result.cpuUsagePercent = (int) perfMetrics.get("cpuUsagePercent");
                result.memoryUsageBytes = (long) perfMetrics.get("memoryUsageBytes");
            }
            
            result.success = true;
            result.metrics = metrics;
            
        } catch (Exception e) {
            Log.e(TAG, "音频API测试失败", e);
            result.success = false;
            result.errorMessage = e.getMessage();
        } finally {
            cleanupAudioAPI(config.apiType);
        }
        
        return result;
    }
    
    // 初始化音频API
    private boolean initializeAudioAPI(AudioAPIType apiType) {
        switch (apiType) {
            case DIRECT_SOUND:
                return initializeDirectSound();
            case WAVE_OUT:
                return initializeWaveOut();
            case WASAPI:
                return initializeWASAPI();
            default:
                return false;
        }
    }
    
    // 初始化DirectSound
    private boolean initializeDirectSound() {
        try {
            // DirectSound初始化代码
            Log.d(TAG, "初始化DirectSound");
            // 实际实现...
            return true;
        } catch (Exception e) {
            Log.e(TAG, "DirectSound初始化失败", e);
            return false;
        }
    }
    
    // 初始化WaveOut
    private boolean initializeWaveOut() {
        try {
            // WaveOut初始化代码
            Log.d(TAG, "初始化WaveOut");
            // 实际实现...
            return true;
        } catch (Exception e) {
            Log.e(TAG, "WaveOut初始化失败", e);
            return false;
        }
    }
    
    // 初始化WASAPI
    private boolean initializeWASAPI() {
        try {
            // WASAPI初始化代码
            Log.d(TAG, "初始化WASAPI");
            // 实际实现...
            return true;
        } catch (Exception e) {
            Log.e(TAG, "WASAPI初始化失败", e);
            return false;
        }
    }
    
    // 枚举音频设备
    private List<AudioDevice> enumerateAudioDevices(AudioAPIType apiType) {
        List<AudioDevice> devices = new ArrayList<>();
        
        try {
            switch (apiType) {
                case DIRECT_SOUND:
                    devices = enumerateDirectSoundDevices();
                    break;
                case WAVE_OUT:
                    devices = enumerateWaveOutDevices();
                    break;
                case WASAPI:
                    devices = enumerateWASAPIDevices();
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "枚举音频设备失败", e);
        }
        
        return devices;
    }
    
    // 测试音频格式支持
    private boolean testAudioFormatSupport(TestConfig config) {
        try {
            // 测试指定格式是否支持
            Log.d(TAG, "测试音频格式支持: " + config.sampleRate + "Hz, " + 
                  config.channels + "ch, " + config.bitDepth + "bit");
            
            // 实际实现...
            return true;
        } catch (Exception e) {
            Log.e(TAG, "测试音频格式支持失败", e);
            return false;
        }
    }
    
    // 测量延迟
    private long measureLatency(TestConfig config) {
        try {
            Log.d(TAG, "测量音频延迟");
            
            // 实际实现...
            return 50; // 示例值，实际需要测量
        } catch (Exception e) {
            Log.e(TAG, "测量延迟失败", e);
            return -1;
        }
    }
    
    // 测试多通道支持
    private boolean testMultiChannelSupport(TestConfig config) {
        try {
            Log.d(TAG, "测试多通道支持");
            
            // 实际实现...
            return true;
        } catch (Exception e) {
            Log.e(TAG, "测试多通道支持失败", e);
            return false;
        }
    }
    
    // 测试设备切换
    private boolean testDeviceSwitching(TestConfig config) {
        try {
            Log.d(TAG, "测试设备切换");
            
            // 实际实现...
            return true;
        } catch (Exception e) {
            Log.e(TAG, "测试设备切换失败", e);
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
            
        } catch (Exception e) {
            Log.e(TAG, "性能测量失败", e);
        }
        
        return metrics;
    }
    
    // 清理音频API
    private void cleanupAudioAPI(AudioAPIType apiType) {
        try {
            switch (apiType) {
                case DIRECT_SOUND:
                    cleanupDirectSound();
                    break;
                case WAVE_OUT:
                    cleanupWaveOut();
                    break;
                case WASAPI:
                    cleanupWASAPI();
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "清理音频API失败", e);
        }
    }
    
    // 辅助方法（实际实现需要补充）
    private List<AudioDevice> enumerateDirectSoundDevices() { return new ArrayList<>(); }
    private List<AudioDevice> enumerateWaveOutDevices() { return new ArrayList<>(); }
    private List<AudioDevice> enumerateWASAPIDevices() { return new ArrayList<>(); }
    private int measureCPUUsage() { return 0; }
    private long measureMemoryUsage() { return 0; }
    private double measureThroughput(TestConfig config) { return 0.0; }
    private void cleanupDirectSound() {}
    private void cleanupWaveOut() {}
    private void cleanupWASAPI() {}
}
```

### 2. 音频质量测试工具

```java
public class AudioQualityTester {
    private static final String TAG = "AudioQualityTester";
    
    // 音频质量测试参数
    public static class QualityTestParams {
        public int testDurationSeconds = 10;
        public int sampleRate = 44100;
        public int channels = 2;
        public int bitDepth = 16;
        public String referenceAudioFile;
        public String testAudioFile;
        public boolean testTHD = true;        // 总谐波失真
        public boolean testSNR = true;        // 信噪比
        public boolean testFrequencyResponse = true; // 频率响应
        public boolean testDynamicRange = true; // 动态范围
        public boolean testCrosstalk = true;  // 串音
    }
    
    // 音频质量测试结果
    public static class QualityTestResult {
        public boolean success;
        public String errorMessage;
        public double thdPercent;             // 总谐波失真百分比
        public double snrDb;                  // 信噪比(dB)
        public Map<Integer, Double> frequencyResponse; // 频率响应
        public double dynamicRangeDb;         // 动态范围(dB)
        public double crosstalkDb;            // 串音(dB)
        public double similarityPercent;      // 与参考音频相似度
    }
    
    // 执行音频质量测试
    public QualityTestResult runQualityTest(QualityTestParams params, WindowsAudioAPITestFramework.AudioAPIType apiType) {
        QualityTestResult result = new QualityTestResult();
        
        try {
            Log.d(TAG, "开始音频质量测试，API类型: " + apiType);
            
            // 1. 生成测试音频
            byte[] testAudioData = generateTestAudio(params);
            
            // 2. 播放并录制音频
            byte[] recordedAudio = playAndRecordAudio(testAudioData, params, apiType);
            
            // 3. 分析音频质量
            if (params.testTHD) {
                result.thdPercent = calculateTHD(recordedAudio, params);
            }
            
            if (params.testSNR) {
                result.snrDb = calculateSNR(recordedAudio, params);
            }
            
            if (params.testFrequencyResponse) {
                result.frequencyResponse = calculateFrequencyResponse(recordedAudio, params);
            }
            
            if (params.testDynamicRange) {
                result.dynamicRangeDb = calculateDynamicRange(recordedAudio, params);
            }
            
            if (params.testCrosstalk) {
                result.crosstalkDb = calculateCrosstalk(recordedAudio, params);
            }
            
            // 4. 与参考音频比较
            if (params.referenceAudioFile != null) {
                result.similarityPercent = calculateSimilarity(recordedAudio, params.referenceAudioFile);
            }
            
            result.success = true;
            
        } catch (Exception e) {
            Log.e(TAG, "音频质量测试失败", e);
            result.success = false;
            result.errorMessage = e.getMessage();
        }
        
        return result;
    }
    
    // 生成测试音频
    private byte[] generateTestAudio(QualityTestParams params) {
        int samplesPerChannel = params.sampleRate * params.testDurationSeconds;
        int totalSamples = samplesPerChannel * params.channels;
        int bytesPerSample = params.bitDepth / 8;
        byte[] audioData = new byte[totalSamples * bytesPerSample];
        
        // 生成多频正弦波测试信号
        double[] frequencies = {100, 1000, 10000}; // 低频、中频、高频
        
        for (int i = 0; i < samplesPerChannel; i++) {
            double sampleValue = 0;
            
            // 合成多个频率
            for (double freq : frequencies) {
                sampleValue += Math.sin(2 * Math.PI * freq * i / params.sampleRate) / frequencies.length;
            }
            
            // 转换为指定位深
            int intValue = (int) (sampleValue * Math.pow(2, params.bitDepth - 1));
            
            // 写入所有通道
            for (int ch = 0; ch < params.channels; ch++) {
                int index = (i * params.channels + ch) * bytesPerSample;
                
                if (bytesPerSample == 2) { // 16位
                    audioData[index] = (byte) (intValue & 0xFF);
                    audioData[index + 1] = (byte) ((intValue >> 8) & 0xFF);
                } else if (bytesPerSample == 3) { // 24位
                    audioData[index] = (byte) (intValue & 0xFF);
                    audioData[index + 1] = (byte) ((intValue >> 8) & 0xFF);
                    audioData[index + 2] = (byte) ((intValue >> 16) & 0xFF);
                }
            }
        }
        
        return audioData;
    }
    
    // 播放并录制音频
    private byte[] playAndRecordAudio(byte[] audioData, QualityTestParams params, 
                                     WindowsAudioAPITestFramework.AudioAPIType apiType) {
        // 实际实现需要使用指定API播放音频并同时录制
        // 这里返回模拟数据
        return audioData;
    }
    
    // 计算总谐波失真(THD)
    private double calculateTHD(byte[] audioData, QualityTestParams params) {
        // 实际实现需要FFT分析
        return 0.01; // 示例值，表示0.01%的THD
    }
    
    // 计算信噪比(SNR)
    private double calculateSNR(byte[] audioData, QualityTestParams params) {
        // 实际实现需要信号和噪声功率计算
        return 90.0; // 示例值，表示90dB的SNR
    }
    
    // 计算频率响应
    private Map<Integer, Double> calculateFrequencyResponse(byte[] audioData, QualityTestParams params) {
        Map<Integer, Double> frequencyResponse = new HashMap<>();
        
        // 测试多个频率点的响应
        int[] testFrequencies = {20, 100, 1000, 10000, 20000};
        
        for (int freq : testFrequencies) {
            // 实际实现需要FFT分析
            frequencyResponse.put(freq, 0.0); // 示例值，表示0dB的响应
        }
        
        return frequencyResponse;
    }
    
    // 计算动态范围
    private double calculateDynamicRange(byte[] audioData, QualityTestParams params) {
        // 实际实现需要最大和最小信号电平计算
        return 100.0; // 示例值，表示100dB的动态范围
    }
    
    // 计算串音
    private double calculateCrosstalk(byte[] audioData, QualityTestParams params) {
        // 实际实现需要通道间隔离度测量
        return -80.0; // 示例值，表示-80dB的串音
    }
    
    // 计算与参考音频的相似度
    private double calculateSimilarity(byte[] audioData, String referenceAudioFile) {
        // 实际实现需要相关系数计算
        return 99.5; // 示例值，表示99.5%的相似度
    }
}
```

## 测试用例设计

### 1. API兼容性测试用例

```java
public class AudioAPICompatibilityTestCases {
    
    // 测试DirectSound API兼容性
    @Test
    public void testDirectSoundCompatibility() {
        WindowsAudioAPITestFramework.TestConfig config = new WindowsAudioAPITestFramework.TestConfig();
        config.apiType = WindowsAudioAPITestFramework.AudioAPIType.DIRECT_SOUND;
        config.sampleRate = 44100;
        config.channels = 2;
        config.bitDepth = 16;
        
        WindowsAudioAPITestFramework framework = new WindowsAudioAPITestFramework();
        WindowsAudioAPITestFramework.TestResult result = framework.runCompatibilityTest(config);
        
        assertTrue("DirectSound API兼容性测试失败", result.success);
        assertNotNull("设备列表不应为空", result.metrics.get("deviceCount"));
        assertTrue("音频格式应支持", (boolean) result.metrics.get("formatSupported"));
        assertTrue("延迟应小于200ms", result.latencyMs < 200);
    }
    
    // 测试WaveOut API兼容性
    @Test
    public void testWaveOutCompatibility() {
        WindowsAudioAPITestFramework.TestConfig config = new WindowsAudioAPITestFramework.TestConfig();
        config.apiType = WindowsAudioAPITestFramework.AudioAPIType.WAVE_OUT;
        config.sampleRate = 44100;
        config.channels = 2;
        config.bitDepth = 16;
        
        WindowsAudioAPITestFramework framework = new WindowsAudioAPITestFramework();
        WindowsAudioAPITestFramework.TestResult result = framework.runCompatibilityTest(config);
        
        assertTrue("WaveOut API兼容性测试失败", result.success);
        assertNotNull("设备列表不应为空", result.metrics.get("deviceCount"));
        assertTrue("音频格式应支持", (boolean) result.metrics.get("formatSupported"));
    }
    
    // 测试WASAPI API兼容性
    @Test
    public void testWASAPICompatibility() {
        WindowsAudioAPITestFramework.TestConfig config = new WindowsAudioAPITestFramework.TestConfig();
        config.apiType = WindowsAudioAPITestFramework.AudioAPIType.WASAPI;
        config.sampleRate = 44100;
        config.channels = 2;
        config.bitDepth = 16;
        
        WindowsAudioAPITestFramework framework = new WindowsAudioAPITestFramework();
        WindowsAudioAPITestFramework.TestResult result = framework.runCompatibilityTest(config);
        
        assertTrue("WASAPI API兼容性测试失败", result.success);
        assertNotNull("设备列表不应为空", result.metrics.get("deviceCount"));
        assertTrue("音频格式应支持", (boolean) result.metrics.get("formatSupported"));
        assertTrue("多通道应支持", (boolean) result.metrics.get("multiChannelSupport"));
        assertTrue("设备切换应支持", (boolean) result.metrics.get("deviceSwitchSupport"));
    }
    
    // 测试多格式支持
    @Test
    public void testMultiFormatSupport() {
        WindowsAudioAPITestFramework.AudioAPIType[] apiTypes = {
            WindowsAudioAPITestFramework.AudioAPIType.DIRECT_SOUND,
            WindowsAudioAPITestFramework.AudioAPIType.WAVE_OUT,
            WindowsAudioAPITestFramework.AudioAPIType.WASAPI
        };
        
        int[] sampleRates = {8000, 16000, 22050, 44100, 48000, 96000, 192000};
        int[] channels = {1, 2, 6, 8};
        int[] bitDepths = {16, 24, 32};
        
        WindowsAudioAPITestFramework framework = new WindowsAudioAPITestFramework();
        
        for (WindowsAudioAPITestFramework.AudioAPIType apiType : apiTypes) {
            for (int sampleRate : sampleRates) {
                for (int channel : channels) {
                    for (int bitDepth : bitDepths) {
                        WindowsAudioAPITestFramework.TestConfig config = new WindowsAudioAPITestFramework.TestConfig();
                        config.apiType = apiType;
                        config.sampleRate = sampleRate;
                        config.channels = channel;
                        config.bitDepth = bitDepth;
                        
                        WindowsAudioAPITestFramework.TestResult result = framework.runCompatibilityTest(config);
                        
                        // 记录测试结果
                        Log.d("MultiFormatTest", String.format("API: %s, %dHz, %dch, %dbit - %s", 
                            apiType, sampleRate, channel, bitDepth, 
                            result.success ? "PASS" : "FAIL"));
                    }
                }
            }
        }
    }
}
```

### 2. 性能测试用例

```java
public class AudioAPIPerformanceTestCases {
    
    // 测试CPU使用率
    @Test
    public void testCPUUsage() {
        WindowsAudioAPITestFramework.AudioAPIType[] apiTypes = {
            WindowsAudioAPITestFramework.AudioAPIType.DIRECT_SOUND,
            WindowsAudioAPITestFramework.AudioAPIType.WAVE_OUT,
            WindowsAudioAPITestFramework.AudioAPIType.WASAPI
        };
        
        for (WindowsAudioAPITestFramework.AudioAPIType apiType : apiTypes) {
            WindowsAudioAPITestFramework.TestConfig config = new WindowsAudioAPITestFramework.TestConfig();
            config.apiType = apiType;
            config.testPerformance = true;
            
            WindowsAudioAPITestFramework framework = new WindowsAudioAPITestFramework();
            WindowsAudioAPITestFramework.TestResult result = framework.runCompatibilityTest(config);
            
            assertTrue("性能测试失败: " + apiType, result.success);
            assertTrue("CPU使用率过高: " + apiType + " - " + result.cpuUsagePercent + "%", 
                      result.cpuUsagePercent < 20);
            
            Log.d("CPUUsageTest", apiType + " CPU使用率: " + result.cpuUsagePercent + "%");
        }
    }
    
    // 测试内存使用
    @Test
    public void testMemoryUsage() {
        WindowsAudioAPITestFramework.AudioAPIType[] apiTypes = {
            WindowsAudioAPITestFramework.AudioAPIType.DIRECT_SOUND,
            WindowsAudioAPITestFramework.AudioAPIType.WAVE_OUT,
            WindowsAudioAPITestFramework.AudioAPIType.WASAPI
        };
        
        for (WindowsAudioAPITestFramework.AudioAPIType apiType : apiTypes) {
            WindowsAudioAPITestFramework.TestConfig config = new WindowsAudioAPITestFramework.TestConfig();
            config.apiType = apiType;
            config.testPerformance = true;
            
            WindowsAudioAPITestFramework framework = new WindowsAudioAPITestFramework();
            WindowsAudioAPITestFramework.TestResult result = framework.runCompatibilityTest(config);
            
            assertTrue("性能测试失败: " + apiType, result.success);
            assertTrue("内存使用过高: " + apiType + " - " + result.memoryUsageBytes + " bytes", 
                      result.memoryUsageBytes < 50 * 1024 * 1024); // 小于50MB
            
            Log.d("MemoryUsageTest", apiType + " 内存使用: " + result.memoryUsageBytes + " bytes");
        }
    }
    
    // 测试延迟
    @Test
    public void testLatency() {
        WindowsAudioAPITestFramework.AudioAPIType[] apiTypes = {
            WindowsAudioAPITestFramework.AudioAPIType.DIRECT_SOUND,
            WindowsAudioAPITestFramework.AudioAPIType.WAVE_OUT,
            WindowsAudioAPITestFramework.AudioAPIType.WASAPI
        };
        
        for (WindowsAudioAPITestFramework.AudioAPIType apiType : apiTypes) {
            WindowsAudioAPITestFramework.TestConfig config = new WindowsAudioAPITestFramework.TestConfig();
            config.apiType = apiType;
            config.testLatency = true;
            
            WindowsAudioAPITestFramework framework = new WindowsAudioAPITestFramework();
            WindowsAudioAPITestFramework.TestResult result = framework.runCompatibilityTest(config);
            
            assertTrue("延迟测试失败: " + apiType, result.success);
            
            // WASAPI通常延迟最低
            if (apiType == WindowsAudioAPITestFramework.AudioAPIType.WASAPI) {
                assertTrue("WASAPI延迟应小于50ms: " + result.latencyMs + "ms", result.latencyMs < 50);
            } else {
                assertTrue("延迟应小于200ms: " + apiType + " - " + result.latencyMs + "ms", 
                          result.latencyMs < 200);
            }
            
            Log.d("LatencyTest", apiType + " 延迟: " + result.latencyMs + "ms");
        }
    }
}
```

## 自动化测试流程

### 1. 持续集成测试脚本

```batch
@echo off
echo 开始Windows音频API自动化测试...

REM 设置测试环境变量
set TEST_RESULTS_DIR=.\test_results
set TEST_REPORT_DIR=.\test_reports
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

REM 创建结果目录
if not exist %TEST_RESULTS_DIR% mkdir %TEST_RESULTS_DIR%
if not exist %TEST_REPORT_DIR% mkdir %TEST_REPORT_DIR%

REM 运行DirectSound测试
echo 运行DirectSound兼容性测试...
java -cp ".;lib/*" com.test.audio.WindowsAudioAPITestRunner DirectSound > %TEST_RESULTS_DIR%\directsound_%TIMESTAMP%.log

REM 运行WaveOut测试
echo 运行WaveOut兼容性测试...
java -cp ".;lib/*" com.test.audio.WindowsAudioAPITestRunner WaveOut > %TEST_RESULTS_DIR%\waveout_%TIMESTAMP%.log

REM 运行WASAPI测试
echo 运行WASAPI兼容性测试...
java -cp ".;lib/*" com.test.audio.WindowsAudioAPITestRunner WASAPI > %TEST_RESULTS_DIR%\wasapi_%TIMESTAMP%.log

REM 运行性能测试
echo 运行性能测试...
java -cp ".;lib/*" com.test.audio.AudioAPIPerformanceTestRunner > %TEST_RESULTS_DIR%\performance_%TIMESTAMP%.log

REM 运行音频质量测试
echo 运行音频质量测试...
java -cp ".;lib/*" com.test.audio.AudioQualityTestRunner > %TEST_RESULTS_DIR%\quality_%TIMESTAMP%.log

REM 生成测试报告
echo 生成测试报告...
java -cp ".;lib/*" com.test.report.TestReportGenerator %TEST_RESULTS_DIR% %TEST_REPORT_DIR%\audio_test_report_%TIMESTAMP%.html

echo 测试完成，报告已生成: %TEST_REPORT_DIR%\audio_test_report_%TIMESTAMP%.html
```

### 2. 测试报告生成器

```java
public class AudioAPITestReportGenerator {
    
    public static void generateReport(String testResultsDir, String reportFile) {
        try {
            StringBuilder html = new StringBuilder();
            
            // HTML头部
            html.append("<!DOCTYPE html>\n");
            html.append("<html>\n<head>\n");
            html.append("<title>Windows音频API测试报告</title>\n");
            html.append("<style>\n");
            html.append("body { font-family: Arial, sans-serif; margin: 20px; }\n");
            html.append("table { border-collapse: collapse; width: 100%; }\n");
            html.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n");
            html.append("th { background-color: #f2f2f2; }\n");
            html.append(".pass { color: green; }\n");
            html.append(".fail { color: red; }\n");
            html.append("</style>\n");
            html.append("</head>\n<body>\n");
            
            // 报告标题
            html.append("<h1>Windows音频API测试报告</h1>\n");
            html.append("<p>生成时间: ").append(new Date()).append("</p>\n");
            
            // 测试结果汇总
            html.append("<h2>测试结果汇总</h2>\n");
            html.append("<table>\n");
            html.append("<tr><th>API类型</th><th>兼容性测试</th><th>性能测试</th><th>延迟(ms)</th><th>CPU使用率(%)</th><th>内存使用(MB)</th></tr>\n");
            
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
                    html.append("</tr>\n");
                }
            }
            
            html.append("</table>\n");
            
            // 详细测试结果
            html.append("<h2>详细测试结果</h2>\n");
            
            // 音频质量测试结果
            html.append("<h3>音频质量测试</h3>\n");
            html.append("<table>\n");
            html.append("<tr><th>API类型</th><th>THD(%)</th><th>SNR(dB)</th><th>动态范围(dB)</th><th>串音(dB)</th></tr>\n");
            
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
                    html.append("<td>").append(result.get("crosstalk")).append("</td>\n");
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
                } else if (line.contains("串音:")) {
                    currentResult.put("crosstalk", line.substring(line.indexOf(":") + 1).replace("dB", "").trim());
                }
            }
            
            if (currentResult != null) {
                results.add(currentResult);
            }
        }
        
        return results;
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

- **操作系统版本**：Windows 7/8/10/11
- **音频设备类型**：内置声卡、USB音频设备、HDMI音频、蓝牙音频
- **音频格式**：8/16/24/32位，8-192kHz采样率，1-8通道
- **特殊场景**：多设备并存、设备热插拔、设备独占模式

### 2. 性能测试场景

- **CPU负载**：空闲/中等/高负载下的音频性能
- **内存压力**：不同内存使用情况下的稳定性
- **并发测试**：多个音频流同时播放
- **长时间测试**：连续播放24小时稳定性

### 3. 异常场景测试

- **设备断开**：播放过程中音频设备断开
- **格式不支持**：尝试播放不支持的音频格式
- **资源不足**：系统资源不足时的行为
- **权限问题**：无音频设备访问权限

## 测试数据分析与监控

### 1. 性能基线建立

```java
public class AudioAPIPerformanceBaseline {
    
    // 建立性能基线
    public void establishBaseline() {
        Map<String, PerformanceMetrics> baselineData = new HashMap<>();
        
        // DirectSound基线
        PerformanceMetrics directSoundBaseline = new PerformanceMetrics();
        directSoundBaseline.maxLatencyMs = 150;
        directSoundBaseline.maxCpuUsagePercent = 15;
        directSoundBaseline.maxMemoryUsageMB = 30;
        directSoundBaseline.minThroughputMBps = 10.0;
        baselineData.put("DirectSound", directSoundBaseline);
        
        // WaveOut基线
        PerformanceMetrics waveOutBaseline = new PerformanceMetrics();
        waveOutBaseline.maxLatencyMs = 200;
        waveOutBaseline.maxCpuUsagePercent = 12;
        waveOutBaseline.maxMemoryUsageMB = 25;
        waveOutBaseline.minThroughputMBps = 8.0;
        baselineData.put("WaveOut", waveOutBaseline);
        
        // WASAPI基线
        PerformanceMetrics wasapiBaseline = new PerformanceMetrics();
        wasapiBaseline.maxLatencyMs = 50;
        wasapiBaseline.maxCpuUsagePercent = 10;
        wasapiBaseline.maxMemoryUsageMB = 20;
        wasapiBaseline.minThroughputMBps = 15.0;
        baselineData.put("WASAPI", wasapiBaseline);
        
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
        comparison.throughputPass = testResults.throughputMBps >= baseline.minThroughputMBps;
        
        // 计算偏差百分比
        comparison.latencyDeviation = ((double)(testResults.latencyMs - baseline.maxLatencyMs) / baseline.maxLatencyMs) * 100;
        comparison.cpuUsageDeviation = ((double)(testResults.cpuUsagePercent - baseline.maxCpuUsagePercent) / baseline.maxCpuUsagePercent) * 100;
        comparison.memoryUsageDeviation = ((double)(testResults.memoryUsageMB - baseline.maxMemoryUsageMB) / baseline.maxMemoryUsageMB) * 100;
        comparison.throughputDeviation = ((double)(testResults.throughputMBps - baseline.minThroughputMBps) / baseline.minThroughputMBps) * 100;
        
        return comparison;
    }
    
    // 性能指标类
    public static class PerformanceMetrics {
        public long latencyMs;
        public int cpuUsagePercent;
        public double memoryUsageMB;
        public double throughputMBps;
    }
    
    // 基线比较结果
    public static class BaselineComparison {
        public String apiType;
        public boolean latencyPass;
        public boolean cpuUsagePass;
        public boolean memoryUsagePass;
        public boolean throughputPass;
        public double latencyDeviation;
        public double cpuUsageDeviation;
        public double memoryUsageDeviation;
        public double throughputDeviation;
        
        public boolean overallPass() {
            return latencyPass && cpuUsagePass && memoryUsagePass && throughputPass;
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
public class AudioAPIMonitor {
    
    // 性能监控阈值
    private static class MonitoringThresholds {
        public static final double LATENCY_WARNING_THRESHOLD = 1.2; // 延迟超过基线20%告警
        public static final double CPU_WARNING_THRESHOLD = 1.3;     // CPU使用超过基线30%告警
        public static final double MEMORY_WARNING_THRESHOLD = 1.4;  // 内存使用超过基线40%告警
        public static final double THROUGHPUT_WARNING_THRESHOLD = 0.8; // 吞吐量低于基线20%告警
    }
    
    // 执行监控检查
    public void performMonitoringCheck() {
        AudioAPIPerformanceBaseline baseline = new AudioAPIPerformanceBaseline();
        
        WindowsAudioAPITestFramework.AudioAPIType[] apiTypes = {
            WindowsAudioAPITestFramework.AudioAPIType.DIRECT_SOUND,
            WindowsAudioAPITestFramework.AudioAPIType.WAVE_OUT,
            WindowsAudioAPITestFramework.AudioAPIType.WASAPI
        };
        
        List<MonitoringAlert> alerts = new ArrayList<>();
        
        for (WindowsAudioAPITestFramework.AudioAPIType apiType : apiTypes) {
            // 运行性能测试
            WindowsAudioAPITestFramework.TestConfig config = new WindowsAudioAPITestFramework.TestConfig();
            config.apiType = apiType;
            config.testPerformance = true;
            
            WindowsAudioAPITestFramework framework = new WindowsAudioAPITestFramework();
            WindowsAudioAPITestFramework.TestResult result = framework.runCompatibilityTest(config);
            
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
            AudioAPIPerformanceBaseline.PerformanceMetrics testMetrics = new AudioAPIPerformanceBaseline.PerformanceMetrics();
            testMetrics.latencyMs = result.latencyMs;
            testMetrics.cpuUsagePercent = result.cpuUsagePercent;
            testMetrics.memoryUsageMB = result.memoryUsageBytes / (1024.0 * 1024.0);
            testMetrics.throughputMBps = (double) result.metrics.get("throughputMBps");
            
            AudioAPIPerformanceBaseline.BaselineComparison comparison = baseline.compareWithBaseline(apiType.toString(), testMetrics);
            
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
            Log.w("AudioAPIMonitor", 
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
| DirectSound初始化失败 | DirectX版本过低 | 运行dxdiag检查DirectX版本 | 更新DirectX到最新版本 |
| WaveOut设备不可用 | 设备驱动问题 | 检查设备管理器中的音频设备 | 更新或重新安装音频驱动 |
| WASAPI独占模式失败 | 设备已被其他应用占用 | 关闭其他音频应用后重试 | 使用共享模式或释放设备 |
| 音频延迟过高 | 缓冲区设置过大 | 测试不同缓冲区大小 | 调整缓冲区大小到合适值 |
| 多通道音频播放异常 | 设备不支持多通道 | 检查设备支持的通道数 | 降级到立体声或使用虚拟环绕 |

### 2. 调试工具与技术

```java
public class AudioAPIDebugTools {
    
    // 音频API调试信息收集
    public void collectDebugInfo(WindowsAudioAPITestFramework.AudioAPIType apiType) {
        Log.d("AudioAPIDebug", "收集音频API调试信息: " + apiType);
        
        // 1. 系统信息
        collectSystemInfo();
        
        // 2. 音频设备信息
        collectAudioDeviceInfo(apiType);
        
        // 3. 驱动信息
        collectDriverInfo();
        
        // 4. DirectX信息
        collectDirectXInfo();
        
        // 5. 注册表信息
        collectRegistryInfo(apiType);
        
        // 6. 进程信息
        collectProcessInfo();
    }
    
    private void collectSystemInfo() {
        Log.d("AudioAPIDebug", "=== 系统信息 ===");
        Log.d("AudioAPIDebug", "操作系统: " + System.getProperty("os.name"));
        Log.d("AudioAPIDebug", "系统版本: " + System.getProperty("os.version"));
        Log.d("AudioAPIDebug", "系统架构: " + System.getProperty("os.arch"));
        Log.d("AudioAPIDebug", "可用处理器: " + Runtime.getRuntime().availableProcessors());
        Log.d("AudioAPIDebug", "最大内存: " + Runtime.getRuntime().maxMemory() / (1024 * 1024) + "MB");
    }
    
    private void collectAudioDeviceInfo(WindowsAudioAPITestFramework.AudioAPIType apiType) {
        Log.d("AudioAPIDebug", "=== 音频设备信息 (" + apiType + ") ===");
        
        WindowsAudioAPITestFramework framework = new WindowsAudioAPITestFramework();
        List<AudioDevice> devices = framework.enumerateAudioDevices(apiType);
        
        for (AudioDevice device : devices) {
            Log.d("AudioAPIDebug", "设备名称: " + device.name);
            Log.d("AudioAPIDebug", "设备ID: " + device.id);
            Log.d("AudioAPIDebug", "驱动版本: " + device.driverVersion);
            Log.d("AudioAPIDebug", "支持格式: " + device.supportedFormats);
            Log.d("AudioAPIDebug", "默认设备: " + device.isDefault);
            Log.d("AudioAPIDebug", "---");
        }
    }
    
    private void collectDriverInfo() {
        Log.d("AudioAPIDebug", "=== 驱动信息 ===");
        // 实现驱动信息收集
    }
    
    private void collectDirectXInfo() {
        Log.d("AudioAPIDebug", "=== DirectX信息 ===");
        // 实现DirectX信息收集
    }
    
    private void collectRegistryInfo(WindowsAudioAPITestFramework.AudioAPIType apiType) {
        Log.d("AudioAPIDebug", "=== 注册表信息 (" + apiType + ") ===");
        // 实现注册表信息收集
    }
    
    private void collectProcessInfo() {
        Log.d("AudioAPIDebug", "=== 进程信息 ===");
        Log.d("AudioAPIDebug", "当前进程ID: " + ProcessHandle.current().pid());
        
        // 检查可能冲突的音频进程
        String[] conflictingProcesses = {"spotify.exe", "itunes.exe", "vlc.exe", "wmplayer.exe"};
        for (String process : conflictingProcesses) {
            boolean isRunning = isProcessRunning(process);
            Log.d("AudioAPIDebug", process + " 运行中: " + isRunning);
        }
    }
    
    private boolean isProcessRunning(String processName) {
        // 实现进程检查
        return false;
    }
}
```

通过以上测试开发技术，可以全面验证DirectSound、WaveOut和WASAPI音频API的兼容性、性能和稳定性，确保音频播放功能在各种环境下正常工作。