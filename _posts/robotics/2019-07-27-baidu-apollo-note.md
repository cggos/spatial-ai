---
layout: article
title:  "百度Apollo课程学习笔记"
date:   2019-07-27
tags: Robotics AutonomousDriving
key: baidu-apollo-note
---

* the note is from [Apollo Self-Driving Car Lesson](http://apollo.auto/devcenter/devcenter.html)

## Self-Driving Overview

* why need self-driving car  
  ![](../images/apollo/why_need.png)

* 5 driving levels  
  ![](../images/apollo/driving-level.png)

* self-driving car history
  ![](../images/apollo/self-driving-history.png)

* how self-driving car work  
  ![](../images/apollo/5-components.png)

* hardware  
  ![](../images/apollo/car_hardware.png)

* Open Sofware Stack
  - RTOS: Ubuntu + Apollo Kernel
  - ROS
  - Decentralization: No ROS Master Scheme
  - Protobuf

* Cloud Services
  - HD Map
  - Simulation
  - Data Platform
  - Security
  - OTA(Over-The-Air) updatea
  - DuerOS


## High-Definition Map

* 3d representation of the road
* centimeter-level precision
* localization: data match
* OpenDRIVE standard

* HD map construction  
  ![](../images/apollo/HD-map-construction.png)

* HD map crowdsourcing  
  ![](../../images/apollo/HD-map-crowdsourcing.png)

## Localization

* need 10 centi-meter accuracy, but GPS error 1-3 meter

* localization  
  ![](../images/apollo/localization.png)

* GNSS RTK  
  ![](../images/apollo/gps_rtk.png)

* Inertial Navigation
  - accelerator
  - gyroscope

* LiDAR localization
  - ICP
  - filter: Histogram
  - advantage: robust

* visual localization
  - match

* multi-sensor fusion: kalman filter: prediction(Inertial) and update(GNSS LiDAR)  
    ![](../images/apollo/localization_kf.png)

## Perception

* perception overview  
  ![](../images/apollo/perception_overview.png)

* classification pipeline  
  ![](../images/apollo/classification_pipeline.png)

* Camera images

* LiDAR images

* Machine Learning
  - born in 1960s
  - supervised learning
  - unsupervised learning

* Neural Network

* Backpropagation

* Convolutional Neural Network

* Detection and Classification

* Tracking

* Segmentation  
  ![](../images/apollo/full_cnn.png)

* Sensor Data Comparision  
  ![](../images/apollo/sensor_comparision.png)

* Perception Fusion

## Prediction

* realtime & accuracy
* approaches: model-based & data-driven  
  ![](../images/apollo/prediction_approaches.png)

* Trajectory Generation
  - polynomial model

## Planning

* goal: find the best path from A to B on the map
* input: map, our position and destination

* World to Graph

* A star algorithm

* 3D trajectory  
  ![](../images/apollo/3D_trajectory.png)

* Evaluating a Trajectory  
  ![](../images/apollo/evaluate_trajectory.png)

* Frenet Coordinates

* Path-Velocity Decoupled Planning

## Control

* steering, acceleration and brake  
  ![](../images/apollo/control_input.png)

* PID

* LQR

* MPC
