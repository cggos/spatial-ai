---
layout: article
title:  "Kinect Fusion"
tags: Mapping SLAM
key: mapping-kinect-fusion
---

[TOC]

# Overview


Kinect Fusion 描述三维空间的方式叫 **Volumetric**。它把固定大小的一个空间（比如3𝑚×3𝑚×3𝑚）均匀分割成一个个小方块（比如512×512×512），每个小方块就是一个voxel，存储TSDF值以及权重。最终得到的三维重建就是对这些voxel进行线性插值。

<p align="center">
  <img src="../images/kinfu/pipeline.png" style="width:80%">
</p>

重建流程如上图所示：

* **Depth Map Conversion**: 读入的深度图像转换为三维点云并且计算每一点的法向量

* **Camera Tracking (map-to-frame ICP)**: 计算得到的带有法向量的点云，和通过光线投影算法根据上一帧位姿从模型投影出来的点云，利用 ICP 算法配准计算位姿

* **Volumetric Integration**: 根据计算得到的位姿，将当前帧的点云融合到网格模型中去，这里用到了TSDF

* **Raycasting (光线投影算法)**: 根据当前帧相机位姿利用该算法从模型投影得到当前帧视角下的点云，并且计算其法向量，用来对下一帧的输入图像配准

如此是个循环的过程，通过移动相机获取场景不同视角下的点云，重建完整的场景表面。

<p align="center">
  <img src="../images/kinfu/workflow.png" style="width:100%">
</p>


Project:

- [KinectFusion Project Page [Microsoft]](https://www.microsoft.com/en-us/research/project/kinectfusion-project-page/)

- [KinectFusion](http://people.inf.ethz.ch/otmarh/KinectFusion.html): real-time 3D reconstruction and interaction using a moving depth camera

# Depth Map Conversion

<p align="center">
  <img src="../images/kinfu/data_process.png" style="width:80%">
</p>

构建三层金字塔的目的是为了从粗到细地计算相机位置姿态，有加速计算的效果。

# Camera Tracking (ICP)

相机的位置姿态是用ICP (Iterative Closest Point) 求解的。ICP是处理点云的常规手段，通过最小化两块点云的差别，迭代求解出拍摄两块点云的相机之间的相对位置。

有不同的方式来描述点云的差别，最常用的是point-to-point和point-to-plane两种。KinectFusion选择的是**point-to-plane**的方式，要把点到点的距离向法向量投影。point-to-plane要比point-to-point收敛速度快很多，而且更鲁棒。

<p align="center">
  <img src="../images/kinfu/icp_point_plane.png" style="width:90%">
</p>

![](../images/kinfu/icp_error_descript.png)

KinectFusion 算法采用 **frame-to-model** （通过当前帧深度图像转换得到的点云，和根据上一帧相机位姿从模型投影获取的深度图像转换得到的点云进行配准）的方式，而不是采用 frame-to-frame （通过当前帧深度图像转换得到的点云，和上一帧深度图像转换得到的点云进行配准）的形式计算两帧位姿，作者论文里也验证了采用 frame-to-model 的形式重建要更加准确。

假设pose estimation已经计算出来，就可以把本次测量结果融合到全局地图（global model）中了。

这里的**model使用的是TSDF地图**。

# Volumetric Integration (TSDF)

<p align="center">
  <img src="../images/map/tsdf_alg.png">
</p>

# Surface Reconstruction (Raycast TSDF)

更新完TSDF值之后，就可以用TSDF来估计 **voxel/normal map**。这样估计出来的voxel/normal map比直接用RGBD相机得到的深度图有更少的噪音，更少的孔洞（RGBD相机会有一些无效的数据，点云上表现出来的就是黑色的孔洞）。估计出的voxel/normal map与新一帧的测量值一起可以估算相机的位置姿态。

## Ray-Casting

具体的表面估计方法叫Raycasting。这种方法模拟观测位置有一个相机，从每个像素按内参𝐾投射出一条射线，射线穿过一个个voxel，在射线击中表面时，必然穿过TSDF值为一正一负的两个紧邻的voxel（因为射线和表面的交点的TSDF值为0），表面就夹在这两个voxel里面。然后可以利用线性插值，根据两个voxel的位置和TSDF值求出精确的交点位置。这些交点的集合就呈现出三维模型的表面。

<p align="center">
  <img src="../images/kinfu/ray_casting.png" style="width:80%">
</p>

如图：从光心出发，穿过像素点在网格模型中从正到负的穿越点，就表示在当前像素点处可以看到的重建好的场景的表面。对于每个像素点，分别做类似的投影，就可以计算得到的在每个像素点处的点云。

采用光线投影算法计算得到的点云，再计算其法向量，用带法向量的点云和下一帧的输入图像配准，计算下一帧输入图像的位姿。如此是个循环的过程。

其实，到此KinectFusion的流程已经结束了，重建出了点云格式的表面三维模型；但在实际应用中，尤其AR领域，还需要Mesh格式的三维模型，甚至需要纹理贴图等。

# Mesh Generation

## Marching Cube

通过Marching Cube对重建后的点云实现三角面片重建。

点云数据在三维空间中为离散表示，对TSDF地图使用Marching Cube算法来对等值面进行提取，实现三角面片重建。

Marching Cube算法基本思想是逐个处理标量场中的体素，分离出与等值面相交的体素，采用插值计算出等值面与立方体边的交点。根据立方体每一顶点与等值面的相对位置，将等值面与立方体边的交点按一定方式连接生成等值面，作为等值面在该立方体内的一个逼近表示。

Marching Cube用来提取TSDF体素中隐含存储的三维网格模型，实际上是提取TSDF中的0等值曲面。首先，遍历操作，通过遍历TSDF网格，定位并记录下与0等值曲面相交的体素点；然后，提取操作，对于前面记录下来的体素点，利用预存的网格索引及线性插值方法，提取出三角形面片网格，得到重建的三维几何模型。


# Texturing

上面 KinectFusion 的几个步骤属于 **几何重建** 的过程，而在实际中，尤其AR领域，还要给 三维模型 进行 **纹理重建 (纹理贴图)**。


# Other OS Code

- [Volumetric TSDF Fusion of RGB-D Images in Python](https://github.com/cggos/tsdf-fusion-python)

- [KFusion 0.4](https://github.com/GerhardR/kfusion)

- [Kintinuous](http://www.cs.nuim.ie/research/vision/data/rgbd2012/): Spatially Extended KinectFusion

- KinFu
    - [https://github.com/Nerei/kinfu_remake](https://github.com/Nerei/kinfu_remake) 
    - OpenCV KinFu: [https://github.com/opencv/opencv_contrib/blob/master/modules/rgbd/src/kinfu.cpp](https://github.com/opencv/opencv_contrib/blob/master/modules/rgbd/src/kinfu.cpp)
    - PCL KinFu: [https://github.com/PointCloudLibrary/pcl/tree/master/gpu/kinfu](https://github.com/PointCloudLibrary/pcl/tree/master/gpu/kinfu)

- https://github.com/sjy234sjy234/KinectFusion-ios
