---
layout: article
title:  "机器人学之3D欧式变换理论与实践"
date:   2018-11-24
tags: Robotics

---

[TOC]

# 理论基础
三维空间中的变换主要分为如下几种：
* 射影变换
* 仿射变换
* 相似变换
* 欧式变换

其性质如下图所示：  
![3d_transform.png](../images/3d_transform/3d_transform.png)

本文主要介绍欧式变换。

## 欧式变换

$$
\mathbf{T} =
\begin{bmatrix} \mathbf{R} & \mathbf{t} \\ \mathbf{0}^T & 1 \end{bmatrix}
\in \mathbb{R}^{4 \times 4}
$$

$$
\mathbf{T}^{-1} =
\begin{bmatrix}
\mathbf{R}^T & -\mathbf{R}^T \cdot \mathbf{t} \\ \mathbf{0}^T & 1
\end{bmatrix}
\in \mathbb{R}^{4 \times 4}
$$

Translate by $-C$ (align origins), Rotate to align axes:

$$
\begin{aligned}
P_c &= \mathbf{T} \cdot P_w \\
&= \mathbf{R} \cdot (P_w - C) \\
&= \mathbf{R} \cdot P_w - \mathbf{R} \cdot C \\
&= \mathbf{R} \cdot P_w + \mathbf{t}
\end{aligned}
$$

### 旋转

#### 旋转矩阵

$$
\mathbf{R} =  
\begin{bmatrix}
r_{11} & r_{12} & r_{13} \\  
r_{21} & r_{22} & r_{23} \\
r_{31} & r_{32} & r_{33}
\end{bmatrix}
\in \mathbb{R}^{3 \times 3},
\quad s.t. \quad \mathbf{RR}^T = \mathbf{I}, det(\mathbf{R}) = 1
$$

#### 旋转向量（轴角）

$$
\boldsymbol{\phi} = \alpha\mathbf{a} = log(\mathbf{R})^{\vee} \in \mathbb{R}^3
$$

* **旋转轴**：矩阵 $\mathbf{R}$ 特征值1对应的特征向量（单位矢量）
$$
\mathbf{a} = \frac{\boldsymbol{\phi}}{||\boldsymbol{\phi}||} \in \mathbb{R}^3
$$

* **旋转角**
$$
\alpha = ||\boldsymbol{\phi}|| = arccos(\frac{tr(\mathbf{R})-1}{2}) \in \mathbb{R}
$$

