---
layout: article
title:  "Raspberry Pi Overview"
date:   2018-10-18
tags: Embedded
key: raspeberry-pi-overview
---

* [raspberrypi.org](https://www.raspberrypi.org/)
* [Raspbian](http://www.raspbian.org/)
* [RPi Hub](https://elinux.org/RPi_Hub)
* [Raspberry-at-home](http://raspberry-at-home.com/)
* [树莓派实验室](http://shumeipai.nxez.com/)
* [树莓派论坛](http://www.shumeipai.net/portal.php)
* [树莓派吧](http://www.shumeipaiba.com/)
* [RPi Hardware](https://elinux.org/RPi_Hardware)
* [Piddlerintheroot](https://www.piddlerintheroot.com/)

![RPi.jpg](../images/embedded/RPi.jpg)

-----

* [开机篇 – 树莓派 Raspberry Pi Model B+ 入手折腾记 (1)](http://blog.davidrobot.com/2014/11/raspberry_pi_model_b_plus_startup.html)
* [树莓派3B上手（无显示器）](https://www.jianshu.com/p/8d1e9a8ace52)
* [树莓派新手入门教程 (阮一峰)](http://www.ruanyifeng.com/blog/2017/06/raspberry-pi-tutorial.html)

* [有哪些对树莓派的有趣改造和扩展应用？](https://www.zhihu.com/question/20697024)


# Install & Config System
* [Docker on Raspberry Pi](https://resin.io/blog/docker-on-raspberry-pi/)

## 系统镜像下载
* [树莓派操作系统大全](http://wiki.nxez.com/rpi:list-of-oses)

## 烧写树莓派镜像

### Linux
* [INSTALLING OPERATING SYSTEM IMAGES ON LINUX](https://www.raspberrypi.org/documentation/installation/installing-images/linux.md)

1.终端通过`df -h`查找sd卡，类似于 **/dev/sdc1**  
2.卸载sd卡: `sudo umount /dev/sdc1`  
3.烧录镜像: `sudo dd bs=1M if=<path-to-raspbian.img> of=/dev/sdc`  
4.运行`sudo sync`确保所有数据被正确写入  

## 配置系统
* [Raspbian Repository Mirrors](http://www.raspbian.org/RaspbianMirrors)
* [RPi Serial Connection](https://elinux.org/RPi_Serial_Connection)
* [Raspberry Pi and the Serial Port](http://www.hobbytronics.co.uk/raspberry-pi-serial-port)
* [树莓派连接无线网wifi配置方法](http://www.shumeipaiba.com/wanpai/jiaocheng/25.html)
* [Cutting The Wire – WiFi Configuration](http://raspberry-at-home.com/wifi-configuration/)
* [Pi Dashboard (Pi 仪表盘)](http://maker.quwj.com/project/10)


# Programming
* [Wiring Pi](http://wiringpi.com/): GPIO Interface library for the Raspberry Pi

## ScratchGPIO
* [Cymplecy (Simplesi)](http://simplesi.net/)
* [cymplecy/Scratch2GPIO: Use Scratch 2 on a PC to control GPIO pins on a Raspberry Pi using ScratchGPIO](https://github.com/cymplecy/Scratch2GPIO)

## Javascript
* [Raspi.js](https://github.com/nebrius/raspi): Base functionality for working with a Raspberry Pi from Node.js
