# JNI技术测试开发

## 模块概述
本模块提供Java与C/C++之间的桥梁技术实现，使Android应用能够调用原生代码，实现高性能计算、系统级操作和硬件访问等功能。

## 技术组件

### JNI基础架构
- **应用场景**：性能敏感代码实现，系统级功能访问，硬件控制
- **特点**：跨语言调用，高性能，系统级访问能力
- **实现要点**：
  - 定义native方法接口
  - 实现C/C++原生代码
  - 编译和加载原生库
  - 处理Java与C/C++数据类型转换

### 数据类型映射
- **应用场景**：Java与C/C++数据交换，复杂数据结构传递
- **特点**：类型安全，内存管理，引用处理
- **实现要点**：
  - 基本数据类型映射
  - 对象引用处理
  - 数组访问与操作
  - 字符串编码转换

## 技术实现细节

### Java端声明
```java
public class JNIBridge {
    // 加载原生库
    static {
        System.loadLibrary("nativebridge");
    }
    
    // 基本数据类型示例
    public native int addNumbers(int a, int b);
    public native boolean compareValues(float value1, float value2);
    
    // 字符串处理示例
    public native String processString(String input);
    public native String[] splitString(String input, String delimiter);
    
    // 数组处理示例
    public native int sumArray(int[] numbers);
    public native void processByteArray(byte[] data);
    public native int[] getIntArrayFromNative();
    
    // 对象操作示例
    public native void updateObject(MyDataObject obj);
    public native MyDataObject createObject();
    
    // 回调接口示例
    public native void setCallback(ProgressCallback callback);
    
    // 音频处理相关示例
    public native boolean initializeAudio(int sampleRate, int channels, int bitsPerSample);
    public native void startAudioCapture();
    public native void stopAudioCapture();
    public native byte[] getAudioData();
}

// 回调接口定义
public interface ProgressCallback {
    void onProgress(int percent);
    void onComplete();
    void onError(String errorMessage);
}
```

