# 网页嗅探m3u8测试开发技术

## 模块概述
本模块提供网页中m3u8流媒体链接的自动嗅探与提取功能，支持多种网页结构，能够识别和解析m3u8播放列表，为视频播放提供数据源。

## 技术组件

### 网页内容嗅探
- **应用场景**：从网页中提取视频流链接，自动识别播放源
- **特点**：多模式匹配，深度解析，智能识别
- **实现要点**：
  - 解析网页HTML结构
  - 提取JavaScript中的视频链接
  - 识别动态加载内容
  - 处理加密和混淆代码

### m3u8解析器
- **应用场景**：解析HLS播放列表，提取视频片段信息
- **特点**：支持多级播放列表，自适应码率，实时更新
- **实现要点**：
  - 解析主播放列表和媒体播放列表
  - 提取视频片段URL和时长
  - 处理加密信息和密钥
  - 支持播放列表动态更新

## 技术实现细节

### 网页嗅探器
```java
public class WebPageSniffer {
    private static final String TAG = "WebPageSniffer";
    
    // 嗅探模式
    public enum SniffMode {
        HTML_CONTENT,       // HTML内容嗅探
        JAVASCRIPT_CODE,    // JavaScript代码嗅探
        NETWORK_REQUESTS,   // 网络请求嗅探
        COMPREHENSIVE       // 综合嗅探
    }
    
    private List<Pattern> m3u8Patterns;
    private List<Pattern> videoPatterns;
    private NetworkRequestInterceptor networkInterceptor;
    private JavaScriptEngine jsEngine;
    
    public WebPageSniffer() {
        initializePatterns();
        initializeComponents();
    }
    
    // 初始化匹配模式
    private void initializePatterns() {
        m3u8Patterns = new ArrayList<>();
        
        // 基本m3u8链接模式
        m3u8Patterns.add(Pattern.compile("(https?://[^\\s\"'<>]+\\.m3u8[^\\s\"'<>]*)", Pattern.CASE_INSENSITIVE));
        
        // 引号包裹的m3u8链接
        m3u8Patterns.add(Pattern.compile("[\"']([^\"']*\\.m3u8[^\"']*)[\"']", Pattern.CASE_INSENSITIVE));
        
        // JavaScript变量赋值
        m3u8Patterns.add(Pattern.compile("(?:var|let|const)\\s+\\w+\\s*=\\s*[\"']([^\"']*\\.m3u8[^\"']*)[\"']", Pattern.CASE_INSENSITIVE));
        
        // JSON对象中的m3u8链接
        m3u8Patterns.add(Pattern.compile("[\"'](?:url|src|source)[\"']\\s*:\\s*[\"']([^\"']*\\.m3u8[^\"']*)[\"']", Pattern.CASE_INSENSITIVE));
        
        // 函数参数中的m3u8链接
        m3u8Patterns.add(Pattern.compile("\\w+\\([^,]*,[\"']([^\"']*\\.m3u8[^\"']*)[\"']\\)", Pattern.CASE_INSENSITIVE));
        
        // 视频链接模式（用于识别可能的视频源）
        videoPatterns = new ArrayList<>();
        videoPatterns.add(Pattern.compile("(https?://[^\\s\"'<>]+\\.(?:mp4|avi|mkv|flv|webm)[^\\s\"'<>]*)", Pattern.CASE_INSENSITIVE));
    }
    
    // 初始化组件
    private void initializeComponents() {
        // 初始化网络请求拦截器
        networkInterceptor = new NetworkRequestInterceptor();
        
        // 初始化JavaScript引擎
        jsEngine = new JavaScriptEngine();
    }
    
    // 嗅探网页中的m3u8链接
    public List<M3U8Source> sniffM3U8FromWebPage(String url, SniffMode mode) {
        Log.d(TAG, "开始嗅探网页: " + url + ", 模式: " + mode);
        
        List<M3U8Source> results = new ArrayList<>();
        
        try {
            switch (mode) {
                case HTML_CONTENT:
                    results.addAll(sniffFromHtmlContent(url));
                    break;
                    
                case JAVASCRIPT_CODE:
                    results.addAll(sniffFromJavaScript(url));
                    break;
                    
                case NETWORK_REQUESTS:
                    results.addAll(sniffFromNetworkRequests(url));
                    break;
                    
                case COMPREHENSIVE:
                default:
                    // 综合模式，使用所有方法
                    results.addAll(sniffFromHtmlContent(url));
                    results.addAll(sniffFromJavaScript(url));
                    results.addAll(sniffFromNetworkRequests(url));
                    break;
            }
            
            // 去重并验证
            results = deduplicateAndValidate(results);
            
        } catch (Exception e) {
            Log.e(TAG, "嗅探网页失败", e);
        }
        
        Log.d(TAG, "嗅探完成，找到 " + results.size() + " 个m3u8源");
        return results;
    }
    
    // 从HTML内容中嗅探
    private List<M3U8Source> sniffFromHtmlContent(String url) throws IOException {
        List<M3U8Source> results = new ArrayList<>();
        
        // 下载网页内容
        String htmlContent = downloadWebPage(url);
        
        // 使用正则表达式匹配m3u8链接
        for (Pattern pattern : m3u8Patterns) {
            Matcher matcher = pattern.matcher(htmlContent);
            
            while (matcher.find()) {
                String m3u8Url = matcher.group(1);
                
                // 处理相对URL
                if (!m3u8Url.startsWith("http")) {
                    m3u8Url = resolveRelativeUrl(url, m3u8Url);
                }
                
                // 创建M3U8源对象
                M3U8Source source = new M3U8Source();
                source.setUrl(m3u8Url);
                source.setSource("HTML Content");
                source.setExtractionMethod("Pattern Matching");
                
                results.add(source);
            }
        }
        
        return results;
    }
    
    // 从JavaScript代码中嗅探
    private List<M3U8Source> sniffFromJavaScript(String url) throws IOException {
        List<M3U8Source> results = new ArrayList<>();
        
        // 下载网页内容
        String htmlContent = downloadWebPage(url);
        
        // 提取JavaScript代码块
        List<String> jsBlocks = extractJavaScriptBlocks(htmlContent);
        
        // 执行JavaScript代码并提取变量
        for (String jsCode : jsBlocks) {
            try {
                // 使用JavaScript引擎执行代码
                jsEngine.execute(jsCode);
                
                // 获取可能包含m3u8链接的变量
                Map<String, Object> variables = jsEngine.getVariables();
                
                for (Map.Entry<String, Object> entry : variables.entrySet()) {
                    Object value = entry.getValue();
                    
                    if (value instanceof String && ((String) value).contains(".m3u8")) {
                        String m3u8Url = (String) value;
                        
                        // 处理相对URL
                        if (!m3u8Url.startsWith("http")) {
                            m3u8Url = resolveRelativeUrl(url, m3u8Url);
                        }
                        
                        // 创建M3U8源对象
                        M3U8Source source = new M3U8Source();
                        source.setUrl(m3u8Url);
                        source.setSource("JavaScript Variable: " + entry.getKey());
                        source.setExtractionMethod("JavaScript Execution");
                        
                        results.add(source);
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "执行JavaScript代码失败", e);
            }
        }
        
        return results;
    }
    
    // 从网络请求中嗅探
    private List<M3U8Source> sniffFromNetworkRequests(String url) throws IOException {
        List<M3U8Source> results = new ArrayList<>();
        
        // 启动网络请求拦截器
        networkInterceptor.startIntercepting();
        
        try {
            // 加载网页（这会触发网络请求）
            downloadWebPage(url);
            
            // 等待一段时间，让网络请求完成
            Thread.sleep(5000);
            
            // 获取拦截到的网络请求
            List<NetworkRequest> requests = networkInterceptor.getInterceptedRequests();
            
            // 查找m3u8请求
            for (NetworkRequest request : requests) {
                if (request.getUrl().contains(".m3u8")) {
                    // 创建M3U8源对象
                    M3U8Source source = new M3U8Source();
                    source.setUrl(request.getUrl());
                    source.setSource("Network Request");
                    source.setExtractionMethod("Network Interception");
                    source.setRequestHeaders(request.getHeaders());
                    
                    results.add(source);
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            // 停止网络请求拦截
            networkInterceptor.stopIntercepting();
        }
        
        return results;
    }
    
    // 下载网页内容
    private String downloadWebPage(String url) throws IOException {
        HttpURLConnection connection = null;
        BufferedReader reader = null;
        
        try {
            URL webpage = new URL(url);
            connection = (HttpURLConnection) webpage.openConnection();
            
            // 设置请求头，模拟浏览器
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            connection.setRequestProperty("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            connection.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("HTTP错误: " + responseCode);
            }
            
            // 读取内容
            StringBuilder content = new StringBuilder();
            reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
            
            return content.toString();
            
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    Log.w(TAG, "关闭读取器失败", e);
                }
            }
            
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
    
    // 提取JavaScript代码块
    private List<String> extractJavaScriptBlocks(String htmlContent) {
        List<String> jsBlocks = new ArrayList<>();
        
        // 匹配<script>标签中的内容
        Pattern scriptPattern = Pattern.compile("<script[^>]*>(.*?)</script>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
        Matcher matcher = scriptPattern.matcher(htmlContent);
        
        while (matcher.find()) {
            String jsCode = matcher.group(1).trim();
            if (!jsCode.isEmpty()) {
                jsBlocks.add(jsCode);
            }
        }
        
        return jsBlocks;
    }
    
    // 解析相对URL
    private String resolveRelativeUrl(String baseUrl, String relativeUrl) {
        try {
            URL base = new URL(baseUrl);
            return new URL(base, relativeUrl).toString();
        } catch (MalformedURLException e) {
            Log.w(TAG, "解析相对URL失败: " + relativeUrl, e);
            return relativeUrl;
        }
    }
    
    // 去重并验证
    private List<M3U8Source> deduplicateAndValidate(List<M3U8Source> sources) {
        Map<String, M3U8Source> uniqueSources = new HashMap<>();
        
        for (M3U8Source source : sources) {
            String url = source.getUrl();
            
            // 如果已存在，则合并信息
            if (uniqueSources.containsKey(url)) {
                M3U8Source existing = uniqueSources.get(url);
                
                // 合并来源信息
                String combinedSource = existing.getSource() + ", " + source.getSource();
                existing.setSource(combinedSource);
            } else {
                uniqueSources.put(url, source);
            }
        }
        
        // 验证URL是否有效
        List<M3U8Source> validSources = new ArrayList<>();
        for (M3U8Source source : uniqueSources.values()) {
            if (isValidM3U8Url(source.getUrl())) {
                validSources.add(source);
            }
        }
        
        return validSources;
    }
    
    // 验证m3u8 URL是否有效
    private boolean isValidM3U8Url(String url) {
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            int responseCode = connection.getResponseCode();
            connection.disconnect();
            
            return responseCode == HttpURLConnection.HTTP_OK;
        } catch (Exception e) {
            return false;
        }
    }
}
```

