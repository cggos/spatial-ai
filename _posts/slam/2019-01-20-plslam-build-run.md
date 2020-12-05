---
layout: article
title: "Ubuntu 16.04 下 PL-SLAM (Stereo) 的安装和使用"
date: 2019-01-20
tags: SLAM

---

[TOC]

# Overview

This code [rubengooj/pl-slam](https://github.com/rubengooj/pl-slam) contains an algorithm to compute **stereo visual SLAM** by using **both point and line segment features**.

* Related Publication

  ```bibtex
  @article{gomez2017pl,
    title   = {PL-SLAM: a Stereo SLAM System through the Combination of Points and Line Segments},
    author  = {Gomez-Ojeda, Ruben and Zuñiga-Noël, David and Moreno, Francisco-Angel and Scaramuzza, Davide and Gonzalez-Jimenez, Javier},
    journal = {arXiv preprint arXiv:1705.09479},
    year    = {2017}
  ```

# Prerequisites and Dependencies

* Basics

  ```sh
  sudo apt install build-essential pkg-config libboost-dev \
  libsuitesparse-dev libeigen3-dev libyaml-cpp-dev
  ```

* OpenCV 3.x.x
  - I installed **OpenCV 3.3.1** along with **ros-kinetic**

* G2O
  - recommend version: commit id **ff647bd** (ff647bd7537860a2b53b3b774ea821a3170feb13)

* [MRPT/mrpt](https://github.com/MRPT/mrpt): The Mobile Robot Programming Toolkit
  - recommend version: commit id **0c3d605** (0c3d605c3cbf5f2ffb8137089e43ebdae5a55de3)

  ```sh
  git clone https://github.com/MRPT/mrpt.git
  git branch cg_0c3d605 0c3d605c3cbf5f2ffb8137089e43ebdae5a55de3
  git checkout cg_0c3d605

  # install dependencies
  sudo apt install libdc1394-22-dev libjpeg-dev libftdi-dev freeglut3-dev \
  libwxgtk3.0-dev zlib1g-dev libusb-1.0-0-dev libudev-dev libfreenect-dev \
  libavformat-dev libswscale-dev libassimp-dev libgtest-dev libpcap-dev

  # build & install
  mkdir build & cd build
  cmake .. & make -j4
  sudo make install
  ```

* [rubengooj/stvo-pl](https://github.com/rubengooj/stvo-pl): Stereo Visual Odometry by combining point and line segment features

  ```sh
  git clone https://github.com/rubengooj/stvo-pl.git
  cd stvo-pl
  chmod +x build.sh
  ./build.sh
  ```

**Note:** it's better **mrpt, stvo-pl and pl-slam are in the same directory**


# Build

## Build pl-slam

```sh
git clone https://github.com/rubengooj/pl-slam.git
chmod +x build.sh
./build.sh
```

## Errors

* Q: **/usr/bin/ld: cannot find -lg2o_ext_csparse**  
  A: `sudo ln -sv libg2o_csparse_extension.so libg2o_ext_csparse.so`


# Run

## Dataset

* [Kitti Dataset](http://www.cvlibs.net/datasets/kitti/eval_odometry.php): data_odometry_gray (~22G)

### Kitti data_odometry_gray

* edit `~/.bashrc`, and  
  add `export DATASETS_DIR=<path-to-data_odometry_gray>/sequences`
* copy `pl-slam/config/dataset_params/kitti00-02.yaml`  
  to `<path-to-data_odometry_gray>/sequences/00/`,  
  rename the yaml file to `dataset_params.yaml` and change it if necessary
* `source ~/.bashrc`
* edit `pl-slam/config/config/config_kitti.yaml`, change the value of **vocabulary_p** and **vocabulary_l**
* run  
  `./plslam_dataset 00 -c ../config/config/config_kitti.yaml -o 100 -s 1 -n 1000`  
  or  
  `./plslam_dataset 00 -c ../config/config/config_kitti.yaml -o 100 -s 1`

#### Result

<p align="center">
  <img src="../images/pl_slam/pl_slam_3dscene.png">
</p>


### EuRoC MH_01_easy

* edit `~/.bashrc`, and add `export DATASETS_DIR=<path-to-MH_01_easy>`
* copy `pl-slam/config/dataset_params/euroc_params.yaml` to `<path-to-MH_01_easy>/mav0/`,  
  rename the yaml file to `dataset_params.yaml`  and change it if necessary
* `source ~/.bashrc`
* edit `pl-slam/config/config/config_euroc.yaml`, change the value of **vocabulary_p** and **vocabulary_l**
* run `./plslam_dataset mav0 -c ../config/config/config_euroc.yaml -o 100 -s 1`

### Run Errors

* the app crashed and get the following error when restart the app after close it with `Ctrl+C`

  > DRM_IOCTL_I915_GEM_APERTURE failed: Invalid argument
  Assuming 131072kB available aperture size.
  May lead to reduced performance or incorrect rendering.
  get chip id failed: -1 [22]
  param: 4, val: 0
  Segmentation fault (core dumped)

  and it fixed after **reinstalling Nvidia-driver**

* the app crashed with the error `Segmentation fault (core dumped)` after run `Frame #1600` with the **KITTI data_odometry_gray** dataset, but **have not solved it**
