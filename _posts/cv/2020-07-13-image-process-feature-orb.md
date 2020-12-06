---
layout: article
title:  "图像分析之ORB特征"
date:   2020-07-13
tags: ComputerVision
key: image-process-feature-orb
---

[TOC]

<div>{%- include extensions/slideshare.html id='6S7xPEvA9dQkJL' -%}</div>

## Overview

* Oriented FAST + Rotated BRIEF

<p align="center">
    <img src="../images/image_features/orb.jpg" style="width:80%;"/>
</p>

### Feature/Corner Detector

* FAST方法 -- 定位特征点坐标
* 矩方法 -- 特征点方向
* 非极大值抑制 -- 特征点响应值（分数）
* 图像金字塔 -- 特征点具有 **尺度不变性**

### Descriptor

* BRIEF -- 特征点描述子
* 特征点方向 -- 描述子具有 **旋转不变性**



## oFAST: FAST Keypoint Orientation

### Multiscale Image Pyramid

<p align="center">
    <img src="../images/image_features/img_pyramid.png"/>
</p>

* level: 8
* scale: 1.2
* down sample: **bilinear interpolation**
* produce FAST features (filtered by Harris ???) at each level in the pyramid


### FAST (Features from Accelerated and Segments Test)

* FAST-9: ≥ 9 contiguous pixels brighter than p+threshold

<p align="center">
    <img src="../images/image_features/fast.png" style="width:80%;"/>
</p>

Procedure:

1. Select a pixel p whose intensity is $I_p$ and Select appropriate threshold value $t$
2. the pixel p is a corner if there exists a set of $n$ contiguous pixels in the circle (of 16 pixels) which are all brighter than $I_p+t$, or all darker than $I_p−t$
   - Rapid rejection by testing 1, 9, 5 then 13: First 1 and 9 are tested if they are too brighter or darker. If so, then checks 5 and 13
   -  If p is a corner, then at least three of these must all be brighter than $I_p+t$ or darker than $I_p−t$


### NMS (Non-Maximal Suppression)

非极大值抑制主要是为了避免图像上得到的“角点”过于密集，主要过程是，每个特征点会计算得到相应的响应得分，然后以当前像素点p为中心，取其邻域（如3x3 的邻域），判断当前像素p的响应值是否为该邻域内最大的，如果是，则保留，否则，则抑制。


### Uniform Distribution
  ```cpp
  DistributeOctTree()
  ```

ORB-SLAM中使用四叉树来快速筛选特征点，筛选的目的是非极大值抑制，取局部特征点邻域中FAST角点相应值最大的点，而如何搜索到这些扎堆的的点，则采用的是四叉树的分快思想，递归找到成群的点，并从中找到相应值最大的点。


### Orientation by Intensity Centroid (IC)

* Rosin defines **the moments of a patch** as:

  $$
  m_{p q}=\sum_{x, y} x^{p} y^{q} I(x, y)
  $$

  the first order moment of a patch $I$ (patch size = 31)

  $$
	\begin{aligned}
	m_{10}
	&= \sum_{x=-15}^{15} \sum_{y=-15}^{15} x I(x, y)
	=  \sum_{y=0}^{15} {\color{blue} \sum_{x=-15}^{15} x \left[ I(x,y) - I(x, -y) \right] }  \\
	m_{01}
	&= \sum_{x=-15}^{15} \sum_{y=-15}^{15} y I(x, y)
	=  \sum_{y=1}^{15} {\color{blue} \sum_{x=-15}^{15} y \left[ I(x,y) - I(x, -y) \right] }
	\end{aligned}
	$$

* the intensity centroid

  $$
  C=\left(\frac{m_{10}}{m_{00}}, \frac{m_{01}}{m_{00}}\right)
  $$

* the orientation (the vector **from the corner’s center to the centroid**)

  <p align="center">
    <img src="../images/image_features/fast_angle.jpeg"/>
  </p>

  $$
  \theta=\operatorname{atan} 2\left(m_{01}, m_{10}\right)
  $$

  ```cpp
  const int PATCH_SIZE = 31;
  const int HALF_PATCH_SIZE = 15;

  int m01 = 0;
  int m10 = 0;
  for(int y=-half_patch_size; y<half_patch_size; ++y){
      for(int x=-half_patch_size; x<half_patch_size; ++x){
          m01 += y * image.at<uchar>(kp.pt.y+y, kp.pt.x+x);
          m10 += x * image.at<uchar>(kp.pt.y+y, kp.pt.x+x);
      }
  }
  kp.angle = std::atan2(m01, m10)/CV_PI*180.0;
  ```

## Gaussian Filter

