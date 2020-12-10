---
layout: article
title: "VINS-Mono 论文公式推导与代码解析"
date: 2019-03-16
tags: SLAM
key: slam-vinsmono-note-cg
---

[TOC]

# 概述

<p align="center">
  <img src="../images/vins_mono/vins_mono_framework.png">
</p>

**Monocular visual-inertial odometry** with relocalization achieved via **nonlinear graph optimization-based, tightly-coupled, sliding window, visual-inertial bundle adjustment**.

* 代码（注释版）：[cggos/vins_mono_cg](https://github.com/cggos/vins_mono_cg)
* PDF文档：https://github.com/cggos/vins_mono_cg/blob/master/docs/vinsmono_note_cg.pdf （持续更新中）

# 1. 测量预处理

## 1.1 前端视觉处理

* Simple feature processing pipeline
  * 自适应直方图均衡化（ `cv::CLAHE` ）
  * 掩模处理，特征点均匀分布（`setMask`）
  * 提取图像Harris角点（`cv::goodFeaturesToTrack`）
  * KLT金字塔光流跟踪（`cv::calcOpticalFlowPyrLK`）
  * 连续帧跟踪
  * 本质矩阵(RANSAC)去除外点（`rejectWithF`）
  * 发布feature_points(id_of_point, un_pts, cur_pts, pts_velocity)

* Keyframe selection
  - Case 1: Rotation-compensated average feature parallax is larger than a threshold
  - Case 2: Number of tracked features in the current frame is less than a threshold
  - All frames are used for optimization, but non-keyframes are removed first

## 1.2 IMU 预积分

<p align="center">
  <img src="../images/vins_mono/imu_integration_01.png">
</p>

### IMU 测量方程

忽略地球旋转，IMU 测量方程为

$$
\begin{aligned}
\hat{a}_t &= a_t + b_{a_t} + R_w^t g^w + n_a \\
\hat{\omega} &= \omega_t + b_{\omega}^t + n_{\omega}
\end{aligned}
$$

### 预积分方程

（1）**IMU integration in world frame**

由上面的IMU测量方程积分就可以计算出下一时刻的p、v和q：  

<p align="center">
  <img src="../images/vins_mono/imu_integration_world.png">
</p>

（2）**IMU integration in the body frame of first pose of interests**

<p align="center">
  <img src="../images/vins_mono/imu_integration_02.png">
</p>

为避免重新传播IMU观测值，选用IMU预积分模型，从世界坐标系转为本体坐标系

<p align="center">
  <img src="../images/vins_mono/formular_w_b.png">
</p>

则 预积分IMU测量模型（**估计值**）为

$$
\begin{bmatrix}
\hat{\alpha}^{b_{k}}_{b_{k+1}}\\
\hat{\gamma}^{b_{k}}_{b_{k+1}}\\
\hat{\beta }^{b_{k}}_{b_{k+1}}\\
0\\
0
\end{bmatrix} =
\begin{bmatrix}
R^{b_{k}}_{w}
(p^{w}_{b_{k+1}}-p_{b_{k}}^{w}+\frac{1}{2}g^{w}\Delta t^{2}-v_{b_{k}}^{w}\Delta t) \\
q_{b_{k}}^{w^{-1}}\otimes q^{w}_{b_{k+1}}\\
R^{b_{k}}_{w}(v^{w}_{b_{k+1}}+g^{w}\Delta t-v_{b_{k}}^{w})\\
b_{ab_{k+1}}-b_{ab_{k}}\\
b_{wb_{k+1}}-b_{wb_{k}}
\end{bmatrix}
$$


离散状态下采用 **中值法积分** 的预积分方程（预积分 **测量值**）为

$$
\begin{aligned}
\delta q_{i+1} &= \delta q_{i} \otimes
\begin{bmatrix}
1
\\
\frac{1}{2} w_{i}' \delta t
\end{bmatrix} \\
\delta\alpha_{i+1} &= \delta\alpha_{i}+\delta\beta_{i}t+0.5a_{i}'\delta t^{2} \\
\delta\beta_{i+1}&=\delta\beta_{i}+a_{i}' \delta t \\
{b_a}_{i+1}&= {b_a}_i \\
{b_g}_{i+1}&= {b_g}_i
\end{aligned}
$$

其中

$$
\begin{aligned}
w_{i}' &= \frac{w_{i+1}+w_{i}}{2}-b_{i} \\
a_{i}' &= \frac{
  \delta q_{i}(a_{i}+n_{a0}-b_{a_{i}})+
  \delta q_{i+1}(a_{i+1}++n_{a1}-b_{a_{i}})}{2}
\end{aligned}
$$

`midPointIntegration` 中的相关代码：  

```c++
Vector3d un_gyr = 0.5 * (_gyr_0 + _gyr_1) - linearized_bg;
result_delta_q  = delta_q * Quaterniond(1, un_gyr(0) * _dt / 2, un_gyr(1) * _dt / 2, un_gyr(2) * _dt / 2);

Vector3d un_acc_0 =        delta_q * (_acc_0 - linearized_ba);
Vector3d un_acc_1 = result_delta_q * (_acc_1 - linearized_ba);
Vector3d un_acc   = 0.5 * (un_acc_0 + un_acc_1);

result_delta_p = delta_p + delta_v * _dt + 0.5 * un_acc * _dt * _dt;
result_delta_v = delta_v + un_acc * _dt;

// 预积分的过程中Bias没有发生改变
result_linearized_ba = linearized_ba;
result_linearized_bg = linearized_bg;
```

### 误差状态方程

IMU误差状态向量  

$$
\delta X =
[\delta P \quad \delta v \quad \delta \theta
 \quad \delta b_a \quad \delta b_g]^T
\in \mathbb{R}^{15 \times 1}
$$

根据ESKF中 ***5.3.3 The error-state kinematics*** 小节公式  

<p align="center">
  <img src="../images/vins_mono/formular_eskf_533.png">
</p>

对于 **中值积分** 下的 **误差状态方程** 为  

$$
\dot{\delta X_k} =
\begin{cases}
\dot{\delta \theta_{k}} =&
-[\frac{w_{k+1}+w_{k}}{2}-b_{g_{k}}]_{\times} \delta \theta_{k}-\delta b_{g_{k}}+\frac{n_{w0}+n_{w1}}{2} \\
\dot{\delta\beta_{k}} =&
-\frac{1}{2}q_{k}[a_{k}-b_{a_{k}}]_{\times}\delta \theta \\
&-\frac{1}{2}q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}((I-[\frac{w_{k+1}+w_{k}}{2}-b_{g_{k}}]_{\times }\delta t) \delta \theta_{k} -\delta b_{g_{k}}\delta t+\frac{n_{w0}+n_{w1}}{2}\delta t) \\
&-\frac{1}{2}q_{k}\delta b_{a_{k}}-\frac{1}{2}q_{k+1}\delta b_{a_{k}}-\frac{1}{2}q_{k}n_{a0}-\frac{1}{2}q_{k}n_{a1} \\
\dot{\delta\alpha_{k}} =&
-\frac{1}{4}q_{k}[a_{k}-b_{a_{k}}]_{\times}\delta \theta\delta t \\
&-\frac{1}{4}q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}((I-[\frac{w_{k+1}+w_{k}}{2}-b_{g_{k}}]_{\times }\delta t) \delta \theta _{k} -\delta b_{g_{k}}\delta t+\frac{n_{w0}+n_{w1}}{2}\delta t)\delta t \\
&-\frac{1}{4}q_{k}\delta b_{a_{k}}\delta t-\frac{1}{4}q_{k+1}\delta b_{a_{k}}\delta t-\frac{1}{4}q_{k}n_{a0}\delta t-\frac{1}{4}q_{k}n_{a1}\delta t \\
\dot{\delta b_{a_k}} =&  n_{b_a} \\
\dot{\delta b_{g_k}} =&  n_{b_g}
\end{cases}
$$