### m3u8解析器
```java
public class M3U8Parser {
    private static final String TAG = "M3U8Parser";
    
    // 解析m3u8播放列表
    public M3U8Playlist parseM3U8(String url) throws IOException {
        Log.d(TAG, "解析m3u8播放列表: " + url);
        
        // 下载m3u8内容
        String content = downloadM3U8Content(url);
        
        // 判断是主播放列表还是媒体播放列表
        if (isMasterPlaylist(content)) {
            return parseMasterPlaylist(url, content);
        } else {
            return parseMediaPlaylist(url, content);
        }
    }
    
    // 下载m3u8内容
    private String downloadM3U8Content(String url) throws IOException {
        HttpURLConnection connection = null;
        BufferedReader reader = null;
        
        try {
            URL m3u8Url = new URL(url);
            connection = (HttpURLConnection) m3u8Url.openConnection();
            
            // 设置请求头
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("HTTP错误: " + responseCode);
            }
            
            // 读取内容
            StringBuilder content = new StringBuilder();
            reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
            
            return content.toString();
            
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    Log.w(TAG, "关闭读取器失败", e);
                }
            }
            
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
    
    // 判断是否为主播放列表
    private boolean isMasterPlaylist(String content) {
        // 主播放列表通常包含EXT-X-STREAM-INF标签
        return content.contains("#EXT-X-STREAM-INF");
    }
    
    // 解析主播放列表
    private M3U8MasterPlaylist parseMasterPlaylist(String baseUrl, String content) {
        M3U8MasterPlaylist masterPlaylist = new M3U8MasterPlaylist();
        masterPlaylist.setUrl(baseUrl);
        
        String[] lines = content.split("\n");
        M3U8StreamInfo currentStream = null;
        
        for (String line : lines) {
            line = line.trim();
            
            if (line.isEmpty() || line.startsWith("#")) {
                // 处理标签
                if (line.startsWith("#EXT-X-STREAM-INF:")) {
                    // 解析流信息
                    currentStream = parseStreamInfo(line);
                } else if (line.startsWith("#EXT-X-MEDIA:")) {
                    // 解析媒体信息
                    M3U8MediaInfo mediaInfo = parseMediaInfo(line);
                    masterPlaylist.addMediaInfo(mediaInfo);
                }
            } else {
                // 处理URL
                if (currentStream != null) {
                    // 处理相对URL
                    String streamUrl = line;
                    if (!streamUrl.startsWith("http")) {
                        streamUrl = resolveRelativeUrl(baseUrl, streamUrl);
                    }
                    
                    currentStream.setUrl(streamUrl);
                    masterPlaylist.addStreamInfo(currentStream);
                    currentStream = null;
                }
            }
        }
        
        return masterPlaylist;
    }
    
    // 解析媒体播放列表
    private M3U8MediaPlaylist parseMediaPlaylist(String baseUrl, String content) {
        M3U8MediaPlaylist mediaPlaylist = new M3U8MediaPlaylist();
        mediaPlaylist.setUrl(baseUrl);
        
        String[] lines = content.split("\n");
        M3U8Segment currentSegment = null;
        double currentDuration = 0;
        
        for (String line : lines) {
            line = line.trim();
            
            if (line.isEmpty()) {
                continue;
            }
            
            if (line.startsWith("#")) {
                // 处理标签
                if (line.startsWith("#EXTINF:")) {
                    // 解析片段时长
                    currentDuration = parseDuration(line);
                } else if (line.startsWith("#EXT-X-KEY:")) {
                    // 解析加密信息
                    M3U8KeyInfo keyInfo = parseKeyInfo(line, baseUrl);
                    mediaPlaylist.setKeyInfo(keyInfo);
                } else if (line.startsWith("#EXT-X-TARGETDURATION:")) {
                    // 解析目标时长
                    double targetDuration = parseTargetDuration(line);
                    mediaPlaylist.setTargetDuration(targetDuration);
                } else if (line.startsWith("#EXT-X-VERSION:")) {
                    // 解析版本
                    int version = parseVersion(line);
                    mediaPlaylist.setVersion(version);
                } else if (line.startsWith("#EXT-X-MEDIA-SEQUENCE:")) {
                    // 解析媒体序列号
                    int mediaSequence = parseMediaSequence(line);
                    mediaPlaylist.setMediaSequence(mediaSequence);
                } else if (line.startsWith("#EXT-X-ENDLIST")) {
                    // 播放列表结束
                    mediaPlaylist.setEndList(true);
                }
            } else {
                // 处理片段URL
                if (currentDuration > 0) {
                    // 处理相对URL
                    String segmentUrl = line;
                    if (!segmentUrl.startsWith("http")) {
                        segmentUrl = resolveRelativeUrl(baseUrl, segmentUrl);
                    }
                    
                    currentSegment = new M3U8Segment();
                    currentSegment.setUrl(segmentUrl);
                    currentSegment.setDuration(currentDuration);
                    
                    mediaPlaylist.addSegment(currentSegment);
                    
                    currentDuration = 0;
                    currentSegment = null;
                }
            }
        }
        
        return mediaPlaylist;
    }
    
    // 解析流信息
    private M3U8StreamInfo parseStreamInfo(String line) {
        M3U8StreamInfo streamInfo = new M3U8StreamInfo();
        
        // 移除标签前缀
        String attributes = line.substring("#EXT-X-STREAM-INF:".length());
        
        // 解析属性
        String[] attrPairs = attributes.split(",");
        for (String attrPair : attrPairs) {
            attrPair = attrPair.trim();
            
            if (attrPair.startsWith("BANDWIDTH=")) {
                int bandwidth = Integer.parseInt(attrPair.substring("BANDWIDTH=".length()));
                streamInfo.setBandwidth(bandwidth);
            } else if (attrPair.startsWith("RESOLUTION=")) {
                String resolution = attrPair.substring("RESOLUTION=".length());
                String[] parts = resolution.split("x");
                if (parts.length == 2) {
                    int width = Integer.parseInt(parts[0]);
                    int height = Integer.parseInt(parts[1]);
                    streamInfo.setWidth(width);
                    streamInfo.setHeight(height);
                }
            } else if (attrPair.startsWith("CODECS=")) {
                String codecs = attrPair.substring("CODECS=".length()).replaceAll("\"", "");
                streamInfo.setCodecs(codecs);
            } else if (attrPair.startsWith("AUDIO=")) {
                String audio = attrPair.substring("AUDIO=".length()).replaceAll("\"", "");
                streamInfo.setAudio(audio);
            }
        }
        
        return streamInfo;
    }
    
    // 解析媒体信息
    private M3U8MediaInfo parseMediaInfo(String line) {
        M3U8MediaInfo mediaInfo = new M3U8MediaInfo();
        
        // 移除标签前缀
        String attributes = line.substring("#EXT-X-MEDIA:".length());
        
        // 解析属性
        String[] attrPairs = attributes.split(",");
        for (String attrPair : attrPairs) {
            attrPair = attrPair.trim();
            
            if (attrPair.startsWith("TYPE=")) {
                String type = attrPair.substring("TYPE=".length()).replaceAll("\"", "");
                mediaInfo.setType(type);
            } else if (attrPair.startsWith("GROUP-ID=")) {
                String groupId = attrPair.substring("GROUP-ID=".length()).replaceAll("\"", "");
                mediaInfo.setGroupId(groupId);
            } else if (attrPair.startsWith("NAME=")) {
                String name = attrPair.substring("NAME=".length()).replaceAll("\"", "");
                mediaInfo.setName(name);
            } else if (attrPair.startsWith("LANGUAGE=")) {
                String language = attrPair.substring("LANGUAGE=".length()).replaceAll("\"", "");
                mediaInfo.setLanguage(language);
            }
        }
        
        return mediaInfo;
    }
    
    // 解析时长
    private double parseDuration(String line) {
        // 格式: #EXTINF:duration,[title]
        String[] parts = line.split(",");
        if (parts.length > 0) {
            String durationStr = parts[0].substring("#EXTINF:".length());
            return Double.parseDouble(durationStr);
        }
        return 0;
    }
    
    // 解析密钥信息
    private M3U8KeyInfo parseKeyInfo(String line, String baseUrl) {
        M3U8KeyInfo keyInfo = new M3U8KeyInfo();
        
        // 移除标签前缀
        String attributes = line.substring("#EXT-X-KEY:".length());
        
        // 解析属性
        String[] attrPairs = attributes.split(",");
        for (String attrPair : attrPairs) {
            attrPair = attrPair.trim();
            
            if (attrPair.startsWith("METHOD=")) {
                String method = attrPair.substring("METHOD=".length());
                keyInfo.setMethod(method);
            } else if (attrPair.startsWith("URI=")) {
                String uri = attrPair.substring("URI=".length()).replaceAll("\"", "");
                
                // 处理相对URL
                if (!uri.startsWith("http")) {
                    uri = resolveRelativeUrl(baseUrl, uri);
                }
                
                keyInfo.setUri(uri);
            } else if (attrPair.startsWith("IV=")) {
                String iv = attrPair.substring("IV=".length()).replaceAll("\"", "");
                keyInfo.setIv(iv);
            }
        }
        
        return keyInfo;
    }
    
    // 解析目标时长
    private double parseTargetDuration(String line) {
        String durationStr = line.substring("#EXT-X-TARGETDURATION:".length());
        return Double.parseDouble(durationStr);
    }
    
    // 解析版本
    private int parseVersion(String line) {
        String versionStr = line.substring("#EXT-X-VERSION:".length());
        return Integer.parseInt(versionStr);
    }
    
    // 解析媒体序列号
    private int parseMediaSequence(String line) {
        String sequenceStr = line.substring("#EXT-X-MEDIA-SEQUENCE:".length());
        return Integer.parseInt(sequenceStr);
    }
    
    // 解析相对URL
    private String resolveRelativeUrl(String baseUrl, String relativeUrl) {
        try {
            URL base = new URL(baseUrl);
            return new URL(base, relativeUrl).toString();
        } catch (MalformedURLException e) {
            Log.w(TAG, "解析相对URL失败: " + relativeUrl, e);
            return relativeUrl;
        }
    }
}
```

