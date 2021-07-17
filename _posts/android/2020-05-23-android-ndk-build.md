---
layout: article
title:  "Ubuntu16.04 下 构建 Android(NDK) 应用"
date:   2020-05-23
tags: Android
key: android-ndk-build
---

[TOC]

## NDK Build

Generate `.so` or `.a` files using NDK tools:

1. Edit `.java` file;

2. Generate header file for the java file using JDK tools `javac` and `javah`;
   ```sh
   # 在 `src` 目录下
   javac com/ndk/test/OpenCVTest.java
   javah -classpath ./ -jni com.ndk.test.OpenCVTest
   ```

3. Edit `Android.mk` and `Application.mk` files;

4. Generate `.so` or `.a` files using command `ndk-build`;

5. Load the library and using its methods

### NDK Tips

Android NDK 从2013年开始支持了C++11，从2015年开始支持C++14，在 `Android.mk` 中加入

```sh
# c++ 11 标准
LOCAL_CPPFLAGS += -std=c++11
LOCAL_CPPFLAGS += -D__cplusplus=201103L  

# or

# c++ 14 标准
LOCAL_CPPFLAGS += -std=c++1y
LOCAL_CPPFLAGS += -D__cplusplus=201300L
```

When compiling c++ code with `-std=c++11` and using `gnustl_shared`, many **C99 math functions** are not provided by the <cmath> header as they should. At this time, `APP_STL := c++_static` may help. (from Issue: [C++11 cmath functions not in std namespace](https://stackoverflow.com/a/22924781/6560660))


## Build Android Project

### Build Ant Project

* generate `build.xml` for Ant
  ```sh
  android update project -p .
  ```

* build ant project
  ```sh
  ant debug/release
  ```

### Build Eclipse Project

* [Introduction to Android development Using Eclipse and Android widgets](http://www.ibm.com/developerworks/opensource/tutorials/os-eclipse-androidwidget/)

## Sign APK

1. Generate keystore file  
    ```sh
    keytool -genkey -alias ChenguangCam -keyalg RSA -validity 100000 -keystore AndroidCameraApp.keystore
    ```

2. Sign Apk

* 使用第三方工具：**爱加密签名工具**；  
* 使用命令行
  ```sh
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore  
  <path_to_AndroidCameraApp.keystore> -storepass 123456 -keypass 123456 -signedjar <path_to_signed.apk> <path_to_unsign.apk> ChenguangCam
  ```
* Eclipse Project: 右键单击项目名称，选择"Android Tools"，再选择"Export Signed Application Package…"；
* Ant Project: add **key.store** and **key.alias** properties to **ant.properties** file;

## Install APK

* Install apk file to devices
  ```sh
  adb install <path_to_apk>
  # or
  adb install -r <path_to_apk>
  ```

* uninstall apk
  ```sh
  adb uninstall <package-name>
  ```

## Debug

### Native C++ Crash Debug

当NDK生成的 .so 运行崩掉时，通过NDK工具查找相关信息。

#### ndk-stack

##### 1) 实时分析日志

程序运行过程中，执行如下命令：

```sh
adb logcat | ndk-stack -sym <so文件所在路径>
```

当程序崩溃时，可输出崩溃信息。

##### 2) 获取日志再分析

程序运行过程中，执行如下命令：

```sh
adb logcat > 1.log
```

程序崩溃后，通过如下命令获取崩溃信息：

```sh
ndk-stack -sym <so文件所在路径> -dump 1.log
```

或 通过关键字查找

* NDK logcat crash keywords
  > --------- beginning of crash
  > backtrace

#### arm-linux-androideabi-addr2line

获取日志中关键函数指针，例如

> #00 pc 00031896 /data/app/com.tools/lib/arm/libtools.so

根据地址，使用如下命令找到对应的函数：

```sh
arm-linux-androideabi-addr2line -e libtools.so 00031896 -f
```

参考：[如何定位Android NDK开发中遇到的错误](http://www.wx135.com/articles/20141231/54a3ba2d-9c68-473a-9f1a-782802734e20.html)


### Check File Dependencies

#### arm-linux-androideabi-readelf

* check .so file
  ```sh
  arm-linux-androideabi-readelf -d *.so
  ```

## 应用认领

应用认领那些事：   
[http://droidyue.com/blog/2014/12/14/android-yingyong-renling/?utm_source=tuicool&utm_medium=referral](http://droidyue.com/blog/2014/12/14/android-yingyong-renling/?utm_source=tuicool&utm_medium=referral)
