---
layout: article
title:  "最小二乘问题解决方法"
date:   2019-08-20
tags: Maths StateEstimation
key: nolinear-least-squares-problem-methods
---

[TOC]

# 最小二乘问题

**最小二乘问题（Least Squares Problem）**，即

$$
\min_{\mathbf{x}} \mathbf{F}(\mathbf{x}) = \frac{1}{2} {\|\mathbf{f}(\mathbf{x})\|}^2_2
$$

 其中，$\mathbf{F}(\mathbf{x})$ 为 **损失函数**，$\mathbf{f}(\mathbf{x})$ 为 **残差函数**，定义为

$$
\mathbf{F}(\mathbf{x})
= \frac{1}{2} \sum_{i=1}^{m}\left(f_{i}(\mathbf{x})\right)^{2}
= \frac{1}{2} \mathbf{f}^{\top}(\mathbf{x}) \mathbf{f}(\mathbf{x})
= \frac{1}{2} {\|\mathbf{f}(\mathbf{x})\|}^2_2
$$


* 若 残差函数 $\mathbf{f}(\mathbf{x})$ 为 线性函数，则这个问题即为 **线性最小二乘问题**
* 若 残差函数 $\mathbf{f}(\mathbf{x})$ 为 非线性函数，则这个问题即为 **非线性最小二乘问题**

# 线性最小二乘问题

$$
\min_{x} \|Ax-b\|
$$

* 正规方程组

$$
A^TA x = A^T b
$$

* QR分解

$$
\min_{x} \|Ax-b\| = \min_{x} \|QRx-b\| = \min_{x} \|Rx - Q^T b\|
$$

* 乔列斯基分解

# 非线性最小二乘问题

对于不方便求解的最小二乘问题，我们用 **迭代** 的方式，从一个初始值出发，不断地更新当前的优化变量，使目标函数下降。这让求解 **导函数为零** 的问题变成了一个不断 **寻找下降增量 $\Delta \mathbf{x}$** 的问题。

> 1. 给定某个初始值 $\mathbf{x}_0$
> 2. 对于第k次迭代，寻找一个增量 $\Delta \mathbf{x}_k$，使得 ${\|f(\mathbf{x}_k + \Delta \mathbf{x}_k)\|}_2^2$ 达到极小值
> 3. 若 $\Delta \mathbf{x}_k$ 足够小，则停止
> 4. 否则，令 $\mathbf{x}_{k+1} = \mathbf{x}_k + \Delta \mathbf{x}_k$，返回第2步

实际上，非线性优化的所有迭代求解方案，都需要用户提供一个 **良好的初始值**。

## 损失函数 线性化

对 $\mathbf{F}(\mathbf{x})$ 进行线性化，对其进行 **二阶泰勒展开**，得

$$
\mathbf{F}(\mathbf{x} + \Delta \mathbf{x})
= \mathbf{F}(\mathbf{x}) + \Delta \mathbf{x}^{\top} \mathbf{F}^{\prime}(\mathbf{x}) + \frac{1}{2} \Delta \mathbf{x}^{\top} \mathbf{F}^{\prime\prime}(\mathbf{x}) \Delta \mathbf{x} + O \left(\|\Delta \mathbf{x}\|^{3}\right)
$$

记

$$
\begin{aligned}
\mathbf{g} &= \mathbf{F}^{\prime}(\mathbf{x})
= \mathbf{f}^{\prime}(\mathbf{x})^\top \mathbf{f}(\mathbf{x}) \\
\mathbf{H} &= \mathbf{F}^{\prime\prime}(\mathbf{x})
\end{aligned}
$$

忽略高阶余项，损失函数变成了二次函数，可以轻易得到如下性质：

* 如果在点 $\mathbf{x}_s$ 处有 $\mathbf{g}_s$ 为 0（对应 $\mathbf{H}_s$），则称这个点为 **驻点（stationary point）**
  - 如果 $\mathbf{H}_s$ 是正定矩阵，则 $\mathbf{x}_s$ 为 **局部最小值点（local minimizer）**
  - 如果 $\mathbf{H}_s$ 是负定矩阵，则 $\mathbf{x}_s$ 为 **局部最大值点（local maximizer）**
  - 如果 $\mathbf{H}_s$ 是不定矩阵，则 $\mathbf{x}_s$ 为 **鞍点（saddle point）**

对于泰勒展开，

* 保留 一阶项，求解方法为 **一阶梯度法**
* 保留 二阶项，求解方法为 **二阶梯度法**

### 一阶梯度法（最速下降法）

保留 泰勒展开 一阶项

$$
\mathbf{F}(\mathbf{x} + \Delta \mathbf{x})
= \mathbf{F}(\mathbf{x}) + \Delta \mathbf{x}^{\top} \mathbf{g}
$$

梯度的负方向为最速下降方向，增量方程 为

$$
\Delta \mathbf{x}_{\mathrm{sd}} = - \mathbf{F}^{\prime}(\mathbf{x}) = - \mathbf{g}
$$

* 适用于迭代的开始阶段
* 缺点：最优值附近震荡，收敛慢

### 二阶梯度法（牛顿法）

保留 泰勒展开 二阶项

$$
\mathbf{F}(\mathbf{x} + \Delta \mathbf{x})
= \mathbf{F}(\mathbf{x}) + \Delta \mathbf{x}^{\top} \mathbf{g} + \frac{1}{2} \Delta \mathbf{x}^{\top} \mathbf{H} \Delta \mathbf{x}
$$

