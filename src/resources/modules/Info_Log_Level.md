# Info日志等级测试开发技术

## 模块概述
本模块提供统一的日志管理系统，支持多种日志等级，特别是Info等级日志的规范使用，确保开发、测试和生产环境中日志记录的有效性和可管理性。

## 技术组件

### 日志等级体系
- **应用场景**：应用程序调试，问题排查，系统监控
- **特点**：分级记录，可配置输出，支持过滤
- **实现要点**：
  - 定义标准日志等级
  - 实现日志输出控制
  - 支持日志文件存储
  - 提供日志查询与分析功能

### Info日志规范
- **应用场景**：记录关键业务流程，状态变更，重要操作
- **特点**：信息量大，业务相关，便于追踪
- **实现要点**：
  - 规范Info日志内容格式
  - 控制Info日志输出频率
  - 实现敏感信息过滤
  - 支持日志聚合与统计

## 技术实现细节

### 日志等级定义
```java
public class LogLevel {
    // 日志等级常量
    public static final int VERBOSE = 2;
    public static final int DEBUG = 3;
    public static final int INFO = 4;
    public static final int WARN = 5;
    public static final int ERROR = 6;
    public static final int ASSERT = 7;
    
    // 日志等级名称
    public static final String[] LOG_LEVEL_NAMES = {
        "UNKNOWN", "UNKNOWN", "VERBOSE", "DEBUG", "INFO", "WARN", "ERROR", "ASSERT"
    };
    
    // 获取日志等级名称
    public static String getLevelName(int level) {
        if (level >= VERBOSE && level <= ASSERT) {
            return LOG_LEVEL_NAMES[level];
        }
        return "UNKNOWN";
    }
}
```

### 日志管理器实现
```java
public class LogManager {
    private static final String TAG = "LogManager";
    private static int currentLogLevel = LogLevel.DEBUG;
    private static boolean logToFile = false;
    private static String logFilePath = null;
    private static long maxLogFileSize = 10 * 1024 * 1024; // 10MB
    private static int maxLogFiles = 5;
    
    // 设置日志等级
    public static void setLogLevel(int level) {
        currentLogLevel = level;
        i(TAG, "日志等级设置为: " + LogLevel.getLevelName(level));
    }
    
    // 获取当前日志等级
    public static int getLogLevel() {
        return currentLogLevel;
    }
    
    // 启用文件日志
    public static void enableFileLogging(String filePath, long maxSize, int maxFiles) {
        logFilePath = filePath;
        maxLogFileSize = maxSize;
        maxLogFiles = maxFiles;
        logToFile = true;
        
        // 创建日志目录
        File logFile = new File(filePath);
        File logDir = logFile.getParentFile();
        if (logDir != null && !logDir.exists()) {
            logDir.mkdirs();
        }
        
        i(TAG, "文件日志已启用: " + filePath);
    }
    
    // 禁用文件日志
    public static void disableFileLogging() {
        logToFile = false;
        i(TAG, "文件日志已禁用");
    }
    
    // Verbose日志
    public static void v(String tag, String message) {
        if (currentLogLevel <= LogLevel.VERBOSE) {
            Log.v(tag, message);
            writeToFile(LogLevel.VERBOSE, tag, message);
        }
    }
    
    // Debug日志
    public static void d(String tag, String message) {
        if (currentLogLevel <= LogLevel.DEBUG) {
            Log.d(tag, message);
            writeToFile(LogLevel.DEBUG, tag, message);
        }
    }
    
    // Info日志
    public static void i(String tag, String message) {
        if (currentLogLevel <= LogLevel.INFO) {
            Log.i(tag, message);
            writeToFile(LogLevel.INFO, tag, message);
        }
    }
    
    // Info日志（带参数）
    public static void i(String tag, String format, Object... args) {
        String message = String.format(format, args);
        i(tag, message);
    }
    
    // Warn日志
    public static void w(String tag, String message) {
        if (currentLogLevel <= LogLevel.WARN) {
            Log.w(tag, message);
            writeToFile(LogLevel.WARN, tag, message);
        }
    }
    
    // Error日志
    public static void e(String tag, String message) {
        if (currentLogLevel <= LogLevel.ERROR) {
            Log.e(tag, message);
            writeToFile(LogLevel.ERROR, tag, message);
        }
    }
    
    // Error日志（带异常）
    public static void e(String tag, String message, Throwable throwable) {
        if (currentLogLevel <= LogLevel.ERROR) {
            Log.e(tag, message, throwable);
            writeToFile(LogLevel.ERROR, tag, message + "\n" + Log.getStackTraceString(throwable));
        }
    }
    
    // 写入文件
    private static void writeToFile(int level, String tag, String message) {
        if (!logToFile || logFilePath == null) {
            return;
        }
        
        try {
            // 检查文件大小，如果超过限制则轮转
            File logFile = new File(logFilePath);
            if (logFile.exists() && logFile.length() > maxLogFileSize) {
                rotateLogFiles();
            }
            
            // 格式化日志消息
            String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.getDefault())
                .format(new Date());
            String levelName = LogLevel.getLevelName(level);
            String logEntry = String.format("[%s] [%s] [%s] %s\n", timestamp, levelName, tag, message);
            
            // 写入文件
            FileWriter writer = new FileWriter(logFilePath, true);
            writer.write(logEntry);
            writer.close();
        } catch (IOException e) {
            Log.e(TAG, "写入日志文件失败", e);
        }
    }
    
    // 日志文件轮转
    private static void rotateLogFiles() {
        try {
            File currentFile = new File(logFilePath);
            
            // 删除最旧的日志文件
            File oldestFile = new File(logFilePath + "." + maxLogFiles);
            if (oldestFile.exists()) {
                oldestFile.delete();
            }
            
            // 重命名现有日志文件
            for (int i = maxLogFiles - 1; i >= 1; i--) {
                File oldFile = new File(logFilePath + "." + i);
                if (oldFile.exists()) {
                    File newFile = new File(logFilePath + "." + (i + 1));
                    oldFile.renameTo(newFile);
                }
            }
            
            // 重命名当前日志文件
            File newFile = new File(logFilePath + ".1");
            currentFile.renameTo(newFile);
        } catch (Exception e) {
            Log.e(TAG, "日志文件轮转失败", e);
        }
    }
}
```

