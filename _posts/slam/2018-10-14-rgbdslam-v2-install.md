---
layout: article
title: "Ubuntu 16.04 下 RGBDSLAM-v2 的安装和使用"
date: 2018-10-14
tags: SLAM
key: slam-rgbdslam-v2-install
---

# 简介

[RGBD-SLAM-v2](http://felixendres.github.io/rgbdslam_v2/) is a state-of-the-art SLAM system for **RGB-D cameras**, e.g., the Microsoft Kinect. You can use it to create highly accurate **3D point clouds or OctoMaps**.

RGBDSLAMv2 is based on the ROS project, OpenCV, PCL, OctoMap, SiftGPU and more.

# rgbdslam_v2_cg

**!!! Important**  

本人已建立了 RGBDSLAM-v2 的改版 [cggos/rgbdslam_v2_cg](https://github.com/cggos/rgbdslam_v2_cg)，可直接跳转到该项目下，阅读 README.md 进行项目的安装，本文以下部分不必阅读。

**!!! Important**  


# 运行环境
* 平台
  - Ubuntu 16.04 + ROS kinetic
* 数据源
  - RGB-D dataset: **rgbd_dataset_freiburg1_xyz.bag**
  - RGB-D camera: **Realsense Camera ZR300**

# 安装依赖
* `sudo apt-get install libglew1.5-dev libdevil-dev libsuitesparse-dev`
* [rgbdslam作者的g2o](https://github.com/felixendres/g2o)
  ```
  git clone https://github.com/felixendres/g2o.git
  ```
* pcl-1.8.0
  ```
  wget https://github.com/PointCloudLibrary/pcl/archive/pcl-1.8.0.tar.gz
  ```
  pcl-1.8.0 的 CMakeLists.txt 中加入 C++11 支持:
  ```
  SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
  ```
依赖库g2o和pcl不兼容，可能导致 **“required process[rgbdslam-2] has died”......Iinitiating down** 问题，程序挂掉。

# 编译 rgbdslam_v2
* 下载 rgbdslam_v2
  ```
  wget -q http://github.com/felixendres/rgbdslam_v2/archive/kinetic.zip
  ```
* rosdep
  ```
  rosdep update
  rosdep install rgbdslam
  ```
* 修改 CMakeLists.txt
  - 第6行加入: `add_compile_options(-std=c++11)`
  - `set(USE_SIFT_GPU  1 CACHE BOOL "build with support for siftgpu")` 改为 `set(USE_SIFT_GPU  0 CACHE BOOL "build with support for siftgpu")`
  - `find_package(PCL 1.7 REQUIRED COMPONENTS common io)` 改为 `find_package(PCL 1.8 REQUIRED COMPONENTS common io)`
* 编译
  ```
  catkin_make
  ```

# 运行

## RGB-D 数据集
RGB-D 数据集 使用 **rgbd_dataset_freiburg1_xyz.bag**

* 修改 rgbdslam_v2 的 launch文件 rgbdslam.launch 中的 图像topic
  ```
  <param name="config/topic_image_mono"              value="/camera/rgb/image_color"/>
  <param name="config/topic_image_depth"             value="/camera/depth/image"/>
  ```
* 运行
  ```
  roscore & rosbag play rgbd_dataset_freiburg1_xyz.bag
  roslaunch rgbdslam rgbdslam.launch
  ```
* 结果  
![rgbdslam_v2_rgbd_dataset_freiburg1_xyz.png](../images/RGBDSLAM_v2/rgbdslam_v2_rgbd_dataset_freiburg1_xyz.png)

## RGB-D 相机
RGB-D 相机 使用 **Realsense Camera ZR300**

* 修改 rgbdslam_v2 的 launch文件 rgbdslam.launch 中的 图像topic
  ```
  <param name="config/topic_image_mono"              value="/camera/rgb/image_color"/>
  <param name="config/topic_image_depth"             value="/camera/depth_registered/sw_registered/image_rect_raw"/>
  ```
* 运行
  ```
  roslaunch realsense_camera zr300_nodelet_rgbd.launch
  roslaunch rgbdslam rgbdslam.launch
  ```
* 结果  
![rgbdslam_v2_realsense_zr300.png](../images/RGBDSLAM_v2/rgbdslam_v2_realsense_zr300.png)

# 参考
* [Instructions for Compiling Rgbdslam (V2) on a Fresh Ubuntu 16.04 Install (Ros Kinetic) in Virtualbox](https://hubpages.com/technology/Instructions-for-compiling-rgbdslam-v2-on-a-fresh-Ubuntu-1604-install-ros-kinetic-in-virtualbox)
