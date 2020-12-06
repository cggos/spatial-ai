---
layout: article
title:  "Camera Control"
date:   2019-04-10
tags: ComputerVision
key: camera-ctrl
---

[TOC]

## Interfaces

```sh
MIPI DSI CSI LVDS DVP SCCB SPI
```

## Drivers

* Video4Linux
  - V4L for short, is a collection of device drivers and an API for supporting realtime video capture on Linux systems.
  - v4l2-ctl
    - `sudo v4l2-ctl -d /dev/video0 --list-formats-ext`

* Firewire
  - [The IEEE1394/USB3 Digital Camera List](https://damien.douxchamps.net/ieee1394/cameras/)

* UVC (USB Video Class)
  - [libuvc_camera (ROS Wiki)](http://wiki.ros.org/libuvc_camera)
  - [saki4510t/UVCCamera](https://github.com/saki4510t/UVCCamera): library and sample to access to UVC web camera on non-rooted Android device

## Viewer/Controller
- [Webcam Test (Online)](https://webcamtests.com/)
- [Turn Camera On (Online)](https://turncameraon.com/)
- [Coriander](https://damien.douxchamps.net/ieee1394/coriander/) is the Linux graphical user interface (GUI) for controlling a Digital Camera through the IEEE1394 bus (aka FireWire, or iLink).
- luvcview: Sdl video Usb Video Class grabber  
- [GTK+ UVC Viewer](http://guvcview.sourceforge.net/index.html)
  * guvcview
- cheese: Take photos and videos with your webcam, with fun graphical effects
- eog: a GNOME image viewer
- [Motion](https://motion-project.github.io/): a highly configurable program that monitors video signals from many types of cameras
  * [如何借助Motion操控Linux监控摄像头](http://blog.sae.sina.com.cn/archives/4902)
  * [树莓派+motion安装摄像头实现远程监控](http://shumeipai.nxez.com/2016/09/01/raspberry-pi-motion-cameras-for-remote-monitoring.html)
- [mjpg-streamer](https://github.com/jacksonliam/mjpg-streamer)
- [Video Capture Tools (Windows)](http://noeld.com/programs.asp?cat=video)

### with Arduino

* [ArduCam](http://www.arducam.com/)
  - [ArduCam GitHub](https://github.com/ArduCAM)
  - [ArduCAM Mini Cameras Tutorial](http://www.arducam.com/knowledge-base/mini-tutorial/)
  - [uctronics (buy)](https://www.uctronics.com/)
  - [dlscorp](https://dlscorp.com/)
* [Visual Capturing with OV7670 on Arduino](https://www.hackster.io/techmirtz/visual-capturing-with-ov7670-on-arduino-069ebb)
* [A Guide to Arduino Based Video Camera](https://www.open-electronics.org/a-complete-guide-to-arduino-based-video-camera/)
* [alchitry camera tutorial](https://alchitry.com/blogs/tutorials/camera)

### Others
* [Linux and webcams](http://krustev.net/w/articles/Linux_and_webcams/)
* [How to Operate Your Spycams with ZoneMinder on Linux (part 1)](https://www.linux.com/learn/how-operate-your-spycams-zoneminder-linux-part-1)
* [Webcam Capture](http://webcam-capture.sarxos.pl/): Generic Webcam Java API
* [Set up a Webcam with Linux](http://www.linuxintro.org/wiki/Set_up_a_Webcam_with_Linux)
* [Accessing the Video Device](https://www.tldp.org/HOWTO/Webcam-HOWTO/dev-intro.html)
* Create Video Device ( /dev/video1 )
  ```sh
  sudo mknod /dev/video1 c 81 1
  sudo chmod 666 /dev/video1
  sudo chgrp video /dev/video1
  ```
