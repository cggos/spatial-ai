---
layout: article
title: "Ubuntu 16.04 下 VINS-Kidnap(Docker) 的安装和使用"
date: 2019-12-18
tags: SLAM

---

[TOC]

# Overview

* [HKUST-Aerial-Robotics/VINS-kidnap](https://github.com/HKUST-Aerial-Robotics/VINS-kidnap): VINS-Fusion with Cerebro

* [vins kidnap安装使用](https://blog.csdn.net/huanghaihui_123/article/details/90181975)

# Install Nvidia Drive and CUDA

* [ubuntu上安装NVIDIA驱动和cuda9.0，及NVIDIA-Docker](https://blog.csdn.net/huanghaihui_123/article/details/87985403)

# Install Docker and Nvidia-Docker

* [用nvidia-docker跑深度学习模型](https://blog.csdn.net/weixin_42749767/article/details/82934294)

# Run MYNT-EYE-S-SDK

```sh
roslaunch mynt_eye_ros_wrapper mynteye.launch
```

# VINS-Kidnap Docker

* https://hub.docker.com/r/mpkuse/kusevisionkit

* run docker image
  ```sh
  docker run --runtime=nvidia -it \
          --add-host `hostname`:172.17.0.1 \
          --env ROS_MASTER_URI=http://`hostname`:11311/ \
          --env ROS_IP=172.17.0.2 \
          --env CUDA_VISIBLE_DEVICES=0 \
          --hostname happy_go \
          --name happy_go  \
          mpkuse/kusevisionkit:vins-kidnap bash
  ```

* modify yaml config file related to mynteye camera in
  ```sh
  /app_deployed/catkin_ws/src/cerebro/config/vinsfusion/mynteye
  ```

* run mynteye_vinsfusion
  ```sh
  roslaunch cerebro mynteye_vinsfusion.launch
  ```