简写为

$$
\dot{\delta X_k} = F \delta X_k + Gn
$$

所以

$$
\begin{aligned}
\delta X_{k+1}
&= \delta X_k + \dot{\delta X_k} \delta t \\
&= \delta X_k + (F \delta X_k + Gn) \delta t \\
&= (I + F \delta t) \delta X_k + (G \delta t) n
\end{aligned}
$$

展开得

$$
\begin{aligned}
\begin{bmatrix}
\delta \alpha_{k+1}\\
\delta \theta_{k+1}\\
\delta \beta_{k+1} \\
\delta b_{a{}{k+1}} \\
\delta b_{g{}{k+1}}
\end{bmatrix}&=\begin{bmatrix}
I & f_{01} &\delta t  & -\frac{1}{4}(q_{k}+q_{k+1})\delta t^{2} & f_{04}\\
0 & I-[\frac{w_{k+1}+w_{k}}{2}-b_{wk}]_{\times } \delta t & 0 &  0 & -\delta t \\
0 &  f_{21}&I  &  -\frac{1}{2}(q_{k}+q_{k+1})\delta t & f_{24}\\
0 &  0&  0&I  &0 \\
 0& 0 & 0 & 0 & I
\end{bmatrix}
\begin{bmatrix}
\delta \alpha_{k}\\
\delta \theta_{k}\\
\delta \beta_{k} \\
\delta b_{a{}{k}} \\
\delta b_{g{}{k}}
\end{bmatrix} \\
&+
\begin{bmatrix}
 \frac{1}{4}q_{k}\delta t^{2}&  v_{01}& \frac{1}{4}q_{k+1}\delta t^{2} & v_{03} & 0 & 0\\
 0& \frac{1}{2}\delta t & 0 & \frac{1}{2}\delta t &0  & 0\\
 \frac{1}{2}q_{k}\delta t&  v_{21}& \frac{1}{2}q_{k+1}\delta t & v_{23} & 0 & 0 \\
0 & 0 & 0 & 0 &\delta t  &0 \\
 0& 0 &0  & 0 &0  & \delta t
\end{bmatrix}
\begin{bmatrix}
n_{a0}\\
n_{w0}\\
n_{a1}\\
n_{w1}\\
n_{ba}\\
n_{bg}
\end{bmatrix}
\end{aligned}
$$

其中

$$
\begin{aligned}
f_{01}&=-\frac{1}{4}q_{k}[a_{k}-b_{a_{k}}]_{\times}\delta t^{2}-\frac{1}{4}q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}(I-[\frac{w_{k+1}+w_{k}}{2}-b_{g_{k}}]_{\times }\delta t)\delta t^{2} \\
f_{21}&=-\frac{1}{2}q_{k}[a_{k}-b_{a_{k}}]_{\times}\delta t-\frac{1}{2}q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}(I-[\frac{w_{k+1}+w_{k}}{2}-b_{g_{k}}]_{\times }\delta t)\delta t \\
f_{04}&=\frac{1}{4}(-q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}\delta t^{2})(-\delta t) \\
f_{24}&=\frac{1}{2}(-q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}\delta t)(-\delta t) \\
v_{01}&=\frac{1}{4}(-q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}\delta t^{2})\frac{1}{2}\delta t \\
v_{03}&=\frac{1}{4}(-q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}\delta t^{2})\frac{1}{2}\delta t \\
v_{21}&=\frac{1}{2}(-q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}\delta t^{2})\frac{1}{2}\delta t \\
v_{23}&=\frac{1}{2}(-q_{k+1}[a_{k+1}-b_{a_{k}}]_{\times}\delta t^{2})\frac{1}{2}\delta t
\end{aligned}
$$

令

$$
\begin{aligned}
F' &= I + F \delta t & \in \mathbb{R}^{15 \times 15} \\
V  &= G \delta t     & \in \mathbb{R}^{15 \times 18}
\end{aligned}
$$

则简写为

$$
\delta X_{k+1} = F' \delta X_k + V n
$$

此处 $F'$ 即代码中 `F`，相关代码见 `midPointIntegration`。

最后得到 **IMU预积分测量关于IMU Bias** 的 **雅克比矩阵** $J_{k+1}$ 、IMU预积分测量的 **协方差矩阵** $P_{k+1}$ 和 噪声的 **协方差矩阵 $Q$**，初始状态下的雅克比矩阵和协方差矩阵为 **单位阵** 和 **零矩阵**

$$
\begin{aligned}
J_{b_k} &= I \\
P_{b_{k}}^{b_k} &= 0 \\
J_{t+\delta t} &= F' J_t = (I + F_t \delta t) J_t, \quad t \in [k, k+1] \\
P_{t+\delta t}^{b_k} &= F' P_t^{b_k} F'^T + V Q V^T \\
&= (I + F_t \delta t) P_{t}^{b_k} (I + F_t \delta t) + (G_t \delta t) Q (G_t \delta t) \\
Q &= \text{diag}(
  \sigma_{a_0}^2 \quad \sigma_{\omega_0}^2 \quad
  \sigma_{a_1}^2 \quad \sigma_{\omega_1}^2 \quad
  \sigma_{b_a}^2 \quad \sigma_{b_g}^2) \in \mathbb{R}^{18 \times 18}
\end{aligned}
$$

当bias估计轻微改变时，我们可以使用如下的一阶近似 **对中值积分得到的预积分测量值进行矫正**，而不重传播，从而得到 **更加精确的预积分测量值**（bias修正的线性模型）

$$
\begin{aligned}
{\alpha}^{b_{k}}_{b_{k+1}} &\approx
\hat{\alpha}^{b_{k}}_{b_{k+1}} +
J^{\alpha}_{b_a} \delta {b_a}_k +
J^{\alpha}_{b_{\omega}} \delta {b_{\omega}}_k \\
{\beta}^{b_{k}}_{b_{k+1}} &\approx
\hat{\beta}^{b_{k}}_{b_{k+1}} +
J^{\beta}_{b_a} \delta {b_a}_k +
J^{\beta}_{b_{\omega}} \delta {b_{\omega}}_k \\
{\gamma}^{b_{k}}_{b_{k+1}} &\approx
\hat{\gamma}^{b_{k}}_{b_{k+1}} \otimes
\begin{bmatrix}
1
\\
\frac{1}{2} J^{\gamma}_{b_{\omega}} \delta {b_{\omega}}_k
\end{bmatrix}
\end{aligned}
$$

此时，可以与 **卡尔曼滤波** 对比一下：

<p align="center">
  <img src="../images/kalman_filter/kalman_filter_matrix_process_flowchart.jpg">
</p>


# 2. 初始化(松耦合)

在提取的图像的Features和做完IMU的预积分之后，进入了系统的初始化环节，主要的目的有以下两个：      

- 系统使用单目相机，如果没有一个良好的尺度估计，就无法对两个传感器做进一步的融合，这个时候需要恢复出尺度；
- 要对IMU进行初始化，IMU会受到bias的影响，所以要得到IMU的bias。

