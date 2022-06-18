---
layout: article
title:  "OpenMVG + OpenMVS build & run"
tags: Mapping SLAM
key: mapping-openmvg-openmvs-build-run
---

[TOC]

# Overview

* [OpenMVG](https://github.com/openMVG/openMVG) provides an end-to-end 3D reconstruction from images framework compounded of libraries, binaries, and pipelines.

  - a library mainly focused on **Multiple-View-Geometry** and **Structure-From-Motion**
  - **Structure-from-Motion** pipelines (like **OpenMVG**) which recover camera poses and a sparse 3D point-cloud from an input set of images, there are none addressing the last part of the photogrammetry chain-flow

  ![](https://github.com/openMVG/openMVG/raw/develop/docs/sphinx/rst/openMVG/sfm/pipeline_simple.png)


* [OpenMVS (Multi-View Stereo)](https://github.com/cdcseacave/openMVS) is a library for computer-vision scientists and especially targeted to the **Multi-View Stereo reconstruction** community.

  - [Modules](https://github.com/cdcseacave/openMVS/wiki/Modules)

  - aims at filling that gap by providing a complete set of algorithms to recover the full surface of the scene to be reconstructed

  - The input is a set of camera poses plus the sparse point-cloud and the output is a textured mesh


# OpenMVG

## Build

* https://github.com/openMVG/openMVG/blob/develop/BUILD.md

## Run

* [OpenMVG on your image dataset](https://github.com/openMVG/openMVG/wiki/OpenMVG-on-your-image-dataset)

Modify the code below in **SfM_SequentialPipeline.py**, **SfM_GlobalPipeline.py** or **tutorial_demo.py**

```python
# before
pIntrisics = subprocess.Popen( [os.path.join(OPENMVG_SFM_BIN, "openMVG_main_SfMInit_ImageListing"),  "-i", input_dir, "-o", matches_dir, "-d", camera_file_params] )

# after
pIntrisics = subprocess.Popen( [os.path.join(OPENMVG_SFM_BIN, "openMVG_main_SfMInit_ImageListing"),  "-i", input_dir, "-o", matches_dir, "-d", camera_file_params, "-f", "xxx"] )
```

then

```sh
python SfM_GlobalPipeline.py [full path image directory] [resulting directory]
```

MVG (SfM scene) to MVS

```sh
openMVG_main_openMVG2openMVS -i sfm_data.bin -o scene.mvs
```

# OpenMVS

## Build

* https://github.com/cdcseacave/openMVS/wiki/Building

## Run

* [OpenMVS_sample](https://github.com/cdcseacave/openMVS_sample)

### View

`Viewer` module can be used to visualize any `MVS` project file or `PLY/OBJ` file.

```sh
./openMVS_build/bin/Viewer xxx.mvs # or xxx.ply xxx.obj
```

# Ref

* [OpenMVG与OpenMVS安装配置、简单使用](https://blog.csdn.net/X_kh_2001/article/details/83690094)
