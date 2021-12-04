---
layout: article
title:  "EKF v.s. ESKF or Direct v.s. Indirect KF"
tags: StateEstimation MSF
key: state-estimation-ekf-vs-eskf
---

[TOC]

# Overview

EKF and ESKF:

* EKF: Extended Kalman Filter --> Direct Kalman Filter
* ESKF: Error State Kalman Filter --> Indirect Kalman Filter

Estimator State Types:

* True State
* Nominal State
* Error State

ESKF Advantages:

* The orientation error-state is **minimal** (i.e., it has the same number of parameters as degrees of freedom), **avoiding issues related to over-parametrization (or redundancy) and the consequent risk of singularity of the involved covariances matrices**, resulting typically from enforcing constraints.

* The error-state system is always operating close to the origin, and therefore **far from possible parameter singularities, gimbal lock issues, or the like, providing a guarantee that the linearization validity holds at all times**.

* The error-state is always small, meaning that **all second-order products are negligible**. This **makes the computation of Jacobians very easy and fast**. Some Jacobians may even be constant or equal to available state magnitudes.

* The error dynamics are slow because all the large-signal dynamics have been integrated in the nominal-state. This means that **we can apply KF corrections (which are the only means to observe the errors) at a lower rate than the predictions**.

<p align="center">
  <img src="../images/kalman_filter/direct-indirect-kf.png" style="width:100%;">
</p>

# EKF

<p align="center">
  <img src="../images/kalman_filter/kf_flow.jpg">
</p>

## Generic Problem Formulation

Consider a nonlinear, bounded, observable system with continuous process dynamics and discrete measurement as

$$
\begin{aligned}
\dot{\mathbf{x}}(t) &=\mathbf{f}(\mathbf{x}(t), \mathbf{u}(t))+\Gamma \mathbf{w}(t)
, \quad \mathbf{w} \sim \mathcal{N}(0, Q) \\
\mathbf{z}_{k} &=\mathbf{h}\left(\mathbf{x}_{k}\right)+\mathbf{v}_{k}
, \quad \mathbf{v}_{k} \sim \mathcal{N}\left(0, R_{k}\right)
\end{aligned}
$$

and

$$
\mathbf{x}(0)=\mathbf{x}_{0}
$$

The process and measurement noise are assumed to be zero mean, band-limited, uncorrelated, white multivariate Gaussian processes given by

