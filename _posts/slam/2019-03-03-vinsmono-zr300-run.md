---
layout: article
title: "Ubuntu 16.04 下 VINS-Mono 的安装和使用(RealSense ZR300)"
date: 2019-03-03
tags: SLAM
key: slam-vinsmono-zr300-run
---

[TOC]

# Overview

本文介绍在 Ubuntu 16.04（ROS Kinetic）的PC平台上使用 RealSense ZR300 的 **fisheye camera (FOV: 100x133) + IMU** 运行 我对VINS-Mono的改版 [cggos/vins_mono_cg](https://github.com/cggos/vins_mono_cg)。

# 安装&运行 ZR300驱动

RealSense ZR300 的加速度计和陀螺仪的时间戳不是完全相同的（加速度计的频率为250Hz而陀螺仪的频率为200Hz），但是由于RealSense ZR300的时间戳是在硬件上打的，不是操作系统接收到到图像和IMU的时间戳，所以可以通过 **插值** 的方式使它们的时间戳对齐。  

这里使用 **maplab** 推荐的驱动：**ethz-asl** 的 [maplab_realsense](https://github.com/ethz-asl/maplab_realsense)，对IMU的陀螺仪、加速度计、图像的时间戳做了对齐处理。

* 安装 librealsense

  ```sh
  sudo apt install ros-${ROS_VERSION}-librealsense
  ```

* 安装 maplab_realsense

  ```sh
  mkdir -p ws_realsense/src
  cd ws_realsense/src
  git clone https://github.com/ethz-asl/maplab_realsense.git
  wstool init
  wstool merge maplab_realsense/dependencies.rosinstall
  wstool update -j4
  cd ../
  catkin build
  ```

* 运行 maplab_realsense

  ```sh
  source devel/setup.bash
  roslaunch maplab_realsense maplab_realsense.launch
  ```

  正常运行界面如下：  

  <p align="center">
    <img src="../images/vins_mono/maplab_realsense.jpg">
  </p>

  **注意**：若运行错误，可尝试运行多次，或者 更换尝试更换USB口。

  其 Topic list：

  ```sh
  /rosout
  /rosout_agg
  /tf_static
  /zr300_node/color/camera_info
  /zr300_node/color/image_raw
  /zr300_node/color/image_raw/compressed
  /zr300_node/color/image_raw/compressed/parameter_descriptions
  /zr300_node/color/image_raw/compressed/parameter_updates
  /zr300_node/color/image_raw/compressedDepth
  /zr300_node/color/image_raw/compressedDepth/parameter_descriptions
  /zr300_node/color/image_raw/compressedDepth/parameter_updates
  /zr300_node/color/image_raw/theora
  /zr300_node/color/image_raw/theora/parameter_descriptions
  /zr300_node/color/image_raw/theora/parameter_updates
  /zr300_node/depth/camera_info
  /zr300_node/device_time
  /zr300_node/device_time/parameter_descriptions
  /zr300_node/device_time/parameter_updates
  /zr300_node/fisheye/camera_info
  /zr300_node/fisheye/image_raw
  /zr300_node/fisheye/image_raw/compressed
  /zr300_node/fisheye/image_raw/compressed/parameter_descriptions
  /zr300_node/fisheye/image_raw/compressed/parameter_updates
  /zr300_node/fisheye/image_raw/compressedDepth
  /zr300_node/fisheye/image_raw/compressedDepth/parameter_descriptions
  /zr300_node/fisheye/image_raw/compressedDepth/parameter_updates
  /zr300_node/fisheye/image_raw/theora
  /zr300_node/fisheye/image_raw/theora/parameter_descriptions
  /zr300_node/fisheye/image_raw/theora/parameter_updates
  /zr300_node/imu
  /zr300_node/ir_1/camera_info
  /zr300_node/ir_1/image_raw
  /zr300_node/ir_1/image_raw/compressed
  /zr300_node/ir_1/image_raw/compressed/parameter_descriptions
  /zr300_node/ir_1/image_raw/compressed/parameter_updates
  /zr300_node/ir_1/image_raw/compressedDepth
  /zr300_node/ir_1/image_raw/compressedDepth/parameter_descriptions
  /zr300_node/ir_1/image_raw/compressedDepth/parameter_updates
  /zr300_node/ir_1/image_raw/theora
  /zr300_node/ir_1/image_raw/theora/parameter_descriptions
  /zr300_node/ir_1/image_raw/theora/parameter_updates
  /zr300_node/ir_2/camera_info
  /zr300_node/ir_2/image_raw
  /zr300_node/ir_2/image_raw/compressed
  /zr300_node/ir_2/image_raw/compressed/parameter_descriptions
  /zr300_node/ir_2/image_raw/compressed/parameter_updates
  /zr300_node/ir_2/image_raw/compressedDepth
  /zr300_node/ir_2/image_raw/compressedDepth/parameter_descriptions
  /zr300_node/ir_2/image_raw/compressedDepth/parameter_updates
  /zr300_node/ir_2/image_raw/theora
  /zr300_node/ir_2/image_raw/theora/parameter_descriptions
  /zr300_node/ir_2/image_raw/theora/parameter_updates
  /zr300_node/pointcloud
  ```

# 标定 ZR300

使用 **kalibr** 对 ZR300 进行标定，标定方法可参考 [Kalibr 之 Camera-IMU 标定 (总结)](https://blog.csdn.net/u011178262/article/details/83316968)。

# 安装&运行 VINS-Mono

这里使用 我对VINS-Mono的改版 [cggos/vins_mono_cg](https://github.com/cggos/vins_mono_cg)，配置文件或者标定参数均使用VINS-Mono默认文件。

* 安装 Dependencies
  - eigen3
  - ceres-solver

* 安装 vins_mono_cg

  ```sh
  mkdir -p ws_vins/src
  cd ws_vins/src
  git clone https://github.com/cggos/vins_mono_cg.git
  cd ../
  catkin_make -j3
  ```

* 修改 config/realsense/realsense_fisheye_config.yaml

  ```sh
  imu_topic:   "/zr300_node/imu"
  image_topic: "/zr300_node/fisheye/image_raw"
  output_path: "./output/"
  ```

* 运行 vins_mono_cg

  ```sh
  roslaunch vins_estimator realsense_fisheye.launch
  ```

  <p align="center">
    <img src="../images/vins_mono/vinsmono_zr300_20190303.jpg">
  </p>