### Info日志使用规范
```java
public class InfoLogUsage {
    private static final String TAG = "InfoLogUsage";
    
    // 业务流程开始
    public void startBusinessProcess(String processId, String userId) {
        LogManager.i(TAG, "业务流程开始: processId=%s, userId=%s", processId, userId);
        // 业务逻辑...
    }
    
    // 重要状态变更
    public void onStateChanged(String component, String oldState, String newState) {
        LogManager.i(TAG, "组件状态变更: component=%s, oldState=%s, newState=%s", 
                    component, oldState, newState);
        // 状态变更处理...
    }
    
    // 关键操作执行
    public void performCriticalOperation(String operation, boolean success) {
        LogManager.i(TAG, "关键操作执行: operation=%s, success=%s", operation, success);
        // 操作后处理...
    }
    
    // 性能指标记录
    public void recordPerformanceMetric(String metric, long value) {
        LogManager.i(TAG, "性能指标: metric=%s, value=%dms", metric, value);
        // 指标记录后处理...
    }
    
    // 用户行为记录
    public void logUserAction(String action, String target, Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        sb.append("用户行为: action=").append(action)
          .append(", target=").append(target);
        
        for (Map.Entry<String, String> entry : params.entrySet()) {
            sb.append(", ").append(entry.getKey()).append("=").append(entry.getValue());
        }
        
        LogManager.i(TAG, sb.toString());
        // 行为记录后处理...
    }
    
    // 网络请求记录
    public void logNetworkRequest(String url, String method, int responseCode, long duration) {
        LogManager.i(TAG, "网络请求: url=%s, method=%s, responseCode=%d, duration=%dms", 
                    url, method, responseCode, duration);
        // 请求后处理...
    }
    
    // 资源使用记录
    public void logResourceUsage(String resource, long used, long total) {
        LogManager.i(TAG, "资源使用: resource=%s, used=%d, total=%d, usage=%.2f%%", 
                    resource, used, total, (used * 100.0 / total));
        // 资源使用后处理...
    }
}
```