### C/C++端实现
```c
#include <jni.h>
#include <string.h>
#include <android/log.h>

#define LOG_TAG "JNIBridge"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// 基本数据类型示例
JNIEXPORT jint JNICALL
Java_com_example_JNIBridge_addNumbers(JNIEnv *env, jobject thiz, jint a, jint b) {
    return a + b;
}

JNIEXPORT jboolean JNICALL
Java_com_example_JNIBridge_compareValues(JNIEnv *env, jobject thiz, jfloat value1, jfloat value2) {
    return (value1 > value2) ? JNI_TRUE : JNI_FALSE;
}

// 字符串处理示例
JNIEXPORT jstring JNICALL
Java_com_example_JNIBridge_processString(JNIEnv *env, jobject thiz, jstring input) {
    const char *inputStr = (*env)->GetStringUTFChars(env, input, NULL);
    if (inputStr == NULL) {
        return NULL;
    }
    
    // 处理字符串（示例：转换为大写）
    char *resultStr = strdup(inputStr);
    for (int i = 0; resultStr[i]; i++) {
        if (resultStr[i] >= 'a' && resultStr[i] <= 'z') {
            resultStr[i] -= 'a' - 'A';
        }
    }
    
    (*env)->ReleaseStringUTFChars(env, input, inputStr);
    
    jstring result = (*env)->NewStringUTF(env, resultStr);
    free(resultStr);
    
    return result;
}

// 数组处理示例
JNIEXPORT jint JNICALL
Java_com_example_JNIBridge_sumArray(JNIEnv *env, jobject thiz, jintArray numbers) {
    jint sum = 0;
    jint *elements = (*env)->GetIntArrayElements(env, numbers, NULL);
    if (elements == NULL) {
        return 0;
    }
    
    jsize length = (*env)->GetArrayLength(env, numbers);
    for (int i = 0; i < length; i++) {
        sum += elements[i];
    }
    
    (*env)->ReleaseIntArrayElements(env, numbers, elements, 0);
    return sum;
}

JNIEXPORT void JNICALL
Java_com_example_JNIBridge_processByteArray(JNIEnv *env, jobject thiz, jbyteArray data) {
    jbyte *elements = (*env)->GetByteArrayElements(env, data, NULL);
    if (elements == NULL) {
        return;
    }
    
    jsize length = (*env)->GetArrayLength(env, data);
    
    // 处理字节数组（示例：每个字节加1）
    for (int i = 0; i < length; i++) {
        elements[i]++;
    }
    
    (*env)->ReleaseByteArrayElements(env, data, elements, 0);
}

// 对象操作示例
JNIEXPORT void JNICALL
Java_com_example_JNIBridge_updateObject(JNIEnv *env, jobject thiz, jobject obj) {
    // 获取对象类
    jclass clazz = (*env)->GetObjectClass(env, obj);
    
    // 获取字段ID
    jfieldID valueField = (*env)->GetFieldID(env, clazz, "value", "I");
    jfieldID nameField = (*env)->GetFieldID(env, clazz, "name", "Ljava/lang/String;");
    
    if (valueField == NULL || nameField == NULL) {
        LOGE("Failed to get field IDs");
        return;
    }
    
    // 获取字段值
    jint value = (*env)->GetIntField(env, obj, valueField);
    jstring name = (jstring)(*env)->GetObjectField(env, obj, nameField);
    
    // 修改字段值
    (*env)->SetIntField(env, obj, valueField, value * 2);
    
    // 释放本地引用
    (*env)->DeleteLocalRef(env, clazz);
    (*env)->DeleteLocalRef(env, name);
}

// 回调接口示例
JNIEXPORT void JNICALL
Java_com_example_JNIBridge_setCallback(JNIEnv *env, jobject thiz, jobject callback) {
    // 保存回调对象的全局引用
    static jobject g_callback = NULL;
    
    if (g_callback) {
        (*env)->DeleteGlobalRef(env, g_callback);
    }
    
    g_callback = (*env)->NewGlobalRef(env, callback);
    
    // 获取回调方法ID
    jclass clazz = (*env)->GetObjectClass(env, callback);
    jmethodID onProgress = (*env)->GetMethodID(env, clazz, "onProgress", "(I)V");
    jmethodID onComplete = (*env)->GetMethodID(env, clazz, "onComplete", "()V");
    jmethodID onError = (*env)->GetMethodID(env, clazz, "onError", "(Ljava/lang/String;)V");
    
    // 模拟异步任务
    for (int i = 0; i <= 100; i += 10) {
        (*env)->CallVoidMethod(env, g_callback, onProgress, i);
        
        // 检查是否有异常
        if ((*env)->ExceptionCheck(env)) {
            (*env)->ExceptionDescribe(env);
            (*env)->ExceptionClear(env);
            break;
        }
        
        // 模拟工作延迟
        usleep(100000); // 100ms
    }
    
    // 调用完成回调
    (*env)->CallVoidMethod(env, g_callback, onComplete);
    
    // 清理
    (*env)->DeleteGlobalRef(env, g_callback);
    (*env)->DeleteLocalRef(env, clazz);
}

// 音频处理相关示例
static JavaVM *g_jvm = NULL;
static jobject g_audioCallback = NULL;

JNIEXPORT jboolean JNICALL
Java_com_example_JNIBridge_initializeAudio(JNIEnv *env, jobject thiz, jint sampleRate, jint channels, jint bitsPerSample) {
    // 保存JavaVM引用
    (*env)->GetJavaVM(env, &g_jvm);
    
    LOGI("Initializing audio: sampleRate=%d, channels=%d, bitsPerSample=%d", 
         sampleRate, channels, bitsPerSample);
    
    // 实际的音频初始化代码...
    
    return JNI_TRUE;
}

JNIEXPORT void JNICALL
Java_com_example_JNIBridge_startAudioCapture(JNIEnv *env, jobject thiz) {
    LOGI("Starting audio capture");
    
    // 实际的音频捕获启动代码...
}

JNIEXPORT void JNICALL
Java_com_example_JNIBridge_stopAudioCapture(JNIEnv *env, jobject thiz) {
    LOGI("Stopping audio capture");
    
    // 实际的音频捕获停止代码...
}

JNIEXPORT jbyteArray JNICALL
Java_com_example_JNIBridge_getAudioData(JNIEnv *env, jobject thiz) {
    // 模拟获取音频数据
    jbyteArray result = (*env)->NewByteArray(env, 1024);
    if (result == NULL) {
        return NULL;
    }
    
    jbyte *data = (*env)->GetByteArrayElements(env, result, NULL);
    if (data == NULL) {
        return NULL;
    }
    
    // 填充模拟数据
    for (int i = 0; i < 1024; i++) {
        data[i] = (jbyte)(i % 256);
    }
    
    (*env)->ReleaseByteArrayElements(env, result, data, 0);
    
    return result;
}

// JNI_OnLoad函数，在库加载时调用
JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *reserved) {
    JNIEnv *env;
    
    if ((*vm)->GetEnv(vm, (void **)&env, JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }
    
    LOGI("JNI library loaded successfully");
    
    return JNI_VERSION_1_6;
}
```

