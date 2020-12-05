---
layout: article
title:  "图像空间域分析之图像统计特征"
date:   2018-11-30
tags: ComputerVision

---

[TOC]

我们可以将一幅数字图像视为一个 **二维函数$I(x,y)$** ，其中x和y是空间坐标，在x-y平面中的任意空间坐标 $(x,y)$ 上的 **幅值 $I_{xy}$** 称为该点 **图像的灰度、亮度或强度**。

$$
I_{x,y} = I(x,y);
$$

下面以 $I_{xy}$ 作为随机变量，分析二维数字图像的 统计特征。


# 数学期望

**数学期望（Expectation）** 就是随机变量 **以概率为权数的加权平均值**，以 **级数** 的形式表示为

$$
E(X) = \sum_{k=1}^{\infty} x_k p_k
$$

一幅数字图像的数学期望为其 **灰度平均值**，即所有像元灰度值的算数平均值

$$
\bar{I} = \frac{1}{M \cdot N} \sum_{x=1}^{M} \sum_{y=1}^{N} I(x,y)
$$


# 方差

**方差（variance）** 是对随机变量离散程度的度量。

$$
D(x) = E[X-E(X)]^2 = E(X^2) - [E(X)]^2
$$

称 $\sqrt{D(X)}$ 为随机变量的 **标准差（standard deviation）**，或 **均方差（mean square deviation）**，记为 $\sigma(X)$

二维数字图像的 **灰度方差** 反应的是图像中各个像素的灰度值与整个图像平均灰度值的离散程度，与图像的 **对比度** 有关。如果图片对比度小，那方差就小；如果图片对比度很大，那方差就大。

$$
var(I) =
\frac{1}{M \cdot N}
\sum_{x=1}^{M} \sum_{y=1}^{N} \left[ I(x,y) - \bar{I} \right]
$$


# 协方差（矩阵）与相关系数

随机变量X、Y的 **协方差（covariance）** 为

$$
\begin{aligned}
cov(X,Y)
&= E \{ [X-E(X)][Y-E(Y)] \} = E[XY] - E(X)E(Y) \\
&= \sum_{i} \sum_{j} [x_i-E(X)] [y_j-E(Y)] p_{ij}
\end{aligned}
$$

**协方差矩阵** 可表示为

$$
\Sigma =
\begin{bmatrix}
\sigma_{11} & \sigma_{12} & \ldots & \sigma_{1n} \\
\sigma_{21} & \sigma_{22} & \ldots & \sigma_{2n} \\
\vdots      & \vdots      & \ddots & \vdots      \\
\sigma_{n1} & \sigma_{n2} & \ldots & \sigma_{nn} \\
\end{bmatrix}
$$

其中，$\sigma_{ij} = cov(X_i, X_j)$

随机变量X、Y的 **相关系数（correlation coefficient）** 或 **标准协方差（standard covariance）** 为  

$$
\rho_{XY} = \frac{ cov(X,Y) }{ \sqrt{D(X)} \sqrt{D(Y)} }
$$

数字图像 $I_A$ 和 $I_B$ 的协方差为

$$
cov(I_A, I_B) =
\frac{1}{M \cdot N}
\sum_{x=1}^{M} \sum_{y=1}^{N} [ I_A(x,y) - \bar{I_A} ] [ I_B(x,y) - \bar{I_B} ]
$$

图像的相关系数表征的是两个不同波段图像的所含信息的重叠程度，相关系数越大，重叠度越高，反之越低。

$$
\rho_{I_A I_B} =
\frac
{\sum_{x=1}^{M} \sum_{y=1}^{N} [ I^A_{xy} - \bar{I_A} ] [ I^B_{xy} - \bar{I_B} ]}
{
  \bigg(\sum_{x=1}^{M} \sum_{y=1}^{N} [ I^A_{xy} - \bar{I_A} ]\bigg)^{1/2}
  \bigg(\sum_{x=1}^{M} \sum_{y=1}^{N} [ I^B_{xy} - \bar{I_A} ]\bigg)^{1/2}
}
$$

下面计算 lena图像 **灰度图** 和 **高斯模糊图** 的相关系数  
![image_gray.png](../images/image_fft2/image_gray.png)![image_gauss.png](../images/image_fft2/image_gauss.png)  

```python
img = Image.open('lena.bmp').convert('L')
im = np.asarray(img)
im_blur = ndimage.gaussian_filter(im, 4)
a = np.corrcoef(im.flatten(), im_blur.flatten())
print a
```
计算得到其相关系数为 0.95346


# 矩