### 日志过滤与分析
```java
public class LogAnalyzer {
    private static final String TAG = "LogAnalyzer";
    
    // 过滤特定等级的日志
    public static List<String> filterLogsByLevel(String logFilePath, int targetLevel) {
        List<String> filteredLogs = new ArrayList<>();
        
        try {
            BufferedReader reader = new BufferedReader(new FileReader(logFilePath));
            String line;
            
            while ((line = reader.readLine()) != null) {
                // 解析日志等级
                String[] parts = line.split("\\s+");
                if (parts.length >= 3) {
                    String levelStr = parts[2].replace("[", "").replace("]", "");
                    int level = getLevelFromName(levelStr);
                    
                    if (level == targetLevel) {
                        filteredLogs.add(line);
                    }
                }
            }
            
            reader.close();
        } catch (IOException e) {
            LogManager.e(TAG, "过滤日志失败", e);
        }
        
        return filteredLogs;
    }
    
    // 统计日志等级分布
    public static Map<String, Integer> analyzeLogDistribution(String logFilePath) {
        Map<String, Integer> distribution = new HashMap<>();
        
        try {
            BufferedReader reader = new BufferedReader(new FileReader(logFilePath));
            String line;
            
            while ((line = reader.readLine()) != null) {
                // 解析日志等级
                String[] parts = line.split("\\s+");
                if (parts.length >= 3) {
                    String levelStr = parts[2].replace("[", "").replace("]", "");
                    
                    // 更新统计
                    Integer count = distribution.get(levelStr);
                    if (count == null) {
                        count = 0;
                    }
                    distribution.put(levelStr, count + 1);
                }
            }
            
            reader.close();
        } catch (IOException e) {
            LogManager.e(TAG, "分析日志分布失败", e);
        }
        
        return distribution;
    }
    
    // 搜索特定关键词的日志
    public static List<String> searchLogsByKeyword(String logFilePath, String keyword) {
        List<String> matchedLogs = new ArrayList<>();
        
        try {
            BufferedReader reader = new BufferedReader(new FileReader(logFilePath));
            String line;
            
            while ((line = reader.readLine()) != null) {
                if (line.contains(keyword)) {
                    matchedLogs.add(line);
                }
            }
            
            reader.close();
        } catch (IOException e) {
            LogManager.e(TAG, "搜索日志失败", e);
        }
        
        return matchedLogs;
    }
    
    // 从名称获取日志等级
    private static int getLevelFromName(String levelName) {
        switch (levelName.toUpperCase()) {
            case "VERBOSE":
                return LogLevel.VERBOSE;
            case "DEBUG":
                return LogLevel.DEBUG;
            case "INFO":
                return LogLevel.INFO;
            case "WARN":
                return LogLevel.WARN;
            case "ERROR":
                return LogLevel.ERROR;
            case "ASSERT":
                return LogLevel.ASSERT;
            default:
                return LogLevel.DEBUG;
        }
    }
}
```

## 测试验证方法

### 功能测试
1. **日志输出测试**：
   - 验证不同等级日志的输出控制
   - 测试日志格式是否正确
   - 检查日志文件写入是否正常

2. **日志过滤测试**：
   - 测试按等级过滤日志
   - 验证关键词搜索功能
   - 检查日志统计准确性

### 性能测试
1. **日志写入性能**：
   - 测量高频日志写入的性能影响
   - 检查文件轮转的效率
   - 验证大量日志的处理能力

2. **资源消耗测试**：
   - 监控内存使用情况
   - 检查CPU占用率
   - 测试存储空间消耗

### 稳定性测试
1. **长时间运行测试**：
   - 测试长时间日志记录的稳定性
   - 检查文件轮转是否正常
   - 验证内存泄漏情况

2. **异常情况测试**：
   - 测试存储空间不足时的处理
   - 验证文件权限问题的处理
   - 检查并发写入的稳定性

## 常见问题排查

### 日志输出问题
1. **日志不显示**：
   - 检查日志等级设置是否正确
   - 验证过滤条件是否合适
   - 确认日志调用是否正确

2. **日志格式错误**：
   - 检查格式化字符串是否正确
   - 验证参数数量是否匹配
   - 确认特殊字符处理

### 文件日志问题
1. **文件写入失败**：
   - 检查文件路径是否正确
   - 验证写入权限是否足够
   - 确认存储空间是否充足

2. **文件轮转异常**：
   - 检查文件大小设置是否合理
   - 验证文件重命名逻辑
   - 确认文件清理机制

## 使用场景
- 应用程序调试
- 问题排查与分析
- 用户行为追踪
- 系统监控与告警
- 性能分析与优化

## 相关模块
- 埋点上报验证模块
- 缓存文件存储模块
- 性能监控模块
- 错误处理模块