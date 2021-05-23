---
layout: article
title:  "机器人学之3D欧式变换之旋转ABC"
date:   2020-04-03
tags: TF
key: robotics-rotation-abc
---

[TOC]

# 旋转表示

## euler angle

## rotation vector

$$
\boldsymbol \phi = \mathbf{u} \theta
$$

## rotation matrix

$$
R = \exp({\boldsymbol \phi^{\wedge}})
$$

## SO3 Lie Group & Lie Algebra

$$
R = \exp({\boldsymbol \phi^{\wedge}}) \in SO3
$$

## rotation(unit) quarternion

$$
\mathbf{q}
= \exp(\frac{\boldsymbol \phi}{2})
= \cos(\frac{\theta}{2}) + \mathbf{u} \sin(\frac{\theta}{2})
$$

$$
R = C(q) \longrightarrow R^T = C(q^{-1})
$$


# 旋转方式

## active

* rotating vectors

## passive

* rotating frames


# 旋转小量

* 若小旋转向量 $\Delta \boldsymbol{\phi}$，则旋转小量

$$
\Delta \mathbf{R}
= \exp({\Delta \boldsymbol{\phi}}^\wedge)
\approx \mathbf{I} + {\Delta \boldsymbol{\phi}}^\wedge
$$

$$
\Delta \mathbf{q}
\approx \begin{bmatrix} 1 \\ \frac{1}{2} \Delta \boldsymbol{\phi} \end{bmatrix}
$$

* 两种对旋转更新的方式

$$
\mathbf{R} \leftarrow \mathbf{R} \cdot \Delta \mathbf{R}
$$

$$
\mathbf{q} \leftarrow \mathbf{q} \otimes \Delta \mathbf{q}
$$


# 旋转扰动

## Local Perturbation

## Global Perturbation


# 旋转导数

## 对时间求导

* 若角速度为 $\boldsymbol{\omega}$，那么旋转的时间导数为

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

### 李代数加法方式

用李代数表示位姿，然后根据李代数加法来对李代数求导

$$
\begin{aligned}
\frac{\partial(\boldsymbol{R} p)}{\partial \phi} &=
\frac{\partial\left(\exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}\right)}{\partial \boldsymbol{\phi}} \\
&=\lim _{\delta \phi \rightarrow 0} \frac{\exp \left((\boldsymbol{\phi}+\delta \boldsymbol{\phi})^{\wedge}\right) \boldsymbol{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}}{\delta \boldsymbol{\phi}} \\
&=\lim _{\delta \boldsymbol{\phi} \rightarrow 0} \frac{\exp \left(\left(\boldsymbol{J}_{l} \delta \boldsymbol{\phi}\right)^{\wedge}\right) \exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}}{\delta \boldsymbol{\phi}} \\
& \approx \lim _{\delta \boldsymbol{\phi} \rightarrow 0} \frac{\left(\boldsymbol{I}+\left(\boldsymbol{J}_{l} \delta \boldsymbol{\phi}\right)^{\wedge}\right) \exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}}{\delta \boldsymbol{\phi}} \\
&=\lim _{\delta \boldsymbol{\phi} \rightarrow 0} \frac{\left(\boldsymbol{J}_{l} \delta \boldsymbol{\phi}\right)^{\wedge} \exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}}{\delta \boldsymbol{\phi}} \\
&=\lim _{\delta \boldsymbol{\phi} \rightarrow 0} \frac{-\left(\exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}\right)^{\wedge} \boldsymbol{J}_{l} \delta \boldsymbol{\phi}}{\delta \boldsymbol{\phi}}=-(\boldsymbol{R} \boldsymbol{p})^{\wedge} \boldsymbol{J}_{l}
\end{aligned}
$$

with

$$
\boldsymbol{J}_{l}=\boldsymbol{J}=\frac{\sin \theta}{\theta} \boldsymbol{I}+\left(1-\frac{\sin \theta}{\theta}\right) \boldsymbol{a} \boldsymbol{a}^{T}+\frac{1-\cos \theta}{\theta} \boldsymbol{a}^{\wedge}
$$

### 扰动方式

对李群左乘或者右乘微小扰动量，然后对该扰动求导，成为左扰动和右扰动模型，这种方式 **省去了计算雅克比**，所以使用更为常见

（1）$\frac{d(\mathbf{R} \mathbf{p})}{d \mathbf{R}}$

$$
\begin{aligned}
\frac{d(\mathbf{R} \mathbf{p})}{d \mathbf{R}}
&=\frac{\partial(\boldsymbol{R} \boldsymbol{p})}{\partial \boldsymbol{\varphi}} \\
&=\lim _{\boldsymbol{\varphi} \rightarrow 0} \frac{\exp \left(\boldsymbol{\varphi}^{\wedge}\right) \exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}}{\varphi} \\
& \approx \lim _{\varphi \rightarrow 0} \frac{\left(1+\boldsymbol{\varphi}^{\wedge}\right) \exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}-\exp \left(\boldsymbol{\phi}^{\wedge}\right) \boldsymbol{p}}{\varphi} \\
&=\lim _{\boldsymbol{\varphi} \rightarrow 0} \frac{\boldsymbol{\varphi}^{\wedge} \boldsymbol{R} \boldsymbol{p}}{\varphi} \\
&=\lim _{\varphi \rightarrow 0} \frac{-(\boldsymbol{R} \boldsymbol{p})^{\wedge} \boldsymbol{\varphi}}{\varphi} \\
&=-(\boldsymbol{R} \boldsymbol{p})^{\wedge}
\end{aligned}
$$

