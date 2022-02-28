---
layout: article
title:  "李群和李代数: SO3, SE3"
tags: TF
key: lie-group-lie-algebra-so3-se3
---

[TOC]

# Overview

* [第四讲：李群和李代数](https://zhuanlan.zhihu.com/p/33156814)

* [四元数矩阵与 so(3) 左右雅可比](https://fzheng.me/2018/05/22/quaternion-matrix-so3-jacobians/)

<p align="center">
  <img src="../images/3d_transform/se3_so3.png" style="width:100%;"/>
</p>

## Matrix Exponential & Logarithm

已知 $A \in \mathbb{R}^{M \times M}$,

$$
\exp (\mathbf{A})=\mathbf{1}+\mathbf{A}+\frac{1}{2 !} \mathbf{A}^{2}+\frac{1}{3 !} \mathbf{A}^{3}+\cdots=\sum_{n=0}^{\infty} \frac{1}{n !} \mathbf{A}^{n}
$$

$$
\ln (\mathbf{A})=\sum_{n=1}^{\infty} \frac{(-1)^{n-1}}{n}(\mathbf{A}-\mathbf{1})^{n}
$$

# SO3

## 特殊正交群 $SO(3)$

$$
SO(3) =
\Bigg\{
\mathbf{R} \in \mathbb{R}^{3 \times 3} \Bigg|
\mathbf{RR}^T = \mathbf{I}, det(\mathbf{R}) = 1
\Bigg\}
$$

## 李代数 $\mathfrak{so}(3)$

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

## 映射

### 指数映射

$$
\begin{aligned}
\mathbf{R} 
&= \exp(\boldsymbol{\phi}^{\wedge}) \\
&= \mathbf{I} + \boldsymbol{\phi}^{\wedge} \mathbf{J}
\end{aligned}
$$

当 $\|\phi\|$ 比较小时，一阶泰勒近似

$$
\mathbf{R} \approx \mathbf{I} + \boldsymbol{\phi}^{\wedge}
$$

### 对数映射

$$
\boldsymbol{\phi} = \log(\mathbf{R})^{\vee}
$$

# SE3

## 特殊欧式群 $SE(3)$  

$$
SE(3) =
\Bigg\{
\mathbf{T} =
\begin{bmatrix} \mathbf{R} & \mathbf{t} \\ \mathbf{0}^T & 1 \end{bmatrix}
\in \mathbb{R}^{4 \times 4} \Bigg|
\mathbf{R} \in SO(3), \mathbf{t} \in \mathbb{R}^{3}
\Bigg\}
$$

## 李代数 $\mathfrak{se}(3)$

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

另外，

$$
\mathbf{t}=\mathbf{J} \boldsymbol{\rho} \in \mathbb{R}^{3}, \quad \mathbf{J}=\sum_{n=0}^{\infty} \frac{1}{(n+1) !}\left(\phi^{\wedge}\right)^{n}
$$

## 映射

### 指数映射

$$
\mathbf{T} = \exp(\boldsymbol{\xi}^{\wedge})
$$  

## 对数映射

$$
\boldsymbol{\xi} = \log(\mathbf{T})^{\vee}
$$


# Adjoint of Lie Group

<p align="center">
  <img src="../images/3d_transform/adjoint_lie_group.png" style="width:60%;"/>
</p>

```cpp
Eigen::Matrix3d R_b = Eigen::AngleAxisd(M_PI / 4, Eigen::Vector3d(0, 1, 0)).toRotationMatrix();
Sophus::SO3d SO3_b(R_b);
Sophus::SE3d::Tangent vec_b;
vec_b.head(3) << 10.1793, -6.3204, 28.09113;
vec_b.tail(3) = SO3_b.log();

Sophus::Vector3d t_wb(1.2, 3.4, 5.6);
Sophus::SE3d SE3_wb(R, t_wb);

Sophus::SE3d SE3_w = SE3_wb * Sophus::SE3d::exp(vec_b) * SE3_wb.inverse();
Sophus::SE3d::Tangent vec_w0 = SE3_w.log();

Sophus::SE3d::Tangent vec_w1 = Sophus::SE3d::vee(SE3_wb.matrix() * Sophus::SE3d::hat(vec_b) * SE3_wb.inverse().matrix());

Sophus::SE3d::Tangent vec_w2 = Sophus::SE3d::exp(vec_w1).log();

Sophus::SE3d::Tangent vec_b_adj = SE3_wb.Adj() * vec_b;

std::cout << "vec_w0 :" << vec_w0.transpose() << std::endl;
std::cout << "vec_w1 :" << vec_w1.transpose() << std::endl;
std::cout << "vec_w2 :" << vec_w2.transpose() << std::endl;
std::cout << "vec_b_adj :" << vec_b_adj.transpose() << std::endl;
```

output:

```
vec_w0 :     6.3204     5.78107     30.7615   -0.785398 1.13928e-16           0
vec_w1 :     6.3204     5.78107     30.7615   -0.785398 1.74393e-16           0
vec_w2 :     6.3204     5.78107     30.7615   -0.785398 1.74393e-16           0
vec_b_adj :  6.3204     5.78107     30.7615   -0.785398 1.74393e-16           0
```

## Adjoint action of SE(3)

* https://gtsam.org/2021/02/23/uncertainties-part3.html

<p align="center">
  <img src="../images/3d_transform/adjoint_bw.png" style="width:80%;"/>
</p>

上图用伴随表示：

$$
\exp(\xi_w^{\wedge}) = T_{wb} \cdot \exp(\xi_b^{\wedge}) \cdot T_{wb}^{-1} = \exp((\mathtt{Adj}_{T_{wb}} \cdot \xi_b)^{\wedge})
$$

### 同一刚体中不同坐标系姿态变换的相互表示

以带有IMU的相机模组为例，已知 IMU（坐标系）本身的姿态变换 $\mathbf{T}^{B}$ 和 同一模组中Camera到IMU(Body)的坐标系变换 $\mathbf{T}_{BC}$，则 该Camera（坐标系）本身的姿态变换为：  

$$
{}_C\mathbf{T} = \mathbf{T}_{BC} \cdot \mathbf{T}^{B} \cdot \mathbf{T}_{BC}^{-1}
$$

因为上面的变换都是 **坐标系的变换**，所以矩阵相乘 从左到右，即 **矩阵右乘**

<p align="center">
  <img src="../images/3d_transform/pointcloud_imu.jpg"/>
</p>

## Properties

$$
R \phi^{\wedge} R^T = (R \phi)^{\wedge}
$$

# Baker-Campbell-Hausdorff (BCH)

$$
\begin{aligned}
\ln \left(\mathbf{C}_{1} \mathbf{C}_{2}\right)^{\vee}=\ln (\exp (&\left.\left.\phi_{1}^{\wedge}\right) \exp \left(\phi_{2}^{\wedge}\right)\right)^{\vee} \\
& \approx\left\{\begin{array}{ll}
\mathbf{J}_{\ell}\left(\phi_{2}\right)^{-1} \phi_{1}+\phi_{2} & \text { if } \phi_{1} \text { small } \\
\phi_{1}+\mathbf{J}_{r}\left(\phi_{1}\right)^{-1} \phi_{2} & \text { if } \phi_{2} \text { small }
\end{array},\right.
\end{aligned}
$$

In Lie group theory, $J_r$ and $J_l$ are referred to as **the right and left Jacobians of $SO(3)$**, respectively.

## SO(3) 左右雅克比矩阵

* [四元数矩阵与 so(3) 左右雅可比](https://fzheng.me/2018/05/22/quaternion-matrix-so3-jacobians/)
