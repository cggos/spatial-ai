---
layout: article
title: "SLAM Data Structure"
tags: SLAM
key: slam-data-structure
---

[TOC]

## MSCKF

```cpp
typedef
std::map<FeatureIDType, Feature, std::less<int>,
  Eigen::aligned_allocator<std::pair<const FeatureIDType, Feature> > > MapServer;

struct Feature {
  FeatureIDType id;

  Eigen::Vector3d position;

  std::map<StateIDType, Eigen::Vector4d, std::less<StateIDType>,
    Eigen::aligned_allocator<std::pair<const StateIDType, Eigen::Vector4d> > > observations;
};                
```

<p align="center">
  <img src="../images/msckf/post_ekf_update.png" style="width:80%;"/>
</p>
