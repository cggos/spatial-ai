---
layout: article
title:  "图像分析之图像特征匹配"
date:   2019-01-13
tags: ComputerVision

---

[TOC]

## 相似度

* SSD (Sum of Squared Distance)

$$
{D(I_A,I_B)}_{SSD} = \sum_{x,y}[{I_A}(x,y)-{I_B}(x,y)]^2
$$

* SAD (Sum of Absolute Difference)

$$
{D(I_A,I_B)}_{SAD} = \sum_{x,y} | {I_A}(x,y)-{I_B}(x,y) |
$$

* NCC (Normalized Cross Correlation)

$$
{D(I_A,I_B)}_{NCC} =
\frac
{ \sum_{x,y} {I_A}(x,y) {I_B}(x,y) }
{ \sqrt { \sum_{x,y} {I_A}(x,y)^2 \sum_{x,y} {I_B}(x,y)^2 } }
$$

* 去均值 版本

* 汉明距离

## 块匹配

### 极线搜索

对极几何中，通过 极线搜索 缩小搜索范围，减少计算资源

### 仿射变换

### 基本步骤

* 假设图像I1和图像I2，分别对应的角点为p1i和p2j，在图像I2角点中找到与图像I1对应的角点；
* 以角点p1i为中心，在图像I1中提取9*9的像素块作为模板图像T1i；
* 在图像I2中p1i点周围(以角点p1i为中心20*20的像素 范围)查找所有的角点p2jm(m<=n,n为该范围内角点数)；
* 遍历所有的角点p2jm，以角点p2jm为中心，在图像I2中提取9*9的像素块，计算该像素块与T1i的SSD；
* SSD最小对应的角点p2jm，即为图像I2中与图像I1中角点p1i对应的匹配角点；
* 循环执行以上5步，查找图像I2中与图像I1对应的所有匹配角点；

## 描述子匹配

Brute Force匹配和FLANN匹配是opencv二维特征点匹配常见的两种办法，分别对应BFMatcher（cv::BFMatcher）和FlannBasedMatcher（cv::FlannBasedMatcher）。

### Brute-Force

### FLANN