（2）$\frac{d(\mathbf{R}^{-1} \mathbf{p})}{d \mathbf{R}}$

$$
\begin{aligned}
\frac{d(\mathbf{R}^{-1} \mathbf{p})}{d \mathbf{R}}
&= \frac{\partial{(\mathbf{R}^{-1} \mathbf{p})}}{\partial{\varphi}} \\
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

（3）$\frac{d \ln(\mathbf{R}_1 \mathbf{R}_2^{-1})^{\vee}}{d \mathbf{R}_2}$

$$
\begin{aligned}
\frac{d \ln(\mathbf{R}_1 \mathbf{R}_2^{-1})^{\vee}}{d \mathbf{R}_2}
&= \lim_{\phi \rightarrow 0}
   \frac{\ln(\mathbf{R}_1 (\mathbf{R}_2 \exp(\phi^{\wedge}))^{-1})^{\vee} - \ln(\mathbf{R}_1 \mathbf{R}_2^{-1})^{\vee}} {\phi} \\
&= \lim_{\phi \rightarrow 0}
   \frac{\ln(\mathbf{R}_1 \exp(-\phi^{\wedge}) \mathbf{R}_2^{-1})^{\vee}  - \ln(\mathbf{R}_1 \mathbf{R}_2^{-1})^{\vee}} {\phi} \\
&= \lim_{\phi \rightarrow 0}
   \frac{\ln(\mathbf{R}_1 \mathbf{R}_2^{-1} \exp((-\mathbf{R}_2 \phi)^{\wedge}))^{\vee} - \ln(\mathbf{R}_1\mathbf{R}_2^{-1})^{\vee}} {\phi} \\
&= \lim_{\phi \rightarrow 0}
   \frac{\ln(\mathbf{R}_1\mathbf{R}_2^{-1})^{\vee} + \mathbf{J}_r^{-1} (-\mathbf{R}_2 \phi) - \ln(\mathbf{R}_1\mathbf{R}_2^{-1})^{\vee}} {\phi} \\
&= -\mathbf{J}_r^{-1}(\ln(\mathbf{R}_1\mathbf{R}_2^{-1})^{\vee}) \mathbf{R}_2
\end{aligned}
$$

（4）$\frac{d \ln(\mathbf{R}_1 \mathbf{R}_2^{-1})^{\vee}}{d {\theta}_2}$

$$
r = \ln(R_1 \cdot R_2^T)^\vee =
\ln \left[ \exp({\theta}_1^{\wedge}) \cdot \exp(-{\theta}_2^{\wedge}) \right]^\vee = {\theta}_1 - {\theta}_2
$$

$$
\frac{r}{\theta_2} = -I
$$

### 四元数形式

$$
r = \delta \theta
= 2 \left[ q_1 \otimes q_2^{-1} \right]_{xyz}
= 2 \left[ q_1 \otimes q_2^{*} \right]_{xyz}
$$

$$
\begin{aligned}
  \frac{\partial r}{\partial {\theta}_2}
  &= \frac{\partial 2 \left[ q_1 \otimes q_2^{*} \right]_{xyz}}{\partial {\theta}_2} \\
  &=
  \frac
  {\partial 2
  \left[ q_1 \otimes
  \left[ q_2 \otimes \begin{bmatrix} 1 \\ \frac{1}{2} {\theta}_2 \end{bmatrix}
  \right]^{*}
  \right]_{xyz}}
  {\partial {\theta}_2} \\
  &= -2 \begin{bmatrix} 0 & I \end{bmatrix}_{3 \times 4} \cdot
  \frac{\partial
  \left[ q_1^* \otimes q_2 \otimes
  \begin{bmatrix} 1 \\ \frac{1}{2} {\theta}_2 \end{bmatrix}
  \right]}
  {\partial {\theta}_2} \\
  &= -2 \begin{bmatrix} 0 & I \end{bmatrix}_{3 \times 4} \cdot
  \frac{\partial
  \left[ L(q_1^* \otimes q_2) \cdot
  \begin{bmatrix} 1 \\ \frac{1}{2} {\theta}_2 \end{bmatrix}
  \right]}
  {\partial \begin{bmatrix} 1 \\ \frac{1}{2} {\theta}_2 \end{bmatrix}} \cdot
  \frac{\partial \begin{bmatrix} 1 \\ \frac{1}{2} {\theta}_2 \end{bmatrix}}
  {\partial {\theta}_2} \\
  &= -2 \begin{bmatrix} 0 & I \end{bmatrix}_{3 \times 4} \cdot
  L(q_1^* \otimes q_2) \cdot
  \begin{bmatrix} 0 \\ \frac{1}{2} I \end{bmatrix}
\end{aligned}
$$
