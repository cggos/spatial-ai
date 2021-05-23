---
layout: article
title: "VINS-Mono LoopClosure"
tags: SLAM
key: slam-vinsmono-loopclosure
---

[TOC]

# Overview

<p align="center">
  <img src="../images/vins_mono/vinsmono_loopclosure.png" style="width:100%;"/>
</p>

<p align="center">
  <img src="../images/vins_mono/vinsmono_loopclosure.jpg" style="width:100%;"/>
</p>

* 忽略掉了 **shift to base frame**：`w_t_vio`, `w_r_vio`

# loop closure 初始化

* PoseGraph 设置
  - 设置参数
  - 启动线程 `PoseGraph::optimize4DoF` 或 `PoseGraph::optimize6DoF`
  - 加载 词典文件

* 启动线程 `SystemROS::loop_closing`

# 线程 loop_closing

* 获取同步的图像、位姿、2D与3D点信息
  - img
  - pose
  - `point_id`, `point_3d`, `point_2d_uv`, `point_2d_normal`

* 构建 KeyFrame
  - KeyFrame 成员变量初始化
  - `computeWindowBRIEFPoint`: 根据 `point_2d_uv` 生成 `window_keypoints`， 计算其对应的描述子 `window_brief_descriptors`
  - `computeBRIEFPoint`: 提取 `FAST` 特征点，一起和 `point_2d_uv` 放到 `keypoints`，计算其描述子 `brief_descriptors` 和 `keypoints_norm`

* addKeyFrame
  - cur_kf->index = global_index++;
  - loop_index = **detectLoop**(cur_kf, cur_kf->index)
    - `db.query(keyframe->brief_descriptors, ret, 3, max_frame_id_allowed)`
    - `db.add(keyframe->brief_descriptors);`
  - KeyFrame* old_kf = getKeyFrame(loop_index)
  - cur_kf->**findConnection**(old_kf)
    - `point_2d_uv` --> `point_2d_norm`
    - `old_kf->keypoints` --> `old_kf->keypoints_norm`
    - **searchByBRIEFDes**: `window_brief_descriptors` <--> `old_kf->brief_descriptors` --> `matched_2d_old_norm`
    - **PnP RANSAC** (利用PnP得到回环帧位姿): `matched_3d` <--> `matched_2d_old_norm` --> `PnP_T_old, PnP_R_old`
    - get **loop_info** (计算PnP得到的回环帧的位姿与当前帧位姿的相对变换): `relative_t`, `relative_q`, `relative_yaw`
  - earliest_loop_index = loop_index;
  - **optimize_buf**: `optimize_buf.push(cur_kf->index);`
  - **updatePose**
    ```cpp
    cur_kf->getVioPose(P, R);
    P = r_drift * P + t_drift;
    R = r_drift * R;
    cur_kf->updatePose(P, R);
    ```
  - **keyframelist**: `keyframelist.push_back(cur_kf);`


# 线程 optimize4DoF

* get `first_looped_index` and `cur_index`
  ```cpp
  while (!optimize_buf.empty()) {
      cur_index = optimize_buf.front();
      first_looped_index = earliest_loop_index;
      optimize_buf.pop();
  }
  ```

* ceres solver 优化
  - 遍历 `keyframelist`， 忽略 `first_looped_index` 之前的 keyframe，直到 `cur_index`
  - getVioPose --> `t_array`, `q_array`, `euler_array`
  - problem.AddParameterBlock: `euler_array`, `t_array`
  - problem.SetParameterBlockConstant: `first_looped_index`
  - problem.AddResidualBlock
    - 相邻帧约束关系
    - 回环边和顶点
  - ceres::Solve(options, &problem, &summary);

* **updatePose**
  - 遍历 `keyframelist`， 忽略 `first_looped_index` 之前的 keyframe，直到 `cur_index`
  - updatePose: `euler_array`, `t_array`

* get **drift**: `yaw_drift`, `r_drift`, `t_drift`
  $$
  T_{drift} = T_{opt} * T_{vio}^{-1}
  $$

* **updatePose**
  - 遍历 `cur_index` 之后的 `keyframelist`
  - updatePose
    ```cpp
    (it)->getVioPose(P, R);
    P = r_drift * P + t_drift;
    R = r_drift * R;
    (it)->updatePose(P, R);
    ```

* updatePath
  - 遍历 `keyframelist`，获取位姿 `getPose` 给 `Path`


# 线程 optimize6DoF

# FAST_RELOCALIZATION

* cur_kf->**findConnection**(old_kf)
  - publish: 回环帧的 `matched_2d_old_norm`, `matched_id`, `T_wi`

* relocalization_callback
  - subscribe: get `relo_buf`

* process loop
  - get latest `relo_msg` from `relo_buf`
  - `estimator.setReloFrame(frame_stamp, frame_index, match_points, relo_t, relo_r);`
    - `relo_frame_index`
    - `match_points`
    - `prev_relo_t`
    - `prev_relo_r`
    - `relo_Pose` <-- `para_Pose`
    - `relo_frame_local_index` <-- i
    - `relocalization_info = 1`

* optimization
  - `problem.AddParameterBlock`: `relo_Pose`
  - `problem.AddResidualBlock`

* double2vector(?????)
  - `drift_correct_r`, `drift_correct_t`
  - `relo_relative_q`, `relo_relative_t`, `relo_relative_yaw`

* publish
  - pub_relo_path
    - `drift_correct_r`, `drift_correct_t` + `estimator.Ps[WINDOW_SIZE]` --> `correct_t`, `correct_q`
  - pub_relo_relative_pose (`relo_relative_pose`)
    - `relo_relative_q`, `relo_relative_t`, `relo_relative_yaw`

* relo_relative_pose_callback
  - loop_info <-- `relo_relative_pose`
  - `posegraph.updateKeyFrameLoop(index, loop_info);`
    - get **drift**: `yaw_drift`, `r_drift`, `t_drift`
