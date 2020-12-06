---
layout: article
title:  "Cameras Overview"
date:   2019-04-10
tags: ComputerVision
key: cameras-overview
---

[TOC]

# Overview

* [Sensors/Cameras (ROS Wiki)](http://wiki.ros.org/Sensors/Cameras)

# 0. Basic Knowledge

* [相机的那些事儿 - 概念、模型及标定](https://yq.aliyun.com/articles/62472)
* [Norman Koren photography: images and tutorials](http://www.normankoren.com/)
* [摄影知识普及：如何用好滤光镜，想进一步玩好摄影必看！](http://www.sohu.com/a/168545276_374721)
* [如何理解 ISO、快门、光圈、曝光这几个概念？](https://www.zhihu.com/question/21427664)
* [Introduction to Shutter Speed in Photography](https://photographylife.com/what-is-shutter-speed-in-photography)
* [HUTTER SPEED: A BEGINNER'S GUIDE](https://www.photographymad.com/pages/view/shutter-speed-a-beginners-guide)
* [EXPOSURE, APERTURE AND SHUTTER SPEED EXPLAINED](https://www.photographymad.com/pages/view/exposure-aperture-shutter-speed)
* [camera资料链接整理](https://blog.csdn.net/ccwwff/article/details/86679455)
* [Sensor Shutter Modes](https://www.ximea.com/support/wiki/allprod/Sensor_Shutter_Modes)

## Benchmark

* [ISO 12233 Test Chart](http://www.graphics.cornell.edu/~westin/misc/res-chart.html)
* [Setting Up an Optical Testing Station](https://www.lensrentals.com/blog/2014/02/setting-up-an-optical-testing-station/)
* [dxomark](https://www.dxomark.com/): source for image quality benchmarks for phones and cameras

# 1. Lenses

* [Lensation](https://www.lensation.de/) provides free of charge consulting about lenses, illumination and optical components
* [1stVision](https://www.1stvision.com/)
* [Digital Network Vision](http://www.digitalnetworkvision.com/)
* [摄像机镜头详细知识](https://zhuanlan.zhihu.com/p/29098395)
* Fisheye Lens: Its not unusual for a fisheye lens to have a FOV of 185 degrees.


# 2. Camera Sensors

* MT9V034
  - [MT9V034 Tutorial：如何使用全局快门摄像头](https://zhuanlan.zhihu.com/p/34516668)

* OV2640
  - [ATK-OV2640 200W摄像头模块资料](http://openedv.com/posts/list/0/41696.htm)

* [Raspberry Pi Camera Sensor Details](http://richshumaker.com/raspi/raspicamera.html)



# 3. Digital Camera
* [gPhoto](http://www.gphoto.org/) is a free, redistributable, ready to use set of digital camera software applications for Unix-like systems
* [digiCamControl](http://digicamcontrol.com/): An innovative and easy to use solution for complex camera control!
* [DSLR Controller](http://www.dslrcontroller.com/) was the first and is still the best app to fully control your Canon EOS DSLR from your Android device, with nothing more than a USB cable.
* [Generic PTP control of digital cameras](https://www.circuitsathome.com/camera-control/generic-ptp-control-of-digital-cameras/)  
![digital_cam_ctrl_p100.jpg](../images/camera/digital_cam_ctrl_p100.jpg)


# 4. Camera Modules

* [In Search of a Better Serial Camera Module](http://sigalrm.blogspot.com/2013/07/in-search-of-better-serial-camera-module.html)
* [摄像头模组基础扫盲](https://www.cnblogs.com/raymon-tec/p/5048632.html)

## MatrixVision mvBlueFox

* [USB 2.0 board-level camera - mvBlueFOX-MLC](https://www.matrix-vision.com/USB2.0-single-board-camera-mvbluefox-mlc.html)
* [KumarRobotics/bluefox2](https://github.com/KumarRobotics/bluefox2): ROS driver for the Matrix Vision mvBlueFOX cameras

## iDS uEye

* [IDS Imaging Development Systems](https://en.ids-imaging.com/home.html)
* [ueye](http://wiki.ros.org/ueye): Driver for IDS Imaging uEye cameras

## [CMUcam](http://www.cmucam.org/)
**Open Source Programmable Embedded Color Vision Sensors**, The first CMUcam made its splash in 1999 as a CREATE Lab project.

* [The CMUcam1 Vision Sensor](https://www.cs.cmu.edu/~cmucam/qanda.html)  
![CMUcam1_B.JPG](../images/camera/CMUcam1_B.JPG)

### [Pixy](https://pixycam.com/)

![pixy_cam.jpg](../images/camera/pixy_cam.jpg)

**Pixy** is **the fifth version of the CMUcam, or CMUcam5**, but “Pixy” is easier to say than CMUcam5, so the name more or less stuck.  Pixy got its start in 2013 as part of a successful Kickstarter campaign, and as a partnership between **Charmed Labs** and **CMU**.

**Pixy2** was announced recently as Pixy’s smaller, faster, and smarter younger sibling.  
![pixy2_cam.jpg](../images/camera/pixy2_cam.jpg)

## [OpenMV](https://openmv.io/)
The OpenMV(**Open-Source Machine Vision**) project aims at making machine vision more accessible to beginners by developing a user-friendly, open-source, low-cost **machine vision platform**.  

OpenMV cameras are programmable in **Python3** and come with an extensive set of **image processing functions** such as face detection, keypoints descriptors, color tracking, QR and Bar codes decoding, AprilTags, GIF and MJPEG recording and more.  

![openmv_cam.jpg](../images/camera/openmv_cam.jpg)

## [NXTCam-v4](http://www.mindsensors.com/ev3-and-nxt/14-vision-subsystem-camera-for-nxt-or-ev3-nxtcam-v4)
Vision Subsystem - Camera for NXT or EV3 (NXTCam-v4)  

![nxtcam_v4.jpg](../images/camera/nxtcam_v4.jpg)

## [JeVois Smart Machine Vision Camera](http://jevois.org/)

Open-source quad-core camera effortlessly adds powerful machine vision to all your PC, Arduino, and Raspberry Pi projects.

![jevois.png](../images/camera/jevois.png)


# 5. 3D (Depth) Cameras

## Structure Light Camera

### Kinect
* [Kinect for windows微软中国体感官方网站](http://www.k4w.cn/)
* [OpenKinect](https://openkinect.org/wiki/Main_Page) is an open community of people interested in making use of the amazing Xbox Kinect hardware with our PCs and other devices.
* [Kinect V1 and Kinect V2 fields of view compared](http://smeenk.com/kinect-field-of-view-comparison/)
* [Ubuntu + Kinect + OpenNI + PrimeSense](http://mitchtech.net/ubuntu-kinect-openni-primesense/)
* [【翻译】Kinect v1和Kinect v2的彻底比较](http://www.cnblogs.com/TracePlus/p/4136297.html)
* [code-iai/iai_kinect2](https://github.com/code-iai/iai_kinect2): Tools for using the Kinect One (Kinect v2) in ROS

### Orbbec Astra Camera
* [astra_camera (ROS Wiki)](http://wiki.ros.org/astra_camera)
* [ROS wrapper for Astra camera](https://github.com/orbbec/ros_astra_camera)

### ASUS Xtion 2
* https://www.asus.com/3D-Sensor/

## Stereo Camera

### Realsense Camera
* [realsense_camera (ROS Wiki)](http://wiki.ros.org/realsense_camera)
* [Intel® RealSense­™ Camera ZR300](https://software.intel.com/en-us/realsense/zr300)
* [ethz-asl/maplab_realsense](https://github.com/ethz-asl/maplab_realsense): Simple ROS wrapper for the Intel RealSense driver with a focus on the ZR300

### ZED Stereo Camera
* [StereoLabs](https://www.stereolabs.com/)

### FLIR Bumblebee
* [立体视觉](https://www.ptgrey.com/stereo-vision-cameras-systems)

### Tara
* [Tara - USB 3.0 Stereo Vision Camera](https://www.e-consystems.com/3D-USB-stereo-camera.asp)

## Event Camera
* [Event Camera动态视觉传感器，让无人机用相机低成本进行导航](https://www.leiphone.com/news/201709/LkfPqS60ZYgmXk8x.html)