$$
\begin{aligned}
E\left[\mathbf{w}(t) \mathbf{w}^{T}(\tau)\right] &=Q \delta(t-\tau)=\left\{\begin{array}{lr}
Q, & t=\tau \\
0, & t \neq \tau
\end{array}\right.\\
E\left[\mathbf{v}_{k} \mathbf{v}_{j}^{T}\right] &=R_{k} \delta_{k j}=\left\{\begin{array}{ll}
R_{k}, & k=j \\
0, & k \neq j
\end{array}\right.
\end{aligned}
$$

* $Q$: **continuous process noise covariance matrix**
* $R$: **discrete measurement noise covariance matrix**

## Prediction

$$
\begin{aligned}
\dot{\hat{\mathbf{x}}}(t) &=\mathbf{f}(\hat{\mathbf{x}}(t), \mathbf{u}(t)) \\
\dot{P}(t) &=F(t) P(t)+P(t) F^{T}(t)+\Gamma Q \Gamma^{T} \\
F(t) &=\left.\frac{\partial \mathbf{f}(\mathbf{x}(t), \mathbf{u}(t))}{\partial \mathbf{x}(t)}\right|_{\mathbf{x}(t)=\hat{\mathbf{x}}(t), \mathbf{u}(t)}
\end{aligned}
$$

* $P$: **state error covariance matrix**

EKF Transition to Update Stage:

$$
\begin{aligned}
\hat{\mathbf{x}}_{k}^{-} &=\hat{\mathbf{x}}(k \Delta t)+\dot{\hat{\mathbf{x}}}(t) \cdot \Delta t \\
P_{k}^{-} &=P(k \Delta t)+\dot{P}(t) \cdot \Delta t
\end{aligned}
$$

## Update

measurement process

$$
\hat{\mathbf{z}}_{k}^{-}=\mathbf{h}\left(\hat{\mathbf{x}}_{k}^{-}\right)
$$

kalman gain

$$
K_{k} =P_{k}^{-} H_{k}^{T}\left(H_{k} P_{k}^{-} H_{k}^{T}+R_{k}\right)^{-1}
$$

where (**w.r.t true-state**)

$$
\color{blue}{H_{k} =\left.\frac{\partial \mathbf{h}\left(\mathbf{x}_{k}\right)}{\partial \mathbf{x}_{k}}\right|_{\mathbf{x}_{k}=\hat{\mathbf{x}}_{k}^{-}}}
$$

finally

$$
\begin{aligned}
\hat{\mathbf{x}}_{k} &=\hat{\mathbf{x}}_{k}^{-}+K_{k}\left(\mathbf{z}_{k}-\hat{\mathbf{z}}_{k}^{-}\right) \\
P_{k} &=\left(I-K_{k} H_{k}\right) P_{k}^{-}
\end{aligned}
$$

# ESKF

consider the following simplified nonlinear process model:

$$
\dot{\mathbf{x}}(t)=\mathbf{f}(\mathbf{x}(t))
$$

Applying a small perturbation δx (t) around x (t) yields

$$
\dot{\mathbf{x}}(t)+\delta \dot{\mathbf{x}}(t)=\mathbf{f}(\mathbf{x}(t)+\delta \mathbf{x}(t))
=\mathbf{f}(\mathbf{x}(t))+\nabla \mathbf{f}(\mathbf{x}(t)) \delta \mathbf{x}(t)+\mathcal{O}(t, \mathbf{x}(t), \delta \mathbf{x}(t))
$$

## Prediction

linear time varying system with δx as the state vector as

$$
\delta \dot{\mathbf{x}}(t)=F(t) \delta \mathbf{x}(t)+\Gamma \mathbf{w}(t)
$$

**the error-state process model is linear !!!**

and

$$
\delta \mathbf{x}_{k}=\Phi_{k-1} \delta \mathbf{x}_{k-1}+\tilde{\mathbf{w}}_{k-1}
, \quad \tilde{\mathbf{w}}_{k-1}=\int_{0}^{\Delta t} \Phi(t, 0) \Gamma \mathbf{w}(t) d t
$$

where $\tilde{\mathbf{w}}$ is the **discretized process noise** and $\Phi_{k-1}$ is the **state transition matrix**.

the **error state covariance matrix** is propagated using

$$
P_{k}^{-}=\Phi_{k-1} P_{k-1} \Phi_{k-1}^{T}+Q_{k-1}
$$

where $Q_{k-1}$ is the **discrete time equivalent process noise covariance matrix** and is given by

$$
Q_{k-1}=\int_{0}^{\Delta t} \Phi(t, 0) \Gamma Q \Gamma^{T} \Phi^{T}(t, 0) d t
$$

where, $\Phi(t, 0)=e^{F(t) t}$ is the **continuous time state transition matrix** and $Q$ is the **continuous time process noise covariance matrix**.

## Update

The measurement model is assumed to be in **direct discrete time**

$$
\mathbf{z}_{k}=\mathbf{h}\left(\mathbf{x}_{k}\right)+\mathbf{v}_{k}
$$

kalman gain

$$
\begin{aligned}
S_{k} &=R_{k}+H_{k} P_{k}^{-} H_{k}^{T} \\
K_{k} &=P_{k}^{-} H_{k}^{T} S_{k}^{-1}
\end{aligned}
$$

where (**w.r.t error-state**)

$$
\color{blue}{
\mathbf{H}
\left.\triangleq \frac{\partial h}{\partial \delta \mathbf{x}}\right|_{\mathbf{x}}}
$$

finally

$$
\begin{aligned}
\mathcal{I}_{k} &= \mathbf{z}_{k}-\mathbf{h}\left(\hat{\mathbf{x}}_{k}^{-}\right) \\
\delta \hat{\mathbf{x}}_{k} &=K_{k} \mathcal{I}_{k}
\end{aligned}
$$

$$
P_{k}=\left(I-K_{k} H_{k}\right) P_{k}^{-}
$$

true-state estimate

$$
\hat{\mathbf{x}}_{k} =\hat{\mathbf{x}}_{k}^{-}+\delta \hat{\mathbf{x}}_{k}
$$


# Appendix

## Kalman Filter Diagrams

<p align="center">
  <img src="../images/kalman_filter/kf_flow_00.jpg">
</p>

<p align="center">
  <img src="../images/kalman_filter/kf_flow_02.png" style="width:100%;">
</p>

<p align="center">
  <img src="../images/kalman_filter/kf_flow_01.png" style="width:100%;">
</p>


# Reference

* [1] Extended Kalman Filter vs. Error State Kalman Filter for Aircraft Attitude Estimation

* [2] Quaternion kinematics for the error-state Kalman filter