## 测试验证方法

### 功能测试
1. **网页嗅探测试**：
   - 测试不同网页结构的嗅探能力
   - 验证JavaScript代码解析
   - 检查网络请求拦截功能

2. **m3u8解析测试**：
   - 测试主播放列表解析
   - 验证媒体播放列表解析
   - 检查加密信息处理

### 性能测试
1. **嗅探效率测试**：
   - 测量不同网页的嗅探时间
   - 检查资源消耗情况
   - 验证并发嗅探能力

2. **解析性能测试**：
   - 测试大型播放列表的解析速度
   - 检查内存使用情况
   - 验证解析准确性

### 兼容性测试
1. **网站兼容性测试**：
   - 测试主流视频网站
   - 验证不同网页框架的支持
   - 检查特殊编码处理

2. **格式兼容性测试**：
   - 测试不同版本的m3u8格式
   - 验证特殊标签处理
   - 检查加密格式支持

## 常见问题排查

### 嗅探问题
1. **无法找到m3u8链接**：
   - 检查正则表达式模式是否匹配
   - 验证JavaScript代码执行环境
   - 确认网络请求拦截是否正常

2. **找到的链接无法访问**：
   - 检查URL解析是否正确
   - 验证请求头设置
   - 确认链接有效性验证逻辑

### 解析问题
1. **播放列表解析失败**：
   - 检查m3u8格式是否符合标准
   - 验证特殊标签处理
   - 确认编码格式正确

2. **片段信息错误**：
   - 检查时长解析逻辑
   - 验证URL解析是否正确
   - 确认相对路径处理

## 使用场景
- 视频下载工具
- 在线视频播放器
- 视频内容分析
- 版权保护系统

## 相关模块
- HLS支持模块
- HTTP/HTTPS在线播放模块
- 缓存文件存储模块
- 双IO播放模块