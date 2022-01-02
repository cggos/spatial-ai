---
layout: article
title:  "From MAP, MLE, OLS, G-N to IEKF,EKF"
tags: StateEstimation MSF
key: state-estimation-ekf-vs-eskf
---

[TOC]

# Overview

本文主要包括以下几个方面：

* 将线性高斯系统的状态空间方程(运动和观测方程，即多个似然因子)组合为一个新的观测方程，其实就是将多个约束项放在一起

* 推导了MAP到MLE，再到OLS的历程

* 以上面系统的状态估计为出发点，推导了最小二乘、高斯牛顿、IEKF和EKF的区别与联系，将优化与滤波联系在一起，导出了高斯牛顿海塞矩阵H与EKF协方差矩阵P的关系，证明了IEKF与高斯牛顿的等价性，以及EKF即是高斯牛顿的一次迭代

# Linear-Gaussian System

定义 非线性系统

$$
\begin{cases}
x_{k}^- = g(x_{k-1}) + v, \quad v \sim \mathcal{N}(0, Q) \\
y_{k} = h(x_k) + w,  \quad w \sim \mathcal{N}(0, R)
\end{cases}
$$

在工作点附近线性化 (在此不考虑状态预测，将状态先验定义为预测后的值)

$$
\begin{cases}
x_{k}^- = x_{k} + v, 
\quad v \sim \mathcal{N}(0, Q), \quad x_{k}^- \sim \mathcal{N}(x_k, P_k^-) \\
y_{k} = h(x_{op, k}) + H (x_k - x_{op, k}) + w,  \quad w \sim \mathcal{N}(0, R_k)
\end{cases}
$$

其中，

$$
H_k = \frac{\partial h(x_k)}{\partial x_k} |_{x_{op,k}}
$$

合并所有 **likelihood factors**，即 状态方程(先验) 与 观测方程(后验) ，得到新的 测量值、观测方程和残差

$$
z_k = \begin{bmatrix} x_{k}^- \\ y_k \end{bmatrix}, \quad
f_k(x_k) = \begin{bmatrix} x_k \\ h(x_k) \end{bmatrix}, \quad
r_k(x_k) = z_k - f(x_k)
$$

其中，

$$
z_k \sim \mathcal{N}(f(x_k), \Sigma_k), \quad 
\Sigma_k = 
\begin{bmatrix} P_k^- & 0 \\ 0 & R_k \end{bmatrix}
$$


新的观测方程 (**工作点附近线性化**，一阶泰勒展开)

$$
\begin{aligned}
f(x_k) 
=& f(x_{op,k}) + J_k (x_k - x_{op,k}) + n \\
\approx& f(x_{op,k}) + J_k \Delta x_{op,k} + n
\end{aligned}
$$

其中，

$$
\begin{aligned}
J_k =& \frac{\partial f_k(x)}{\partial x_k} |_{x_{op,k}} =
\begin{bmatrix} I \\ H_k \end{bmatrix}
\end{aligned}
$$

测量残差

$$
r(x_k) = z_k - f(x_k)
$$

另外， **预测残差函数 (工作点附近线性化)**

$$
r_k(x_{op,k}) = z_k - f(x_{op,k}) = J_k \Delta x_{op,k} + n, 
\quad n \sim \mathcal{N}(0, \Sigma)
$$


# MAP $\rightarrow$ MLE $\rightarrow$ OLS

根据 贝叶斯法则， **后验 = 似然 x 先验**

$$
\begin{aligned}
\underbrace{P(X \mid Z)}_{posterior} 
=& \frac{P(X, Z)}{P(Z)}  \\
=& \frac{P(Z \mid X) P(X)}{P(Z)} \\
\propto& \underbrace{P(Z \mid X)}_{likehood} \underbrace{P(X)}_{prior}
\end{aligned}
$$

解决上述系统的状态估计问题，就是求X的最优估计使得 **最大后验概率(MAP)**，即求 **最大似然估计(MLE)**

$$
\begin{aligned}
X^* 
=& \arg \max_X P(X \mid Z) \\
=& \arg \max_X P(Z \mid X) P(X) \\
=& \arg \max_X P(Z \mid X) \\
\end{aligned}
$$

根据 **多元高斯分布** 的 概率密度函数 为

