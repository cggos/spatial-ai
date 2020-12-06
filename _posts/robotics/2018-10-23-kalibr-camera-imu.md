---
layout: article
title:  "Kalibr 之 Camera-IMU 标定 (总结)"
date:   2018-10-23
tags: Robotics SensorCalib
key: kalibr-camera-imu
---

[TOC]

# Overview
[ethz-asl/kalibr](https://github.com/ethz-asl/kalibr) is a toolbox that solves the following calibration problems:
* **Multiple camera calibration**: intrinsic and extrinsic calibration of a camera-systems with non-globally shared overlapping fields of view
* **Camera-IMU calibration**: spatial and temporal calibration of an IMU w.r.t a camera-system
* **Rolling Shutter Camera calibration**: full intrinsic calibration (projection, distortion and shutter parameters) of rolling shutter cameras

本文以 **单目+IMU** 和 **双目+IMU** 为例，讲解使用 **Kalibr工具** 标定 **Camera-IMU**，其中使用的摄像头分别为 **Realsense ZR300** 和 **MYNT-EYE S系列摄像头**。

**注意**：本文用于学习kalibr标定过程，文中结果仅供参考。

# 1. 标定 Camera

## 采集 images

**注意**： 采集图像时，帧率控制在4帧左右

* 单目

  ```bash
  rosbag record /camera/fisheye/image_raw -O images.bag
  ```

* 双目

  ```bash
  rosbag record /stereo/left/image_raw /stereo/right/image_raw -O images.bag
  ```

## 标定 Camera

* 单目

  ```bash
  kalibr_calibrate_cameras \
      --target april_6x6_24x24mm.yaml \
      --bag images.bag --bag-from-to 5 20 \
      --models pinhole-fov \
      --topics /camera/fisheye/image_raw
  ```

* 双目

  ```bash
  kalibr_calibrate_cameras \
      --target april_6x6_24x24mm.yaml \
      --bag images.bag --bag-from-to 5 30 \
      --models pinhole-radtan pinhole-radtan \
      --topics /stereo/left/image_raw /stereo/right/image_raw
  ```

### 标定评估

重投影误差在 **0.1~0.2** 以内，标定结果较好，如下所示。

<p align="center">
  <img src="../images/kalibr/kalibr_cam_result.jpg">
</p>

### Other Camera Calib Tools

* ROS camera_calibration
* PTAM Calibration ( ATAN / FOV camera model )
* OCamCalib toolbox

## 输出 cam_chain.yaml

* 单目  

  sample file output:  

  ```yaml
  cam_overlaps: []
    camera_model: pinhole
    distortion_coeffs: [0.9183540411447179]
    distortion_model: fov
    intrinsics: [252.40344712951838, 253.29272771389083, 310.9288373770512, 227.37425906476517]
    resolution: [640, 480]
    rostopic: /camera/fisheye/image_raw
  ```

* 双目  

  sample file output:  

  ```yaml
  cam0:
    cam_overlaps: [1]
    camera_model: pinhole
    distortion_coeffs: [0.962084349711143]
    distortion_model: fov
    intrinsics: [334.23991339518517, 333.6035571693483, 368.20264278064553, 252.393048692916]
    resolution: [752, 480]
    rostopic: /stereo/left/image_raw
  cam1:
    T_cn_cnm1:
    - [0.9999904159643447, 0.0026734233431591698, -0.003467100673890538, -0.1172292375035688]
    - [-0.002666210133778015, 0.999994275307285, 0.002083428947247444, 0.0001658846059485747]
    - [0.003472650713385957, -0.002074164960638575, 0.9999918192349059, -0.0002328222935304919]
    - [0.0, 0.0, 0.0, 1.0]
    cam_overlaps: [0]
    camera_model: pinhole
    distortion_coeffs: [0.9617138563016285]
    distortion_model: fov
    intrinsics: [330.66005261900216, 330.07191301082963, 371.03802575515203, 231.03601204806853]
    resolution: [752, 480]
    rostopic: /stereo/right/image_raw
  ```


# 2. 标定 IMU

* [imu_utils](https://github.com/gaowenliang/imu_utils): A ROS package tool to analyze the IMU performance, C++ version of Allan Variance Tool.

## 采集 IMU 数据

* collect the data while the IMU is **Stationary**, with a **two hours** duration

```bash
rosbag record /camera/imu/data_raw -O imu.bag
```

## 标定 IMU

```bash
rosbag play -r 200 imu.bag
roslaunch imu_utils ZR300.launch
```

**ZR300.launch** 文件内容

```xml
<launch>
    <node pkg="imu_utils" type="imu_an" name="imu_an" output="screen">
        <param name="imu_topic" type="string" value= "/camera/imu/data_raw"/>
        <param name="imu_name" type="string" value= "ZR300"/>
        <param name="data_save_path" type="string" value= "$(find imu_utils)/data/"/>
        <param name="max_time_min" type="int" value= "80"/>
        <param name="max_cluster" type="int" value= "100"/>
    </node>
</launch>
```

输出 **ZR300_imu_param.yaml**，sample file output:  

```yaml
%YAML:1.0
---
type: IMU
name: ZR300
Gyr:
   unit: " rad/s"
   avg-axis:
      gyr_n: 2.7878706973951564e-03
      gyr_w: 1.6503780396374297e-05
   x-axis:
      gyr_n: 3.2763884944799469e-03
      gyr_w: 1.8012497709865783e-05
   y-axis:
      gyr_n: 2.7204386280639753e-03
      gyr_w: 1.6637042617714669e-05
   z-axis:
      gyr_n: 2.3667849696415461e-03
      gyr_w: 1.4861800861542444e-05
Acc:
   unit: " m/s^2"
   avg-axis:
      acc_n: 2.5172832889483965e-02
      acc_w: 4.4150867224248972e-04
   x-axis:
      acc_n: 2.4450765767551903e-02
      acc_w: 4.0728821351916671e-04
   y-axis:
      acc_n: 2.1474226370935746e-02
      acc_w: 2.1468705215157706e-04
   z-axis:
      acc_n: 2.9593506529964245e-02
      acc_w: 7.0255075105672530e-04
```

## 输出 imu.yaml

根据标定结果修改 **imu.yaml**，其文件内容为  

```yaml
#Accelerometers
accelerometer_noise_density: 2.52e-02   #Noise density (continuous-time)
accelerometer_random_walk:   4.41e-04   #Bias random walk

#Gyroscopes
gyroscope_noise_density:     2.78e-03   #Noise density (continuous-time)
gyroscope_random_walk:       1.65e-05   #Bias random walk

rostopic:                    /camera/imu/data_raw   #the IMU ROS topic
update_rate:                 200.0      #Hz (for discretization of the values above)
```


# 3. 标定 Camera-IMU

## 采集 images & imu 数据

* 单目 + IMU

  ```bash
  rosbag record /camera/imu/data_raw /camera/fisheye/image_raw -O images_imu.bag
  ```

* 双目 + IMU

  ```bash
  rosbag record /camera/imu/data_raw /stereo/left/image_raw /stereo/right/image_raw -O images_imu.bag
  ```

## 标定

```bash
kalibr_calibrate_imu_camera \
    --target april_6x6_24x24mm.yaml \
    --bag images_imu.bag \
    --bag-from-to 5 45 \
    --cam camchain.yaml \
    --imu imu.yaml \
    --imu-models scale-misalignment \
    --timeoffset-padding 0.1
```

* **--bag-from-to 5 45**: because there are shocks in the dataset (sensor pick-up/lay-down), only the data between 5 to 45 s is used

## 输出 camchain-imucam.yaml

* 单目 + IMU

  sample file output:  

  ```yaml
  cam0:
    T_cam_imu:
    - [0.9996455719455962, 0.02441693761016358, -0.010608659071806014, -0.15423539234968817]
    - [-0.024769907516072436, 0.9990969029165591, -0.03452289478279192, -0.0032297199459559245]
    - [0.00975613505470538, 0.03477343440443987, 0.9993476002315277, 0.150153755143352]
    - [0.0, 0.0, 0.0, 1.0]
    cam_overlaps: []
    camera_model: pinhole
    distortion_coeffs: [0.9183540411447179]
    distortion_model: fov
    intrinsics: [252.40344712951838, 253.29272771389083, 310.9288373770512, 227.37425906476517]
    resolution: [640, 480]
    rostopic: /camera/fisheye/image_raw
    timeshift_cam_imu: 0.7904787918609288
  ```

* 双目 + IMU  

  sample file output:   

  ```yaml
  cam0:
    T_cam_imu:
    - [0.0008247496568674628, 0.9999961104998093, -0.002664352314491823, 0.043041669055924436]
    - [-0.9999929524133787, 0.0008149826348758382, -0.003664822898610003, 0.003376471075594937]
    - [-0.0036626372434111396, 0.0026673560986662063, 0.9999897350972485, -0.021104195227740437]
    - [0.0, 0.0, 0.0, 1.0]
    cam_overlaps: [1]
    camera_model: pinhole
    distortion_coeffs: [0.962084349711143]
    distortion_model: fov
    intrinsics: [334.23991339518517, 333.6035571693483, 368.20264278064553, 252.393048692916]
    resolution: [752, 480]
    rostopic: /stereo/left/image_raw
    timeshift_cam_imu: 0.00019201226395901445
  cam1:
    T_cam_imu:
    - [-0.001835964017484093, 0.999979457302906, -0.00614118948676923, -0.07410578385444819]
    - [-0.9999970575613598, -0.001845664547293735, -0.001574290634432294, 0.003383609126826685]
    - [-0.001585592869970595, 0.0061382810757381065, 0.9999799034984085, -0.021194379548050524]
    - [0.0, 0.0, 0.0, 1.0]
    T_cn_cnm1:
    - [0.9999904159643451, 0.00267342334315917, -0.003467100673890538, -0.1172292375035688]
    - [-0.0026662101337780156, 0.9999942753072855, 0.0020834289472474446, 0.0001658846059485747]
    - [0.003472650713385957, -0.0020741649606385755, 0.9999918192349063, -0.0002328222935304919]
    - [0.0, 0.0, 0.0, 1.0]
    cam_overlaps: [0]
    camera_model: pinhole
    distortion_coeffs: [0.9617138563016285]
    distortion_model: fov
    intrinsics: [330.66005261900216, 330.07191301082963, 371.03802575515203, 231.03601204806853]
    resolution: [752, 480]
    rostopic: /stereo/right/image_raw
    timeshift_cam_imu: 0.0001648708557824339
  ```
