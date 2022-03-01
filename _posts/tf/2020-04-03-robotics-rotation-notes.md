---
layout: article
title:  "3D欧式变换之旋转ABC"
date:   2020-04-03
tags: TF
key: robotics-rotation-abc
---

[TOC]

# Overview

* 旋转转换

  * [Maths - Rotation conversions](https://www.euclideanspace.com/maths/geometry/rotations/conversions/index.htm)

  * [ptam_cg/src/Tools.cc](https://github.com/cggos/ptam_cg/blob/master/src/Tools.cc)

# 旋转表示

## 旋转矩阵 (Rotation Matrix)

$$
\mathbf{R} =  
\begin{bmatrix}
r_{11} & r_{12} & r_{13} \\  
r_{21} & r_{22} & r_{23} \\
r_{31} & r_{32} & r_{33}
\end{bmatrix}
\in \mathbb{R}^{3 \times 3},
\quad s.t. \quad \mathbf{RR}^T = \mathbf{I}, \det(\mathbf{R}) = 1
$$

## Lie Group & Lie Algebra

$$
R = \exp({\boldsymbol \phi^{\wedge}}) \in SO3
$$

## 旋转向量/轴角 (Rotation Vector)

$$
\boldsymbol{\phi} 
= \mathbf{u} \theta 
= \log(\mathbf{R})^{\vee} 
\in \mathbb{R}^3
$$

* **旋转轴**：矩阵 $\mathbf{R}$ 特征值1对应的特征向量（单位矢量）
$$
\mathbf{u} = \frac{\boldsymbol{\phi}}{||\boldsymbol{\phi}||} \in \mathbb{R}^3
$$

* **旋转角**
$$
\theta = ||\boldsymbol{\phi}|| = \arccos \left(\frac{tr(\mathbf{R})-1}{2} \right) \in \mathbb{R}
$$

旋转向量与旋转矩阵的转换，**罗德里格斯公式**（[Rodrigues' rotation formula](https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula)）：

$$
\mathbf{R} = \cos \theta \mathbf{I} + (1-\cos \theta) \mathbf{uu}^T + \sin \theta \mathbf{u}^{\wedge}
$$

## 单位四元数 (Rotation/Unit Quarternion)

$$
R = C(q) \longrightarrow R^T = C(q^{-1})
$$

**2D旋转**：**单位复数** 可用来表示2D旋转。  

$$
z = a + b\vec{i} = r (\cos \theta + \sin \theta \vec{i} ) = e^{\theta \vec{i}}, 
\quad r = ||z||=1
$$

**3D旋转**：**单位四元数** 才可表示3D旋转，四元数是复数的扩充，在表示旋转前需要进行 **归一化**。

$$
\mathbf{q}
= \exp(\frac{\boldsymbol \phi}{2})
= \exp \left( \frac{\mathbf{u} \theta}{2} \right)
= \cos \frac{\theta}{2} + \mathbf{u} \sin \frac{\theta}{2}
= \begin{bmatrix} \cos \frac{\theta}{2} \\ \mathbf{u} \sin \frac{\theta}{2} \end{bmatrix}
\quad s.t. \quad
||\mathbf{q}||_2 = 1
$$

当 $\theta$ 很小时，可以近似表达为

$$
\mathbf{q}
\approx \begin{bmatrix} 1 \\ \frac{\boldsymbol{\phi}}{2} \end{bmatrix}
$$

四元数可以在 **保证效率** 的同时，减小矩阵1/4的内存占有量，同时又能 **避免欧拉角的万向锁问题**。

## 欧拉角 (Euler Angle)

旋转矩阵可以可以分解为绕各自轴对应旋转矩阵的乘积：

$$
\mathbf{R} = \mathbf{R}_1 \mathbf{R}_2 \mathbf{R}_3
$$

根据绕轴的不同，欧拉角共分为两大类，共12种，如下图（基于 **右手系**）所示：

<p align="center">
  <img src="../images/3d_transform/euler_angles_12.jpg"/>
</p>

<a name="is_fixed_axis"></a>

以上不同旋转轴合成的旋转矩阵，每一种都可以看成 **同一旋转矩阵的两种不同物理变换**：

* 绕 **固定轴** 旋转
* 绕 **动轴** 旋转

以 **$Z_1Y_2X_3$** 进行为例，旋转矩阵表示为 $\mathbf{R} = \mathbf{R}_z \mathbf{R}_y \mathbf{R}_x$，说明：

* 绕 **固定轴** 旋转：以初始坐标系作为固定坐标系，**分别先后绕固定坐标系的X、Y、Z轴** 旋转；

* 绕 **动轴** 旋转：先绕 **初始Z轴** 旋转，再绕 **变换后的Y轴** 旋转，最后绕 **变换后的X轴** 旋转

即 绕 **固定坐标轴的XYZ** 和 **绕运动坐标轴的ZYX** 的旋转矩阵是一样的。

我们经常用的欧拉角一般就是 **$Z_1Y_2X_3$** 轴序的 **yaw-pitch-roll**，如下图所示：  

<p align="center">
  <img src="../images/3d_transform/rpy_plane.png"/>
</p>

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
0 & \cos(\theta) & -\sin(\theta) \\
0 & \sin(\theta) &  \cos(\theta)
\end{bmatrix}
$$

$$
\mathbf{R}_y(\theta) =
\begin{bmatrix}
 \cos(\theta) & 0 & \sin(\theta) \\
0 & 1 & 0 \\
-\sin(\theta) & 0 & \cos(\theta)
\end{bmatrix}
$$

$$
\mathbf{R}_z(\theta) =
\begin{bmatrix}
\cos(\theta) & -\sin(\theta) & 0 \\
\sin(\theta) &  \cos(\theta) & 0 \\
0 & 0 & 1
\end{bmatrix}
$$


# 旋转方式

* active rotation: rotating vectors

* passive rotation: rotating frames


# 旋转小量

若小旋转向量 $\Delta \boldsymbol{\phi}$，则旋转小量

$$
\Delta \mathbf{R}
= \exp({\Delta \boldsymbol{\phi}}^\wedge)
\approx \mathbf{I} + {\Delta \boldsymbol{\phi}}^\wedge
$$

$$
\Delta \mathbf{q}
\approx \begin{bmatrix} 1 \\ \frac{1}{2} \Delta \boldsymbol{\phi} \end{bmatrix}
$$

两种对旋转更新的方式

$$
\mathbf{R} \leftarrow \mathbf{R} \cdot \Delta \mathbf{R}
$$

$$
\mathbf{q} \leftarrow \mathbf{q} \otimes \Delta \mathbf{q}
$$


# 旋转扰动

* Local Perturbation

* Global Perturbation


# 旋转导数 (雅克比矩阵)

## 对时间求导

若角速度为 $\boldsymbol{\omega}$，那么旋转的时间导数为

$$
\dot{\mathbf{q}}
= \mathbf{q} \otimes
\begin{bmatrix} 0 \\ \frac{1}{2} \boldsymbol{\omega} \end{bmatrix}
= \frac{1}{2} \mathbf{q} \otimes
\begin{bmatrix} 0 \\ \boldsymbol{\omega} \end{bmatrix}
$$

$$
\dot{\mathbf{R}}=\mathbf{R} \boldsymbol{\omega}^{\wedge}
$$

## 对旋转求导

### 李代数求导

用李代数表示位姿，然后根据李代数加法来对李代数求导

$$
\begin{aligned}
\frac{\partial(\mathbf{R} \mathbf{p})}{\partial \phi} &=
\frac{\partial\left(\exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}\right)}{\partial \boldsymbol{\phi}} \\
&=\lim _{\delta \phi \rightarrow 0} \frac{\exp \left((\boldsymbol{\phi}+\delta \boldsymbol{\phi})^{\wedge}\right) \mathbf{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}}{\delta \boldsymbol{\phi}} \\
&=\lim _{\delta \boldsymbol{\phi} \rightarrow 0} \frac{\exp \left(\left(\boldsymbol{J}_{l} \delta \boldsymbol{\phi}\right)^{\wedge}\right) \exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}}{\delta \boldsymbol{\phi}} \\
& \approx \lim _{\delta \boldsymbol{\phi} \rightarrow 0} \frac{\left(\boldsymbol{I}+\left(\boldsymbol{J}_{l} \delta \boldsymbol{\phi}\right)^{\wedge}\right) \exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}}{\delta \boldsymbol{\phi}} \\
&=\lim _{\delta \boldsymbol{\phi} \rightarrow 0} \frac{\left(\boldsymbol{J}_{l} \delta \boldsymbol{\phi}\right)^{\wedge} \exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}}{\delta \boldsymbol{\phi}} \\
&=\lim _{\delta \boldsymbol{\phi} \rightarrow 0} \frac{-\left(\exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}\right)^{\wedge} \boldsymbol{J}_{l} \delta \boldsymbol{\phi}}{\delta \boldsymbol{\phi}}=-(\mathbf{R} \mathbf{p})^{\wedge} \boldsymbol{J}_{l}
\end{aligned}
$$

