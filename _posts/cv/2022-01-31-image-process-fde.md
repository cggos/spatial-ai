---
layout: article
title:  "图像频率域分析之频域谱(FDE)"
tags: ComputerVision
key: image-process-fde
---

[TOC]

# Overview

code: https://github.com/cggos/cv_py/blob/main/fft_fde.py

主要用于：

* 图像模糊度计算
* 镜头对焦

# 频域熵(FDE) {% cite kristan2004entropy %}

计算图像的 **频域谱**，表示如下

$$
f(i, j)
$$

将其 **幅度谱** 归一化

$$
f_{\text {norm }}(i, j)=\frac{1}{\sum_{(i, j) \in D}|f(i, j)|}|f(i, j)|
$$

计算 **归一化幅度谱** 的 **信息熵**，即最终的 **FDE**

$$
F D E=-\sum_{(i, j) \in D} f_{\text {norm }}(i, j) \cdot \log \left(f_{\text {norm }}(i, j)\right)
$$

# 图像模糊度

通过计算图像模糊度，我们在SLAM算法中可以

* 检测模糊图像
* 动态改变图像特征点的噪声值

## 高斯模糊图像

通过利用高斯模糊算法将图像模糊程度逐渐增大，其对应的FDE值逐渐减小。

* Entropy: 11.368065834 (Origin)
* Entropy: 10.0918264389 ($\sigma = 1$)
* Entropy: 9.30934810638 ($\sigma = 2$)
  <p align="center">
    <img src="../images/fde/lena_00.png" style="width:30%"/>
    <img src="../images/fde/lena_01.png" style="width:30%"/>
    <img src="../images/fde/lena_02.png" style="width:30%"/>
  </p>

* Entropy: 8.96276855469 ($\sigma = 3$)
* Entropy: 8.66108512878 ($\sigma = 5$)
* Entropy: 8.41834259033 ($\sigma = 10$)
  <p align="center">
    <img src="../images/fde/lena_03.png" style="width:30%"/>
    <img src="../images/fde/lena_05.png" style="width:30%"/>
    <img src="../images/fde/lena_10.png" style="width:30%"/>
  </p>

# References

{% bibliography --cited %}
