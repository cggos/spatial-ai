---
layout: article
title:  "Photometric Calibration"
tags: ComputerVision
key: photometric-calibration
---

[TOC]

# Overview

- [https://github.com/tum-vision/mono_dataset_code](https://github.com/tum-vision/mono_dataset_code)
- [https://blog.csdn.net/KYJL888/article/details/104893357](https://blog.csdn.net/KYJL888/article/details/104893357)
- [https://github.com/tum-vision/online_photometric_calibration](https://github.com/tum-vision/online_photometric_calibration)

## Install

安装aruco marker dection，用来标定渐晕

```bash
cd mono_dataset_code/thirdparty
tar -zxvf aruco-1.3.0.tar.gz
cd aruco-1.3.0/
mkdir build
cd build
cmake ..
make
sudo make install
```

## playDataset

```bash
./bin/playDataset ~/projects/dataset/tum/sequence_01/
```

optionally, the calibration is used for

- rectification ( r )
- response function inversion ( g )
- vignette removal ( v )
- removal of over-exposed (white) images. ( o ).

Pressing the respective key toggles the option.

## responseCalib: calibrate response function

### dataset: narrow_sweep3 (同一场景，曝光时间变化)

- images.zip
- times.txt (id, timestamp, exposure time)
- camera.txt (Calibration file: [http://wiki.ros.org/ptam/cameracalibrator](http://wiki.ros.org/ptam/cameracalibrator))
    
    ```
    fx/width fy/height cx/width cy/height d
    in_width in_height
    "crop" / "full" / "none" / "e1 e2 e3 e4 0"
    out_width out_height
    ```
    
- pcalib.txt (Photometric Calibration) (optional)

<div>{%- include extensions/video.html src='https://vision.cs.tum.edu/mono/video_calib_preview/calib_narrow_sweep3_5x.mp4' -%}</div>

### run

```bash
./bin/responseCalib ~/projects/dataset/tum/calib_narrow_sweep3/
```

### output (photoCalibResult):

<p align="center">
  <img src="../images/photometric_calib/calib_response.png" style="width:100%;"/>
</p>

标定结果存储于 mono_dataset_code/bin/photoCalibResult/ 中

- E-0.png存储初始的辐照度，初值值设置为所有图片对应像素的平均值
- E-%d.png 每次优化过后场景辐照度的值
- E-%d16.png 归一化到255*255上的图片
- G-%d.png 每次迭代后的响应曲线
- pcalib.txt 响应曲线U

log:

```
Load Dataset /home/cg/projects/dataset/tum/calib_narrow_sweep3/: found no in folder /images; assuming that images are zipped.
got 1134 entries and 1134 files from zipfile!
Input resolution: 1280 1024
Input Calibration (fx fy cx cy): 685.720764 685.636475 631.358154 512.418457 0.897966
Out: Crop
Output resolution: 640 480
new K: 277.523987 291.680328 312.474304 240.035583
old K: 685.720764 685.636475 630.858154 511.918457
Reading Photometric Calibration from file /home/cg/projects/dataset/tum/calib_narrow_sweep3/pcalib.txt
PhotometricUndistorter: Could not open file!
Dataset /home/cg/projects/dataset/tum/calib_narrow_sweep3/: Got 1134 files!
loaded 1134 images
init RMSE = 202.516842! 	Irradiance 0.094356 - 255.000000
optG RMSE = 64.865443! 	Inv. Response 2.361527 - 612.030157
OptE RMSE = 9.717671!  	Irradiance 0.231759 - 7458.561565
resc RMSE = 4.048830!  	rescale with 0.416646!

optG RMSE = 2.372160! 	Inv. Response 0.732493 - 286.883998
OptE RMSE = 2.098267!  	Irradiance 0.073330 - 3107.388651
resc RMSE = 1.865068!  	rescale with 0.888861!
optG RMSE = 1.834344! 	Inv. Response 0.638839 - 257.705476
OptE RMSE = 1.830208!  	Irradiance 0.064087 - 2760.662528
resc RMSE = 1.810994!  	rescale with 0.989502!
optG RMSE = 1.809984! 	Inv. Response 0.630362 - 255.116903
OptE RMSE = 1.809334!  	Irradiance 0.063252 - 2729.932064
resc RMSE = 1.808505!  	rescale with 0.999542!
optG RMSE = 1.807896! 	Inv. Response 0.629496 - 254.860585
OptE RMSE = 1.807293!  	Irradiance 0.063167 - 2726.871591
resc RMSE = 1.808282!  	rescale with 1.000547!
optG RMSE = 1.807679! 	Inv. Response 0.629402 - 254.833424
OptE RMSE = 1.807077!  	Irradiance 0.063158 - 2726.545993
resc RMSE = 1.808258!  	rescale with 1.000654!
optG RMSE = 1.807655! 	Inv. Response 0.629391 - 254.830437
OptE RMSE = 1.807053!  	Irradiance 0.063157 - 2726.510104
resc RMSE = 1.808255!  	rescale with 1.000665!
optG RMSE = 1.807653! 	Inv. Response 0.629390 - 254.830103
OptE RMSE = 1.807050!  	Irradiance 0.063156 - 2726.506082
resc RMSE = 1.808255!  	rescale with 1.000667!
optG RMSE = 1.807652! 	Inv. Response 0.629390 - 254.830065
OptE RMSE = 1.807050!  	Irradiance 0.063156 - 2726.505628
resc RMSE = 1.808255!  	rescale with 1.000667!
optG RMSE = 1.807652! 	Inv. Response 0.629390 - 254.830061
OptE RMSE = 1.807050!  	Irradiance 0.063156 - 2726.505576
resc RMSE = 1.808255!  	rescale with 1.000667!
```

## vignetteCalib: calibrate vignette

Performs photometric calibration from a set of images, showing a flat surface with an ARMarker

### dataset: narrow_vignette (不同场景，曝光时间不变)

- images.zip
- times.txt (id, timestamp, exposure time)
- camera.txt (Calibration file)
- pcalib.txt (Photometric Calibration) (optional)

<div>{%- include extensions/video.html src='https://vision.cs.tum.edu/mono/video_calib_preview/calib_narrow_vignette_5x.mp4' -%}</div>

### run

```bash
./vignetteCalib X/CalibrationDatasets/narrow_vignette/"
```

### output (vignetteCalibResult)

- vignette.png (16-bit png) containing the calibrated vignette function
- vignetteSmoothed.png is a slightly smoothed version, mainly to remove the black borders (pixels at the border are never observed)

<p align="center">
  <img src="../images/photometric_calib/calib_vignette.png" style="width:100%;"/>
</p>

log:

```
Load Dataset /home/cg/projects/dataset/tum/calib_narrow_vignette/: found no in folder /images; assuming that images are zipped.
got 603 entries and 603 files from zipfile!
Input resolution: 1280 1024
Input Calibration (fx fy cx cy): 685.720764 685.636475 631.358154 512.418457 0.897966
Out: Crop
Output resolution: 640 480
new K: 277.523987 291.680328 312.474304 240.035583
old K: 685.720764 685.636475 630.858154 511.918457
Reading Photometric Calibration from file /home/cg/projects/dataset/tum/calib_narrow_vignette/pcalib.txt
Reading Vignette Image from /home/cg/projects/dataset/tum/calib_narrow_vignette/vignette.png
PhotometricUndistorter: Invalid vignette image size! got 0 x 0, expected 1280 x 1024. Set vignette to 1.
Dataset /home/cg/projects/dataset/tum/calib_narrow_vignette/: Got 603 files!
SEQUENCE NAME: /home/cg/projects/dataset/tum/calib_narrow_vignette/!
plane image values 13.502855 - 253.491135!
334534966.000000 residual terms => 5126.586426
248922688.000000 residual terms => 14.131591
plane image values 14.390357 - 276.360291!
248922688.000000 residual terms => 20.186613
334823446.000000 residual terms => 6.567778
plane image values 14.477414 - 283.975037!
334823446.000000 residual terms => 8.231921
334823446.000000 residual terms => 3.842967
plane image values 14.585913 - 289.569702!
334823446.000000 residual terms => 5.230762
334823446.000000 residual terms => 2.797016
plane image values 14.648720 - 292.665253!
334823446.000000 residual terms => 3.405436
334823446.000000 residual terms => 2.461457
plane image values 14.685353 - 294.357880!
334823446.000000 residual terms => 2.676736
334823446.000000 residual terms => 2.367437
plane image values 14.711020 - 295.366974!
334823446.000000 residual terms => 2.445577
334823446.000000 residual terms => 2.342488
plane image values 14.724164 - 295.883911!
334823446.000000 residual terms => 2.363412
334823446.000000 residual terms => 2.335967
plane image values 14.730860 - 296.147430!
334823446.000000 residual terms => 2.341449
334823446.000000 residual terms => 2.334269
plane image values 14.734280 - 296.282471!
334823446.000000 residual terms => 2.335698
334823446.000000 residual terms => 2.333826
plane image values 14.736023 - 294.839050!
334823446.000000 residual terms => 2.269461
334823446.000000 residual terms => 2.266629
plane image values 14.732889 - 293.670929!
334823446.000000 residual terms => 2.266446
334823446.000000 residual terms => 2.265800
plane image values 14.733760 - 292.678101!
334823446.000000 residual terms => 2.265857
334823446.000000 residual terms => 2.265482
plane image values 14.734113 - 291.896484!
334823446.000000 residual terms => 2.265492
334823446.000000 residual terms => 2.265260
plane image values 14.734237 - 291.834442!
334823446.000000 residual terms => 2.265262
334823446.000000 residual terms => 2.265134
plane image values 14.734333 - 291.837555!
334823446.000000 residual terms => 2.265134
334823446.000000 residual terms => 2.265070
plane image values 14.734364 - 291.839386!
334823446.000000 residual terms => 2.265070
334823446.000000 residual terms => 2.265027
plane image values 14.734390 - 291.839935!
334823446.000000 residual terms => 2.265027
334823446.000000 residual terms => 2.264997
plane image values 14.734390 - 291.840637!
334823446.000000 residual terms => 2.264997
334823446.000000 residual terms => 2.264974
plane image values 14.734395 - 291.841003!
334823446.000000 residual terms => 2.264974
334823446.000000 residual terms => 2.264956
```