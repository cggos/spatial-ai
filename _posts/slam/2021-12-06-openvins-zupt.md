---
layout: article
title: "Zero Velocity Update (ZUPT) in OpenVINS"
tags: SLAM MSF StateEstimation
key: zupt-openvins
---

[TOC]

## Overview

The key idea of the zero velocity update (ZUPT) is to allow for the system to **reduce its uncertainty leveraging motion knowledge (i.e. leverage the fact that the system is stationary)**.

This is of particular importance in cases where we have a monocular system without any temporal SLAM features. In this case, **if we are stationary we will be unable to triangulate features and thus will be unable to update the system**. This can be avoided by **either using a stereo system or temporal SLAM features**.

One problem that both of these don't solve is **the issue of dynamic environmental objects**. In a typical autonomous car scenario the sensor system will become stationary at stop lights in which dynamic objects, such as other cars crossing the intersection, can **quickly corrupt the system**.

**A zero velocity update and skipping feature tracking** can address these issues if we are able to classify the cases where the sensor system is at rest.


## Zero Velocity Detection

```cpp
// Check if we are currently zero velocity
// We need to pass the chi2 and not be above our velocity threshold
if (!disparity_passed && (chi2 > _options.chi2_multipler * chi2_check || state->_imu->vel().norm() > _zupt_max_velocity)) {
    last_zupt_state_timestamp = 0.0;
    printf(YELLOW "[ZUPT]: rejected |v_IinG| = %.3f (chi2 %.3f > %.3f)\n" RESET, state->_imu->vel().norm(), chi2, _options.chi2_multipler * chi2_check);
    return false;
}
printf(CYAN "[ZUPT]: accepted |v_IinG| = %.3f (chi2 %.3f < %.3f)\n" RESET, state->_imu->vel().norm(), chi2, _options.chi2_multipler * chi2_check);
```

### Inertial-based Detection

$$
\tilde{\mathbf{z}}^{\top}\left(\mathbf{H P H}^{\top}+\alpha \mathbf{R}\right)^{-1} \tilde{\mathbf{z}}<\chi^{2}
$$

```cpp
// Chi2 distance check
// NOTE: we also append the propagation we "would do before the update" if this was to be accepted
// NOTE: we don't propagate first since if we fail the chi2 then we just want to return and do normal logic
Eigen::MatrixXd P_marg = StateHelper::get_marginal_covariance(state, Hx_order);
P_marg.block(3, 3, 6, 6) += Q_bias;
Eigen::MatrixXd S = H * P_marg * H.transpose() + R;
double chi2 = res.dot(S.llt().solve(res));

// Get our threshold (we precompute up to 1000 but handle the case that it is more)
double chi2_check;
if (res.rows() < 1000) {
    chi2_check = chi_squared_table[res.rows()];
} else {
    boost::math::chi_squared chi_squared_dist(res.rows());
    chi2_check = boost::math::quantile(chi_squared_dist, 0.95);
    printf(YELLOW "[ZUPT]: chi2_check over the residual limit - %d\n" RESET, (int)res.rows());
}
```

#### Residual $\tilde{\mathbf{z}}$

To perform update, we create a synthetic "measurement" which says that **the current true acceleration and angular velocity is zero**.

$$
\tilde{\mathbf{z}}=\begin{bmatrix} z_a \\ z_g \end{bmatrix} =
\left[\begin{array}{c}
\mathbf{a}-\left(\mathbf{a}_{m}-\mathbf{b}_{a}-{ }_{G}^{I_{k}} \mathbf{R}^{G} \mathbf{g}-\mathbf{n}_{a}\right) \\
\boldsymbol{\omega}-\left(\boldsymbol{\omega}_{m}-\mathbf{b}_{g}-\mathbf{n}_{g}\right)
\end{array}\right]=\left[\begin{array}{c}
-\left(\mathbf{a}_{m}-\mathbf{b}_{a}-{ }_{G}^{I_{k}} \mathbf{R}^{G} \mathbf{g}-\mathbf{n}_{a}\right) \\
-\left(\boldsymbol{\omega}_{m}-\mathbf{b}_{g}-\mathbf{n}_{g}\right)
\end{array}\right]
\in \mathbb{R}^6
$$