* ref: [图像分析之高斯滤波](https://cggos.github.io/computervision/image-process-gauss-filter.html)

* start by **smoothing image using a Gaussian kernel at each level in the pyramid** in order to **prevent the descriptor from being sensitive to high-frequency noise**


* Gaussian Kernel size: 7x7, Sigma: 2


* 利用高斯滤波的可分离性，实现水平和垂直分开滤波，降低计算量，并进行定点化


## rBRIEF: Rotation-Aware Brief


### Brief of BRIEF (Binary robust independent elementary feature)

  <div align="center">
    <img src="../images/image_features/brief.png"/>
  </div>

* In brief, each keypoint is described by a feature vector which is 128–512 bits string.

* vector dim = 256 bits (32 bytes)

* each vector $\longleftrightarrow$ each keypoint

* for each bit, select a pair of points in a patch $I$ which centered a corner $\mathbf{p}$ and compare their intensity  

  $$
  \mathbf{S}=
  \left(\begin{array}{l}
  \mathbf{p}_{1}, \ldots, \mathbf{p}_{n} \\
  \mathbf{q}_{1}, \dots,  \mathbf{q}_{n}
  \end{array}\right)
  \in \mathbb{R}^{(2 \times 2) \times 256}
  $$

  $$
  \tau(\mathbf{I} ; \mathbf{p}_i, \mathbf{q}_i):=
  \left\{\begin{array}{ll}
  1 & : \mathbf{I}(\mathbf{p}_i) <    \mathbf{I}(\mathbf{q}_i) \\
  0 & : \mathbf{I}(\mathbf{p}_i) \geq \mathbf{I}(\mathbf{q}_i)
  \end{array}\right.
  $$

* the descriptor (each bit $\longleftrightarrow$ each pair of points $(\mathbf{p}_i, \mathbf{q}_i)$):

  $$
  f(n) = \sum_{i=1}^n 2^{i-1} \tau(\mathbf{I} ; \mathbf{p}_i, \mathbf{q}_i),
  \quad (n = 256)
  $$


### steered BRIEF

* 为了具有旋转不变性，引入该算法，但方差很小、相关性高

  $$
  \mathbf{R}_{\theta} =
  \begin{bmatrix}
  \cos{\theta} & -\sin{\theta} \\
  \sin{\theta} &  \cos{\theta}
  \end{bmatrix}
  $$

  $$
  \mathbf{S}_{\theta}=\mathbf{R}_{\theta} \mathbf{S}=
  \left(\begin{array}{l}
  \mathbf{p}_{1}', \ldots, \mathbf{p}_{n}' \\
  \mathbf{q}_{1}', \dots,  \mathbf{q}_{n}'
  \end{array}\right)  
  $$

### rBRIEF

* rBRIEF shows significant improvement in the **variance and correlation** over steered BRIEF

* 为了把steered BRIEF方差增大，相关性降低
* 基于统计规律，利用了贪心算法进行筛选

* construct a lookup table of precomputed BRIEF patterns
  ```cpp
  // construct a lookup table of precomputed BRIEF patterns

  // 训练好的31*31邻域256对像素点坐标
  static int ORB_pattern[256*4] = {
        8, -3,  9,  5 /*mean (0), correlation (0)*/,
        4,  2,  7,-12 /*mean (1.12461e-05), correlation (0.0437584)*/,
      -11,  9, -8,  2 /*mean (3.37382e-05), correlation (0.0617409)*/,
        7,-12, 12,-13 /*mean (5.62303e-05), correlation (0.0636977)*/
        //                       .
        //                       .
        //                       .
  }
  ```

* steered BRIEF

* for each bit of the descriptors

  $$
  \mathbf{p}_i' = \mathbf{R}_{\theta} (\mathbf{p}_i-\mathbf{p}) + \mathbf{p} \\
  \mathbf{q}_i' = \mathbf{R}_{\theta} (\mathbf{q}_i-\mathbf{p}) + \mathbf{p}
  $$

  $$
  \tau(\mathbf{I} ; \mathbf{p}_i', \mathbf{q}_i'):=
  \left\{\begin{array}{ll}
  1 & : \mathbf{I}(\mathbf{p}_i') <    \mathbf{I}(\mathbf{q}_i') \\
  0 & : \mathbf{I}(\mathbf{p}_i') \geq \mathbf{I}(\mathbf{q}_i')
  \end{array}\right.
  $$

  ```cpp
  double degRad = kp.angle/180.0*CV_PI;
  double dcos = std::cos(degRad);
  double dsin = std::sin(degRad);

  vector<bool> d(256, false);
  for (int i = 0; i < 256; i++) {
      d[i] = 0;

      int p_offset_x = ORB_pattern[4*i+0];
      int p_offset_y = ORB_pattern[4*i+1];
      int q_offset_x = ORB_pattern[4*i+2];
      int q_offset_y = ORB_pattern[4*i+3];

      double pu = kp.pt.x + (dcos*p_offset_x - dsin*p_offset_y);
      double pv = kp.pt.y + (dsin*p_offset_x + dcos*p_offset_y);
      double qu = kp.pt.x + (dcos*q_offset_x - dsin*q_offset_y);
      double qv = kp.pt.y + (dsin*q_offset_x + dcos*q_offset_y);

      int pI = image.at<uchar>((int)pv, (int)pu);
      int qI = image.at<uchar>((int)qv, (int)qu);

      d[i] = (pI>=qI) ? 0 : 1;
  }
  ```