$$
p(\mathbf{x} \mid \boldsymbol{\mu}, \mathbf{\Sigma})
= \mathcal{N}(\mathbf{x} ; \boldsymbol{\mu}, \mathbf{\Sigma})
= \frac{1}{\sqrt{(2 \pi)^{N} \operatorname{det} \mathbf{\Sigma}}} \exp \left(-\frac{1}{2}(\mathbf{x}-\boldsymbol{\mu})^{T} \boldsymbol{\Sigma}^{-1}(\mathbf{x}-\boldsymbol{\mu})\right)
$$

对于上述系统 (Linear-Gaussian)，已知 测量模型

$$
z = f(x) + n, \quad n \sim \mathcal{N}(0, \Sigma), \quad z \sim \mathcal{N}(f(x), \Sigma)
$$

则 其 似然概率

$$
P(z \mid x) 
= \mathcal{N}(z; f(x), \Sigma) 
= \eta \exp \left(-\frac{1}{2}(z-f(x))^{T} {\Sigma}^{-1}(z-f(x))\right)
$$

定义 马氏范数 (本文皆以此定义)

$$
\| r \|_{\Sigma}^2 \triangleq r^T \Sigma^{-1} r
$$


因此，在 **MLE 和 高斯分布** 的假设下，我们可以得到 **最小二乘问题(OLS)**

$$
\begin{aligned}
X^* 
=& \arg \min_X - \log \left( P(z \mid x) \right) \\
=& \arg \min_X \frac{1}{2} (z-f(x))^{T} {\Sigma}^{-1} (z-f(x)) \\
=& \arg \min_X \frac{1}{2} \| z-f(x) \|^2_{\Sigma} \\
=& \arg \min_X \frac{1}{2} \| z - f(x_{op}) - J \Delta_{op} \|^2_{\Sigma} \\
=& \arg \min_X \frac{1}{2} \| J \Delta_{op} - (z - f(x_{op})) \|^2_{\Sigma} \\
=& \arg \min_X \frac{1}{2} \| r(x) \|^2_{\Sigma}
\end{aligned}
$$

# OLS $\rightarrow$ Gauss-Newton

根据以上最小二乘问题， 我们可以得到G-N正规方程为

$$
(J^T \Sigma^{-1} J) \Delta_{op} = J^T \Sigma^{-1} r_{op}
$$

从而，状态增量

$$
\Delta_{op} = (J^T \Sigma^{-1} J)^{-1} J^T \Sigma^{-1} r_{op}
$$

另外，对于 **加权最小二乘**，上式中的 $\Sigma^{-1}$ (**信息矩阵**，协方差的逆)，就是 **权重矩阵** $W$；方差越大，权重越小。

# Gauss-Newton $\rightarrow$ EKF(update P)

<!-- 
对上述系统的 **预测残差**

$$
\begin{aligned}
\| r_k(x_{op,k}) \|^2_{\Sigma} 
=& r_k(x_{op,k})^T \Sigma^{-1} r_k(x_{op,k}) \\
=& (z_k - f(x_{op,k}))^T \Sigma^{-1} (z_k - f(x_{op,k})) \\
=& (J_k \Delta x_{op,k})^T \Sigma^{-1} (J_k \Delta x_{op,k}) \\
=& \Delta x_{op,k}^T (J_k^T \Sigma^{-1} J_k) \Delta x_{op,k} \\
=& (x_k^+ - x_{op,k}) (P_k^+)^{-1}  (x_k^+ - x_{op,k})^T
\end{aligned}
$$

$$
\begin{aligned}
\Sigma 
=& E(r_{op} r_{op}^T) \\
=& E( (r_{op}^T r_{op})^T ) \\
=& E( (\Delta x_{op,k}^T (J_k^T \Sigma^{-1} J_k) \Delta x_{op,k})^T ) \\
=& E( \Delta x_{op,k} (J_k^T \Sigma^{-1} J_k) \Delta x_{op,k}^T )
\end{aligned}
$$ 

-->

**后验 协方差矩阵**

$$
\begin{aligned}
P_k^+ 
=& E[(x_k^+ - x_{op,k})(x_k^+ - x_{op,k})^T] \\
=& E(\Delta_{op} \Delta_{op}^T) \\
=& E(
  (J^T \Sigma^{-1} J)^{-1} J^T \Sigma^{-1} r_{op} 
  r_{op}^T \Sigma^{-T} J (J^T \Sigma^{-1} J)^{-T}) \\
=& 
  (J^T \Sigma^{-1} J)^{-1} J^T \Sigma^{-1} 
  E(r_{op} r_{op}^T)
  \Sigma^{-1} J J^{-1} \Sigma J^{-T} \\  
