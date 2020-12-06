---
layout: article
title:  "各相机模型(针孔+鱼眼)综述"
date:   2019-01-26
tags: ComputerVision
key: camera-models-overview
---

[TOC]

# Overview

## Lens Projections

* [About the various projections of the photographic objective lenses](http://michel.thoby.free.fr/Fisheye_history_short/Projections/Various_lens_projection.html)
* [Models for the various classical lens projections](http://michel.thoby.free.fr/Fisheye_history_short/Projections/Models_of_classical_projections.html)
* [鱼眼相机成像、校准和拼接(笔记)](http://blog.sciencenet.cn/blog-465130-1052526.html)
* [Computer Generated Angular Fisheye Projections](http://paulbourke.net/dome/fisheye/)

<p align="center">
  <img src="../images/camera_model/five_various_theoretical_classical_projections_01.jpg"> <img src="../images/camera_model/five_various_theoretical_classical_projections_02.jpg">
</p>

* Perspective and fisheye imaging process
<p align="center">
  <img src="../images/camera_model/perspective_fisheye_imaging.png">
</p>

## Optics: Terminology

* Dioptric: All elements are refractive (lenses)
* Catoptric: All elements are reflective (mirrors)
* Catadioptric: Elements are refractive and reflective (mirrors + lenses)

## Camera Models

* [Double Sphere Camera Model (TUM)](https://vision.in.tum.de/research/vslam/double-sphere)


## Papers

* *Straight Lines Have to be Straight: Automatic Calibration and Removal of Distortion from Scenes of Structured Environments*
* *A Generic Camera Model and Calibration Method for Conventional, Wide-Angle, and Fish-Eye Lenses*
* *Single View Point Omnidirectional Camera Calibration from Planar Grids*
* *The Double Sphere Camera Model*

## Related Code

* [Supported models in Kalibr](https://github.com/ethz-asl/kalibr/wiki/supported-models)

* Distortion Models in ROS (distortion_models.h)
  - **plumb_bob**: a 5-parameter polynomial approximation of radial and tangential distortion
  - **rational_polynomial**: an 8-parameter rational polynomial distortion model
  - **equidistant** (lunar)
* [hengli/camodocal](https://github.com/hengli/camodocal)
  - Pinhole camera model
  - Unified projection model
  - Equidistant fish-eye model
* [uzh-rpg/rpg_vikit/vikit_common](https://github.com/uzh-rpg/rpg_vikit/tree/10871da6d84c8324212053c40f468c6ab4862ee0/vikit_common/src): support **pinhole, atan and omni camera**

* [ethz-asl/aslam_cv2](https://github.com/ethz-asl/aslam_cv2/tree/master/aslam_cv_cameras/src): support **pinhole and unified peojection** and **radtan, fisheye and equidistant distortion**

* [cggos/okvis_cg](https://github.com/cggos/okvis_cg/tree/master/okvis/okvis_cv/include/okvis/cameras/implementation): support **pinhole peojection** and **radtan and equidistant distortion**

* [ptam_cg/src/ATANCamera.cc](https://github.com/cggos/ptam_cg/blob/master/src/ATANCamera.cc): support **ATAN camera model**


# Pinhole camera

* **pinhole model (rectilinear projection model) + radial-tangential distortion**

The Pinhole camera model is the most common camera model for consumer cameras. In this model, the image is mapped onto a plane through **perspective projection**. The projection is defined by the camera intrinsic parameters such as focal length, principal point, aspect ratio, and skew.

# Fisheye camera

## OpenCV fisheye camera model

* **pinhole model (rectilinear projection model) + fisheye distortion**

The Fisheye camera model is a camera model utilized for wide field of view cameras. This camera model is neccessary because **the pinhole perspective camera model is not capable of modeling image projections as the field of view approaches 180 degrees**.

Given a point $ X=[x_c \quad  y_c \quad  z_c] $ from **the camera $z_c=1$ plane** in camera coordinates, the **pinhole projection** is:

$$
\begin{cases}
r = \sqrt{x_c^2 + y_c^2} \\
\theta = atan2(r, |z_c|) = atan2(r, 1) = atan(r)
\end{cases}
$$

in another way

$$
f = r' \cdot tan(\theta) \quad \text{where} \quad r' = \sqrt{u^2 + v^2}
$$

**fisheye distortion**:

$$
\theta_d =
\theta (1 + k1 \cdot \theta^2 + k2 \cdot \theta^4 +
k3 \cdot \theta^6 + k4 \cdot \theta^8)
$$

The distorted point coordinates are

$$
\begin{cases}
x_d = \frac{\theta_d \cdot x_c} {r} \\
y_d = \frac{\theta_d \cdot y_c} {r}
\end{cases}
$$

convert into pixel coordinates, the final pixel coordinates vector

$$
\begin{cases}
u = f_x (x_d + \alpha y_d) + c_x \\
v = f_y \cdot y_d + c_y
\end{cases}
$$

write in matrix form

$$
\begin{aligned}
\left[\begin{array}{c}u\\v\\1\end{array}\right] =  
\left[\begin{array}{ccc}
f_x & \alpha & c_x \\
0 & f_y & c_y \\
0 & 0 & 1
\end{array}\right]  
\left[\begin{array}{c}x_d\\y_d\\1\end{array}\right]
\end{aligned}
$$

* [Fisheye camera model (OpenCV)](https://docs.opencv.org/master/db/d58/group__calib3d__fisheye.html)
* [FisheyeCameraModel (theia-sfm)](http://www.theia-sfm.org/cameras.html#fisheyecameramodel)

## ATAN model

* **pinhole model (rectilinear projection model) + FOV distortion**
* [ptam_cg/src/ATANCamera.cc](https://github.com/cggos/ptam_cg/blob/master/src/ATANCamera.cc)

This is an alternative representation **for camera models with large radial distortion (such as fisheye cameras) where the distance between an image point and principal point is roughly proportional to the angle between the 3D point and the optical axis**. This camera model is first proposed in ***Straight Lines Have to be Straight: Automatic Calibration and Removal of Distortion from Scenes of Structured Environments***.

Given a point $ X=[x_c \quad  y_c \quad  z_c] $ from **the camera $z_c=1$ plane** in camera coordinates, the **pinhole projection** is:

$$
r = \sqrt{\frac{x_c^2 + y_c^2}{z_c^2}} = \sqrt{x_c^2 + y_c^2}
$$

**FOV distortion**:

$$
r_d = \frac{1}{\omega}arctan( 2 \cdot r \cdot tan(\frac{\omega}{2}) )
$$

where $\omega$ is the **FOV distortion coefficient**

The distorted point coordinates are

$$
\begin{cases}
x_d = \frac{r_d}{r} \cdot x_c \\
y_d = \frac{r_d}{r} \cdot y_c
\end{cases}
$$

convert into pixel coordinates, the final pixel coordinates vector

$$
\begin{aligned}
\left[\begin{array}{c}u\\v\\1\end{array}\right] =  
\left[\begin{array}{ccc}
f_x & 0 & c_x \\
0 & f_y & c_y \\
0 & 0 & 1
\end{array}\right]  
\left[\begin{array}{c}x_d\\y_d\\1\end{array}\right]
\end{aligned}
$$

## Equidistant fish-eye model

# Omnidirectional Camera
