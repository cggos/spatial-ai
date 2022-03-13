---
layout: article
title:  "TSDF Overview"
tags: Mapping
key: mapping-tsdf-overview
---

[TOC]

# Overview

<p align="center">
  <img src="../images/map/sdf_tsdf.png" style="width:80%">
</p>

**SDF (Signed Distance Function)** 描述的是点到面的距离，在面上为0，在面的一边为正，另一边为负。

**TSDF (Truncated SDF)** 只考虑面的邻域内的SDF值，邻域的最大值是max truncation的话，则实际距离会除以max truncation这个值，达到归一化的目的，所以TSDF的值在-1到+1之间。



# 算法逻辑

<p align="center">
  <img src="../images/map/tsdf_alg.png">
</p>

TSDF 模型将整个待重建的三维空间划分成网格，每个网格中存储了数值，网格模型中值的大小代表网格离重建好的表面的距离。

如下图表示的是重建的一个人的脸（网格模型中值为 0 的部分，红线表示重建的表面，示意图给出的二维信息，实际是三维的），**重建好的表面到相机一侧都是正值，另一侧都是负值，网格点离重建好的表面距离越远绝对值越大，在网格模型中从正到负的穿越点表示重建好的场景表面**。

<p align="center">
  <img src="../images/map/tsdf_face.png" style="width:80%">
</p>

我们将整个空间的体素全部存入GPU运算，每个线程处理一条(x,y)。即对于(x,y,z)的晶格坐标，每个GPU进程扫描处理一个(x,y)坐标下的晶格柱。

1. 对于每个x,y坐标下的体元g，并行的从前往后扫描

2. 将晶格坐标g转换到对应的世界坐标系点vg

3. 对于每次TSDF操作时的拍摄变换Ti反变换到对应的相机坐标系坐标v

4. 相机坐标系点v投影到图像坐标点p，从3D到2D
5. 如果v在此摄像机的投影范围内，用它修正现有tsdf表示
6. sdfi是该相机坐标系点vg到本次相机原点ti的距离与本次观测深度Di(p)的差值
7. 8-11为截断的过程，Truncated的意义所在，用max truncation表示选取的截断范围，此值将会关系到最后重建结果的精细程度
8. 如果差值为正，表示该晶格在本次测量的面的后面
9. tsdfi赋值【0,1】之间，越靠近观测面的地方值越接近0
10. 如果差值为负，表示该晶格在本次测量的面的前面
11. tsdfi赋值【-1，0】之间，越靠近观测面的地方值越接近0
12. 选取本次计算值的tsdf的权值wi，这个权值的选取直接关系到图片的适应性，以及抗噪声的能力，其实这里有点类似卡尔曼滤波。注意这里每次权值+1的操作基于这样的原因，由于只有在相机拍摄范围内的点才会进入求tsdf的操作，每次的权值在原先的基础上增加1能照顾到迅速变化的或很少扫描到的面的变化。
13. 加权平均求出tsdfavg
14. 将wi和tsdfavg存储在对应的晶格，进行下个晶格的扫描操作
经过上面的扫描，最终立方体晶格中存储的tsdf值形成了重建物体外是负值，物体内部是正值，物体表面是0值得形式（可能没有准确的零值，但是可以根据正负值插值求出零值点，所以最后物体表面的分辨率将会超过晶格的分辨率）

# Example: MobileFusion

## 建立长方体包围盒，并划分网格

要建立一个长方体包围盒，让所有的三维点都在这个长方体里面。

假设z方向垂直相机，则x,y方向上的极值就是图像的边界。图像的边界点是就是四个角 (0,0),(w,0),(0,h),(w,h)，z方向上深度范围是0~max_depth，组合而成的边界点就是（0，0，0），（0，0，max_depth）,(w,0,0)等的2^3=8种情况，然后把这些点用相机的内参和外参换算到世界坐标系中，长方体的极点。

在长方体内部划分网格，比如说我们现在求得的长方体的极点分别是（-1，-1，-1），（1，1，1），单位是米。我们要在这个长方体内部划分网格，就是分割出一个个等体积的小的立方体，也就是所谓的体素。我们让体素的边长是0.02，也就是2厘米。那么从-1到1，我们可以划分出100个体素，也就是说这个长方体上每个小立方体的8个顶点的坐标可以用（x,y,z）来表示，其中x,y,z都是0-100之间的，同时它们的世界坐标也可以通过（-1+0.02x,-1+0.02y,-1+0.02*z）来计算出来。

<p align="center">
  <img src="../images/map/tsdf_grid.png" style="width:60%"/>
</p>

## 迭代更新tsdf网格

遍历每一组数据（RGB图、深度图、pose.txt），每次把这个长方体内的所有格点的世界坐标通过逆变换到相机坐标，再投影到图片上。

将图片上对应位置的深度与格点的在相机坐标系下的深度比较 

$$
\text{depth-diff} = \text{depth-val} - \text{cam-pts}[2,:]
$$

如果 $\|\text{depth-diff}\| < \text{trunc-marin}$ 则认为有效。

用 $\text{dist} = \text{depth-diff} / \text{trunc-marin}$ 去加权更新tsdf网格。

tsdf网格每个顶点存放的是dist的加权和。

## 找等值面

用marching cubes算法在tsdf网格中寻找dist加权和为0的等值面，就是物体表面。

<p align="center">
  <img src="../images/map/tsdf_face_3d.png" style="width:80%"/>
</p>

# Related Projects

- https://github.com/andyzeng/tsdf-fusion

- https://github.com/andyzeng/tsdf-fusion-python 🚩

- [http://www.open3d.org/docs/0.12.0/tutorial/pipelines/rgbd_integration.html#TSDF-volume-integration](http://www.open3d.org/docs/0.12.0/tutorial/pipelines/rgbd_integration.html#TSDF-volume-integration)