if `integrated_accel_constraint` (**the velocity is zero**), then

$$
z_a = 0 - v_{k+1} = - (v_k +  R_{IG}^T \cdot (a_m - b_a - n_a) \cdot \Delta t - g \cdot \Delta t)
$$

```cpp
// Measurement order is: [w_true = 0, a_true = 0 or v_k+1 = 0]
// w_true = w_m - bw - nw
// a_true = a_m - ba - R*g - na
// v_true = v_k - g*dt + R^T*(a_m - ba - na)*dt

int m_size = 6 * ((int)imu_recent.size() - 1);
Eigen::VectorXd res = Eigen::VectorXd::Zero(m_size);

// Measurement residual (true value is zero)
res.block(6 * i + 0, 0, 3, 1) = -(imu_recent.at(i).wm - state->_imu->bias_g());
if (!integrated_accel_constraint) {
    res.block(6 * i + 3, 0, 3, 1) = -(a_hat - state->_imu->Rot() * _gravity);
} else {
    res.block(6 * i + 3, 0, 3, 1) = -(state->_imu->vel() - _gravity * dt + state->_imu->Rot().transpose() * a_hat * dt);
}
```


#### Measurement Jacobian $H$

$$
\begin{gathered}
\frac{\partial \tilde{\mathbf{z}}}{\partial_{G}^{I_{k}} \mathbf{R}}=-\left\lfloor{ }_{G}^{I_{k}} \mathbf{R}^{G} \mathbf{g} \times\right\rfloor \\
\frac{\partial \tilde{\mathbf{z}}}{\partial \mathbf{b}_{a}}=\frac{\partial \tilde{\mathbf{z}}}{\partial \mathbf{b}_{g}}=-\mathbf{I}_{3 \times 3}
\end{gathered}
$$


```cpp
// State order is: [q_GtoI, bg, ba, v_IinG]

int h_size = (integrated_accel_constraint) ? 12 : 9;
int m_size = 6 * ((int)imu_recent.size() - 1);
Eigen::MatrixXd H = Eigen::MatrixXd::Zero(m_size, h_size);

// Measurement Jacobian
Eigen::Matrix3d R_GtoI_jacob = (state->_options.do_fej) ? state->_imu->Rot_fej() : state->_imu->Rot();
H.block(6 * i + 0, 3, 3, 3) = -Eigen::Matrix3d::Identity();
if (!integrated_accel_constraint) {
    H.block(6 * i + 3, 0, 3, 3) = -skew_x(R_GtoI_jacob * _gravity);
    H.block(6 * i + 3, 6, 3, 3) = -Eigen::Matrix3d::Identity();
} else {
    H.block(6 * i + 3, 0, 3, 3) = -R_GtoI_jacob.transpose() * skew_x(a_hat) * dt;
    H.block(6 * i + 3, 6, 3, 3) = -R_GtoI_jacob.transpose() * dt;
    H.block(6 * i + 3, 9, 3, 3) = Eigen::Matrix3d::Identity();
}
```


### Disparity-based Detection

$$
\frac{1}{N} \sum_{i=0}^{N}\left\|\mathbf{u} \mathbf{v}_{k, i}-\mathbf{u v}_{k-1, i}\right\|<\Delta d
$$

