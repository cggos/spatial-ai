---
layout: article
title:  "Intel RealSense T265 Report"
date:   2019-07-25
tags: VI-Modules
key: realsense-t265-report
---

[TOC]

# Overview

* [Intel RealSense Tracking Camera T265](https://www.intelrealsense.com/tracking-camera-t265)

## Tech Specs

* **Intel® Movidius™ Myriad™ 2.0 VPU**: Visual Processing Unit optimized to run V‑SLAM at low power
* **Two Fisheye lenses**
  - FOV: close to hemispherical 163±5° field of view
  - Resolution: 840x800
  - Frame Rate: 30 FPS
  - Image Format: Y8
  - sensor: OV9282
* **BMI055 IMU**
  - Gyroscope
    - Frame Rate: 200 FPS
  - Accelerator
    - Frame Rate: 62 FPS
* **infrared cut filter**: The T265 features an infrared cut filter over the lenses, allowing it to ignore the projected patterns from D400 series depth cameras
* pose output
  - Format: 6DOF
  - Frame Rate: 200 FPS

<p align="center">
    <img src="../images/vi_modules/t265_view.png" style="width:100%;">
</p>

# Install

* https://www.intelrealsense.com/developers/

# Run

```sh
realsense-viewer
```

# Test

## Results

* 相机前视，运行正常，回到原点
  <p align="center">
      <img src="../images/vi_modules/t265_trajectory_01.png" style="width:100%;">
  </p>
  <p align="center">
      <img src="../images/vi_modules/t265_trajectory_02.png" style="width:100%;">
  </p>

* 相机下视，运行正常，最终离原点误差 0.8m 左右
  <p align="center">
      <img src="../images/vi_modules/t265_trajectory_downview.png" style="width:100%;">
  </p>

* 快速运动（某些地方来回快速挥动），正常运行，不飞，最终离原点误差 2m 左右
  <p align="center">
      <img src="../images/vi_modules/t265_trajectory_hightspeed.png" style="width:100%;">
  </p>

* 遮挡右目，正常运行，最终离原点误差 0.7m 左右
  <p align="center">
      <img src="../images/vi_modules/t265_trajectory_only_left.png" style="width:100%;">
  </p>

* 遮挡左目，正常运行，最终离原点误差 2m 左右
  <p align="center">
      <img src="../images/vi_modules/t265_trajectory_only_right.png" style="width:100%;">
  </p>

## Conclusion

### pros

* 相机前视，正常运动，回到原点
* 快速运动（手快速来回挥动）不会飞，不过最终到原点的误差会差些
* 相机下视（看到的都是地毯），也会正常运行，不过最终到原点的误差会差些
* 遮挡任一相机（单目状态），也会正常运行，不过最终到原点的误差会差些

### cons

* 回环检测（貌似没有，待确定）
* 运行中静止一段时间，有时SLAM挂掉
* SLAM挂掉后有时需要重新插拔T265后才能正常启动
