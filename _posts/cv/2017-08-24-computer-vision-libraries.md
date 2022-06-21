---
layout: article
title:  "Computer Vision Libraries"
date:   2017-08-24 22:03:00 +0800
tags: ComputerVision
key: computer-vision-libraries
---

# libCVD

libCVD is a very portable and high performance C++ library for computer vision, image, and video processing.   

```cmake
# libCVD
link_libraries( cvd )
```

# OpenGL Suits

```cmake
# OpenGL
find_package(OpenGL REQUIRED)
if(OPENGL_FOUND)
    link_libraries( ${OPENGL_LIBRARY} )
endif()
```

```cmake
# GLUT
find_package(GLUT REQUIRED)
if(GLUT_FOUND)
    link_libraries( ${GLUT_LIBRARY} )
endif()
```

```cmake
# GLEW
find_package(GLEW REQUIRED)
if (GLEW_FOUND)
    include_directories(${GLEW_INCLUDE_DIRS})
    link_libraries(${GLEW_LIBRARIES})
endif()
```

# Pangolin

Pangolin is a lightweight portable rapid development library for managing OpenGL display / interaction and abstracting video input.Pangolin also provides a mechanism for manipulating program variables through config files and ui integration, and has a flexible real-time plotter for visualising graphical data.

```cmake
# Pangolin
find_package( Pangolin )
if(Pangolin_FOUND)
    include_directories( ${Pangolin_INCLUDE_DIRS} )
    link_directories( ${Pangolin_LIBRARIES} )
endif()
```

# OpenCV  

```cmake
# OpenCV
find_package( OpenCV 3.1 REQUIRED )
if(OpenCV_FOUND)
    include_directories( ${OpenCV_INCLUDE_DIRS} )
    link_libraries( ${OpenCV_LIBS} )
endif()
```

# PCL

```cmake
# pcl
set( PCL_DIR "/usr/local/share/pcl-1.7/" )
find_package( PCL REQUIRED COMPONENTS common io )
if(PCL_FOUND)
    include_directories( ${PCL_INCLUDE_DIRS} )
    add_definitions( ${PCL_DEFINITIONS} )
    link_libraries( ${PCL_LIBRARIES} )
endif()
```

# Open3D

install

```sh
pip install open3d
# or
pip install -i https://pypi.doubanio.com/simple open3d
# or
conda install -c open3d-admin open3d

# test
python -c "import open3d as o3d"
```