```cpp
// Check if the image disparity
bool disparity_passed = false;
if (override_with_disparity_check) {
    // Get features seen from this image, and the previous image
    double time0_cam = state->_timestamp;
    double time1_cam = timestamp;
    std::vector<std::shared_ptr<Feature>> feats0 = _db->features_containing(time0_cam, false, true);

    // Compute the disparity
    double average_disparity = 0.0;
    double num_features = 0.0;
    for (auto &feat : feats0) {

        // Get the two uvs for both times
        for (auto &campairs : feat->timestamps) {

        // First find the two timestamps
        size_t camid = campairs.first;
        auto it0 = std::find(feat->timestamps.at(camid).begin(), feat->timestamps.at(camid).end(), time0_cam);
        auto it1 = std::find(feat->timestamps.at(camid).begin(), feat->timestamps.at(camid).end(), time1_cam);
        if (it0 == feat->timestamps.at(camid).end() || it1 == feat->timestamps.at(camid).end())
            continue;
        auto idx0 = std::distance(feat->timestamps.at(camid).begin(), it0);
        auto idx1 = std::distance(feat->timestamps.at(camid).begin(), it1);

        // Now lets calculate the disparity
        Eigen::Vector2f uv0 = feat->uvs.at(camid).at(idx0).block(0, 0, 2, 1);
        Eigen::Vector2f uv1 = feat->uvs.at(camid).at(idx1).block(0, 0, 2, 1);
        average_disparity += (uv1 - uv0).norm();
        num_features += 1;
        }
    }

    // Now check if we have passed the threshold
    if (num_features > 0) {
        average_disparity /= num_features;
    }
    disparity_passed = (average_disparity < _zupt_max_disparity && num_features > 20);
    if (disparity_passed) {
        printf(CYAN "[ZUPT]: passed disparity (%.3f < %.3f, %d features)\n" RESET, average_disparity, _zupt_max_disparity, (int)num_features);
    } else {
        printf(YELLOW "[ZUPT]: failed disparity (%.3f > %.3f, %d features)\n" RESET, average_disparity, _zupt_max_disparity,
                (int)num_features);
    }
}
```

## EKF Update

```cpp
// Propagate the state forward in time
double time0_cam = last_zupt_state_timestamp;
double time1_cam = timestamp;
_prop->propagate_and_clone(state, time1_cam);

// Create the update system!
H = Eigen::MatrixXd::Zero(9, 15);
res = Eigen::VectorXd::Zero(9);
R = Eigen::MatrixXd::Identity(9, 9);

// residual (order is ori, pos, vel)
Eigen::Matrix3d R_GtoI0 = state->_clones_IMU.at(time0_cam)->Rot();
Eigen::Vector3d p_I0inG = state->_clones_IMU.at(time0_cam)->pos();
Eigen::Matrix3d R_GtoI1 = state->_clones_IMU.at(time1_cam)->Rot();
Eigen::Vector3d p_I1inG = state->_clones_IMU.at(time1_cam)->pos();
res.block(0, 0, 3, 1) = -log_so3(R_GtoI0 * R_GtoI1.transpose());
res.block(3, 0, 3, 1) = p_I1inG - p_I0inG;
res.block(6, 0, 3, 1) = state->_imu->vel();
res *= -1;

// jacobian (order is q0, p0, q1, p1, v0)
Hx_order.clear();
Hx_order.push_back(state->_clones_IMU.at(time0_cam));
Hx_order.push_back(state->_clones_IMU.at(time1_cam));
Hx_order.push_back(state->_imu->v());
if (state->_options.do_fej) {
    R_GtoI0 = state->_clones_IMU.at(time0_cam)->Rot_fej();
}
H.block(0, 0, 3, 3) = Eigen::Matrix3d::Identity();
H.block(0, 6, 3, 3) = -R_GtoI0;
H.block(3, 3, 3, 3) = -Eigen::Matrix3d::Identity();
H.block(3, 9, 3, 3) = Eigen::Matrix3d::Identity();
H.block(6, 12, 3, 3) = Eigen::Matrix3d::Identity();

// noise (order is ori, pos, vel)
R.block(0, 0, 3, 3) *= std::pow(1e-2, 2);
R.block(3, 3, 3, 3) *= std::pow(1e-1, 2);
R.block(6, 6, 3, 3) *= std::pow(1e-1, 2);

// finally update and remove the old clone
StateHelper::EKFUpdate(state, Hx_order, H, res, R);
StateHelper::marginalize(state, state->_clones_IMU.at(time1_cam));
state->_clones_IMU.erase(time1_cam);
```

## Ref

* https://docs.openvins.com/update-zerovelocity.html

* [基于车体，INS的约束辅助的定位（ZUPT, NHC, ZIHR, ZAWR ）](https://zhuanlan.zhihu.com/p/115529319)