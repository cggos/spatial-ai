---
layout: article
title:  "EKF v.s. MSCKF v.s. MAP (VINS-Mono)"
tags: StateEstimation MSF
key: ekf-msckf-map-vinsmono
---

[TOC]

# Overview

$$
z = f(x) + n, \quad n \sim \mathcal{N}(0, \Sigma), \quad z \sim \mathcal{N}(f(x), \Sigma)
$$

$$
P(z \mid x) 
= \mathcal{N}(z; f(x), \Sigma) 
= \eta \exp \left(-\frac{1}{2}(z-f(x))^{T} {\Sigma}^{-1}(z-f(x))\right)
$$

# EKF

true state

$$
\begin{aligned}
x_k &= f(x_{k-1}, w_{k-1}) \\
z_k &= h(x_k, v_k)
\end{aligned}
$$

norminal state

$$
\begin{aligned}
\bar{x}_k &= f(\hat{x}_{k-1}, 0) \\
\bar{z}_k &= h(\bar{x}, 0)
\end{aligned}
$$

true state linearization

$$
\begin{aligned}
x_k &\approx \bar{x}_k + A(x_{k-1} - \hat{x}_{k-1}) + W w_{k-1} \\
z_k &\approx \bar{z}_k + H(x_k - \bar{x}_k) + V v_k
\end{aligned}
$$

prediction error & measurement residual

$$
\begin{aligned}
e_x &\equiv x_k - \bar{x}_k \approx A(x_{k-1} - \hat{x}_{k-1}) + W w_{k-1} \\
e_z &\equiv z_k - \bar{z}_k \approx H e_x + V v_k
\end{aligned}
$$

jacobian

$$
A = \frac{\partial f}{\partial x} = \frac{\partial f}{\partial e_x}, \quad
W = \frac{\partial f}{\partial w}
$$

$$
H = \frac{\partial h}{\partial x} = \frac{\partial f}{\partial e_x}, \quad
V = \frac{\partial h}{\partial v}
$$

covariance

$$
w \sim \mathcal{N}(0, Q), \quad v \sim \mathcal{N}(0, R)
$$

$$
e_x \sim \mathcal{N}(0, P) \rightarrow x \sim \mathcal{N}(\bar{x}, P), \quad 
e_z \sim \mathcal{N}(0, S)
$$

$$
P = \texttt{cov}(e_x) = E(e_x e_x^T), \quad S = \texttt{cov}(e_z) = E(e_z e_z^T)
$$

## Prediction

state prediction (w/o noise)

$$
\hat{x}_k^- = f(\hat{x}_{k-1}, 0)
$$

(error state) covariance

$$
\text{cov}(x_k - \hat{x}_k^-) = P_k^- = A_k P_{k-1} A_k^T + W_k Q_{k-1} W_k^T
$$

## Update

Kalman gain

$$
K_k = P_k^- H_k^T S^{-1}, \quad S = H_k P_k^- H_k^T + V_k R_k V_k^T
$$

state update

$$
\hat{x}_k = \hat{x}_k^- + K_k (z_k - h(\hat{x}_k^-, 0))
$$

covariance update

$$
\text{cov}(x_k - \hat{x}_k) = P_k = (I - K_k H_k) P_k^-
$$

# MSCKF

## Prediction

### state prediction (state prior)

$$
PVQ
$$

### propagate error cov P

continuous-time to discret-time，离散时间 状态转移矩阵和噪声协方差矩阵 比较准确，例如

$$
F = \exp(A \Delta t) \approx
I + A \Delta t + \frac{1}{2} (A \Delta t)^2 + \frac{1}{6} (A \Delta t)^3
$$

误差状态的概率分布

$$
\delta x \sim \mathcal{N}(\hat{\delta x}, P)
, \quad n \sim \mathcal{N}(0, Q)
$$

误差协方差传播（整个系统过程）

$$
\delta x_{i+1} = F \delta x_i + G n
, \quad P = F P F^T + G Q G^T
$$

