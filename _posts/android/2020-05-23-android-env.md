---
layout: article
title:  "Ubuntu16.04 下 Android 开发环境"
date:   2020-05-23
tags: Android
key: android-key
---

[TOC]

## Overview

* in `~/.bashrc`(or `/etc/profile` or `/etc/environment`)
  ```sh
  export JAVA_HOME=/home/cg/tools/android_tools/jdk1.8.0_251
  export JRE_HOME=$JAVA_HOME/jre
  export CLASSPATH=.:$JAVA_HOME/lib:$JRE_HOME/lib
  export PATH=$JAVA_HOME/bin:$PATH

  export ANDROID_SDK=/home/cg/tools/android_tools/android-sdk-linux
  export PATH=$ANDROID_SDK/tools:$PATH
  export PATH=$ANDROID_SDK/platform-tools:$PATH

  export ANDROID_NDK=/home/cg/tools/android_tools/android-ndk-r16b
  export PATH=$ANDROID_NDK:$ANDROID_NDK/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64/bin:$PATH
  ```


## JDK

* 下载JDK包（例如，`jdk-8u251-linux-x64.tar.gz`）并解压

* 配置环境变量

* 查看java版本
  ```sh
  java -version
  javac -version
  ```


## Android SDK

* online install: http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz
* offline install:
  - windows: `installer_r24.4.1-windows.exe`
  - linux: `android-sdk_r24.4.1-linux.tgz`
* [Android SDK开发包国内下载地址](http://www.cnblogs.com/bjzhanghao/archive/2012/11/14/android-platform-sdk-download-mirror.html)

### tools

#### android

* Android SDK Manager
  ```sh
  android
  ```

* android list
  ```sh
  android list [targets]
  ```

* update tools
  ```sh
  [tsocks] android update sdk -u
  ```


#### ddms

* DDMS
  ```sh
  ddms
  ```

#### emulator

* emulator
  ```sh
  emulator
  ```

#### mksdcard

### platform-tools

#### adb

```sh
adb help

adb shell

adb root
adb remount

adb start-server

adb devices
adb get-serialno

adb push/pull
adb install

adb logcat
adb bugreport
```


## Android NDK

* e.g., `android-ndk-r14b`, `android-ndk-r16b-linux-x86_64.zip`, etc.

* ndk build
  ```sh
  ndk-build -j4
  ```

### toolchains (Cross-Compilation tools)

* e.g. compilers
  ```sh
  arm-linux-androideabi-g++
  arm-linux-androideabi-gcc
  ```

* others
  ```sh
  arm-linux-androideabi-*
  ```

## Android Project

### Ant Project

* install **ant**
  ```sh
  sudo apt install ant
  ```

* generate `build.xml` for Ant
  ```sh
  android update project -t android-23 -p .
  ```

* build ant project (**SDK Build-tools** and **SDK Platform** need to be installed)
  ```sh
  ant debug/release
  ```

### Eclipse

* [Introduction to Android development Using Eclipse and Android widgets](http://www.ibm.com/developerworks/opensource/tutorials/os-eclipse-androidwidget/)


- Eclipse
  * Eclipse IDE for Java Developers
- ADT
  * online install: https://dl-ssl.google.com/android/eclipse/
  * offline install: Location：[jar:file:ADT-23.0.7.zip]()
- EGit
  * online install: http://download.eclipse.org/egit/updates/

### Android Studio (AS)

* ubuntu 删除android studio
  - android-studio文件夹
  - `~/.AndroidStudio`
  - `~/.android`
  - `~/.local/share/applications/jetbrains-android-studio.desktop`
