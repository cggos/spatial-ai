---
layout: article
title:  "图像分析之高斯滤波"
date:   2020-07-12
tags: ComputerVision

---

[TOC]

# 高斯函数

一维高斯函数

$$
f(x) = A \cdot e^{-\frac{(x-\mu)^2}{2{\sigma}^2}}
$$

多维高斯函数

$$
f_{X}\left(x_{1}, x_{2}, \cdots, x_{k}\right) =
A \cdot \exp \left(-\frac{1}{2}(X-\mu)^{T} \Sigma^{-1}(X-\mu)\right)
$$

一维正态分布 高斯概率密度函数

$$
f(x) = \frac{1}{\sqrt{2\pi} \sigma} e^{-\frac{(x-\mu)^2}{2{\sigma}^2}}
$$

多元正态分布 高斯概率密度函数

$$
f_{X}\left(x_{1}, x_{2}, \cdots, x_{k}\right) =
\frac{1}{\sqrt{(2 \pi)^{k}|\Sigma|}} \cdot
\exp \left(-\frac{1}{2}(X-\mu)^{T} \Sigma^{-1}(X-\mu)\right)
$$

# 图像高斯滤波（模糊、平滑）

* [图像与滤波（阮一峰）](http://www.ruanyifeng.com/blog/2017/12/image-and-wave-filters.html)

<p align="center">
  <img src="../images/image_filter/cappadocia_gaussian_blur.png" style="width:25%;"/>
</p>

图像大多数噪声均属于高斯噪声，因此高斯滤波器应用也较广泛。高斯滤波是一种线性平滑滤波，适用于消除高斯噪声，广泛应用于图像去噪。

在图像处理中，高斯滤波一般有两种实现方式，一是 **用离散化窗口滑窗卷积**，另一种通过 **傅里叶变换**。最常见的就是第一种滑窗实现，只有当离散化的窗口非常大，用滑窗计算量非常大（即使用可分离滤波器的实现）的情况下，可能会考虑基于傅里叶变化的实现方法。

* [高斯模糊的算法（阮一峰）](http://www.ruanyifeng.com/blog/2012/11/gaussian_blur.html)

二维高斯核模板或卷积核（假设x与y方向方差一致）：

$$
f(x,y) = \frac{1}{2\pi{\sigma}^2} \cdot
         \exp
         \left(
           -\frac{(x-\frac{m}{2})^2 + (y-\frac{n}{2})^2}{2{\sigma}^2}
         \right)
\quad s.t. \quad
x \in [0, m), \quad y \in [0, n)
$$

```C++
double *generate_gaussian_template(unsigned int m, double sigma = 0.84089642) {
    unsigned int n = m;
    double *gaussian_template = new double[m * n];
    double sum = 0.0;
    for (int y = 0; y < m; y++) {
        for (int x = 0; x < n; x++) {
            double r2 = std::pow((double) x - m / 2, 2) + std::pow((double) y - n / 2, 2);
            double sigma2Inv = 1.f / (2 * std::pow(sigma, 2));
            double exp = std::exp(-r2 * sigma2Inv);
            sum += *(gaussian_template + y * m + x) = sigma2Inv / M_PI * exp;
        }
    }
    double sumInv = 0.0;
    if (sum > 1e-6)
        sumInv = 1.0 / sum;
    for (int y = 0; y < m; y++)
        for (int x = 0; x < n; x++)
            *(gaussian_template + y * m + x) *= sumInv;
    return gaussian_template;
}
```

二维高斯核模板或卷积核（以模板中心为原点）：

$$
G(u, v) = \frac{1}{2 \pi \sigma^{2}} e^{-\frac{u^{2}+v^{2}}{2 \sigma^{2}}},
\quad s.t. \quad
u \in [-w, w], \quad v \in [-w, w]
$$

归一化：

$$
G_n(u, v) = \frac{1}{s} \cdot e^{-\frac{u^{2}+v^{2}}{2 \sigma^{2}}}, \quad
s = \sum_{u=-w}^{w} \sum_{v=-w}^{w} e^{-\frac{u^{2}+v^{2}}{2 \sigma^{2}}}
$$

<p align="center">
  <img src="../images/image_filter/gauss_coordinate.png" style="width:30%;"/>
  <img src="../images/image_filter/gauss_kernel.png" style="width:33%;"/>
  <img src="../images/image_filter/gauss_kernel_norm.png" style="width:32%;"/>
</p>

图像高斯滤波：

$$
\quad I^{\prime}(i,j) = \sum_{u=-w}^{w} \sum_{v=-w}^{w} I(i+u, j+v) G_n(u,v)
$$

## 高斯滤波的可分离性

$$
s = \sum_{u=-w}^{w} \sum_{v=-w}^{w} \cdot g(u) \cdot g(v)
= \left(\sum_{u=-w}^{w} \cdot g(u) \right) \cdot \left(\sum_{v=-w}^{w} \cdot g(v) \right)
= s^\prime \cdot s^\prime
$$

$$
G_n(u, v)
= \frac{1}{s} \cdot e^{-\frac{u^{2}}{2 \sigma^{2}}} \cdot e^{-\frac{v^{2}}{2 \sigma^{2}}}
= \frac{1}{s} \cdot g(u) \cdot g(v)
= \frac{g(u)}{s^\prime} \cdot \frac{g(v)}{s^\prime}
$$

核矩阵：

$$
\begin{aligned}
\mathbf{G}_{(2w+1)\times(2w+1)}
&=
\frac{1}{s}\left[\begin{array}{ccccc}
g(-w) g(-w) & \dots & g(-w) g(0) & \dots & g(-w) g(w) \\
\vdots & & \vdots & & \vdots \\
g(0) g(-w) & \dots & g(0) g(0) & \dots & g(0) g(w) \\
\vdots & & \vdots & & \vdots \\
g(w) g(-w) & \dots & g(w) g(0) & \dots & g(w) g(w)
\end{array}\right] \\
&=
\frac{1}{s^\prime}
\left[\begin{array}{c}
g(-w) \\
\vdots \\
g(0) \\
\vdots \\
g(w)
\end{array}\right] \cdot
\frac{1}{s^\prime}
\left[\begin{array}{ccccc} g(-w) & \ldots & g(0) & \ldots & g(w) \end{array}\right]
\end{aligned}
$$

图像高斯滤波：

$$
\begin{aligned}
I^{\prime}(i, j)
&=\sum_{u=-w}^{w} \sum_{v=-w}^{w} I(i+u, j+v) G_n(u, v) \\
&=\sum_{u=-w}^{w} \sum_{v=-w}^{w} I(i+u, j+v) \frac{1}{s} g(u) g(v) \\
&=\sum_{u=-w}^{w} \sum_{v=-w}^{w} I(i+u, j+v) \frac{1}{s^{\prime}} g(u) \frac{1}{s^{\prime}} g(v) \\
&=\sum_{u=-w}^{w}
\left[ {\color{blue} \sum_{v=-w}^{w} I(i+u, j+v) \frac{g(v)}{s^{\prime}} } \right]
\frac{g(u)}{s^{\prime}} \\
&=\sum_{u=-w}^{w} {\color{blue} S(i+u) } \frac{g(u)}{s^{\prime}}
\end{aligned}
$$