所以我们要从初始化中恢复出尺度、重力、速度以及IMU的bias，因为视觉(SFM)在初始化的过程中有着较好的表现，所以在初始化的过程中主要以SFM为主，然后将IMU的预积分结果与其对齐，即可得到较好的初始化结果。

## 2.1 相机与IMU之间的相对旋转

相机与IMU之间的旋转标定非常重要，**偏差1-2°系统的精度就会变的极低**。

设相机利用对极关系得到的旋转矩阵为 $R_{c_{k+1}}^{c_k}$ ，IMU经过预积分得到的旋转矩阵为 $R_{b_{k+1}}^{b_{k}}$，相机与IMU之间的相对旋转为 $R_{c}^{b}$，则对于任一帧满足，

$$
R^{b_{k}}_{b_{k+1}}R^{b}_{c}=R^{b}_{c}R^{c_{k}}_{c_{k+1}}
$$

将旋转矩阵写为四元数，则上式可以写为

$$
q^{b_{k}}_{b_{k+1}} \otimes q^{b}_{c}=q^{b}_{c}\otimes q^{c_{k}}_{c_{k+1}}
$$

将其写为左乘和右乘的形式

$$
({[q^{b_{k}}_{b_{k+1}}]}_L - {[q^{c_{k}}_{c_{k+1}}]}_R) q^b_c
= Q^k_{k+1} q^b_c = 0
$$

$[q]_L$ 与 $[q]_R$ 分别表示 **四元数左乘矩阵** 和 **四元数右乘矩阵**，其定义为（四元数实部在后）

$$
\begin{aligned}
[q]_L &=
\begin{bmatrix}
q_{w}I_{3}+[q_{xyz }]_{\times} & q_{xyz}\\
-q_{xyz} & q_{w}
\end{bmatrix} \\
[q]_R &=
\begin{bmatrix}
q_{w}I_{3}-[q_{xyz }]_{\times} & q_{xyz}\\
-q_{xyz} & q_{w}
\end{bmatrix}
\end{aligned}
$$

那么对于 $n$对测量值，则有

$$
\begin{bmatrix}
w^{0}_{1}Q^{0}_{1}\\
w^{1}_{2}Q^{1}_{2}\\
\vdots \\
w^{N-1}_{N}Q^{N-1}_{N}
\end{bmatrix}q^{b}_{c}=Q_{N}q^{b}_{c}=0
$$

其中 $w^{N-1}_{N}$ 为外点剔除权重，其与相对旋转求得的角度残差有关，$N$为计算相对旋转需要的测量对数，其由最终的终止条件决定。角度残差可以写为，

$$
{\theta}^{k}_{k+1}=
arccos\bigg(
  \frac{tr(\hat{R}^{b^{-1}}_{c}R^{b_{k}^{-1}}_{b_{k+1}}\hat{R}^{b}_{c}R^{c_{k}}_{c_{k+1}} )-1}{2}\bigg)
$$

从而权重为

