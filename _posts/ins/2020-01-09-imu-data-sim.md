---
layout: article
title:  "IMU数据仿真公式推导及代码实现"
date:   2020-01-09
tags: INS
Key: imu-data-sim
---

[TOC]

# IMU测量模型（离散时间）

IMU测量模型：

$$
\begin{aligned}
{\omega}_m &= \omega + b_{gd} + n_{gd} \\
a_m &= a + b_{ad} + n_{ad}
\end{aligned}
$$

其中，

离散时间的 Bias：

$$
\begin{aligned}
b_{gd}[k]
&= b_{gd}[k-1] + \sigma_{bgd} \cdot w[k] \\
&= b_{gd}[k-1] + \sigma_{bg} \sqrt{\Delta t} \cdot w[k] \\
b_{ad}[k]
&= b_{ad}[k-1] + \sigma_{bad} \cdot w[k] \\
&= b_{ad}[k-1] + \sigma_{ba} \sqrt{\Delta t} \cdot w[k]
\end{aligned}
$$

离散时间的 White Noise：

$$
\begin{aligned}
n_{gd}
&= \sigma_{gd} \cdot w[k] \\
&= \sigma_{g} \frac{1}{\sqrt{\Delta t}} \cdot w[k] \\
n_{ad}
&= \sigma_{ad} \cdot w[k] \\
&= \sigma_{a} \frac{1}{\sqrt{\Delta t}} \cdot w[k]
\end{aligned}
$$

其中，$w[k] \sim \mathcal{N}(0,1)$，$\Delta t$ 为采样时间。

# 代码实现

参考贺一家博士的代码（[HeYijia/vio_data_simulation](https://github.com/HeYijia/vio_data_simulation)）

```c++
std::random_device rd;
std::default_random_engine generator_(rd());
std::normal_distribution<double> noise(0.0, 1.0);

Eigen::Vector3d noise_gyro(noise(generator_),noise(generator_),noise(generator_));
Eigen::Matrix3d gyro_sqrt_cov = param_.gyro_noise_sigma * Eigen::Matrix3d::Identity();
data.imu_gyro = data.imu_gyro + gyro_sqrt_cov * noise_gyro / sqrt( param_.imu_timestep ) + gyro_bias_;

Eigen::Vector3d noise_acc(noise(generator_),noise(generator_),noise(generator_));
Eigen::Matrix3d acc_sqrt_cov = param_.acc_noise_sigma * Eigen::Matrix3d::Identity();
data.imu_acc = data.imu_acc + acc_sqrt_cov * noise_acc / sqrt( param_.imu_timestep ) + acc_bias_;

// gyro_bias update
Eigen::Vector3d noise_gyro_bias(noise(generator_),noise(generator_),noise(generator_));
gyro_bias_ += param_.gyro_bias_sigma * sqrt(param_.imu_timestep ) * noise_gyro_bias;
data.imu_gyro_bias = gyro_bias_;

// acc_bias update
Eigen::Vector3d noise_acc_bias(noise(generator_),noise(generator_),noise(generator_));
acc_bias_ += param_.acc_bias_sigma * sqrt(param_.imu_timestep ) * noise_acc_bias;
data.imu_acc_bias = acc_bias_;
```