求 $\mathbf{F}(\mathbf{x} + \Delta \mathbf{x})$ 关于 $\Delta \mathbf{x}$ 的导数并令其为零，即

$$
\mathbf{F}^{\prime}(\mathbf{x} + \Delta \mathbf{x}) = 0
\quad \Longrightarrow \quad
\mathbf{g} + \mathbf{H} \Delta \mathbf{x} = 0
\quad \Longrightarrow \quad
\mathbf{H} \Delta \mathbf{x} = - \mathbf{g}
$$

则，增量方程 为

$$
\Delta \mathbf{x}_{\mathrm{n}} = -\mathbf{H}^{-1} \mathbf{g}
$$

* 适用于最优值附近
* 缺点：二阶导矩阵 $\mathbf{H}$ 计算复杂

## 残差函数 线性化

对 $\mathbf{f}(\mathbf{x})$ 进行线性化，对其进行 **一阶泰勒展开**，得

$$
\mathbf{f}(\mathbf{x}+\Delta \mathbf{x})
\approx \ell(\Delta \mathbf{x})
\equiv \mathbf{f}(\mathbf{x}) + \mathbf{J}(\mathbf{x}) \Delta \mathbf{x}
\quad \text{with} \quad
\mathbf{J}(\mathbf{x}) = \mathbf{f}^{\prime}(\mathbf{x})
$$

代入 损失函数

$$
\begin{aligned}
\mathbf{F}(\mathbf{x}+\Delta \mathbf{x})
\approx \mathbf{L}(\Delta \mathbf{x})
& \equiv \frac{1}{2} \ell(\Delta \mathbf{x})^{\top} \ell(\Delta \mathbf{x}) \\
&=\frac{1}{2} \mathbf{f}^{\top} \mathbf{f} + \Delta \mathbf{x}^{\top} \mathbf{J}^{\top} \mathbf{f}+\frac{1}{2} \Delta \mathbf{x}^{\top} \mathbf{J}^{\top} \mathbf{J} \Delta \mathbf{x} \\
&=\mathbf{F}(\mathbf{x}) + \Delta \mathbf{x}^{\top} \mathbf{J}^{\top} \mathbf{f}+\frac{1}{2} \Delta \mathbf{x}^{\top} \mathbf{J}^{\top} \mathbf{J} \Delta \mathbf{x}
\end{aligned}
$$

并且

$$
\begin{aligned}
\mathbf{g}
&= \mathbf{F}^{\prime}(\mathbf{x})
= \mathbf{J}^\top \mathbf{f} \\
\mathbf{H} &= \mathbf{F}^{\prime\prime}(\mathbf{x}) \approx \mathbf{J}^{\top} \mathbf{J}
\end{aligned}
$$

### 高斯-牛顿法（G-N）

求 $\mathbf{L}(\Delta \mathbf{x})$ 关于 $\Delta \mathbf{x}$ 的导数并令其为零，即

$$
\mathbf{L}^{\prime}(\Delta \mathbf{x}) = 0
\quad \Longrightarrow \quad
\mathbf{J}^{\top} \mathbf{f} + \mathbf{J}^{\top} \mathbf{J} \Delta \mathbf{x} = 0
$$

则，增量方程 为

$$
\left(\mathbf{J}^{\top} \mathbf{J}\right) \Delta \mathbf{x}_{\mathrm{gn}}=-\mathbf{J}^{\top} \mathbf{f}
$$

简写为

$$
\mathbf{H} \Delta \mathbf{x}_{\mathrm{gn}} = -\mathbf{g} \quad \text{with} \quad
\mathbf{H} \approx \mathbf{J}^{\top} \mathbf{J}
$$

* $\mathbf{J}^{\top} \mathbf{J}$ 可能为奇异矩阵或病态的情况，此时增量的稳定性较差，导致算法不收敛

### 列文伯格-马夸尔特法（L-M）

$$
\left(\mathbf{J}^{\top} \mathbf{J}+\mu \mathbf{I}\right) \Delta \mathbf{x}_{\operatorname{lm}}=-\mathbf{J}^{\top} \mathbf{f} \quad \text { with } \mu \geq 0
$$

## 鲁棒核函数（M估计）

* Huber
* Cauchy

在前面的非线性最小二乘问题中，我们最小化误差项的二范数平方和，作为目标函数。当出现误匹配时，误差 $e$ 就会很大，如果我们再使用平方，这个误差就会更大，算法将试图调整这条边所连接的节点的估计值，使它们顺应这条边的无理要求。由于这个边的误差真的很大，往往会抹平了其他正确边的影响，使优化算法专注于调整一个错误的值。

出现这种问题的原因是，当误差很大时，二范数增长得太快了。于是就有了核函数的存在。 **核函数保证每条边的误差不会太大以至于掩盖掉其他的边。这种核函数称之为鲁棒核函数。**

最常用的鲁棒核函数有Huber核：

$$
H(e)=
\left\{
\begin{array}{lr}
\frac{1}{2}e^2\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \text{if}\ |e|<\delta ,\\
\delta(|e|-\frac{1}{2}\delta) \ \ \ \  \text{otherwise}
\end{array}
\right.
$$

当误差 $e$ 大于某个阈值 $\delta$ 后，函数增长由二次形式变成了一次形式，相当于限制了梯度的最大值。同时，Huber 核函数又是光滑的，可以很方便地求导。

<p align="center">
  <img src="../images/maths/huber.png"/>
</p>
