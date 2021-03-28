---
layout: article
title: "Ubuntu 16.04 下 PVIO 的编译与运行"
tags: SLAM
key: slam-pvio-build-run
---

[TOC]

# Overview

* code: https://github.com/zju3dv/PVIO

* paper
  ```bib
  @inproceedings{PRCV-LiYHZB2019,
    author={Jinyu Li and Bangbang Yang and Kai Huang and Guofeng Zhang and Hujun Bao},
    title     = {Robust and Efficient Visual-Inertial Odometry with Multi-plane Priors},
    booktitle = {Pattern Recognition and Computer Vision - Second Chinese Conference,
                 {PRCV} 2019, Xi'an, China, November 8-11, 2019, Proceedings, Part {III}},
    series    = {Lecture Notes in Computer Science},
    volume    = {11859},
    pages     = {283--295},
    publisher = {Springer},
    year      = {2019}
  }
  ```

Note: 本博客主要是记录下在本人Ubuntu 16.04的PC平台上编译时遇到的问题和解决办法。

# Build

## Dependencies

* cmake 3.18.0
* GCC 9.3.0
* Eigen 3.3.7
* Ceres Solver 1.14.0
* OpenCV-3.3.1 (from ROS kinetic)
* FFMPEG 4.3.2

## Build

* download
  ```sh
  git clone https://github.com/zju3dv/PVIO.git
  ```

* cmake
  ```sh
  cd PVIO && mkdir build && cd build
  cmake -DCMAKE_BUILD_TYPE=Release ..
  ```
  Tips: 执行 `cmake` 过程中会下载 `GIT_REPOSITORY`，因网络原因可能导致部分下载失败，可改善网络或者多执行几次直到全部下载下来。

* make
  ```sh
  make -j1
  ```

## Errors when make

* > error: ‘::av_packet_alloc’ has not been declared

  <p align="center">
    <img src="../images/pvio/error-ffmpeg-avcodec.png" style="width:100%">
  </p>

  解决办法：升级 **FFMPEG**（之前是FFMPEG2） 和 对应的 **libavcodec**
  ```sh
  sudo add-apt-repository ppa:jonathonf/ffmpeg-4
  sudo apt update
  sudo apt install ffmpeg
  ffmpeg -version

  sudo apt install libavcodec-dev
  ```

* > /usr/lib/x86_64-linux-gnu/libavutil.so: undefined reference to clEnqueueWriteImage@OPENCL_1.0

  <p align="center">
    <img src="../images/pvio/error-libavutil-cl.png" style="width:100%">
  </p>

  解决办法：

  因我之前装了cuda8，`libavutil.so` 链接到了 cuda 中的 `libOpenCL.so.1`

  <p align="center">
    <img src="../images/pvio/libavutil-ldd.png" style="width:100%">
  </p>

  使其链接到 `/usr/lib/x86_64-linux-gnu/` 中的 `libOpenCL.so.1` 即可。
  ```sh
  cd /usr/local/cuda-8.0/lib64
  sudo unlink libOpenCL.so.1
  sudo ln -s /usr/lib/x86_64-linux-gnu/libOpenCL.so.1.0.0 libOpenCL.so.1
  ```

# Run

* run with dataset
  ```sh
  ./pvio-pc/pvio-pc euroc:///home/cg/dev_sdb/datasets/ETH_ASL_Datasets/EuRoC_MAV/V1_01_easy/mav0 ../config/euroc.yaml
  ```

  <p align="center">
    <img src="../images/pvio/run-pvio.png" style="width:100%">
  </p>
