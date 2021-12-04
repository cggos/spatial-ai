---
layout: article
title:  "HoloLens Note"
tags: XR
key: xr-mr-glasses-hololens
---

[TOC]

# Overview

- [https://en.wikipedia.org/wiki/HoloLens_2](https://en.wikipedia.org/wiki/HoloLens_2)
- [https://docs.microsoft.com/zh-cn/hololens/](https://docs.microsoft.com/zh-cn/hololens/)
- [Hololens 2 Display Evaluation (Part 1: LBS Visual Sausage Being Made)](https://kguttag.com/2020/07/04/hololens-2-display-evaluation-part-1-lbs-visual-sausage-being-made/)

# Hololens 硬件

- [https://www.microsoft.com/en-us/hololens/hardware](https://www.microsoft.com/en-us/hololens/hardware)

## 计算平台

- Qualcomm Snapdragon 850
- HPU

### 设备体系结构

- x86 = HoloLens（第一代）
- ARM = HoloLens 2

## 传感器

### 深度相机

一个ToF相机，两种工作模式

- AHAT，高频率 (45 FPS) 用于**手部跟踪**的**近深度运动**。 与第一个版本的短引发模式不同，AHAT 提供伪深度，其相位包装超过 1 米。
- 高引发、低频率 (1-5 FPS) 空间映射使用的**远深度探测**

**Project Kinect for Azure**

<p align="center">
  <img src="../images/hololens/kinect_depth_sensor.png" style="width:80%;"/>
</p>

<div>{%- include extensions/youtube.html id='aa8DzmvLxus' -%}</div>


### VLC Camera

4个，用于头部跟踪

### IR Camera

2个，用于眼部跟踪

### IMU

- Gyro
- Acc
- Mag

### 麦克风阵列

- 5通道

## 光学组件

- 光引擎
    - 波导
- 组合器

## 其他

- 散热
    - 神经网络：识别 先粗再细
- 材料
    - 碳纤维

# 功能分析

- 头部跟踪
- 眼部跟踪
- 手势识别
- 空间建图
- 空间定位

# Microsoft HoloLens App

Windows 10 上无法连接设备？？？

# Windows 设备门户

- ref: [使用 Windows 设备门户](https://docs.microsoft.com/zh-cn/windows/mixed-reality/develop/advanced-concepts/using-the-windows-device-portal)
- Wifi
    - HoloLens 和 PC 处于同一局域网
    - 浏览器
        - 登录：`https://<HOLOLENS-IP>` （目前用户名和密码：hongchen）
        - 配置：`https://<HOLOLENS-IP>/devicepair.htm` (新建用户名和密码，有则忽略)
- USB（TODO: `127.0.0.1:10080` ???）
    - 浏览器
        - `https://<UsbNcm-IP>`

# HoloLens 研究模式

- ref
    - [HoloLens 研究模式](https://docs.microsoft.com/zh-cn/windows/mixed-reality/develop/advanced-concepts/research-mode)
    - [Advancing the MR Experience with HoloLens 2 Research Mode](https://valoremreply.com/post/hololens_research_mode/)
- 在 **Windows 设备门户** 打开 **研究模式**:
    - System -> Research mode -> Allow access to sensor streams
- Raw sensor data
    - [Getting raw data from sensors](https://forums.hololens.com/discussion/9671/getting-raw-data-from-sensors)
    - 需要打开 **HoloLens 研究模式**
    

# HoloLensForCV

- https://github.com/microsoft/HoloLensForCV

# HoloLens2ForCV

- https://github.com/cggos/HoloLens2ForCV

## 开发环境

- 根据工程中文档说明安装相关工具

## 部署样例

- Visual Studio 打开某一工程，例如 SensorVisualization
- 配置管理器：`Debug | ARM64`
- 部署
    - USB（**调试器** 选择 **设备**）
    - WiFi（**调试器** 选择 **远程计算机**，输入 **Hololens IP地址**）
- 构建
- 调试运行

注意： 

- 第一次连接设备运行需要PIN码（Hololens开发人员选项->配对）
- 每个应用第一次部署，需要在Hololens端 同意访问Camera，否则会报“拒绝访问”的错误
- 应用部署前，需要设备处于登录状态，否则会报“拒绝访问”的错误

## Samples

### SensorVisualization

<p align="center">
  <img src="../images/hololens/holo2_sensor_vis.jpg" style="width:100%;"/>
</p>

### StreamRecorder

- StreamRecorderApp
    - files
        - xxx_head_hand_eye.csv
        - xxx_pv.txt
        - Depth Long Throw_extrinsics.txt
        - Depth Long Throw_lut.bin
        - Depth Long Throw_rig2world.txt
        - Depth Long Throw.tar
        - PV.tar
    - plot rig2world.txt
        
        ```bash
        # get rig2world.kitti
        python StreamRecorderConverter/rig2world_to_kitti.py --dir ./output/2021-11-17-223707/
        
        # evo
        evo_traj kitti rig2world.kitti -p --plot_mode xz
        ```
        
- StreamRecorderConverter

  - scripts

    ```bash
    python StreamRecorderConverter/recorder_console.py --workspace_path ./output/  --dev_portal_username hongchen --dev_portal_password hongchen --dev_portal_address 192.168.1.100
    
    # or only process all
    python StreamRecorderConverter/process_all.py --recording_path output/2021-11-17-223707/
    ```
    
  - issues
    
    - Q: ssl.SSLCertVerificationError: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1091)
    - A: And uncheck **SSL connection** from **Preferences** under **system** at **Windows Device Portal**.
    
  - output
    
    ```
    dev_portal_address 192.168.1.102
    Connecting to HoloLens Device Portal...
    => Connected to HoloLens at address: http://192.168.1.102
    Searching for StreamRecorder application...
    => Found StreamRecorder application with name: 31fa9d1a-a222-4878-a6fc-77aff92195b5_1.0.0.0_arm64__ph1m9x8skttmg
    Searching for recordings...
    => Found a total of 7 recordings
    
    Available commands:
      help:                     Print this help message
      exit:                     Exit the console loop
      list:                     List all recordings
      list_device:              List all recordings on the HoloLens
      list_workspace:           List all recordings in the workspace
      download X:               Download recording X from the HoloLens
      download_all:             Download all recordings from the HoloLens
      delete X:                 Delete recording X from the HoloLens
      delete_all:               Delete all recordings from the HoloLens
      process X:                Process recording X 
    
    [     0]  2021-11-03-005026
    [     1]  2021-11-17-223707
    [     2]  2021-11-18-003216
    [     3]  2021-11-18-004432
    [     4]  2021-11-18-005937
    [     5]  2021-11-18-011202
    [     6]  2021-11-18-012204
    Welcome to the recorder shell.   Type help or ? to list commands.
    
    (recorder console) ?
    Available commands:
      help:                     Print this help message
      exit:                     Exit the console loop
      list:                     List all recordings
      list_device:              List all recordings on the HoloLens
      list_workspace:           List all recordings in the workspace
      download X:               Download recording X from the HoloLens
      download_all:             Download all recordings from the HoloLens
      delete X:                 Delete recording X from the HoloLens
      delete_all:               Delete all recordings from the HoloLens
      process X:                Process recording X 
    (recorder console) list
    Device recordings:
    [     0]  2021-11-03-005026
    [     1]  2021-11-17-223707
    [     2]  2021-11-18-003216
    [     3]  2021-11-18-004432
    [     4]  2021-11-18-005937
    [     5]  2021-11-18-011202
    [     6]  2021-11-18-012204
    Workspace recordings:
    => No recordings found in workspace
    
    (recorder console) download 1
    Downloading recording 2021-11-17-223707...
    => Downloading: 2021-11-17-223707_head_hand_eye.csv
    => Downloading: 2021-11-17-223707_pv.txt
    => Downloading: Depth Long Throw.tar
    => Downloading: Depth Long Throw_extrinsics.txt
    => Downloading: Depth Long Throw_lut.bin
    => Downloading: Depth Long Throw_rig2world.txt
    => Downloading: PV.tar
    
    (recorder console) 
    Downloading recording 2021-11-17-223707...
    => Skipping, already downloaded: 2021-11-17-223707_head_hand_eye.csv
    => Skipping, already downloaded: 2021-11-17-223707_pv.txt
    => Skipping, already downloaded: Depth Long Throw.tar
    => Skipping, already downloaded: Depth Long Throw_extrinsics.txt
    => Skipping, already downloaded: Depth Long Throw_lut.bin
    => Skipping, already downloaded: Depth Long Throw_rig2world.txt
    => Skipping, already downloaded: PV.tar
    (recorder console) process 1
    => Recording does not exist
    (recorder console) process 2
    => Recording does not exist
    
    (recorder console) list
    Device recordings:
    [     0]  2021-11-03-005026
    [     1]  2021-11-17-223707
    [     2]  2021-11-18-003216
    [     3]  2021-11-18-004432
    [     4]  2021-11-18-005937
    [     5]  2021-11-18-011202
    [     6]  2021-11-18-012204
    Workspace recordings:
    [     0]  2021-11-17-223707
    
    (recorder console) process 0
    Extracting output/2021-11-17-223707/Depth Long Throw.tar
    Extracting output/2021-11-17-223707/PV.tar
    Processing images
    .....................................................................................................................
    Saving point clouds
    .....................................................................................................................
    Average PV delta: -0.171ms, fps: -5860.911
    Average Depth Long Throw delta: -22.223ms, fps: -44.999
    Average hand/head delta: 17.628ms, fps: 56.728
    (recorder console)
    ```
    

# 软件开发

## **Core App (C++/WinRT)**

- [https://docs.microsoft.com/en-us/windows/uwp/cpp-and-winrt-apis/intro-to-using-cpp-with-winrt](https://docs.microsoft.com/zh-cn/windows/uwp/cpp-and-winrt-apis/intro-to-using-cpp-with-winrt)

## Research Mode API

- Research Mode API is based on a light-weight derivation of COM called **Nano-COM**.
- **ResearchModeApi.h**
    
    ```cpp
    struct AccelDataStruct
    {
        uint64_t VinylHupTicks;
        uint64_t SocTicks;
        float AccelValues[3];
        float temperature;
    };
    
    struct GyroDataStruct
    {
        uint64_t VinylHupTicks;
        uint64_t SocTicks;
        float GyroValues[3];
        float temperature;
    };
    
    struct MagDataStruct
    {
        uint64_t VinylHupTicks;
        uint64_t SocTicks;
        float MagValues[3];
    };
    
    enum ResearchModeSensorType
    {
        LEFT_FRONT,
        LEFT_LEFT,
        RIGHT_FRONT,
        RIGHT_RIGHT,
        DEPTH_AHAT,
        DEPTH_LONG_THROW,
        IMU_ACCEL,
        IMU_GYRO,
        IMU_MAG
    };
    
    DECLARE_INTERFACE_IID_(IResearchModeSensorVLCFrame, IUnknown, "5C693123-3851-4FDC-A2D9-51C68AF53976")
    {
        STDMETHOD(GetBuffer(
            _Outptr_ const BYTE **ppBytes,
            _Out_ size_t *pBufferOutLength)) = 0;
        STDMETHOD(GetGain(
            _Out_ UINT32 *pGain)) = 0;
        STDMETHOD(GetExposure(
            _Out_ UINT64 *pExposure)) = 0;
    };
    
    DECLARE_INTERFACE_IID_(IResearchModeSensorDepthFrame, IUnknown, "35167E38-E020-43D9-898E-6CB917AD86D3")
    {
        STDMETHOD(GetBuffer(
            _Outptr_ const UINT16 **ppBytes,
            _Out_ size_t *pBufferOutLength)) = 0;
        STDMETHOD(GetAbDepthBuffer(
            _Outptr_ const UINT16 **ppBytes,
            _Out_ size_t *pBufferOutLength)) = 0;
        STDMETHOD(GetSigmaBuffer(
            _Outptr_ const BYTE **ppBytes,
            _Out_ size_t *pBufferOutLength)) = 0;
    };
    
    DECLARE_INTERFACE_IID_(IResearchModeAccelFrame, IUnknown, "42AA75F8-E3FE-4C25-88C6-F2ECE1E8A2C5")
    {
        STDMETHOD(GetCalibratedAccelaration(
            _Out_ DirectX::XMFLOAT3 *pAccel)) = 0;
        STDMETHOD(GetCalibratedAccelarationSamples(
            _Outptr_ const AccelDataStruct **ppAccelBuffer,
            _Out_ size_t *pBufferOutLength)) = 0;
    };
    
    DECLARE_INTERFACE_IID_(IResearchModeGyroFrame, IUnknown, "4C0C5EE7-CBB8-4A15-A81F-943785F524A6")
    {
        STDMETHOD(GetCalibratedGyro(
            _Out_ DirectX::XMFLOAT3 *pGyro)) = 0;
        STDMETHOD(GetCalibratedGyroSamples(
            _Outptr_ const GyroDataStruct **ppAccelBuffer,
            _Out_ size_t *pBufferOutLength)) = 0;
    };
    
    DECLARE_INTERFACE_IID_(IResearchModeMagFrame, IUnknown, "2376C9D2-7F3D-456E-A39E-3B7730DDA9E5")
    {
        STDMETHOD(GetMagnetometer(
            _Out_ DirectX::XMFLOAT3 *pMag)) = 0;
        STDMETHOD(GetMagnetometerSamples(
            _Outptr_ const MagDataStruct **ppMagBuffer,
            _Out_ size_t *pBufferOutLength)) = 0;
    };
    ```