罗德里格斯公式（[Rodrigues' rotation formula](https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula)）：
$$
\mathbf{R} = cos\alpha \mathbf{I} + (1-cos\alpha) \mathbf{aa}^T + sin\alpha \mathbf{a}^{\wedge}
$$

#### 单位四元数

**2D旋转**：**单位复数** 可用来表示2D旋转。  

$$
z = a + b\vec{i} = r ( cos\theta + sin\theta\vec{i} ) = e^{\theta \vec{i}}, r = ||z||=1
$$

**3D旋转**：**单位四元数** 才可表示3D旋转，四元数是复数的扩充，在表示旋转前需要进行 **归一化**。

$$
\mathbf{q} = \begin{bmatrix} \boldsymbol\varepsilon \\ \eta \end{bmatrix}
\quad s.t. \quad
||\mathbf{q}||_2 = 1
$$

where

$$
\eta = cos\frac{\alpha}{2}, \quad
\boldsymbol\varepsilon = \mathbf{a} sin\frac{\alpha}{2} =
\begin{bmatrix}
a_1sin \frac{\alpha}{2} \\ a_2sin \frac{\alpha}{2} \\ a_3sin \frac{\alpha}{2}
\end{bmatrix} =
\begin{bmatrix} \varepsilon_1 \\ \varepsilon_2 \\ \varepsilon_3 \end{bmatrix}
$$

and

$$
||\mathbf{a}||_2 = 1, \quad
\eta^2 + \varepsilon_1^2 + \varepsilon_2^2 + \varepsilon_3^2 = 1
$$

即

$$
\mathbf{q}
= \begin{bmatrix} \mathbf{a} sin\frac{\alpha}{2} \\ cos\frac{\alpha}{2}\end{bmatrix}
$$

当 $\alpha$ 很小时，可以近似表达为

$$
\mathbf{q}
\approx \begin{bmatrix} \mathbf{a} \frac{\alpha}{2} \\ 1 \end{bmatrix}
= \begin{bmatrix} \frac{\boldsymbol{\phi}}{2} \\ 1 \end{bmatrix}
$$

四元数可以在 **保证效率** 的同时，减小矩阵1/4的内存占有量，同时又能 **避免欧拉角的万向锁问题**。

#### 欧拉角
旋转矩阵可以可以分解为绕各自轴对应旋转矩阵的乘积：

$$
\mathbf{R} = \mathbf{R}_1 \mathbf{R}_2 \mathbf{R}_3
$$

根据绕轴的不同，欧拉角共分为两大类，共12种，如下图（基于 **右手系**）所示：    
![euler_angles_12.png](../images/3d_transform/euler_angles_12.jpg)

<a name="is_fixed_axis"></a>

以上不同旋转轴合成的旋转矩阵，每一种都可以看成 **同一旋转矩阵的两种不同物理变换**：
* 绕 **固定轴** 旋转
* 绕 **动轴** 旋转

以 **$Z_1Y_2X_3$** 进行为例，旋转矩阵表示为 $\mathbf{R} = \mathbf{R}_z \mathbf{R}_y \mathbf{R}_x$，说明：
* 绕 **固定轴** 旋转：以初始坐标系作为固定坐标系，**分别先后绕固定坐标系的X、Y、Z轴** 旋转；
* 绕 **动轴** 旋转：先绕 **初始Z轴** 旋转，再绕 **变换后的Y轴** 旋转，最后绕 **变换后的X轴** 旋转

即 绕 **固定坐标轴的XYZ** 和 **绕运动坐标轴的ZYX** 的旋转矩阵是一样的。

我们经常用的欧拉角一般就是 **$Z_1Y_2X_3$** 轴序的 **yaw-pitch-roll**，如下图所示：  
![rpy_plane.png](../images/3d_transform/rpy_plane.png)

对应的旋转矩阵为  

$$
\mathbf{R} = \mathbf{R}_z \mathbf{R}_y \mathbf{R}_x = \mathbf{R}(\theta_{yaw}) \mathbf{R}(\theta_{pitch}) \mathbf{R}(\theta_{roll})
$$

其逆矩阵为：  

$$
\begin{aligned}
\mathbf{R}^{-1}
&= (\mathbf{R}_z \mathbf{R}_y \mathbf{R}_x)^{-1} \\
&= \mathbf{R}_x^{-1} \mathbf{R}_y^{-1} \mathbf{R}_z^{-1} \\
&= \mathbf{R}(-\theta_{roll}) \mathbf{R}(-\theta_{pitch}) \mathbf{R}(-\theta_{yaw})
\end{aligned}
$$

上面 $\mathbf{R}_x \mathbf{R}_y \mathbf{R}_z$ 以 **Cosine Matrix** 的形式表示为（**右手系**）：

$$
\mathbf{R}_x(\theta) =
\begin{bmatrix}
1 & 0 & 0 \\
0 & cos(\theta) & -sin(\theta) \\
0 & sin(\theta) &  cos(\theta)
\end{bmatrix}
$$

$$
\mathbf{R}_y(\theta) =
\begin{bmatrix}
 cos(\theta) & 0 & sin(\theta) \\
0 & 1 & 0 \\
-sin(\theta) & 0 & cos(\theta)
\end{bmatrix}
$$

$$
\mathbf{R}_z(\theta) =
\begin{bmatrix}
cos(\theta) & -sin(\theta) & 0 \\
sin(\theta) &  cos(\theta) & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

#### 旋转转换
* [Maths - Rotation conversions](https://www.euclideanspace.com/maths/geometry/rotations/conversions/index.htm)
* [ptam_cg/src/Tools.cc](https://github.com/cggos/ptam_cg/blob/master/src/Tools.cc)

### 平移

$$
\mathbf{t} = \begin{bmatrix} x & y & z \end{bmatrix}^T \in \mathbb{R}^3
$$


## 李群和李代数

### 特殊正交群 $SO(3)$

$$
SO(3) =
\Bigg\{
\mathbf{R} \in \mathbb{R}^{3 \times 3} \Bigg|
\mathbf{RR}^T = \mathbf{I}, det(\mathbf{R}) = 1
\Bigg\}
$$

### 李代数 $\mathfrak{so}(3)$

$$
\mathfrak{so}(3) =
\Bigg\{
\boldsymbol{\Phi} = \boldsymbol{\phi}^{\wedge}
\in \mathbb{R}^{3 \times 3} \Bigg|
\boldsymbol{\phi} \in \mathbb{R}^3
\Bigg\}
$$

where

$$
\boldsymbol{\phi}^{\wedge} =
\begin{bmatrix} \phi_1 \\ \phi_2 \\ \phi_3 \end{bmatrix}^{\wedge} =
\begin{bmatrix}
0 & -\phi_3 & \phi_2 \\
\phi_3 & 0 & -\phi_1 \\
-\phi_2 & \phi_1 & 0
\end{bmatrix}
\in \mathbb{R}^{3 \times 3}
$$

指数映射：$\mathbf{R} = exp(\boldsymbol{\phi}^{\wedge}) {\approx} \mathbf{I} + \boldsymbol{\phi}^{\wedge}$ (first-order approximation)  

对数映射：$\boldsymbol{\phi} = log(\mathbf{R})^{\vee}$

### 特殊欧式群 $SE(3)$  

$$
SE(3) =
\Bigg\{
\mathbf{T} =
\begin{bmatrix} \mathbf{R} & \mathbf{t} \\ \mathbf{0}^T & 1 \end{bmatrix}
\in \mathbb{R}^{4 \times 4} \Bigg|
\mathbf{R} \in SO(3), \mathbf{t} \in \mathbb{R}^{3}
\Bigg\}
$$

### 李代数 $\mathfrak{se}(3)$

$$
\mathfrak{se}(3) =
\Bigg\{
\boldsymbol{\Xi} =
\boldsymbol{\xi}^{\wedge}
\in \mathbb{R}^{4 \times 4} \Bigg|
\boldsymbol{\xi} \in \mathbb{R}^6
\Bigg\}
$$

where

$$
\boldsymbol{\xi}^{\wedge} =
\begin{bmatrix} \boldsymbol{\rho} \\ \boldsymbol{\phi} \end{bmatrix}^{\wedge} =
\begin{bmatrix}
\boldsymbol{\phi}^{\wedge} & \boldsymbol{\rho} \\
\mathbf{0}^T, & 0
\end{bmatrix}
\in \mathbb{R}^{4 \times 4}, \quad
\boldsymbol{\rho},\boldsymbol{\phi} \in \mathbb{R}^3
$$

指数映射：$\mathbf{T} = exp(\boldsymbol{\xi}^{\wedge})$  
对数映射：$\boldsymbol{\xi} = log(\mathbf{T})^{\vee}$

* [第四讲：李群和李代数](https://zhuanlan.zhihu.com/p/33156814)
* [四元数矩阵与 so(3) 左右雅可比](https://fzheng.me/2018/05/22/quaternion-matrix-so3-jacobians/)

## <a name="coordinate_handle_rules">坐标系手性</a>
坐标系的手性主要分为 **右手系** 和 **左手系**，主要通过以下两种方法区分（右手系）：
* **3 finger method**   
  ![right_handed_3fingers.png](../images/3d_transform/right_handed_3fingers.png)
* **Curling method**  
  ![right_handed_curling.png](../images/3d_transform/right_handed_curling.png)

另外，不同的几何编程库所基于的坐标系的手性会有所不同
* Eigen: 右手系
* OpenGL: 右手系
* Unity3D: 左手系
* ROS tf: 右手系

## 注意事项

### 区分 点的变换 和 坐标系本身的变换

$$
P_a = \mathbf{T}_{AB} \cdot P_b
$$

指的是 将某点在B坐标系中的坐标表示变换为其在A坐标系中的坐标表示，实质是同一点在不同坐标系下的不同坐标表示，即 **点的变换**；若将A和B坐标系假设为刚体，则B坐标系变换到A坐标系（**坐标系本身的变换**）的变换矩阵为 $\mathbf{T}_{AB}^{-1}$。

* 使用传感器（Camera-IMU）标定工具（例如Kalibr）标定出的外参指的是 **点的变换**
* ROS中 **static_transform_publisher** 则是 **坐标系本身的变换**
  ```
  static_transform_publisher x y z yaw pitch roll frame_id child_frame_id period_in_ms
  ```

在分析多个坐标系的姿态变换时，要注意根据点的变换或者坐标系的变换确定矩阵左乘还是右乘：  
* **点的变换**：矩阵相乘 从右到左，即 **矩阵左乘**
* **坐标系的变换**：矩阵相乘 从左到右，即 **矩阵右乘**

### 区分 绕定轴旋转 和 绕动轴旋转

* <a href="#is_fixed_axis">绕定轴旋转 和 绕动轴旋转</a>

### 注意 右手系 和 左手系

* <a href="#coordinate_handle_rules">坐标系手性</a>

### 注意 同一刚体中不同坐标系姿态变换的相互表示

以带有IMU的相机模组为例，已知 IMU（坐标系）本身的姿态变换 $\mathbf{T}^{B}$ 和 同一模组中Camera到IMU(Body)的坐标系变换 $\mathbf{T}_{BC}$，则 该Camera（坐标系）本身的姿态变换为：  

$$
{}_C\mathbf{T} = \mathbf{T}_{BC} \cdot \mathbf{T}^{B} \cdot \mathbf{T}_{BC}^{-1}
$$

因为上面的变换都是 **坐标系的变换**，所以矩阵相乘 从左到右，即 **矩阵右乘**

![pointcloud_imu.jpg](../images/3d_transform/pointcloud_imu.jpg)



# 编程库实践

下面通过示例代码对自己使用过的库进行介绍。

## Eigen
Eigen is a C++ template library for linear algebra: matrices, vectors, numerical solvers, and related algorithms.

```c++
Eigen::Matrix3d m3_r_z = Eigen::AngleAxisd(M_PI/2, Eigen::Vector3d(0,0,1)).toRotationMatrix();
Eigen::Quaterniond q_r_z(m3_r_z);

Eigen::Vector3f v3_translation(x, y, z);

Eigen::Quaternion<double> q(w, qx, qy, qz);
Eigen::Matrix3f m3_rotation = q.matrix();

Eigen::Matrix4f m4_transform = Eigen::Matrix4f::Identity();
m4_transform.block<3,1>(0,3) = v3_translation;
m4_transform.block<3,3>(0,0) = m3_rotation;
```

## TooN
Tom’s Object-oriented numerics library, is a set of C++ header files which provide basic linear algebra facilities

[Array2SE3](https://github.com/cggos/ptam_cg/blob/master/src/Tools.cc#L42-L66):
```c++
#include <TooN/TooN.h>
#include <TooN/se3.h>

/**
 * @brief transform array to TooN::SE3
 * @param array array of 3x4 row-major matrix of RT
 * @param se3 TooN::SE3 object
 */
void Tools::Array2SE3(const float *array, SE3<> &se3)
{
    Matrix<3,3> m3Rotation;
    for(int i=0;i<3;i++)
    {
        for(int j=0;j<3;j++)
        {
            m3Rotation[i][j] = array[i*4+j];
        }
    }
    SO3<> so3 = SO3<>(m3Rotation);

    Vector<3> v3Translation;
    v3Translation[0] = array[ 3];
    v3Translation[1] = array[ 7];
    v3Translation[2] = array[11];

    se3.get_rotation()    = so3;
    se3.get_translation() = v3Translation;
}
```

## Sophus
C++ implementation of Lie Groups using Eigen commonly used for 2d and 3d geometric problems (i.e. for Computer Vision or Robotics applications)

```c++
#include <iostream>
#include <sophus/se3.hpp>

Eigen::Matrix3d R = Eigen::AngleAxisd(M_PI/2, Eigen::Vector3d(0,0,1)).toRotationMatrix();
Eigen::Quaterniond q(R);

Eigen::Vector3d t(1,0,0);

Sophus::SE3 SE3_Rt(R, t);
Sophus::SE3 SE3_qt(q, t);

typedef Eigen::Matrix<double,6,1> Vector6d;

Vector6d se3 = SE3_Rt.log();

std::cout << "se3 hat = " << std::endl
          << Sophus::SE3::hat(se3) << std::endl;
std::cout <<"se3 hat vee = " << std::endl
          << Sophus::SE3::vee( Sophus::SE3::hat(se3) ).transpose() << std::endl;

Vector6d update_se3;
update_se3.setZero();
update_se3(0,0) = 1e-4d;
Sophus::SE3 SE3_updated = Sophus::SE3::exp(update_se3) * SE3_Rt;
std::cout << "SE3 updated = " << std::endl
          << SE3_updated.matrix() << std::endl;
```

## ROS tf & tf2

tf is a package that lets the user keep track of multiple coordinate frames over time. tf maintains the relationship between coordinate frames in a tree structure buffered in time, and lets the user transform points, vectors, etc between any two coordinate frames at any desired point in time.

```c++
#include <Eigen/Geometry>
#include <tf_conversions/tf_eigen.h>
#include <tf2/LinearMath/Quaternion.h>
#include <tf2/LinearMath/Matrix3x3.h>
#include <geometry_msgs/TransformStamped.h>

tf::Transform transform;
transform.setOrigin( tf::Vector3(x, y, z) );
tf::Quaternion q;
q.setRPY(r, p, y);
transform.setRotation(q);

geometry_msgs::Quaternion q_msg;

Eigen::Vector3d v3_r;
tf2::Matrix3x3(tf2::Quaternion(q_msg.x, q_msg.y, q_msg.z, quaternion_imu_.w))
.getRPY(v3_r[0], v3_r[1], v3_r[2]);

tf2::Quaternion q_tf2;
q_tf2.setRPY(v3_r[0], v3_r[1], v3_r[2]);
q_tf2.normalize();

geometry_msgs::TransformStamped tf_stamped;
tf_stamped.transform.rotation.x = q.x();
tf_stamped.transform.rotation.y = q.y();
tf_stamped.transform.rotation.z = q.z();
tf_stamped.transform.rotation.w = q.w();
```
