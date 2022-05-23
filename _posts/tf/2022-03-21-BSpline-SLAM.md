---
layout: article
title:  "B-Spline for SLAM"
tags: TF BSpline
key: tf-bspline-slam
---

# Overview

to convert a set of trajectory points into **a continuous-time uniform cubic cumulative b-spline**

* [BSpline.ipynb on Google Colaboratory](https://colab.research.google.com/drive/1AdQwKN3uagVIbMM2ckNsrD2oy6t7RFpy?usp=sharing)

# Uniform Cubic B-Splines in $\mathbb{SE(3)}$

<p align="center">
  <img src="../images/bspline/bspline_se3.png" style="width:60%">
</p>

# Continuous and Discrete Time

- 离散时间
    - 通过IMU运动学模型，进行IMU预**积分**
    - 跟Cam时间戳对齐
    - 联合优化
- 连续时间
    - Cam位姿BSpline拟合连续位姿
    - 位姿**微分**

# Applications

## 路径规划 轨迹优化

- [https://zhuanlan.zhihu.com/p/159192419](https://zhuanlan.zhihu.com/p/159192419)

## 连续时间轨迹估计

- [https://jishuin.proginn.com/p/763bfbd6f25e](https://jishuin.proginn.com/p/763bfbd6f25e)
    
    <aside>
    💡 连续时间的轨迹表示方法：
    1）离散时间的轨迹优化方法是直接针对机器人的离散时间的轨迹点来进行位姿图优化。
    2）连续时间的轨迹优化方法不直接对机器人的轨迹点进行优化，而是将机器人的轨迹用B样条来拟合，并且通过调整B样条的控制点的位置使得轨迹尽可能贴合观测。
    
    本文采用两组B样条控制点，分别拟合机器人的旋转与平移在时间上的轨迹。
    
    </aside>
    

## IMU插值与数据仿真

- [Kitti IMU 样条插值](https://zhuanlan.zhihu.com/p/161368349)
    
<p align="center">
  <img src="../images/bspline/bspline_imu_kitti.png" style="width:80%">
</p>

### IMU数据仿真

- [https://docs.openvins.com/classov__core_1_1BsplineSE3.html](https://docs.openvins.com/classov__core_1_1BsplineSE3.html)
- [https://matheecs.tech/study/2019/06/23/BSpline.html](https://matheecs.tech/study/2019/06/23/BSpline.html)
- [从已有轨迹生成imu数据推导](https://blog.csdn.net/weixin_40224537/article/details/105546113)
    
<p align="center">
  <img src="../images/bspline/bspline_imu.jpg" style="width:80%">
</p>

## Unsynchronized multi-sensor intrinsic and extrinsic least-squares calibration

### IMU与Cam的相机外参标定

ref:

- [https://zhuanlan.zhihu.com/p/68863677](https://zhuanlan.zhihu.com/p/68863677)

camera-imu外参标定大体上分为三步：

1. 粗略估计camera与imu之间时间延时。
    - 利用camera的样条曲线获取任意时刻camera旋转角速度，而陀螺仪又测量imu的角速度
    - 现在利用两个曲线的**相关性**，可以粗略估计imu和camera时间延时
2. 获取imu-camera之间初始旋转，还有一些必要的初始值：重力加速度、陀螺仪偏置。
3. 大优化，包括所有的角点重投影误差、imu加速度计与陀螺仪测量误差、偏置随机游走噪声。