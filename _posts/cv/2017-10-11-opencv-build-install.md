---
layout: article
title:  "OpenCV编译安装配置总结"
date:   2017-10-11
tags: ComputerVision
---

﻿[TOC]

# Overview

* check version from source
  ```sh
  modules/core/include/opencv2/core/version.hpp
  ```

* check informations after installation
  ```sh
  # 查看opencv版本
  pkg-config --modversion opencv

  # 查看opencv包含目录
  pkg-config --cflags opencv

  # 查看opencv库目录
  pkg-config --libs opencv
  ```

# Build & Installation

## Dependencies

```sh
sudo apt install build-essential  
sudo apt install  libgtk2.0-dev libavcodec-dev libavformat-dev  libtiff4-dev  libswscale-dev libjasper-dev
sudo apt install cmake pkg-config
```

## build with CMake

```sh
#!/usr/bin/env bash
cmake \
  -D CMAKE_BUILD_TYPE=Release \
  -D CMAKE_INSTALL_PREFIX=/usr/local/opencv_249 \
  -D WITH_VTK=OFF \
  -D WITH_MATLAB=OFF \
  -D WITH_TBB=ON \
  -D WITH_IPP=OFF \
  -D WITH_FFMPEG=OFF \
  -D WITH_V4L=ON \
  -D WITH_CUDA=OFF \
  -D CUDA_GENERATION=Kepler \
  -D ENABLE_PRECOMPILED_HEADERS=OFF \
  -D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib/modules \
  ..

# or by the CMake curses interface `ccmake`

time make -j4
sudo make install  
```

## Uninstall

```sh
sudo make uninstall

# or

# install-mainfest.txt包含了安装文件的路径
sudo cat install-manifest.txt | sudo xargs rm
```

## Errors

* /usr/local/include/c++/6.2.0/cstdlib:75:25: fatal error: stdlib.h: No such file or directory
	```sh
	-D ENABLE_PRECOMPILED_HEADERS=OFF
	```

* nvcc fatal   : Unsupported gpu architecture 'compute_11'
CMake Error at cuda_compile_generated_matrix_operations.cu.o.cmake:206
	```sh
	-D CUDA_GENERATION=Kepler
	# When using cmake to do configurations,
	# set the option CUDA_GENERATION to specific your GPU architecture
	```

* opencv/modules/videoio/src/ffmpeg_codecs.hpp:111:7: error: ‘CODEC_ID_H263P’ was not declared in this scope
	```sh
	-D WITH_FFMPEG=OFF
	```

# Usage

## using g++

```sh
g++ `pkg-config opencv --cflags` test.cpp -o test `pkg-config opencv --libs`
```

## using CMake

```sh
set(OpenCV_DIR "/home/ubuntu/src/opencv-3.1.0/build")
find_package( OpenCV REQUIRED )
include_directories( ${OpenCV_INCLUDE_DIRS} )
```

## using Makefile

将opencv-3.1.0.pc和opencv-2.4.12.pc拷贝到/usr/lib/pkgconfig目录(可设置PKG_CONFIG_PATH)下，
使用opencv-3.1.0时，Makefile中为：

```sh
COMMON  += -DOPENCV
CFLAGS  += -DOPENCV
LDFLAGS += `pkg-config --libs opencv-3.1.0`
COMMON  += `pkg-config --cflags opencv-3.1.0`
```

使用opencv-2.4.12时，Makefile中为：

```sh
COMMON  += -DOPENCV
CFLAGS  += -DOPENCV
LDFLAGS += `pkg-config --libs opencv-2.4.12`
COMMON  += `pkg-config --cflags opencv-2.4.12`
```

# Cross-Compilation

## for ARM

## for Android

* 在 `platforms/android` 目录执行以下代码
  ```sh
  #!/usr/bin/env bash

  # cd `dirname $0`/..   # platforms/

  mkdir -p build_android

  cd build_android

  cmake \
    -DCMAKE_MAKE_PROGRAM="/usr/bin/make" \
    -DCMAKE_BUILD_WITH_INSTALL_RPATH=ON \
    -DCMAKE_INSTALL_PREFIX="/opt/opencv_android_sdk" \
    -DCMAKE_TOOLCHAIN_FILE="../android.toolchain.cmake" \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=ON \
    -DBUILD_DOCS=OFF \
    -DBUILD_EXAMPLES=OFF \
    -DBUILD_PERF_TESTS=OFF \
    -DBUILD_TESTS=OFF \
    -DBUILD_opencv_java=OFF \
    -DBUILD_opencv_face=OFF \
    -DBUILD_opencv_face=OFF \
    -DWITH_IPP=OFF \
    -DWITH_TBB=OFF \
    -DWITH_TIFF=OFF \
    -DWITH_OPENEXR=OFF \
    -DWITH_OPENCL=ON \
    -DWITH_CUDA=OFF \
    -DWITH_MATLAB=OFF \
    -DOPENCV_EXTRA_MODULES_PATH="../../../../opencv_contrib-3.3.1/modules/"  \
    -DBUILD_ANDROID_EXAMPLES=OFF \
    -DANDROID_NDK=${ANDROID_NDK} \
    -DANDROID_ABI="armeabi-v7a" \
    -DANDROID_ARM_NEON=TRUE \
    -DANDROID_STL=gnustl_static \
    -DANDROID_CPP_FEATURES="rtti exceptions" \
    -DANDROID_NATIVE_API_LEVEL=23 \
    -DANDROID_PLATFORM=android-23 \
    -DANDROID_SDK_TARGET=23 \
    -DANDROID_DISABLE_FORMAT_STRING_CHECKS=TRUE \
    $@ ../../..

  # -DANDROID_OPENCL_SDK="./OpenCL-SDK" \
  ```

* to compile for Android with `ANDROID_STL=c++_static(shared)`, use Android NDK own CMake toolchain file and **clang**(ref: https://github.com/opencv/opencv/issues/8742#issuecomment-385553011)
  ```sh
  -DCMAKE_TOOLCHAIN_FILE="${ANDROID_NDK}/build/cmake/android.toolchain.cmake" \
  -DANDROID_TOOLCHAIN=clang \
  -DANDROID_STL=c++_static \
  ```

* with `platforms/android/build_sdk.py`
  ```sh
  python build_sdk.py \
    --ndk_path $ANDROID_NDK \
    --sdk_path $ANDROID_SDK \
    --extra_modules_path ../../../opencv_contrib-3.3.1/modules \
    build_cg ../..
  ```