=& \left(
  {\color{blue}{J_k^T \Sigma_k^{-1} J_k}}
\right)^{-1} \\
=& \left(
  \begin{bmatrix} I & H_k^T \end{bmatrix}
  \begin{bmatrix} P_k^- & 0 \\ 0 & R_k \end{bmatrix}^{-1}
  \begin{bmatrix} I \\ H_k \end{bmatrix}
\right)^{-1} \\
=& \left( P^{-1} + H^T R^{-1} H \right)^{-1} \\
=& P - P H^T (H P H^T + R)^{-1} H P  \quad \quad \text{(Matrix inversion lemmas)} \\
=& {\color{blue}{(I - KH) P_k^-}}
\end{aligned}
$$

其中，K即卡尔曼增益

$$
\begin{aligned}
K 
=& P_k^- H^T(H P_k^- H^T + R_k)^{-1} \\
=& (H^T R^{-1}H + P^{-1})^{-1} H^T R^{-1} \quad \quad \text{(Matrix inversion lemmas)}
\end{aligned}
$$

因此，**高斯牛顿的海塞(信息)矩阵H的逆 等价于 EKF的协方差矩阵P**

$$
{\color{red}{
H^{-1} = \left(J_k^T \Sigma_k^{-1} J_k\right)^{-1} 
\longleftrightarrow P
}}
$$


# Gauss-Newton $\rightarrow$ IEKF $\rightarrow$ EKF(update X)

根据 先验，我们从 **高斯-牛顿** 出发，推导 **IEKF的后验估计状态更新方式** (以下 $x_i = x_{op,i}$)

$$
\begin{aligned}
x_{i+1} 
=& x_i + \Delta x \\
=& x_i + (J^T \Sigma^{-1} J)^{-1} (J^T \Sigma^{-1} r_{op}) \\
=& (J^T \Sigma^{-1} J)^{-1} J^T \Sigma^{-1} (z-f(x_i) + J x_i) \\
=& 
\left( P^{-1} + H^T R^{-1} H \right)^{-1}
\begin{bmatrix} {P}^{-1} & H^T R^{-1} \end{bmatrix}
\begin{bmatrix} 
  x_i^- \\ 
  y_i - h(x_i) + H x_i
\end{bmatrix} \\
=& 
\left( P^{-1} + H^T R^{-1} H \right)^{-1}
\left(
  H^T R^{-1}(y_i - h(x_i) + H x_i) + {P}^{-1} x_i^-
\right) \\
=& 
\left( P^{-1} + H^T R^{-1} H \right)^{-1}
\left(
  H^T R^{-1}(y_i - h(x_i) - H(x_i^- - x_i) + H x_i^-) + {P}^{-1} x_i^-
\right) \\
=&
x_i^- +
{\color{blue}{
\left( P^{-1} + H^T R^{-1} H \right)^{-1} H^T R^{-1}
}}
(y_i - h(x_i) - H(x_i^- - x_i)) \\
=&
{\color{blue}{
x_i^- + K (y_i - h(x_i) - H(x_i^- - x_i))
}}
\end{aligned}
$$

从而验证了他们在数学上的等价性

$$
{\color{red}{
\text{IEKF} \longleftrightarrow \text{Gauss-Newon}
}}
$$

当第一次迭代时，一般 $x_i = x_i^-$，此时我们可以得到 **EKF的状态更新公式**

$$
x_{i+1} = x_i^- + K (y_i - h(x_i) )
$$

因此，**EKF 等价于 高斯牛顿的一次迭代**

$$
{\color{red}{\text{EKF} 
\longleftrightarrow \text{IEKF一次迭代} 
\longleftrightarrow \text{GN一次迭代}}}
$$


# IEKF

<p align="center">
  <img src="../images/kalman_filter/iekf/iekf_00.png" style="width:100%;"/>
  <img src="../images/kalman_filter/iekf/iekf_01.png" style="width:100%;"/>
</p>


# Reference

* The Iterated Kalman Filter Update as a Gauss-Newton Method

* Performance evaluation of iterated extended Kalman filter with variable step-length

* [IKF(IEKF)推导](https://zhuanlan.zhihu.com/p/66646519)

* [IEKF 和 Gaussian-Newton method 等价性证明](https://zhuanlan.zhihu.com/p/447014586)

* [Matrix inversion lemmas](https://tlienart.github.io/posts/2018/12/13-matrix-inversion-lemmas/index.html)