* $X$ 的 **$k$阶原点矩**，简称 **$k$阶矩**： $E[X^k]$  

* $X$ 的 **$k$阶中心矩**： $E[X-E(X)]^k$

* $X$ 和 $Y$ 的 **$k+l$阶混合矩**： $E [ X^k Y^l ]$

* $X$ 和 $Y$ 的 **$k+l$阶混合中心矩**： $E \{ [X-E(X)]^k [Y-E(Y)]^l \}$

显然，$X$ 的数学期望 $E(X)$ 是 $X$ 的一阶原点矩，方差 $D(X)$ 是 $X$的二阶中心矩，协方差 $cov(X,Y)$ 是 $X$ 和 $Y$ 的 1+1阶混合中心矩

## 图像矩

图像的矩（Image Moments）主要表征了图像区域的几何特征，又称为 **几何矩**。

### Raw Moments

二维灰度图像 $I$ 的矩定义为  

$$
M_{pq} = \sum_{x} \sum_{y} x^p y^q I(x,y), \quad p,q \in \{ 0,1,2, \ldots \}
$$

**零阶矩** 为

$$
M_{00} = \sum_{x} \sum_{y} I(x,y)
$$

* 当图像为二值图时，$M_{00}$ 就是这个图像上白色区域的总和；因此，$M_{00}$ 可以用来求二值图像（轮廓、连通域）的面积

**一阶矩** 为

$$
M_{10} = \sum_{x} \sum_{y} x \cdot I(x,y)
$$

$$
M_{01} = \sum_{x} \sum_{y} y \cdot I(x,y)
$$

* 当图像为二值图时，$I$ 只有 0 和 1 两个值，$M_{10}$ 就是图像上所有白色区域 x坐标值 的累加
* 一阶矩可以用来求图像的 **质心（Centroid）**，这种方法对噪声不太敏感:   

$$
(x_c, y_c) = \bigg( \frac{M_{10}}{M_{00}}, \frac{M_{01}}{M_{00}} \bigg)
$$

* 一阶矩还可以用来求 **图像块几何中心的方向**，即几何中心 $O$ 与 质心 $C$ 连接的 **方向向量$\vec{OC}$** 的方向（**计算中 $x,y$ 均以几何中心 $O$ 为原点**）:

$$
\theta = arctan( \frac{M_{01}}{M_{10}} )
$$

通过 取以关键点kp为几何中心的图像块 计算其 一阶矩 进而计算 该点方向，示例代码如下：  
```c++
int m01 = 0;
int m10 = 0;
for(int y=-half_patch_size; y<half_patch_size; ++y){
  for(int x=-half_patch_size; x<half_patch_size; ++x){
    m01 += y * image.at<uchar>(kp.pt.y+y, kp.pt.x+x);
    m10 += x * image.at<uchar>(kp.pt.y+y, kp.pt.x+x);
  }
}
kp.angle = std::atan2(m01, m10)/CV_PI*180.0;
```

**二阶矩** 为

$$
M_{20} = \sum_{x} \sum_{y} x^2 \cdot I(x,y)
$$

$$
M_{02} = \sum_{x} \sum_{y} y^2 \cdot I(x,y)
$$

$$
M_{11} = \sum_{x} \sum_{y} x \cdot y \cdot I(x,y)
$$

### Central Moments

$$
\mu_{pq} = \sum_{x} \sum_{y} (x-x_c)^p (y-y_c)^q I(x,y), \quad p,q \in \{ 0,1,2, \ldots \}
$$

利用二阶中心矩可以求图像的方向，图像的 **协方差矩阵** 为

$$
cov[I(x,y)] =
\begin{bmatrix}
\mu_{20}' & \mu_{11}' \\
\mu_{11}' & \mu_{02}'
\end{bmatrix}
$$

求得图像方向为

$$
\theta = \frac{1}{2}
arctan(\frac{2\mu_{11}'}{\mu_{20}'-\mu_{02}'})
$$

其中

$$
\mu_{20}' = \frac{\mu_{20}}{\mu_{00}} = \frac{M_{20}}{M_{00}} - x_c^2
$$

$$
\mu_{02}' = \frac{\mu_{02}}{\mu_{00}} = \frac{M_{02}}{M_{00}} - y_c^2
$$

$$
\mu_{11}' = \frac{\mu_{11}}{\mu_{00}} = \frac{M_{11}}{M_{00}} - x_c y_c
$$


# 参考资料
* 《概率论与数理统计》
* [Image moment (wikipedia)](https://en.wikipedia.org/wiki/Image_moment)
* ORB: an efficient alternative to SIFT or SURF