## Update (ESKF)

$$
\delta x \sim \mathcal{N}(\hat{\delta x}, P)
$$

$$
z = h(x) + v \approx h(x_0) + H \delta x + v, \quad v \sim \mathcal{N}(0, R)
$$

predicted residual (innovation)

$$
r = z - h(x_0) = H \delta x + v
$$

then, the covariance of innovation

$$
cov(r, r) = E(rr^T) = E(H \delta x \delta x^T H^T + vv^T) = HPH^T + R
$$

### update state and covariance

$$
x = K r
$$

$$
P = (I-KH)P
$$

# MAP (VINS-Mono)

## Prediction

### state prediction (state prior)

$$
PVQ
$$

### pre-integration (propagate error cov P & state)

continuous-time to discret-time

$$
F = \exp(A \Delta t) \approx I + A \Delta t
$$

误差状态的概率分布

$$
\delta x \sim \mathcal{N}(0, P)
, \quad n \sim \mathcal{N}(0, Q)
$$

误差状态（状态预积分）和协方差传播（图像k时刻初始，图像k～图像k+1）

$$
\delta x_{i+1} = F \delta x_i + G n
, \quad P = F P F^T + G Q G^T
$$


## Update (MAP)

### Jacobian & information matrix in MAP

$$
J = \frac{\partial r}{\partial \delta x}
$$

#### IMU

协方差矩阵（信息矩阵的逆）

$$
\text{cov}(\delta x_k) = P
$$

#### Cam

协方差矩阵（信息矩阵的逆）

$$
\text{cov}(r_k) = \Sigma_{\pi}
$$

### update state

$$
x = x + \delta x
$$

# QA

##  Jacobi when Linear and Nonlinear

欧式空间的非线性方程

$$
h(x) \approx h(x_0) + H \Delta x, \quad 
\left. H = \frac{\partial h(x)}{\partial x} \right|_{x = x_0}
$$

当 $h(x)$ 线性时

$$
h(x) = Hx
$$

## Jacobi w.r.t Error or True State

$$
f(x_0 \oplus \Delta x) = F(\Delta x)
$$

$$
f(x_0 \oplus \Delta x) \approx f(x_0) + 
\left. \frac{\partial f(x_0 \oplus \Delta x)}{\partial x} \right|_{x=x_0} \Delta x
$$

$$
F(\Delta x) \approx F(0) + 
\left. \frac{\partial F(\Delta x)}{\partial \Delta x} \right|_{\Delta x = 0} \Delta x =
f(x_0) +
\left. \frac{\partial f(x_0 \oplus \Delta x)}{\partial \Delta x} \right|_{\Delta x = 0} \Delta x
$$

当x在欧式空间时，上式等价。


* ref: https://zhuanlan.zhihu.com/p/75714471

### Jacobi in EKF & MAP

优化变量 是 什么状态，对应的 雅克比 即是 对什么状态 求导

#### EKF

|                      | w.r.t true state | w.r.t error state |
|----------------------|:----------------:|:-----------------:|
| measurement function |     $h(x)$       |    $h(\Delta x)$  |
| Jacobi               | $\frac{\partial h(x)}{\partial x}$ | $\frac{\partial h(x)}{\partial \Delta x}$ |
| init state       |      $x = x_0$   |   ${\Delta x}=0$  |
| update               |  $x \oplus \Delta x, \Delta x = Kr$ |  $\Delta x = Kr$ |

#### MAP

|                  | w.r.t true-state | w.r.t error-state |
|------------------|:----------------:|:-----------------:|
| cost function    |     $f(x)$       |   $f(\Delta x)$   |
| Jacobi           | $\frac{\partial f(x)}{\partial x}$ | $\frac{\partial f(x)}{\partial \Delta x}$ |
| init state       |      $x = x_0$   |   ${\Delta x}=0$  |
| iteration update |     $x \oplus \delta x$   |  $\Delta x \oplus \delta \Delta x$   |