其中，$\mathbf{J}_l$ 为 **$SO(3)$ 的左雅克比矩阵**，其定义为

$$
\boldsymbol{J}_{l}=\boldsymbol{J}=\frac{\sin \theta}{\theta} \boldsymbol{I}+\left(1-\frac{\sin \theta}{\theta}\right) \boldsymbol{a} \boldsymbol{a}^{T}+\frac{1-\cos \theta}{\theta} \boldsymbol{a}^{\wedge}
$$

### 扰动方式

Note: 本质是 **Local 或 Global 扰动**

对李群左乘或者右乘微小扰动量，然后对该扰动求导，成为左扰动和右扰动模型，这种方式 **省去了计算雅克比**，所以使用更为常见

$$
\begin{aligned}
\frac{\partial(\mathbf{R} \mathbf{p})}{\partial \boldsymbol{\phi}}
&=\lim _{\boldsymbol{\varphi} \rightarrow 0} \frac{\exp \left(\boldsymbol{\varphi}^{\wedge}\right) \exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}}{\varphi} \\
& \approx \lim _{\varphi \rightarrow 0} \frac{\left(I+\boldsymbol{\varphi}^{\wedge}\right) \exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \mathbf{p}}{\varphi} \\
&=\lim _{\boldsymbol{\varphi} \rightarrow 0} \frac{\boldsymbol{\varphi}^{\wedge} \mathbf{R} \mathbf{p}}{\varphi} \\
&=\lim _{\varphi \rightarrow 0} \frac{-(\mathbf{R} \mathbf{p})^{\wedge} \boldsymbol{\varphi}}{\varphi} \\
&=-(\mathbf{R} \mathbf{p})^{\wedge}
\end{aligned}
$$

