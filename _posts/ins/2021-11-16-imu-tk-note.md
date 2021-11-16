---
layout: article
title:  "imu_tk note"
tags: INS
key: imu-tk-note
---

[TOC]

# Overview

本文以标定 **Realsense D435i** 为例。

加速度计的标定利用了加速度计在静止状态下的三轴数据模值等于重力加速度这一条件，采集加速度计在不同状态的静止数据，通过优化算法即可求出标定参数。加速度计单独即可完成标定，陀螺仪的标定需要加速度计数据的参与，所以需要先标定好加速度计。在标定陀螺仪时，IMU从静止状态A，通过一段时间，到了静止状态B，通过陀螺仪可以算出来A到B的旋转矩阵，而通过加速度数据也可以算出来A到B的旋转矩阵，最小化这一差异即可实现优化求解。

## Code

- https://github.com/cggos/imu_tk
    - [https://zhuanlan.zhihu.com/p/315266927](https://zhuanlan.zhihu.com/p/315266927)
- imu_tk ROS
    - https://github.com/Neil-Oyoung/imu_tk
    - [Use imu_utils and imu_tk to calibrate the deterministic error and random error of imu](https://blog.titanwolf.in/a?ID=01500-ca6ff259-1400-4da2-80c2-18ae187a51bf)

# Collect IMU data

- Procedure:
    1. Left the IMU static for 50 seconds.
    2. Rotate the IMU and then lay it in a different attitude.
    3. Wait for at least 1 seconds.
    4. Have you rotated the IMU 36 ~ 50 times? If not, go back to step 2.
    5. Done.

    <p align="center">
      <img src="../images/ins/imutk_process.png">
    </p>

- 录制 rosbag

    ```bash
    # start
    roslaunch realsense2_camera rs_camera.launch

    # record
    rosbag record /camera/imu
    ```

- rosbag 转 csv 文件

    ```bash
    kalibr_bagextractor --bag ~/Downloads/imu_d435i_imu_tk.bag --imu-topics /camera/imu
    ```

- 拆分 csv 文件 为 acc.mat 和 gyro.mat
    - mat数据格式为：时间戳（单位为秒） X轴数据 Y轴数据 Z轴数据，文本的格式为UTF-8无BOM

# Build

需要修改代码里的offset和scale，把offset设置为0，把scale设置为1

```cpp
// test_imu_calib.cpp
init_acc_calib.setBias( Vector3d(0, 0, 0) );
init_gyro_calib.setScale( Vector3d(1.0, 1.0, 1.0) );

mp_calib.setGravityMagnitude(9.8016); // 9.81744
```

# Run

```bash
cd bin/
./test_imu_calib acc.mat gyro.mat
```

## Output

<p align="center">
  <img src="../images/ins/imutk_output.png" style="width:100%"/>
</p>

```
Importing IMU data from the Matlab matrix file : /home/cg/Downloads/acc_d435i.mat
Importing IMU data from the Matlab matrix file : /home/cg/Downloads/gyr_d435i.mat
Accelerometers calibration: calibrating...
Accelerometers calibration: extracted 46 intervals using threshold multiplier 2 -> Trying calibrate...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  7.303187e+01    0.00e+00    1.16e+03   0.00e+00   0.00e+00  1.00e+04        0    7.22e-03    7.64e-03
   1  2.903204e-01    7.27e+01    5.90e+01   2.87e-01   1.00e+00  3.00e+04        1    8.33e-03    1.60e-02
   2  2.617510e-01    2.86e-02    1.15e-02   3.27e-03   1.00e+00  9.00e+04        1    7.94e-03    2.40e-02
residual 0.261751
Accelerometers calibration: extracted 46 intervals using threshold multiplier 3 -> Trying calibrate...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  7.320660e+01    0.00e+00    1.17e+03   0.00e+00   0.00e+00  1.00e+04        0    7.39e-03    7.68e-03
   1  2.920290e-01    7.29e+01    5.97e+01   2.87e-01   1.00e+00  3.00e+04        1    8.28e-03    1.60e-02
   2  2.637732e-01    2.83e-02    1.15e-02   3.30e-03   1.00e+00  9.00e+04        1    7.47e-03    2.35e-02
residual 0.263773
Accelerometers calibration: extracted 46 intervals using threshold multiplier 4 -> Trying calibrate...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  7.320781e+01    0.00e+00    1.17e+03   0.00e+00   0.00e+00  1.00e+04        0    6.83e-03    7.05e-03
   1  2.906375e-01    7.29e+01    5.99e+01   2.87e-01   1.00e+00  3.00e+04        1    7.65e-03    1.47e-02
   2  2.624371e-01    2.82e-02    1.14e-02   3.27e-03   1.00e+00  9.00e+04        1    7.99e-03    2.27e-02
residual 0.262437
Accelerometers calibration: extracted 46 intervals using threshold multiplier 5 -> Trying calibrate...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  7.316700e+01    0.00e+00    1.17e+03   0.00e+00   0.00e+00  1.00e+04        0    7.16e-03    7.64e-03
   1  2.997427e-01    7.29e+01    6.00e+01   2.87e-01   1.00e+00  3.00e+04        1    7.92e-03    1.56e-02
   2  2.717076e-01    2.80e-02    1.17e-02   3.22e-03   1.00e+00  9.00e+04        1    7.55e-03    2.31e-02
residual 0.271708
Accelerometers calibration: extracted 46 intervals using threshold multiplier 6 -> Trying calibrate...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  7.318641e+01    0.00e+00    1.17e+03   0.00e+00   0.00e+00  1.00e+04        0    6.83e-03    7.18e-03
   1  2.925727e-01    7.29e+01    6.03e+01   2.88e-01   1.00e+00  3.00e+04        1    7.51e-03    1.47e-02
   2  2.646989e-01    2.79e-02    1.15e-02   3.19e-03   1.00e+00  9.00e+04        1    8.01e-03    2.27e-02
residual 0.264699
Accelerometers calibration: extracted 46 intervals using threshold multiplier 7 -> Trying calibrate...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  7.322846e+01    0.00e+00    1.16e+03   0.00e+00   0.00e+00  1.00e+04        0    7.31e-03    7.56e-03
   1  2.962436e-01    7.29e+01    6.06e+01   2.88e-01   1.00e+00  3.00e+04        1    7.85e-03    1.55e-02
   2  2.684434e-01    2.78e-02    1.12e-02   3.14e-03   1.00e+00  9.00e+04        1    7.80e-03    2.33e-02
residual 0.268443
Accelerometers calibration: extracted 46 intervals using threshold multiplier 8 -> Trying calibrate...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  7.324374e+01    0.00e+00    1.16e+03   0.00e+00   0.00e+00  1.00e+04        0    7.08e-03    7.37e-03
   1  2.997994e-01    7.29e+01    6.07e+01   2.88e-01   1.00e+00  3.00e+04        1    7.45e-03    1.48e-02
   2  2.720214e-01    2.78e-02    1.10e-02   3.10e-03   1.00e+00  9.00e+04        1    7.58e-03    2.24e-02
residual 0.272021
Accelerometers calibration: extracted 46 intervals using threshold multiplier 9 -> Trying calibrate...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  7.325722e+01    0.00e+00    1.16e+03   0.00e+00   0.00e+00  1.00e+04        0    6.96e-03    7.21e-03
   1  3.011574e-01    7.30e+01    6.06e+01   2.88e-01   1.00e+00  3.00e+04        1    7.99e-03    1.52e-02
   2  2.733308e-01    2.78e-02    1.11e-02   3.11e-03   1.00e+00  9.00e+04        1    7.87e-03    2.31e-02
residual 0.273331
Accelerometers calibration: extracted 46 intervals using threshold multiplier 10 -> Trying calibrate...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  7.330019e+01    0.00e+00    1.16e+03   0.00e+00   0.00e+00  1.00e+04        0    7.13e-03    7.45e-03
   1  3.019769e-01    7.30e+01    6.05e+01   2.88e-01   1.00e+00  3.00e+04        1    7.92e-03    1.54e-02
   2  2.740658e-01    2.79e-02    1.11e-02   3.12e-03   1.00e+00  9.00e+04        1    7.40e-03    2.28e-02
residual 0.274066
Accelerometers calibration: Better calibration obtained using threshold multiplier 2 with residual 0.261751
Misalignment Matrix
         1 -0.0010374 0.00307749
         0          1 -0.0119756
        -0          0          1
Scale Matrix
0.999201        0        0
       0  1.00004        0
       0        0  1.00224
Bias Vector
-0.0746601
1.5056e-05
  0.276673

Accelerometers calibration: inverse scale factors:
1.0008
0.999961
0.997769

Press Enter to continue

Gyroscopes calibration: calibrating...
iter      cost      cost_change  |gradient|   |step|    tr_ratio  tr_radius  ls_iter  iter_time  total_time
   0  5.638980e-03    0.00e+00    3.06e-01   0.00e+00   0.00e+00  1.00e+04        0    1.21e-01    1.21e-01
   1  1.007029e-03    4.63e-03    3.78e-03   1.86e-02   9.99e-01  3.00e+04        1    1.23e-01    2.44e-01
   2  1.006868e-03    1.61e-07    2.28e-06   7.60e-05   1.00e+00  9.00e+04        1    1.25e-01    3.69e-01

Solver Summary (v 2.0.0-eigen-(3.3.4)-lapack-suitesparse-(5.1.2)-cxsparse-(3.1.9)-eigensparse-no_openmp)

                                     Original                  Reduced
Parameter blocks                            1                        1
Parameters                                  9                        9
Residual blocks                            45                       45
Residuals                                 135                      135

Minimizer                        TRUST_REGION

Dense linear algebra library            EIGEN
Trust region strategy     LEVENBERG_MARQUARDT

                                        Given                     Used
Linear solver                        DENSE_QR                 DENSE_QR
Threads                                     1                        1
Linear solver ordering              AUTOMATIC                        1

Cost:
Initial                          5.638980e-03
Final                            1.006868e-03
Change                           4.632113e-03

Minimizer iterations                        3
Successful steps                            3
Unsuccessful steps                          0

Time (in seconds):
Preprocessor                         0.000056

  Residual only evaluation           0.008886 (3)
  Jacobian & residual evaluation     0.363018 (3)
  Linear solver                      0.000043 (3)
Minimizer                            0.372046

Postprocessor                        0.000003
Total                                0.372105

Termination:                      CONVERGENCE (Function tolerance reached. |cost_change|/cost: 1.906368e-10 <= 1.000000e-06)

Gyroscopes calibration: residual 0.00100687
Misalignment Matrix
          1 -0.00349484   0.0091083
 0.00376498           1  0.00256356
 -0.0125506 -0.00301254           1
Scale Matrix
0.997587        0        0
       0 0.994327        0
       0        0 0.994757
Bias Vector
-0.00401266
  -0.001156
 0.00173263

Gyroscopes calibration: inverse scale factors:
1.00242
1.00571
1.00527
```

- test_imu_acc.calib

    ```
    Accelerometers calibration: Better calibration obtained using threshold multiplier 2 with residual 0.261751

    Misalignment Matrix
             1 -0.0010374 0.00307749
             0          1 -0.0119756
            -0          0          1
    Scale Matrix
    0.999201        0        0
           0  1.00004        0
           0        0  1.00224
    Bias Vector
    -0.0746601
    1.5056e-05
      0.276673

    Accelerometers calibration: inverse scale factors:
    1.0008
    0.999961
    0.997769
    ```

- test_imu_gyro.calib

    ```
    Gyroscopes calibration: residual 0.00100687
    Misalignment Matrix
              1 -0.00349484   0.0091083
     0.00376498           1  0.00256356
     -0.0125506 -0.00301254           1
    Scale Matrix
    0.997587        0        0
           0 0.994327        0
           0        0 0.994757
    Bias Vector
    -0.00401266
      -0.001156
     0.00173263

    Gyroscopes calibration: inverse scale factors:
    1.00242
    1.00571
    1.00527
    ```


# Correction

* code: https://github.com/cggos/imu_tools/tree/kinetic/imu_calib/imu_tk

Given a raw sensor reading X (e.g., the acceleration ), the calibrated "unbiased" reading X' is obtained.

$$x^\prime = T \cdot K \cdot (x - b)$$

```
Misalignment matrix:

    [    1     -mis_yz   mis_zy  ]
T = [  mis_xz     1     -mis_zx  ]
    [ -mis_xy   mis_yx     1     ]

Scale matrix:

    [  s_x      0        0  ]
K = [   0      s_y       0  ]
    [   0       0       s_z ]

Bias vector:

    [ b_x ]
B = [ b_y ]
    [ b_z ]

X' = T*K*(X - B)
```

## Accelerator

<p align="center">
  <img src="../images/ins/imutk_acc_corrected.png" style="width:100%"/>
</p>