$$
w^{k}_{k+1}=
\left\{\begin{matrix}
1, & {\theta}^{k}_{k+1}<threshold  (\text{一般5°}) \\
\frac{threshold}{\theta^{k}_{k+1}}, & otherwise
\end{matrix}\right.
$$

至此，就可以通过求解方程 $Q_N q_c^b=0$ 得到相对旋转，解为 $Q_N$ 的左奇异向量中最小奇异值对应的特征向量。

但是，在这里还要注意 __求解的终止条件(校准完成的终止条件)__ 。在足够多的旋转运动中，我们可以很好的估计出相对旋转 $R_{c}^{b}$，这时 $Q_{N}$ 对应一个准确解，且其零空间的秩为1。但是在校准的过程中，某些轴向上可能存在退化运动(如匀速运动)，这时 $Q_{N}$ 的零空间的秩会大于1。判断条件就是 $Q_N$ 的第二小的奇异值是否大于某个阈值，若大于则其零空间的秩为1，反之秩大于1，相对旋转 $R_{c}^{b}$ 的精度不够，校准不成功。  

对应代码在 `InitialEXRotation::CalibrationExRotation` 中。

```c++
// 相机与IMU之间的相对旋转
if(ESTIMATE_EXTRINSIC == 2)
{
    ROS_INFO("calibrating extrinsic param, rotation movement is needed");
    if (frame_count != 0)
    {
        // 选取两帧之间共有的Features
        vector<pair<Vector3d, Vector3d>> corres = f_manager.getCorresponding(frame_count - 1, frame_count);

        // 校准相机与IMU之间的旋转
        Matrix3d calib_ric;
        if (initial_ex_rotation.CalibrationExRotation(corres, pre_integrations[frame_count]->delta_q, calib_ric))
        {
            ROS_WARN("initial extrinsic rotation calib success");
            ROS_WARN_STREAM("initial extrinsic rotation: " << endl << calib_ric);
            ric[0] = calib_ric;
            RIC[0] = calib_ric;
            ESTIMATE_EXTRINSIC = 1;
        }
    }
}
```

## 2.2 检测IMU可观性

```c++
// 计算均值
map<double, ImageFrame>::iterator frame_it;
Vector3d sum_g;
for (frame_it = all_image_frame.begin(), frame_it++; frame_it != all_image_frame.end(); frame_it++)
{
    double sum_dt  = frame_it->second.pre_integration->sum_dt;
    Vector3d tmp_g = frame_it->second.pre_integration->delta_v / sum_dt;
    sum_g += tmp_g;
}
Vector3d aver_g = sum_g * 1.0 / ((int)all_image_frame.size() - 1);

// 计算方差
double var = 0;
for (frame_it = all_image_frame.begin(), frame_it++; frame_it != all_image_frame.end(); frame_it++)
{
    double sum_dt  = frame_it->second.pre_integration->sum_dt;
    Vector3d tmp_g = frame_it->second.pre_integration->delta_v / sum_dt;
    var += (tmp_g - aver_g).transpose() * (tmp_g - aver_g);
}

// 计算标准差
var = sqrt(var / ((int)all_image_frame.size() - 1));
//ROS_WARN("IMU variation %f!", var);
if(var < 0.25) //! 以标准差判断可观性
{
    ROS_INFO("IMU excitation not enouth!");
    //return false;
}
```

## 2.3 相机初始化（Vision-Only SFM）

* 求取本质矩阵求解位姿（`relativePose`）
* 三角化特征点（`sfm.construct`）
* PnP求解位姿（`cv::solvePnP`）
* 转换到IMU坐标系下
* $c_0$ 坐标系作为参考系
* 不断重复直到恢复出滑窗内的Features和相机位姿

## 2.4 视觉与IMU对齐

* Gyroscope Bias Calibration
* Velocity, Gravity Vector and Metric Scale Initialization
* Gravity Refinement
* Completing Initialization

<p align="center">
  <img src="../images/vins_mono/visual_inertial_alignment.png">
</p>

对应代码：`VisualIMUAlignment`

### 陀螺仪Bias标定

标定陀螺仪Bias使用如下代价函数

$$
\underset{\delta b_{w}}{min}\sum_{k\in B}^{ }\left \| q^{c_{0}^{-1}}_{b_{k+1}}\otimes q^{c_{0}}_{b_{k}}\otimes\gamma _{b_{k+1}}^{b_{k}} \right \|^{2}
$$

因为四元数最小值为单位四元数 $[1,0_{v}]^{T}$，所以令

$$
q^{c_{0}^{-1}}_{b_{k+1}}\otimes q^{c_{0}}_{b_{k}}\otimes\gamma _{b_{k+1}}^{b_{k}} =
\begin{bmatrix}
1\\
0
\end{bmatrix}
$$

其中

$$
\gamma _{b_{k+1}}^{b_{k}}\approx \hat{\gamma}_{b_{k+1}}^{b_{k}}\otimes \begin{bmatrix}
1\\
\frac{1}{2}J^{\gamma }_{b_{w}}\delta b_{w}
\end{bmatrix}
$$

所以

$$
\hat{\gamma}_{b_{k+1}}^{b_{k}} \otimes
\begin{bmatrix}
1\\
\frac{1}{2}J^{\gamma }_{b_{w}}\delta b_{w}
\end{bmatrix}
= q^{c_{0}^{-1}}_{b_{k}}\otimes q^{c_{0}}_{b_{k+1}}
$$

$$
\begin{bmatrix}
1\\
\frac{1}{2}J^{\gamma }_{b_{w}}\delta b_{w}
\end{bmatrix}=\hat{\gamma}_{b_{k+1}}^{b_{k}^{-1}}\otimes q^{c_{0}^{-1}}_{b_{k}}\otimes q^{c_{0}}_{b_{k+1}}
$$


只取上式虚部，再进行最小二乘求解

$$
J^{\gamma^{T}}_{b_{w}}J^{\gamma }_{b_{w}}\delta b_{w}=
2 \cdot J^{\gamma^{T}}_{b_{w}}(\hat{\gamma}_{b_{k+1}}^{b_{k}^{-1}}\otimes q^{c_{0}^{-1}}_{b_{k}}\otimes q^{c_{0}}_{b_{k+1}})_{vec}
$$

求解上式的最小二乘解，即可得到 $\delta b_{w}$，注意这个地方得到的只是Bias的变化量，需要在滑窗内累加得到Bias的准确值。   

对应代码：`solveGyroscopeBias`

```c++
void solveGyroscopeBias(map<double, ImageFrame> &all_image_frame, Vector3d* Bgs) {
    Matrix3d A;
    Vector3d b;
    A.setZero();
    b.setZero();

    map<double, ImageFrame>::iterator frame_i;
    map<double, ImageFrame>::iterator frame_j;
    for (frame_i = all_image_frame.begin(); next(frame_i) != all_image_frame.end(); frame_i++) {
        frame_j = next(frame_i);

        MatrixXd tmp_A(3, 3);
        VectorXd tmp_b(3);
        tmp_A.setZero();
        tmp_b.setZero();

        Eigen::Quaterniond q_ij(frame_i->second.R.transpose() * frame_j->second.R);
        tmp_A = frame_j->second.pre_integration->jacobian.template block<3, 3>(O_R, O_BG);
        tmp_b = 2 * (frame_j->second.pre_integration->delta_q.inverse() * q_ij).vec();

        A += tmp_A.transpose() * tmp_A;
        b += tmp_A.transpose() * tmp_b;
    }

    Vector3d delta_bg = A.ldlt().solve(b);
    ROS_WARN_STREAM("gyroscope bias initial calibration " << delta_bg.transpose());

    // 因为求解出的Bias是变化量，所以要累加
    for (int i = 0; i <= WINDOW_SIZE; i++)
        Bgs[i] += delta_bg;

    // 利用新的Bias重新repropagate
    for (frame_i = all_image_frame.begin(); next(frame_i) != all_image_frame.end(); frame_i++) {
        frame_j = next(frame_i);
        frame_j->second.pre_integration->repropagate(Vector3d::Zero(), Bgs[0]);
    }
}
```

### 初始化速度、重力向量和尺度因子

要估计的状态量

$$
X_{I}=
[v^{b_{0}}_{b_{0}}, v^{b_{0}}_{b_{1}}, \cdots, v^{b_{n}}_{b_{n}}, g^{c_{0}}, s]
\in \mathbb{R}^{3(n+1)+3+1}
$$

其中，$g^{c_{0}}$ 为在第 0 帧 Camera 相机坐标系下的重力向量。

根据IMU测量模型可知

$$
\begin{aligned}
\alpha^{b_{k}}_{b_{k+1}} &= R^{b_{k}}_{c_{0}}(s(\bar{p}^{c_{0}}_{b_{k+1}}-\bar{p}^{c_{0}}_{b_{k}}) +
\frac{1}{2}g^{c_{0}}\Delta t_{k}^{2} -
R^{c_0}_{b_k} v^{b_k}_{b_{k}} \Delta t_{k}) \\
\beta ^{b_{k}}_{b_{k+1}} &=
R^{b_{k}}_{c_{0}}(R^{c_0}_{b_{k+1}} v^{b_{k+1}}_{b_{k+1}} +
g^{c_{0}}\Delta t_{k} -
R^{c_0}_{b_k} v^{b_k}_{b_{k}})
\end{aligned}
$$

我们已经得到了IMU相对于相机的旋转 $q_{b}^{c}$，假设IMU到相机的平移量$p_{b}^{c}$，那么可以很容易地将相机坐标系下的位姿转换到IMU坐标系下

$$
\begin{aligned}
q_{b_{k}}^{c_{0}} &=
q^{c_{0}}_{c_{k}}\otimes (q_{c}^{b})^{-1}  \\
s\bar{p}^{c_{0}}_{b_{k}} &=
s\bar{p}^{c_{0}}_{c_{k}} - R^{c_{0}}_{b_{k}}p_{c}^{b}
\end{aligned}
$$

所以，定义相邻两帧之间的IMU预积分出的增量（${\hat{\alpha}}_{b_{k+1}}^{b_{k}}$，${\hat{\beta}}_{b_{k+1}}^{b_{k}}$）与预测值之间的残差，即

$$
\begin{aligned}
r(\hat{z}^{b_{k}}_{b_{k+1}}, X_I) &=
\begin{bmatrix}
\delta \alpha^{b_{k}}_{b_{k+1}} \\
\delta \beta ^{b_{k}}_{b_{k+1}}
\end{bmatrix} \\ &=
\begin{bmatrix}
\hat{\alpha}^{b_{k}}_{b_{k+1}} -& R^{b_{k}}_{c_{0}}(s(\bar{p}^{c_{0}}_{b_{k+1}}-\bar{p}^{c_{0}}_{b_{k}}) +
\frac{1}{2}g^{c_{0}}\Delta t_{k}^{2} -
R^{c_0}_{b_k} v^{b_k}_{b_{k}} \Delta t_{k})\\
\hat{\beta}^{b_{k}}_{b_{k+1}} -&
R^{b_{k}}_{c_{0}}(R^{c_0}_{b_{k+1}} v^{b_{k+1}}_{b_{k+1}} +
g^{c_{0}}\Delta t_{k} -
R^{c_0}_{b_k} v^{b_k}_{b_{k}})
\end{bmatrix}
\end{aligned}
$$

令 $r(\hat{z}_{b_{k+1}}^{b_{k}}, X_I)=\mathbf{0}$，转换成 $Hx=b$ 的形式

$$
\begin{bmatrix}
-I\Delta t_{k} & 0 & \frac{1}{2}R^{b_{k}}_{c_{0}} \Delta t_{k}^{2} &
R^{b_{k}}_{c_{0}}(\bar{p}^{c_{0}}_{c_{k+1}}-\bar{p}^{c_{0}}_{c_{k}}) \\
-I & R^{b_{k}}_{c_{0}} R^{c_0}_{b_{k+1}} & R^{b_{k}}_{c_{0}}\Delta t_{k} & 0
\end{bmatrix}
\begin{bmatrix}
v^{b_{k}}_{b_{k}}\\
v^{b_{k+1}}_{b_{k+1}}\\
g^{c_{0}}\\
s
\end{bmatrix} =
\begin{bmatrix}
\alpha^{b_{k}}_{b_{k+1}} - p_c^b + R^{b_{k}}_{c_{0}} R^{c_0}_{b_{k+1}} p_c^b \\
\beta ^{b_{k}}_{b_{k+1}}
\end{bmatrix}
$$

通过Cholosky分解求解 $X_I$

$$
H^T H X_I = H^T b
$$

对应代码：`LinearAlignment`

### 优化重力

<p align="center">
  <img src="../images/vins_mono/gravity_tangent_space.png">
</p>

重力矢量的模长固定（9.8），其为2个自由度，在切空间上对其参数化

$$
\begin{aligned}
\hat{g} &=
\|g\| \cdot \bar{\hat{g}} + \omega_1 \vec{b_1} + \omega_2 \vec{b_2} \\ &=
\|g\| \cdot \bar{\hat{g}} + B \vec{\omega}
\end{aligned} , \quad
B \in \mathbb{R}^{3 \times 2}, \vec{\omega} \in \mathbb{R}^{2 \times 1}
$$

令 $\hat{g} = g^{c_{0}}$，将其代入上一小节公式得

$$
\begin{bmatrix}
-I\Delta t_{k} & 0 & \frac{1}{2}R^{b_{k}}_{c_{0}} \Delta t_{k}^{2} B &
R^{b_{k}}_{c_{0}}(\bar{p}^{c_{0}}_{c_{k+1}}-\bar{p}^{c_{0}}_{c_{k}}) \\
-I & R^{b_{k}}_{c_{0}} R^{c_0}_{b_{k+1}} & R^{b_{k}}_{c_{0}}\Delta t_{k} B & 0
\end{bmatrix}
\begin{bmatrix}
v^{b_{k}}_{b_{k}}\\
v^{b_{k+1}}_{b_{k+1}}\\
\vec{\omega}\\
s
\end{bmatrix} \\ =
\begin{bmatrix}
\alpha^{b_{k}}_{b_{k+1}} - p_c^b + R^{b_{k}}_{c_{0}} R^{c_0}_{b_{k+1}} p_c^b -
\frac{1}{2}R^{b_{k}}_{c_{0}} \Delta t_{k}^{2} \|g\| \cdot \bar{\hat{g}}\\
\beta ^{b_{k}}_{b_{k+1}} -
R^{b_{k}}_{c_{0}}\Delta t_{k} \|g\| \cdot \bar{\hat{g}}
\end{bmatrix}
$$

同样，通过Cholosky分解求得 $g^{c_{0}}$，即相机 $C_0$ 系下的重力向量。

最后，通过将 $g^{c_{0}}$ 旋转至惯性坐标系（世界系）中的 z 轴方向[0,0,1]，可以计算第一帧相机系到惯性系的旋转矩阵 $q_{c_0}^w$，这样就可以将所有变量调整至惯性世界系（**水平坐标系**，z轴与重力方向对齐）中。

对应代码：`RefineGravity`

# 3. 后端优化(紧耦合)

<p align="center">
  <img src="../images/vins_mono/sliding_window_vio.png">
</p>

VIO 紧耦合方案的主要思路就是通过将基于视觉构造的残差项和基于IMU构造的残差项放在一起构造成一个联合优化的问题，整个优化问题的最优解即可认为是比较准确的状态估计。

为了限制优化变量的数目，VINS-Mono 采用了滑动窗口的形式，**滑动窗口** 中的 **全状态量**：

$$
\begin{aligned}
X &= [x_{0},x_{1},\cdots ,x_{n},x^{b}_{c},{\lambda}_{0},{\lambda}_{1}, \cdots ,{\lambda}_{m}]  \\
x_{k} &= [p^{w}_{b_{k}},v^{w}_{b_{k}},q^{w}_{b_{k}},b_{a},b_{g}],\quad k\in[0,n] \\
x^{b}_{c} &= [p^{b}_{c},q^{b}_{c}]
\end{aligned}
$$

* 滑动窗口内 n+1 个所有相机的状态(包括位置、朝向、速度、加速度计 bias 和陀螺仪 bias)
* Camera 到 IMU 的外参
* m+1 个 3D 点的逆深度

优化过程中的 **误差状态量**

$$
\begin{aligned}
\delta X&=[\delta x_{0},\delta x_{1},\cdots ,\delta x_{n},\delta x^{b}_{c},\lambda_{0},\delta \lambda _{1}, \cdots , \delta \lambda_{m}]  \\
\delta x_{k}&=[\delta p^{w}_{b_{k}},\delta v^{w}_{b_{k}},\delta \theta ^{w}_{b_{k}},\delta b_{a},\delta b_{g}],\quad k\in[0,n] \\
\delta x^{b}_{c}&= [\delta p^{b}_{c},\delta q^{b}_{c}]
\end{aligned}
$$

进而得到系统优化的代价函数（Minimize residuals from all sensors）

$$
\underset{X}{min}
\begin{Bmatrix}
\left \|
r_{p}-H_{p}X
\right \|^{2} +
\sum_{k\in B}^{ } \left \|
r_{B}(\hat{z}^{b_{k}}_{b_{k+1}},X)
\right \|^{2}_{P^{b_{k}}_{b{k+1}}} +
\sum_{(i,j)\in C}^{ } \left \|
r_{C}(\hat{z}^{c_{j}}_{l},X)
\right \|^{2}_{P^{c_{j}}_{l}}
\end{Bmatrix}
$$

<p align="center">
  <img src="../images/vins_mono/formular_residuals.png">
</p>

其中三个残差项依次是

* 边缘化的先验信息
* IMU测量残差
* 视觉的观测残差

三种残差都是用 **马氏距离**（与量纲无关） 来表示的。

**Motion-only visual-inertial bundle adjustment**: Optimize **position, velocity, rotation** in a smaller windows, assuming all other quantities are fixed

## 3.1 IMU 测量残差

（1）IMU 测量残差

上面的IMU预积分（估计值 - 测量值），得到IMU测量残差

$$
\begin{aligned}
r_{B}(\hat{z}^{b_{k}}_{b_{k+1}},X)=
\begin{bmatrix}
\delta \alpha ^{b_{k}}_{b_{k+1}}\\
\delta \theta   ^{b_{k}}_{b_{k+1}}\\
\delta \beta ^{b_{k}}_{b_{k+1}}\\
0\\
0
\end{bmatrix}
&=\begin{bmatrix}
R^{b_{k}}_{w}(p^{w}_{b_{k+1}}-p_{b_{k}}^{w}+\frac{1}{2}g^{w}\Delta t^{2}-v_{b_{k}}^{w}\Delta t)-\hat{\alpha }^{b_{k}}_{b_{k+1}}\\
2{[{q_{b_{k}}^{w}}^{-1} \otimes q^{w}_{b_{k+1}} \otimes (\hat{\gamma  }^{b_{k}}_{b_{k+1}})^{-1}]}_{xyz} \\
R^{b_{k}}_{w}(v^{w}_{b_{k+1}}+g^{w}\Delta t-v_{b_{k}}^{w})-\hat{\beta }^{b_{k}}_{b_{k+1}} \\
b_{ab_{k+1}}-b_{ab_{k}}\\
b_{gb_{k+1}}-b_{gb_{k}}
\end{bmatrix}
\end{aligned}
$$

其中 $[\hat{\alpha }^{b_{k}}_{b_{k+1}},\hat{\gamma  }^{b_{k}}_{b_{k+1}},\hat{\beta }^{b_{k}}_{b_{k+1}}]$ 为 **IMU预积分Bias修正值**。

```c++
/**
 * [evaluate 计算IMU测量模型的残差]
 * @param Pi，Qi，Vi，Bai，Bgi  [前一次预积分结果]
 * @param Pj，Qj，Vj，Baj，Bgj  [后一次预积分结果]
 */
Eigen::Matrix<double, 15, 1> evaluate(
        const Eigen::Vector3d &Pi, const Eigen::Quaterniond &Qi, const Eigen::Vector3d &Vi, const Eigen::Vector3d &Bai, const Eigen::Vector3d &Bgi,
        const Eigen::Vector3d &Pj, const Eigen::Quaterniond &Qj, const Eigen::Vector3d &Vj, const Eigen::Vector3d &Baj, const Eigen::Vector3d &Bgj)
{
    Eigen::Matrix<double, 15, 1> residuals;

    Eigen::Matrix3d dp_dba = jacobian.block<3, 3>(O_P, O_BA);
    Eigen::Matrix3d dp_dbg = jacobian.block<3, 3>(O_P, O_BG);

    Eigen::Matrix3d dq_dbg = jacobian.block<3, 3>(O_R, O_BG);

    Eigen::Matrix3d dv_dba = jacobian.block<3, 3>(O_V, O_BA);
    Eigen::Matrix3d dv_dbg = jacobian.block<3, 3>(O_V, O_BG);

    Eigen::Vector3d dba = Bai - linearized_ba;
    Eigen::Vector3d dbg = Bgi - linearized_bg;

    // IMU预积分的结果,消除掉acc bias和gyro bias的影响, 对应IMU model中的\hat{\alpha},\hat{\beta},\hat{\gamma}
    Eigen::Quaterniond corrected_delta_q = delta_q * Utility::deltaQ(dq_dbg * dbg);
    Eigen::Vector3d    corrected_delta_v = delta_v + dv_dba * dba + dv_dbg * dbg;
    Eigen::Vector3d    corrected_delta_p = delta_p + dp_dba * dba + dp_dbg * dbg;

    // IMU项residual计算,输入参数是状态的估计值, 上面correct_delta_*是预积分值, 二者求'diff'得到residual
    residuals.block<3, 1>(O_P, 0)  = Qi.inverse() * (0.5 * G * sum_dt * sum_dt + Pj - Pi - Vi * sum_dt) - corrected_delta_p;
    residuals.block<3, 1>(O_R, 0)  = 2 * (corrected_delta_q.inverse() * (Qi.inverse() * Qj)).vec();
    residuals.block<3, 1>(O_V, 0)  = Qi.inverse() * (G * sum_dt + Vj - Vi) - corrected_delta_v;
    residuals.block<3, 1>(O_BA, 0) = Baj - Bai;
    residuals.block<3, 1>(O_BG, 0) = Bgj - Bgi;

    return residuals;
}
```

（2）协方差矩阵

此处用到的协方差矩阵为前面IMU预积分计算出的协方差矩阵。

残差的后处理对应代码：

```c++
// 在优化迭代的过程中, 预积分值是不变的, 输入的状态值会被不断的更新, 然后不断的调用evaluate()计算更新后的IMU残差
Eigen::Map<Eigen::Matrix<double, 15, 1>> residual(residuals);
residual = pre_integration->evaluate(Pi, Qi, Vi, Bai, Bgi,
                                     Pj, Qj, Vj, Baj, Bgj);

Eigen::Matrix<double, 15, 15> sqrt_info =
        Eigen::LLT<Eigen::Matrix<double, 15, 15>>(pre_integration->covariance.inverse()).matrixL().transpose();
//sqrt_info.setIdentity();

residual = sqrt_info * residual; // 为了保证 IMU 和 视觉參差项在尺度上保持一致，一般会采用与量纲无关的马氏距离
```

这里残差 residual 乘以 sqrt_info，这是因为真正的优化项其实是 Mahalanobis 距离: $d = r^T P^{-1} r$，其中 $P$ 是协方差。Mahalanobis距离 其实相当于一个残差加权，协方差大的加权小，协方差小的加权大，着重优化那些比较确定的残差。  

**而 ceres只接受最小二乘优化，也就是 $\min e^T e$，所以把 $P^{-1}$ 做 LLT分解，即 $LL^T=P^{−1}$，则 $d = r^T (L L^T) r = (L^T r)^T (L^T r)$，令 $r' = (L^T r)$，作为新的优化误差，所以 sqrt_info 等于 $L^T$。**

（3）雅克比矩阵

高斯迭代优化过程中会用到IMU测量残差对状态量的雅克比矩阵，但此处我们是 **对误差状态量求偏导**，下面对四部分误差状态量求取雅克比矩阵。

对$[\delta p^{w}_{b_{k}},\delta \theta ^{w}_{b_{k}}]$ 求偏导得

$$
J[0]=\begin{bmatrix}
-q^{b_{k}}_{w} & R^{b_{k}}_{w}[(p^{w}_{b_{k+1}}-p_{b_{k}}^{w}+\frac{1}{2}g^{w}\Delta t^{2}-v_{b_{k}}^{w}\Delta t)]_{\times }\\
0 & [q_{b_{k+1}}^{w^{-1}}q^{w}_{b_{k}}]_{L}[\hat{\gamma  }^{b_{k}}_{b_{k+1}}]_{R}J^{\gamma}_{b_{w}}\\
0 & R^{b_{k}}_{w}[(v^{w}_{b_{k+1}}+g^{w}\Delta t-v_{b_{k}}^{w})]_{\times } \\
0 & 0
\end{bmatrix}
\in \mathbb{R}^{15 \times 7}
$$

对 $[\delta v^{w}_{b_{k}},\delta b_{ab_{k}},\delta b_{wb_{k}}]$ 求偏导得

$$J[1]=
\begin{bmatrix}
-q^{b_{k}}_{w}\Delta t & -J^{\alpha }_{b_{a}} & -J^{\alpha }_{b_{a}}\\
0 & 0 & -[q_{b_{k+1}}^{w^{-1}}\otimes q^{w}_{b_{k}}\otimes \hat{\gamma  }^{b_{k}}_{b_{k+1}}]_{L}J^{\gamma}_{b_{w}}\\
-q^{b_{k}}_{w} & -J^{\beta }_{b_{a}} & -J^{\beta }_{b_{a}}\\
0& -I &0 \\
0 &0  &-I
\end{bmatrix}
\in \mathbb{R}^{15 \times 9}
$$

对 $[\delta p^{w}_{b_{k+1}},\delta \theta ^{w}_{b_{k+1}}]$ 求偏导得

$$
J[2]=
\begin{bmatrix}
-q^{b_{k}}_{w} &0\\
0 &  [\hat{\gamma  }^{b_{k}^{-1}}_{b_{k+1}}\otimes q_{w}^{b_{k}}\otimes q_{b_{k+1}}^{w}]_{L} \\
0 & 0 \\
0 & 0  \\
0 & 0   
\end{bmatrix}
\in \mathbb{R}^{15 \times 7}
$$

对 $[\delta v^{w}_{b_{k}},\delta b_{ab_{k}},\delta b_{wb_{k}}]$ 求偏导得

$$J[3]=
\begin{bmatrix}
-q^{b_{k}}_{w} &0 & 0\\
0 & 0 &0 \\
q^{b_{k}}_{w} & 0 & 0\\
 0& I &0 \\
0 &0  &I
\end{bmatrix}
\in \mathbb{R}^{15 \times 9}
$$

雅克比矩阵计算的对应代码在 `class IMUFactor : public ceres::SizedCostFunction<15, 7, 9, 7, 9>` 中的 `Evaluate()` 函数中。


## 3.2 视觉(td) 测量残差

视觉测量残差 即 **特征点的重投影误差**，视觉残差和雅克比矩阵计算的对应代码在 `ProjectionFactor::Evaluate` 函数中。

（1）切平面重投影误差（Spherical camera model）

<p align="center">
  <img src="../images/vins_mono/visual_residual_sphere.png">
</p>

$$
r_{C}=(\hat{z}_{l}^{c_{j}},X)=[b_{1},b_{2}]^{T}\cdot (\bar{P}_{l}^{c_{j}}-\frac{P_{l}^{c_{j}}}{\left \| P_{l}^{c_{j}} \right \|})
$$

其中，

$$
P_{l}^{c_{j}}=q_{b}^{c}(q_{w}^{b_{j}}(q_{b_{i}}^{w}(q_{c}^{b} \frac{\bar{P}_{l}^{c_{i}}}{\lambda _{l}}+p_{c}^{b})+p_{b_{i}}^{w}-p_{b_{j}}^{w})-p_{c}^{b})
$$

```c++
// 将第i frame下的3D点转到第j frame坐标系下
Eigen::Vector3d pts_camera_i = pts_i / inv_dep_i;                 // pt in ith camera frame, 归一化平面
Eigen::Vector3d pts_imu_i    = qic * pts_camera_i + tic;          // pt in ith body frame
Eigen::Vector3d pts_w        = Qi * pts_imu_i + Pi;               // pt in world frame
Eigen::Vector3d pts_imu_j    = Qj.inverse() * (pts_w - Pj);       // pt in jth body frame
Eigen::Vector3d pts_camera_j = qic.inverse() * (pts_imu_j - tic); // pt in jth camera frame
```

（2）像素重投影误差（Pinhole camera model）

$$
r_{C}=(\hat{z}_{l}^{c_{j}},X) =
( \frac{f}{1.5} \cdot I_{2 \times 2} ) \cdot
{(\frac{\bar{P}_{l}^{c_{j}}}{\bar{Z}}-\frac{P_{l}^{c_{j}}}{Z_j})}_2
$$

```c++
Eigen::Map<Eigen::Vector2d> residual(residuals);
#ifdef UNIT_SPHERE_ERROR
// 把归一化平面上的重投影误差投影到Unit sphere上的好处就是可以支持所有类型的相机 why
// 求取切平面上的误差
residual =  tangent_base * (pts_camera_j.normalized() - pts_j.normalized());
#else
// 求取归一化平面上的误差
double dep_j = pts_camera_j.z();
residual = (pts_camera_j / dep_j).head<2>() - pts_j.head<2>();
#endif
residual = sqrt_info * residual; // 转成 与量纲无关的马氏距离
```

（3）协方差矩阵

固定的协方差矩阵，归一化平面的标准差为 $\frac{1.5}{f}$，即像素标准差为 $1.5$

```c++
ProjectionFactor::sqrt_info   = FOCAL_LENGTH / 1.5 * Matrix2d::Identity();
```

（4）雅克比矩阵

下面关于误差状态量对相机测量残差求偏导，得到高斯迭代优化过程中的雅克比矩阵。

对 $[\delta p^{w}_{b_{i}},\delta \theta ^{w}_{b_{i}}]$ 求偏导

$$
J[0]=\begin{bmatrix}
q_{b}^{c}q_{w}^{b_{j}} & -q_{b}^{c}q_{w}^{b_{j}}q_{b_{i}}^{w}[q_{c}^{b} \frac{\bar{P}_{l}^{c_{i}}}{\lambda_{l}}+p_{c}^{b}]_{\times }
\end{bmatrix}
\in \mathbb{R}^{3 \times 6}
$$

对 $[\delta p^{w}_{b_{j}},\delta \theta ^{w}_{b_{j}}]$ 求偏导

$$
J[1]=\begin{bmatrix}
-q_{b}^{c}q_{w}^{b_{j}} & q_{b}^{c}q_{w}^{b_{j}}[q_{b_{i}}^{w}(q_{c}^{b} \frac{\bar{P}_{l}^{c_{i}}}{\lambda _{l}}+p_{c}^{b})+p_{b_{i}}^{w}-p_{b_{j}}^{w}]_{\times }
\end{bmatrix}
\in \mathbb{R}^{3 \times 6}
$$

对 $[\delta p^{b}_{c},\delta \theta ^{b}_{c}]$ 求偏导

$$
J[2]=
\begin{bmatrix}
q_{b}^{c}(q_{w}^{b_{j}}q_{bi}^{w}-I_{3*3}) & -q_{b}^{c}q_{w}^{b_{j}}q_{b_{i}}^{w}q_{c}^{b}[\frac{\bar{P}_{l}^{c_{i}}}{\lambda_{l}}]_{\times }+[q_{b}^{c}(q_{w}^{b_{j}}(q_{b_{i}}^{w}p_{c}^{b}+p_{b_{i}}^{w}-p_{b_{j}}^{w})-p_{c}^{b})]
\end{bmatrix}
\in \mathbb{R}^{3 \times 6}
$$

对 $\delta \lambda_{l}$ 求偏导

$$
J[3]=-q_{b}^{c}q_{w}^{b_{j}}q_{b_{i}}^{w}q_{c}^{b} \frac{\bar{P}_{l}^{c_{i}}}{\lambda_{l}^{2}}
\in \mathbb{R}^{3 \times 1}
$$

（5）Vision measurement residual for temporal calibration

视觉残差和雅克比矩阵计算的对应代码在 `ProjectionTdFactor::Evaluate` 函数中。

<p align="center">
  <img src="../images/vins_mono/visual_residual_temporal.png">
</p>

```c++
// TR / ROW * row_i 是相机 rolling 到这一行时所用的时间
Eigen::Vector3d pts_i_td, pts_j_td;
pts_i_td = pts_i - (td - td_i + TR / ROW * row_i) * velocity_i;
pts_j_td = pts_j - (td - td_j + TR / ROW * row_j) * velocity_j;

Eigen::Vector3d pts_camera_i = pts_i_td / inv_dep_i;
Eigen::Vector3d pts_imu_i    = qic * pts_camera_i + tic;
Eigen::Vector3d pts_w        = Qi * pts_imu_i + Pi;
Eigen::Vector3d pts_imu_j    = Qj.inverse() * (pts_w - Pj);
Eigen::Vector3d pts_camera_j = qic.inverse() * (pts_imu_j - tic);

Eigen::Map<Eigen::Vector2d> residual(residuals);
#ifdef UNIT_SPHERE_ERROR
residual =  tangent_base * (pts_camera_j.normalized() - pts_j_td.normalized());
#else
double dep_j = pts_camera_j.z();
residual = (pts_camera_j / dep_j).head<2>() - pts_j_td.head<2>();
#endif
residual = sqrt_info * residual;
```

* 添加对 imu-camera 时间戳不完全同步和 Rolling Shutter 相机的支持：通过前端光流计算得到每个角点在归一化的速度，根据 imu-camera 时间戳的时间同步误差和Rolling Shutter相机做一次rolling的时间，对角点的归一化坐标进行调整

## 3.3 Temporal Calibration

### Timestamps

<p align="center">
  <img src="../images/vins_mono/timestamps.png">
</p>

### Time Synchronization

<p align="center">
  <img src="../images/vins_mono/time_synchronization.png">
</p>

### Temporal Calibration

* calibrate **the fixed latency $t_d$** occurred during time stamping
* change the **IMU pre-integration interval** to the **interval between two image timestamps**
  - linear incorporation of IMU measurements to obtain the IMU reading at image time stamping
  - estimates states(position, orientation, etc.) **at image time stamping**

## 3.4 边缘化(Marginalization)

> SLAM is tracking a noraml distribution through a large state space

<p align="center">
  <img src="../images/vins_mono/marginalization.png">
</p>

**滑窗（Sliding Window）** 限制了关键帧的数量，防止pose和feature的个数不会随时间不断增加，使得优化问题始终在一个有限的复杂度内，不会随时间不断增长。

### Marginalization

然而，将pose移出windows时，有些约束会被丢弃掉，这样势必会导致求解的精度下降，而且当MAV进行一些退化运动(如: 匀速运动)时，没有历史信息做约束的话是无法求解的。所以，在移出位姿或特征的时候，需要将相关联的约束转变成一个约束项作为prior放到优化问题中，这就是marginalization要做的事情。

边缘化的过程就是将滑窗内的某些较旧或者不满足要求的视觉帧剔除的过程，所以边缘化也被描述为 **将联合概率分布分解为边缘概率分布和条件概率分布的过程**(就是利用shur补减少优化参数的过程)。

直接进行边缘化而不加入先验条件的后果：

* 无故地移除这些pose和feature会丢弃帧间约束，会降低了优化器的精度，所以在移除pose和feature的时候需要将相关联的约束转变为一个先验的约束条件作为prior放到优化问题中

* 在边缘化的过程中，不加先验的边缘化会导致系统尺度的缺失(参考[6])，尤其是系统在进行退化运动时(如无人机的悬停和恒速运动)。一般来说 **只有两个轴向的加速度不为0的时候，才能保证尺度可观**，而退化运动对于无人机或者机器人来说是不可避免的。所以在系统处于退化运动的时候，要加入先验信息保证尺度的可观性

VINS-Mono中为了处理一些悬停的case，引入了一个two-way marginalization：

* **MARGIN_OLD**：如果次新帧是关键帧，则丢弃滑动窗口内最老的图像帧，同时对与该图像帧关联的约束项进行边缘化处理。这里需要注意的是，如果该关键帧是观察到某个地图点的第一帧，则需要把该地图点的深度转移到后面的图像帧中去。

* **MARGIN_NEW**：如果次新帧不是关键帧，则丢弃当前帧的前一帧。因为判定当前帧不是关键帧的条件就是当前帧与前一帧视差很小，也就是说当前帧和前一帧很相似，这种情况下直接丢弃前一帧，然后用当前帧代替前一帧。为什么这里可以不对前一帧进行边缘化，而是直接丢弃，原因就是当前帧和前一帧很相似，因此当前帧与地图点之间的约束和前一帧与地图点之间的约束是很接近的，直接丢弃并不会造成整个约束关系丢失信息。这里需要注意的是，要把当前帧和前一帧之间的 IMU 预积分转换为当前帧和前二帧之间的 IMU 预积分。

在悬停等运动较小的情况下，会频繁的MARGIN_NEW，这样也就保留了那些比较旧但是视差比较大的pose。这种情况如果一直MARGIN_OLD的话，视觉约束不够强，状态估计会受IMU积分误差影响，具有较大的累积误差。

### Schur Complement

* Marginalization via Schur complement on information matrix

<p align="center">
  <img src="../images/vins_mono/schur_complement.png">
</p>

### First Estimate Jacobin

# 4. 重定位

<p align="center">
  <img src="../images/vins_mono/relocalization.png">
</p>

## 4.1 Loop Detection

Vins-Mono利用 **词袋 DBoW2** 做Keyframe Database的构建和查询。在建立闭环检测的数据库时，关键帧的Features包括两部分：**VIO部分的200个强角点 和 500个Fast角点**，然后描述子使用 **BRIEF** (因为旋转可观，匹配过程中对旋转有一定的适应性，所以不用使用ORB)。

* Describe features by BRIEF
  - Features that we use in the VIO (200, not enough for loop detection)
  - Extract new FAST features (500, only use for loop detection)
* Query Bag-of-Word (DBoW2)
  - Return loop candidates

## 4.2 Feature Retrieval

在闭环检测成功之后，会得到回环候选帧，所以要在已知位姿的回环候选帧和滑窗内的匹配帧通过 **BRIEF描述子匹配**，然后把回环帧加入到滑窗的优化当中，这时整个滑窗的状态量的维度是不发生变化的，因为回环帧的位姿是固定的。

* Try to retrieve matches for features (200) that are used in the VIO
* BRIEF descriptor match
* Geometric check
  - 2D-2D: fundamental matrix test with RANSAC
  - 3D-3D: PnP test with RANSAC
  - At least 30 inliers

<p align="center">
  <img src="../images/vins_mono/loop_closure_outlier_removal.jpg">
</p>

## 4.3 Tightly-Coupled Relocalization

# 5. 全局位姿图优化

<p align="center">
  <img src="../images/vins_mono/global_pose_graph_optimization.png">
</p>

因为之前做的非线性优化本质只是在一个滑窗之内求解出了相机的位姿，而且在回环检测部分，利用固定位姿的回环帧只是纠正了滑窗内的相机位姿，并没有修正其他位姿(或者说没有将回环发现的误差分配到整个相机的轨迹上)，缺少全局的一致性，所以要做一次全局的Pose Graph。**全局的Pose Graph较之滑窗有一定的迟滞性，只有相机的Pose滑出滑窗的时候，Pose才会被加到全局的Pose Graph当中。**

**(1) Adding Keyframes into the Pose Graph**

* Sequential edges from VIO
  - Connected with 4 previous keyframes
* Loop closure edges
  - Only added when a keyframe is marginalized out from the sliding window VIO
  - Multi-constraint relocalization helps eliminating false loop closures
  - Huber norm for rejection of wrong loops

**(2) 4-DOF Pose Graph Optimization**

* Roll and pitch are observable from VIO

**(3) Pose Graph Management**

**(4) Map Reuse**

* Save map at any time
* Load map and re-localize with respect to it
* Pose graph merging

# 6. Remarks on Monocular Visual-Inertial SLAM

* Important factors
  * Access to raw camera data (especially for rolling shutter cameras)
  * Sensor synchronization and timestamps
  * Camera-IMU rotation
  * Estimator initialization
* Not-so-important factors
  * Camera-IMU translation
  * Types of features (we use the simplest corner+KLT)
  * Quality of feature tracking (outlier is acceptable)
* Failures – need more engineering treatment
  * Long range scenes (aerial vehicles)
  * Constant velocity (ground vehicle)
  * Pure rotation (augmented reality)
* Be aware of computational power requirement


# 参考文献

* [1] VINS-Mono: A Robust and Versatile Monocular Visual-Inertial State Estimator  
* [2] Shaojie Shen, Monocular Visual-Inertial SLAM slides, 2018
* [3] Quaternion kinematics for the error-state Kalman filter
* [4] Xiaobuyi, [VINS-Mono代码分析总结](https://www.zybuluo.com/Xiaobuyi/note/866099)