$$
\begin{aligned}
\frac{\partial{(\mathbf{R}^{-1} \mathbf{p})}}{\partial{\boldsymbol{\phi}}}
&= \lim_{\varphi \rightarrow 0}
   \frac{(\mathbf{R}\exp(\varphi^{\wedge}))^{-1} \mathbf{p} - \mathbf{R}^{-1} \mathbf{p}} {\varphi} \\
&= \lim_{\varphi \rightarrow 0}
   \frac{\exp(-\varphi^{\wedge}) \mathbf{R}^{-1} \mathbf{p} - \mathbf{R}^{-1} \mathbf{p}} {\varphi} \\
&\approx
   \lim_{\varphi \rightarrow 0}
   \frac{(\mathbf{I}-\varphi^{\wedge}) \mathbf{R}^{-1} \mathbf{p} - \mathbf{R}^{-1} \mathbf{p}} {\varphi} \\
&= \lim_{\varphi \rightarrow 0}
   \frac{-\varphi^{\wedge} \mathbf{R}^{-1} \mathbf{p}} {\varphi} \\
&= \lim_{\varphi \rightarrow 0}
   \frac{(\mathbf{R}^{-1}\mathbf{p})^{\wedge} \varphi} {\varphi} \\
&= (\mathbf{R}^{-1}\mathbf{p})^{\wedge}
\end{aligned}
$$

$$
\begin{aligned}
\frac{\partial \ln(\mathbf{R}_1 \mathbf{R}_2^{-1})^{\vee}}{\partial \boldsymbol{\phi}_2}
&= \lim_{\varphi \rightarrow 0}
   \frac{\ln(\mathbf{R}_1 (\mathbf{R}_2 \exp(\varphi^{\wedge}))^{-1})^{\vee} - \ln(\mathbf{R}_1 \mathbf{R}_2^{-1})^{\vee}} {\varphi} \\
&= \lim_{\varphi \rightarrow 0}
   \frac{\ln(\mathbf{R}_1 \exp(-\varphi^{\wedge}) \mathbf{R}_2^{-1})^{\vee}  - \ln(\mathbf{R}_1 \mathbf{R}_2^{-1})^{\vee}} {\varphi} \\
&= \lim_{\varphi \rightarrow 0}
   \frac{\ln(\mathbf{R}_1 \mathbf{R}_2^{-1} \exp((-\mathbf{R}_2 \varphi)^{\wedge}))^{\vee} - \ln(\mathbf{R}_1\mathbf{R}_2^{-1})^{\vee}} {\varphi} \\
&\approx \lim_{\varphi \rightarrow 0}
   \frac{\ln(\mathbf{R}_1\mathbf{R}_2^{-1})^{\vee} + \mathbf{J}_r^{-1} (-\mathbf{R}_2 \varphi) - \ln(\mathbf{R}_1\mathbf{R}_2^{-1})^{\vee}} {\varphi} \\
&= -\mathbf{J}_r^{-1} \mathbf{R}_2
\end{aligned}
$$

**对于矩阵A和B，$\exp(A)\exp(B) \neq \exp(A+B)$**，错误示例：

