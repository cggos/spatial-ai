---
layout: article
title:  "Ubuntu 16.04 下 Android Native Libs 交叉编译"
date:   2020-08-12
tags: Android
key: android-native-libs-cross-compilation
---

[TOC]

## CImg for Android

Add the following code in `CImg.h` from https://github.com/dtschump/CImg.git to **NOT** use `Xlib.h`:

```c++
#undef cimg_display
#define cimg_display 0
```


## build OpenCV for Android

* https://blog.csdn.net/u011178262/article/details/78209791#for_Android_127


## build Suitsparse for Android

* https://github.com/cggos/suitesparse_for_android


## build Google Ceres-Solver for Android

* TODO

## build FFTW for Android

It is best to download official tarballs from http://fftw.org/, other than using its github repository!!!

Build Reference: [fftw_android( from he-kai github )](https://github.com/hekai/fftw_android)

```sh
#!/bin/sh
set -o errexit

# Compiles fftw3 for Android
# Make sure you have ANDROID_NDK defined in .bashrc or .bash_profile

PROJECT_ROOT="`pwd`/../"
INSTALL_DIR="$PROJECT_ROOT/jni/ndk-modules/fftw3"
mkdir -p $INSTALL_DIR

NDK_DIR=${ANDROID_NDK}

export PATH="$NDK_DIR/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64/bin/:$PATH"
export SYS_ROOT="$NDK_DIR/platforms/android-9/arch-arm/"
export CC="arm-linux-androideabi-gcc --sysroot=$SYS_ROOT"
export CXX="arm-linux-androideabi-g++"
export LD="arm-linux-androideabi-ld"
export AR="arm-linux-androideabi-ar"
export RANLIB="arm-linux-androideabi-ranlib"
export STRIP="arm-linux-androideabi-strip"
export CFLAGS="-mfpu=neon -march=armv7-a -mfloat-abi=softfp" #use Thumb-2 instructs
export CXXFLAGS="-lstdc++"
export LDFLAGS="-lc -lgcc"

SRC_DIR="./fftw-3.3.3"
cd $SRC_DIR

##### configure & make & make install #####

./configure --host=arm-eabi --prefix=$INSTALL_DIR --enable-float --enable-neon

make -j$(nproc)
make install -j$(nproc)

exit 0
```
