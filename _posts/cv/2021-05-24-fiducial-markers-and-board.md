---
layout: article
title:  "Fiducial Markers & Marker Board"
tags: ComputerVision FiducialMarkers
key: fiducial-markers-and-board
---

[TOC]

# Overview

* [Raspberry Pi position detection using fiducial tags](https://iosoft.blog/2019/09/02/raspberry-pi-position-detection-fiducial-tags/)

# AprilTag

[AprilTag](https://april.eecs.umich.edu/software/apriltag) is a **visual fiducial system**, useful for a wide variety of tasks including augmented reality, robotics, and camera calibration.

* [AprilTags C++ Library](http://people.csail.mit.edu/kaess/apriltags/)

<p align="center">
    <img src="https://april.eecs.umich.edu/media/apriltag/tagformats_web.png" style="width:80%;"/>
</p>

# ArUco Markers

* [ArUco markers generator](https://chev.me/arucogen/)

* Libs
  - [ArUco: a minimal library for Augmented Reality applications based on OpenCV](http://www.uco.es/investiga/grupos/ava/node/26)
  - [python-aruco](https://github.com/fehlfarbe/python-aruco)

## Overview

<p align="center">
    <img src="https://docs.opencv.org/3.4/markers.jpg"/>
</p>

### Marker

An **ArUco marker** is a synthetic square marker composed by **a wide black border** and **an inner binary matrix** which determines its **identifier(id)**. The marker size determines **the size of the internal matrix**. For instance a marker size of 4x4 is composed by 16 bits.

### Dictionary

A dictionary of markers is the set of markers that are considered in a specific application.

The main properties of a dictionary:

* The **dictionary size** is the number of markers that compose the dictionary.
* The **marker size** is the size of those markers (the number of bits).

Different dictionaries:

* **Predefined dictionaries** (`DICT_6X6_250`: an example of predefined dictionary of markers with 6x6 bits and a total of 250 markers)

  ```cpp
  cv::Ptr<cv::aruco::Dictionary> dictionary =
    cv::aruco::getPredefinedDictionary(cv::aruco::DICT_6X6_250);
  ```

* **Automatic dictionary generation**

  ```cpp
  cv::Ptr<cv::aruco::Dictionary> dictionary =
    cv::aruco::generateCustomDictionary(36, 5);
  ```

* **Manual dictionary generation**


## Marker Creation & Detection

* Creation

  ```cpp
  cv::Mat markerImage;
  cv::Ptr<cv::aruco::Dictionary> dictionary =
    cv::aruco::getPredefinedDictionary(cv::aruco::DICT_6X6_250);
  int id_marker = 23;
  int sz_img = 200;
  cv::aruco::drawMarker(dictionary, id_marker, sz_img, markerImage, 1);
  cv::imwrite("marker23.png", markerImage);
  ```

* Marker Detection

  ```cpp
  std::vector<int> markerIds;
  std::vector<std::vector<cv::Point2f>> markerCorners, rejectedCandidates;

  cv::Ptr<cv::aruco::DetectorParameters> parameters =
    cv::aruco::DetectorParameters::create();

  cv::Ptr<cv::aruco::Dictionary> dictionary =
    cv::aruco::getPredefinedDictionary(cv::aruco::DICT_6X6_250);

  cv::aruco::detectMarkers(inputImage, dictionary,
    markerCorners, markerIds, parameters, rejectedCandidates);

  if(ids.size() > 0)
    cv::aruco::drawDetectedMarkers(imageCopy, corners, ids);  
  ```

  <p align="center">
      <img src="https://docs.opencv.org/3.4/singlemarkersdetection.jpg" style="width:100%;"/>
  </p>

## Pose Estimation of Single Marker

* Pose Estimation of Single Marker

  ```cpp
  double marker_length = 0.05;
  std::vector<cv::Vec3d> rvecs, tvecs;
  cv::aruco::estimatePoseSingleMarkers(
    markerCorners, marker_length, cameraMatrix, distCoeffs, rvecs, tvecs);

  for (int i = 0; i < rvecs.size(); ++i) {
      auto rvec = rvecs[i];
      auto tvec = tvecs[i];
      cv::aruco::drawAxis(outputImage, cameraMatrix, distCoeffs, rvec, tvec, 0.1);
  }  
  ```

  <p align="center">
      <img src="https://docs.opencv.org/3.4/singlemarkersaxes.jpg" style="width:100%;"/>
  </p>

# ArUco Board

## Overview

The difference between a Board and a set of independent markers is that **the relative position between the markers in the Board is known a priori**. This allows that the corners of all the markers can be used for estimating the pose of the camera respect to the whole Board.

```cpp
class  Board {
public:
    std::vector<std::vector<cv::Point3f> > objPoints;
    cv::Ptr<cv::aruco::Dictionary> dictionary;
    std::vector<int> ids;
};
```

## Board Creation

* Creation

  ```cpp
  cv::Ptr<cv::aruco::GridBoard> board =
    cv::aruco::GridBoard::create(5, 7, 0.04, 0.01, dictionary);

  cv::Mat boardImage;
  board->draw( cv::Size(600, 500), boardImage, 10, 1 );
  ```

## Board Detection & Pose Estimation

* Board Detection & Pose Estimation

  ```cpp
  cv::Ptr<cv::aruco::Board> board = cv::aruco::Board::create();

  std::vector<int> markerIds;
  std::vector<std::vector<cv::Point2f>> markerCorners;
  cv::aruco::detectMarkers(inputImage, board.dictionary, markerCorners, markerIds);

  if(markerIds.size() > 0) {
      cv::Vec3d rvec, tvec;
      int valid = cv::aruco::estimatePoseBoard(
        markerCorners, markerIds, board, cameraMatrix, distCoeffs, rvec, tvec);
  }
  ```

  <p align="center">
      <img src="https://docs.opencv.org/3.3.1/gbmarkersaxis.png" style="width:100%;"/>
  </p>

# ChArUco Board

## Overview

ArUco markers and boards are very useful due to their fast detection and their versatility. However, **one of the problems of ArUco markers is that the accuracy of their corner positions is not too high, even after applying subpixel refinement**.

On the contrary, **the corners of chessboard patterns can be refined more accurately since each corner is surrounded by two black squares**. However, **finding a chessboard pattern is not as versatile as finding an ArUco board**: it has to be completely visible and occlusions are not permitted.

**The ArUco part is used to interpolate the position of the chessboard corners**, so that it has the versatility of marker boards, since it allows occlusions or partial views. Moreover, since the interpolated corners belong to a chessboard, they are very accurate in terms of subpixel accuracy.

When high precision is necessary, such as in **camera calibration**, Charuco boards are a better option than standard Aruco boards.

<p align="center">
    <img src="https://docs.opencv.org/3.1.0/charucodefinition.png" style="width:100%;"/>
</p>

## Board Creation

* Creation

  ```cpp
  cv::aruco::CharucoBoard board =
    cv::aruco::CharucoBoard::create(5, 7, 0.04, 0.02, dictionary);

  cv::Mat boardImage;
  board.draw(cv::Size(600, 500), boardImage, 10, 1);
  ```

## Board Detection & Pose Estimation

* Board Detection

  ```cpp
  cv::aruco::detectMarkers(inputImage, board.dictionary, markerCorners, markerIds);

  cv::aruco::interpolateCornersCharuco(markerCorners, markerIds, image, board, charucoCorners, charucoIds);
  cv::aruco::drawDetectedCornersCharuco(imageCopy, charucoCorners, charucoIds, cv::Scalar(255, 0, 0));
  ```

* Pose Estimation

  ```cpp
  cv::aruco::estimatePoseCharucoBoard(charucoCorners, charucoIds,
                                      board, cameraMatrix, distCoeffs, rvec, tvec);
  ```

  <p align="center">
      <img src="https://docs.opencv.org/3.1.0/chaxis.png" style="width:100%;"/>
  </p>