## Android.mk与Application.mk配置

### Android.mk
```makefile
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := nativebridge
LOCAL_SRC_FILES := nativebridge.c
LOCAL_LDLIBS := -llog

include $(BUILD_SHARED_LIBRARY)
```

### Application.mk
```makefile
APP_ABI := armeabi-v7a arm64-v8a x86 x86_64
APP_PLATFORM := android-21
APP_CPPFLAGS += -std=c99
```

## 性能优化策略

### 内存管理
1. **引用管理**：
   - 及时释放局部引用
   - 谨慎使用全局引用
   - 避免创建过多局部引用

2. **数组访问优化**：
   - 使用GetPrimitiveArrayCritical减少拷贝
   - 批量处理数组数据
   - 及时释放数组资源

### 调用优化
1. **方法ID缓存**：
   - 缓存常用方法和字段ID
   - 避免重复查找
   - 使用静态变量存储

2. **异常处理**：
   - 检查JNI调用后的异常状态
   - 及时清除异常
   - 提供有意义的错误信息

## 测试验证方法

### 功能测试
1. **数据类型转换测试**：
   - 验证基本数据类型的正确传递
   - 测试字符串编码转换
   - 检查数组访问的正确性

2. **对象操作测试**：
   - 验证对象字段访问
   - 测试对象方法调用
   - 检查对象创建与销毁

### 性能测试
1. **调用开销测试**：
   - 测量JNI调用延迟
   - 比较不同数据类型的传递效率
   - 测试批量操作的性能

2. **内存使用测试**：
   - 监控内存泄漏
   - 检查引用计数
   - 验证内存释放是否及时

### 稳定性测试
1. **异常处理测试**：
   - 测试异常抛出与捕获
   - 验证异常状态清理
   - 检查错误恢复能力

2. **并发测试**：
   - 测试多线程环境下的JNI调用
   - 验证线程安全性
   - 检查资源竞争情况

## 常见问题排查

### 链接问题
1. **库加载失败**：
   - 检查库文件名是否正确
   - 验证库文件是否存在于正确位置
   - 确认库文件架构是否匹配

2. **符号找不到**：
   - 检查函数命名是否正确
   - 验证参数签名是否匹配
   - 确认导出符号表是否正确

### 运行时问题
1. **内存访问错误**：
   - 检查数组边界访问
   - 验证指针有效性
   - 确认内存释放时机

2. **异常处理不当**：
   - 检查JNI调用后的异常状态
   - 验证异常清除是否及时
   - 确认异常传播是否正确

## 使用场景
- 高性能计算
- 音视频处理
- 系统级功能访问
- 硬件控制
- 加密算法实现

## 相关模块
- OpenSLES/AudioRecord模块
- 音频编码模块
- 视频解码模块
- Activity/Fragment生命周期模块