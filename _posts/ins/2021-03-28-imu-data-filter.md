---
layout: article
title:  "IMU数据滤波"
tags: INS
key: imu-data-filter
---

[TOC]

# 一阶低通滤波

一阶低通滤波，又叫 **一阶惯性滤波**，其算法公式为：

$$
Y_k = \alpha X_k + (1-\alpha) Y_{k-1}
$$

根据安卓开发者文档中提供的低通滤波算法：

```java
// https://developer.android.com/guide/topics/sensors/sensors_motion#java
public void onSensorChanged(SensorEvent event){
    // In this example, alpha is calculated as t / (t + dT),
    // where t is the low-pass filter's time-constant and
    // dT is the event delivery rate.

    final float alpha = 0.8;

    // Isolate the force of gravity with the low-pass filter.
    gravity[0] = alpha * gravity[0] + (1 - alpha) * event.values[0];
    gravity[1] = alpha * gravity[1] + (1 - alpha) * event.values[1];
    gravity[2] = alpha * gravity[2] + (1 - alpha) * event.values[2];

    // Remove the gravity contribution with the high-pass filter.
    linear_acceleration[0] = event.values[0] - gravity[0];
    linear_acceleration[1] = event.values[1] - gravity[1];
    linear_acceleration[2] = event.values[2] - gravity[2];
}
```

我实现了加速度的一阶低通滤波算法：

```python
# https://github.com/cggos/sensor_imu/blob/master/script/sensor_imu.py#L285-L293
alpha = 0.8
self.AccTmp[0] = alpha * self.AccTmp[0] + (1-alpha) * msg.linear_acceleration.x
self.AccTmp[1] = alpha * self.AccTmp[1] + (1-alpha) * msg.linear_acceleration.y
self.AccTmp[2] = alpha * self.AccTmp[2] + (1-alpha) * msg.linear_acceleration.z
msg.linear_acceleration.x = self.AccTmp[0]
msg.linear_acceleration.y = self.AccTmp[1]
msg.linear_acceleration.z = self.AccTmp[2]
self.imu_pub_filter.publish(msg)
```

效果如图所示：

<p align="center">
    <img src="../images/ins/imu_lpf.png"/>
</p>

可以看到滤波效果明显，并且具有滞后性。
