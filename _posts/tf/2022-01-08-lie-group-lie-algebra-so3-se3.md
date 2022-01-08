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

指数映射：$\mathbf{R} = exp(\boldsymbol{\phi}^{\wedge}) {\approx} \mathbf{I} + \boldsymbol{\phi}^{\wedge}$ (first-order approximation)  

对数映射：$\boldsymbol{\phi} = log(\mathbf{R})^{\vee}$

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

指数映射：$\mathbf{T} = exp(\boldsymbol{\xi}^{\wedge})$  
对数映射：$\boldsymbol{\xi} = log(\mathbf{T})^{\vee}$