$$
r = \ln(R_1 \cdot R_2^T)^\vee =
\ln \left[ \exp({\theta}_1^{\wedge}) \cdot \exp(-{\theta}_2^{\wedge}) \right]^\vee = {\theta}_1 - {\theta}_2
$$

### 四元数形式

$$
r = \delta \theta
= 2 \left[ q_1 \otimes q_2^{-1} \right]_{xyz}
= 2 \left[ q_1 \otimes q_2^{*} \right]_{xyz}
$$

$$
\begin{aligned}
  \frac{\partial r}{\partial \delta {\theta}_2}
  &= \frac{\partial 2 \left[ q_1 \otimes q_2^{*} \right]_{xyz}}{\partial \delta {\theta}_2} \\
  &=
  \frac
  {\partial 2
  \left[ q_1 \otimes
  \left[ q_2 \otimes \delta q_2
  \right]^{*}
  \right]_{xyz}}
  {\partial \delta {\theta}_2} \\
  &= -2 \begin{bmatrix} 0 & I \end{bmatrix}_{3 \times 4} \cdot
  \frac{\partial
  \left[ q_2 \otimes
  \delta q_2 \otimes q_1^*
  \right]}
  {\partial \delta {\theta}_2} \\
  &= -2 \begin{bmatrix} 0 & I \end{bmatrix}_{3 \times 4} \cdot
  \frac{\partial
  \left[ L(q_2) \cdot R(q_1^*) \cdot \delta q_2
  \right]}
  {\partial \delta q_2} \cdot
  \frac{\partial \delta q_2}
  {\partial {\theta}_2} \\  
  &= -2 \begin{bmatrix} 0 & I \end{bmatrix}_{3 \times 4} \cdot
  L(q_2) \cdot R(q_1^*) \cdot
  \frac{\partial \begin{bmatrix} 1 \\ \frac{1}{2} {\theta}_2 \end{bmatrix}}
  {\partial {\theta}_2} \\
  &= - \begin{bmatrix} 0 & I \end{bmatrix}_{3 \times 4} \cdot
  L(q_2) \cdot R(q_1^*) \cdot
  \begin{bmatrix} 0 \\ I \end{bmatrix}_{4 \times 3}
\end{aligned}
$$

## Check Jacobian Matrix

根据

$$
J = f^{\prime}(x + \Delta x) = \lim_{\Delta x \rightarrow 0} \frac{f(x + \Delta x)-f(x)}{\Delta x}
$$

验证

$$
J \Delta x \approx f(x + \Delta x)-f(x)
$$

Code Ref:

* [CheckJacobian in VINS-Mono](https://github.com/HKUST-Aerial-Robotics/VINS-Mono/blob/master/vins_estimator/src/factor/integration_base.h#L279-L445)

* imu_x_fusion
  ```cpp
    virtual void check_jacobian(
      const Eigen::MatrixXd &mat_x, const Eigen::MatrixXd &mat_z) {
    Eigen::Vector3d delta(0.0012, -0.00034, -0.00056);

    Eigen::Isometry3d T0;
    T0.matrix() = mat_x;
    
    // perturbation on t
    Eigen::Isometry3d T1 = T0;
    T1.translation() += delta;

    // perturbation on R
    Eigen::Isometry3d T2 = T0;
    T2.linear() = State::rotation_update(T2.linear(), State::delta_rot_mat(delta, 1));

    Eigen::Isometry3d Tx0 = Tvw_ * T0 * Tcb_.inverse();
    Eigen::Isometry3d Tx1 = Tvw_ * T1 * Tcb_.inverse();
    Eigen::Isometry3d Tx2 = Tvw_ * T2 * Tcb_.inverse();

    const auto &H = measurement_jacobian(mat_x, mat_z);

    std::cout << "---------------------" << std::endl;
    std::cout << "(purt t) p res: " << (Tx1.translation() - Tx0.translation()).transpose() << std::endl;
    std::cout << "(purt t) p Hx: " << (H.block<3, 3>(0, 0) * delta).transpose() << std::endl;

    std::cout << "(purt R) p res: " << (Tx2.translation() - Tx0.translation()).transpose() << std::endl;
    std::cout << "(purt R) p Hx: " << (H.block<3, 3>(0, 6) * delta).transpose() << std::endl;

    std::cout << "(purt R) q res: " << State::rotation_residual(Tx2.linear(), Tx0.linear()).transpose() << std::endl;
    std::cout << "(purt R) q Hx: " << (H.block<3, 3>(3, 6) * delta).transpose() << std::endl;
    std::cout << "---------------------" << std::endl;
  }
  ```
